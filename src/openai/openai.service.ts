import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobService } from '../database/blob.service';
import axios from 'axios';
import { Card } from 'src/types/card.interface';

@Injectable()
export class OpenAIService {
    private readonly chatApiUrl: string;
    private readonly chatApiKey: string;
    private readonly realtimeApiUrl: string;
    private readonly realtimeApiKey: string;

    constructor(private readonly configService: ConfigService, private readonly blobService: BlobService) {
        this.chatApiUrl = this.configService.get<string>('AZURE_OPENAI_URL');
        this.chatApiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
        this.realtimeApiUrl = this.configService.get<string>('AZURE_OPENAI_REALTIME_URL');
        this.realtimeApiKey = this.configService.get<string>('AZURE_OPENAI_REALTIME_API_KEY');
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
    async readCards(cards: Card[], topic: string): Promise<string> {
        try {
            let systemMessage = `
                You are a Fortune Teller specializing in reading the future using tarot cards. Based on the given Celtic Cross spread, provide detailed predictions. Here are the cards:
            `;

            cards.forEach((card) => {
                systemMessage += `
                    ${card.name} at position ${card.position} with meaning: ${card.description}
                `;
            });

            systemMessage += `
                Provide detailed insights on how the cards relate to relationships, choices, and emotional connections.
            `;
            const userRequest = `
                Using the Celtic Cross spread I laid out, tell me about "${topic}" based on these cards. Provide detailed insights on how the cards relate to relationships, choices, and emotional connections.
            `;

            const payload = {
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: userRequest },
                ],
            };

            const response = await axios.post(this.chatApiUrl, payload, {
                headers: {
                    'api-key': `${this.chatApiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = response.data.choices[0].message.content;
            return data;
        } catch (error) {
            console.error('Error reading cards:', error.message);
            throw error;
        }
    }


    async callChatModel(prompt: string): Promise<any> {
        try {
            const response = await axios.post(
                this.chatApiUrl,
                { messages: [{ role: 'user', content: prompt }] },
                { headers: { Authorization: `Bearer ${this.chatApiKey}` } },
            );
            return response.data;
        } catch (error) {
            console.error('Azure OpenAI Chat Model Error:', error.message);
            throw error;
        }
    }

    async callRealtimeModel(audioData: Buffer, metadata: any): Promise<any> {
        try {
            const response = await axios.post(
                this.realtimeApiUrl,
                { audio: audioData, metadata },
                { headers: { Authorization: `Bearer ${this.realtimeApiKey}` } },
            );
            return response.data;
        } catch (error) {
            console.error('Azure OpenAI Real-Time Model Error:', error.message);
            throw error;
        }
    }
}