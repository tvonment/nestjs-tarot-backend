import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OpenAIService {
    private readonly chatApiUrl: string;
    private readonly chatApiKey: string;
    private readonly realtimeApiUrl: string;
    private readonly realtimeApiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.chatApiUrl = this.configService.get<string>('AZURE_OPENAI_URL');
        this.chatApiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
        this.realtimeApiUrl = this.configService.get<string>('AZURE_OPENAI_REALTIME_URL');
        this.realtimeApiKey = this.configService.get<string>('AZURE_OPENAI_REALTIME_API_KEY');
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