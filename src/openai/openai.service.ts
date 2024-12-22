import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobService } from '../database/blob.service';
import axios from 'axios';
import { Card } from 'src/types/card.interface';
import { Fortune, Gesture } from 'src/types/fortune.interface';

@Injectable()
export class OpenAIService {
    private readonly chatApiUrl: string;
    private readonly chatApiKey: string;

    constructor(private readonly configService: ConfigService, private readonly blobService: BlobService) {
        this.chatApiUrl = this.configService.get<string>('AZURE_OPENAI_URL');
        this.chatApiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
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