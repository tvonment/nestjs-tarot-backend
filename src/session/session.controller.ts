import { Controller, Post, Get, Patch, Body, Query } from '@nestjs/common';
import { SessionService } from './session.service';
import { Session } from '../types/session.interface';
import { OpenAIService } from '../openai/openai.service';
import { Card } from '../types/card.interface';

@Controller('sessions')
export class SessionController {
    constructor(private readonly sessionService: SessionService, private readonly openAIService: OpenAIService) { }

    @Post()
    async createSession(@Body('sessionId') sessionId: string): Promise<Session> {
        return this.sessionService.createSession(sessionId);
    }

    @Get()
    async getSession(@Query('sessionId') sessionId: string): Promise<Session | null> {
        return this.sessionService.getSession(sessionId);
    }

    @Patch('cards')
    async addCards(
        @Body('sessionId') sessionId: string,
        @Body('cardFileName') cardFileName: string,
    ): Promise<Session> {
        const cards: Card[] = await this.openAIService.getCards(cardFileName); // Fetch cards using the OpenAIService
        return this.sessionService.addCardsToSession(sessionId, cards);
    }

    @Patch('fortune')
    async getFortune(@Body('sessionId') sessionId: string): Promise<Session> {
        const session = await this.sessionService.getSession(sessionId);

        if (!session || !session.cards) {
            throw new Error('No cards available for this session.');
        }

        const fortune = await this.openAIService.readCards(session.cards, 'Tell me my fortune about love');
        return this.sessionService.addFortuneToSession(sessionId, fortune);
    }
}