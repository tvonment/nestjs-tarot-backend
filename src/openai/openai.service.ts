import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobService } from '../database/blob.service';
import axios from 'axios';
import { Card } from 'src/types/card.interface';
import { Fortune, Gesture } from 'src/types/fortune.interface';
import { Session } from 'src/types/session.interface';

@Injectable()
export class OpenAIService {
    private readonly chatApiUrl: string;
    private readonly chatApiKey: string;

    constructor(private readonly configService: ConfigService, private readonly blobService: BlobService) {
        this.chatApiUrl = this.configService.get<string>('AZURE_OPENAI_URL');
        this.chatApiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
    }

    async getOpenQuestionAnswer(session: Session, question: string): Promise<string> {
        try {
            const systemMessage = `
                You are an fortune telling assistant that just read the tarot cards to a user and he has questions about it.

                The topic of the session is: ${session.topic}

                These are the cards in the Celtic Cross spread:
                ${session.cards.map(card => `'${card.name}' with meaning: '${card.description}' at position ${card.position}`).join(', \n')}

                This is the fortune you just read:
                ${session.fortune.map(fortune => `Card: ${fortune.card}; Content: ${fortune.content}`).join('\n')}

                Provide a response to the user's question.
            `;

            let history = [];

            if (session.openQuestions && session.openQuestions.length > 0) {
                history = session.openQuestions.map((message) => [
                    { role: 'user', content: message.question },
                    { role: 'assistant', content: message.answer }
                ]).flat();
            }

            const payload = {
                messages: [
                    { role: 'system', content: systemMessage },
                    ...history,
                    { role: 'user', content: question },
                ]
            };

            const response = await axios.post(this.chatApiUrl, payload, {
                headers: {
                    'api-key': `${this.chatApiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            const answer: string = response.data.choices[0].message.content;
            return answer;
        } catch (error) {
            console.error('Error answering question: ', error.message);
            throw error;
        }
    }

    async getCardByDescriptionOrQuestionCard(conversation: { question: string, description: string }[]): Promise<{ name: string; description: string }> {

        try {
            const systemMessage = `
                You are an assistant that identifies tarot cards based on user descriptions.
                - If the description is clear enough to match a specific card with confidence, return a JSON object with:
                    - 'name': The name of the card.
                    - 'description': A brief explanation of the card.
                - If the description is unclear or ambiguous, return:
                    {
                        "name": "Unknown",
                        "description": "A question to help clarify, such as: 'Are there coins, wands, cups, or swords on it? Do you see a number or a title of the card?' but return only questions."
                    }
    
                The output must strictly adhere to this JSON format:
                {
                    "name": "string",
                    "description": "string"
                }
    
                Examples:
    
                Input: "There is a man in a tent-like thing and two sphinx-looking animals in front of it."
                Output:
                {
                    "name": "The Chariot",
                    "description": "The Chariot represents control, determination, and overcoming obstacles. It shows a man in a chariot drawn by two sphinxes."
                }
    
                Input: "It's the Chariot."
                Output:
                {
                    "name": "The Chariot",
                    "description": "The Chariot represents control, determination, and overcoming obstacles. It shows a man in a chariot drawn by two sphinxes."
                }
    
                Input: "There's a card with a woman holding a lion's mouth."
                Output:
                {
                    "name": "Strength",
                    "description": "Strength represents inner courage, patience, and compassion. It shows a woman gently taming a lion."
                }
    
                Input: "It's about balance and justice."
                Output:
                {
                    "name": "Justice",
                    "description": "Justice signifies fairness, truth, and law. It depicts a figure holding a sword and scales."
                }
    
                Input: "It has a number on it, but I can't remember the details."
                Output:
                {
                    "name": "Unknown",
                    "description": "Do you recall the number, or can you describe the imagery on the card?"
                }
    
                Input: "The card has cups, and there's some celebration happening."
                Output:
                {
                    "name": "Three of Cups",
                    "description": "The Three of Cups symbolizes friendship, joy, and celebration. It depicts three women raising cups in a toast."
                }
    
                Input: "I'm not sure, but there are swords on it."
                Output:
                {
                    "name": "Unknown",
                    "description": "Can you describe the scene further? How many swords are there, and what are the figures doing?"
                }
            `;

            let conversationMessages = [];

            if (conversation && conversation.length > 0) {
                conversationMessages = conversation.flatMap((message) => [
                    { role: 'assistant', content: message.question },
                    { role: 'user', content: message.description }
                ]);
            }

            const payload = {
                messages: [
                    { role: 'system', content: systemMessage },
                    ...conversationMessages,
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'CardResponse',
                        strict: true,
                        schema: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                description: { type: 'string' },
                            },
                            required: ['name', 'description'],
                            additionalProperties: false
                        }
                    }
                }
            };

            const response = await axios.post(this.chatApiUrl, payload, {
                headers: {
                    'api-key': `${this.chatApiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = response.data.choices[0].message.content;
            const card: { name: string; description: string } = JSON.parse(data); // Parse the JSON response
            return card;
        } catch (error) {
            console.error('Error fetching card:', error.message);
            throw error;
        }
    }

    async getTopic(userInput: string): Promise<string> {

        try {
            const systemMessage = `
                You are a Fortune Teller specializing in reading the future using tarot cards. Formulate a topic for the reading with what the user said.
            `;

            const fewShotLearning = [
                { role: 'user', content: "I want to know something about my Love Life." },
                { role: 'assistant', content: "Love Life." },
                { role: 'user', content: "How does my future career look like?" },
                { role: 'assistant', content: "Future Career." },
                { role: 'user', content: "I want to know about my health." },
                { role: 'assistant', content: "Health." },
                { role: 'user', content: "I want to know about my financial situation." },
                { role: 'assistant', content: "Financial Situation." },
                { role: 'user', content: "What are the cards saying about my current presence?" },
                { role: 'assistant', content: "Current Presence." },
                { role: 'user', content: "Tell me what the cards say about my friendships." },
                { role: 'assistant', content: "Friendships." },
                { role: 'user', content: "What does the future hold for me?" },
                { role: 'assistant', content: "Future Outlook." },
                { role: 'user', content: "Can the cards guide me on my spiritual journey?" },
                { role: 'assistant', content: "Spiritual Journey." },
                { role: 'user', content: "I need advice on a tough decision I'm facing." },
                { role: 'assistant', content: "Decision Making." },
                { role: 'user', content: "What do the cards say about my creative projects?" },
                { role: 'assistant', content: "Creative Projects." },
                { role: 'user', content: "Can I learn something about my past life?" },
                { role: 'assistant', content: "Past Life." },
                { role: 'user', content: "How can I improve my well-being?" },
                { role: 'assistant', content: "Well-being." },
                { role: 'user', content: "What challenges should I prepare for?" },
                { role: 'assistant', content: "Challenges." },
                { role: 'user', content: "Can the cards tell me about my family relationships?" },
                { role: 'assistant', content: "Family Relationships." },
                { role: 'user', content: "What should I focus on to grow as a person?" },
                { role: 'assistant', content: "Personal Growth." },
                { role: 'user', content: "What opportunities might come my way soon?" },
                { role: 'assistant', content: "Opportunities." },
                { role: 'user', content: "Can the cards help me understand my life's purpose?" },
                { role: 'assistant', content: "Life's Purpose." },
                { role: 'user', content: "What surprises might life have for me?" },
                { role: 'assistant', content: "Surprises." },
                { role: 'user', content: "How can I handle the conflict I'm facing right now?" },
                { role: 'assistant', content: "Conflict Resolution." },
                { role: 'user', content: "What guidance do the cards have for this season?" },
                { role: 'assistant', content: "Seasonal Guidance." },
                { role: 'user', content: "What are the energies surrounding me right now?" },
                { role: 'assistant', content: "Current Energies." },
                { role: 'user', content: "How can I make the most of this year?" },
                { role: 'assistant', content: "Yearly Outlook." },
                { role: 'user', content: "How can I prepare for my upcoming travel?" },
                { role: 'assistant', content: "Travel Preparation." },
                { role: 'user', content: "What do the cards see in my romantic future?" },
                { role: 'assistant', content: "Romantic Future." },
                { role: 'user', content: "Can the cards tell me how to find balance?" },
                { role: 'assistant', content: "Finding Balance." },
                { role: 'user', content: "What advice do the cards have about my dreams?" },
                { role: 'assistant', content: "Dream Interpretation." },
            ];

            const payload = {
                messages: [
                    { role: 'system', content: systemMessage },
                    ...fewShotLearning,
                    { role: 'user', content: userInput },
                ]
            };

            const response = await axios.post(this.chatApiUrl, payload, {
                headers: {
                    'api-key': `${this.chatApiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            const topic: string = response.data.choices[0].message.content;
            return topic;
        } catch (error) {
            console.error('Error fetching topic:', error.message);
            throw error;
        }
    }

    // Fetch cards based on image inputs
    async getCards(cardFileName: string): Promise<Card[]> {
        try {
            const blueprintUrl = await this.blobService.getBlueprintUrl();
            const cardImageUrl = await this.blobService.getImageUrl(cardFileName);

            const systemMessage = `
        You are an assistant that generates structured JSON data. Your task is to output a JSON object containing a list of cards. Each card should have:
        - 'name': A string representing the name of the card.
        - 'description': A string describing the card.
        - 'position': A string representing the position of the card as from the template in the Celtic Cross spread image.
        Map the cards to their positions in the blueprint.

        Ensure the output strictly adheres to this structure:
        {
            "cards": [
                {
                    "name": "string",
                    "description": "string",
                    "position": "number"
                }
            ]
        }

        Example output:
        {
            "cards": [
                {
                    "name": "The Fool",
                    "description": "The Fool is the card without a number. It usually is positioned at the beginning of the major arcana but can be either at the beginning or the end as it depicts the spirit in search of experience.",
                    "position": "1"
                },
                {
                    "name": "The Magician",
                    "description": "The Magician is the card numbered 1 in the major arcana. It is positioned at the beginning of the major arcana and represents the conscious mind.",
                    "position": "2"
                }
            ]
        }
      `;

            const payload = {
                messages: [
                    { role: 'system', content: systemMessage },
                    {
                        role: 'user',
                        content: [
                            { type: 'image_url', image_url: { url: blueprintUrl } },
                            { type: 'image_url', image_url: { url: cardImageUrl } },
                            { type: 'text', content: 'Provide the cards in JSON format.' },
                        ],
                    },
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'CardsResponse',
                        strict: true,
                        schema: {
                            type: 'object',
                            properties: {
                                cards: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            description: { type: 'string' },
                                            position: { type: 'number' }
                                        },
                                        required: ['name', 'description', 'position'],
                                        additionalProperties: false
                                    }
                                }
                            },
                            required: ['cards'],
                            additionalProperties: false
                        }
                    }
                }
            };

            const response = await axios.post(this.chatApiUrl, payload, {
                headers: {
                    'api-key': `${this.chatApiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = response.data.choices[0].message.content;
            const cards: Card[] = JSON.parse(data).cards; // Parse the JSON response into Card[]
            return cards;
        } catch (error) {
            console.error('Error fetching cards:', error.message);
            throw error;
        }
    }

    // Read cards and generate a fortune
    async readCards(cards: Card[], topic: string): Promise<Fortune[]> {

        const gestures = Object.values(Gesture);

        try {
            let systemMessage = `
                You are a Fortune Teller specializing in reading the future using tarot cards. Based on the given Celtic Cross spread, provide detailed predictions. Here are the cards:
            `;

            cards.forEach((card) => {
                systemMessage += `
                    Card Name: "${card.name}" at position ${card.position} with meaning: ${card.description}
                `;
            });

            systemMessage += `
                Provide chunks of fortunes on the topic: "${topic}" with insights on how the cards relate to relationships, choices, and emotional connections. Each chunk of the fortune should have:
                - 'content': the Fortune itself.
                - 'card': if the fortune is related to a specific card, provide the card name. Use the following cards: ${cards.map(card => card.name).join(', ')} else use NONE.
                - 'gesture': a gesture to accompany the fortune. Use the following gestures: ${gestures.join(', ')}.

                Add an introductory fortune at the beginning to set the tone for the reading with the topic: "${topic}" and without a card name.
                Add a summary at the end to conclude the fortune without a card name.

                Ensure the output strictly adheres to this structure:
                {
                    "fortune": [
                        {
                            "content": "string",
                            "card": "string",
                            "gesture": "string"
                        }
                    ]
                }

                Example output:
                {
                    "fortune": [
                        {
                            "content": "Uhhh oh! You are in for a surprise.",
                            "card": "NONE",
                            "gesture": "${Gesture.BIG_SMILE}"
                        },
                        {
                            "content": " In hopes and fears, The Emperor brings a desire for stability and structure in your relationships but might also denote a fear of losing freedom or a fear of becoming too rigid. The need for a balance between authority and emotional openness expresses itself through this card.",
                            "card": "The Emperor",
                            "gesture": "${Gesture.SMILE}"
                        },
                        {
                            "content": "In the recent past position, The Magician indicates a time when you may have utilized your resourcefulness and potential to manifest desires in your love life. This card suggests past efforts to create or attract a fulfilling relationship, leveraging your skills and self-confidence to initiate progress.",
                            "card": "The Magician",
                            "gesture": "${Gesture.THOUGHTFUL}"
                        },
                        {
                            "content": "In the near future, The Lovers card suggests a significant choice or decision that will impact your relationships. This card indicates a time of weighing options and making a decision that aligns with your values and beliefs. The Lovers card often signifies a choice between two paths, each with its own set of consequences.",
                            "card": "The Lovers",
                            "gesture": "${Gesture.SURPRISE}"
                        },
                        {
                            "content": "The Chariot in the conscious thoughts position indicates a strong determination and willpower to overcome obstacles in your relationships. This card suggests that you are focused on your goals and are willing to take action to achieve them. The Chariot represents a sense of control and direction in your love life.",
                            "card": "The Chariot",
                            "gesture": "${Gesture.NOD}"
                        },
                        {
                            "content": "The Hermit in the subconscious position suggests a period of introspection and self-discovery in your relationships. This card indicates that you may be seeking solitude to reflect on your emotions and desires. The Hermit represents a time of inner guidance and self-awareness.",
                            "card": "The Hermit",
                            "gesture": "${Gesture.BROW_RAISE}"
                        },

                        {
                            "content": "In summary, this spread emphasizes a journey from introspection to transformation, with choices significantly shaping your romantic experiences. By releasing old patterns (Death) and embracing new beginnings with an open heart (Fool), while aligning with your deeper values (Lovers), you can manifest a relationship filled with abundance and nurturing love (Empress).",
                            "card": "NONE",
                            "gesture": "${Gesture.SMILE_BACK}"
                        }
                    ]
                }
            `;


            const payload = {
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: 'Provide the fortune in JSON format.' },
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'FortuneResponse',
                        strict: true,
                        schema: {
                            type: 'object',
                            properties: {
                                fortune: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            content: { type: 'string' },
                                            card: {
                                                type: 'string',
                                                enum: [...cards.map(card => card.name), "NONE"] // Enumerate the card names and add NONE
                                            },
                                            gesture: {
                                                type: 'string',
                                                enum: gestures
                                            }
                                        },
                                        required: ['content', 'gesture', 'card'],
                                        additionalProperties: false
                                    }
                                }
                            },
                            required: ['fortune'],
                            additionalProperties: false
                        }
                    }
                }
            };

            const response = await axios.post(this.chatApiUrl, payload, {
                headers: {
                    'api-key': `${this.chatApiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = response.data.choices[0].message.content;
            const fortunes: Fortune[] = JSON.parse(data).fortune; // Parse the JSON response into Fortune[]
            return fortunes;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Error reading cards:', error.response.data);
            } else {
                console.error('Error reading cards:', error.message);
            }
            throw error;
        }
    }
}