import { Controller, Post, Get, Patch, Body, Query } from '@nestjs/common';
import { SessionService } from './session.service';
import { Session } from '../types/session.interface';
import { OpenAIService } from '../openai/openai.service';
import { Card } from '../types/card.interface';

@Controller('sessions')
export class SessionController {
    constructor(private readonly sessionService: SessionService, private readonly openAIService: OpenAIService) { }

    @Post()
    async createSession(
        @Body('topic') topic: string,
    ): Promise<Session> {
        return this.sessionService.createSession(topic);
    }

    @Get()
    async getSession(@Query('sessionId') sessionId: string): Promise<Session | null> {
        return this.sessionService.getSession(sessionId);
    }

    @Patch('cardsByFile')
    async addCards(
        @Body('sessionId') sessionId: string,
        @Body('cardFileName') cardFileName: string,
    ): Promise<Session> {
        return this.sessionService.addCardsByFile(sessionId, cardFileName);
    }

    @Post('cardByDescription')
    async getCardByDescription(
        @Body('sessionId') sessionId: string,
        @Body('conversation') conversation: { question: string, description: string }[],
        @Body('position') position: number,
    ): Promise<Card> {
        return this.sessionService.addCardByDescriptionOrReturnQuestionCard(sessionId, position, conversation);
    };


    @Patch('fortune')
    async getFortune(@Body('sessionId') sessionId: string): Promise<Session> {
        return this.sessionService.addFortune(sessionId);
    }

    @Patch('answerOpenQuestion')
    async answerOpenQuestion(
        @Body('sessionId') sessionId: string,
        @Body('question') question: string,
    ): Promise<{ answer: string }> {
        return this.sessionService.addOpenQuestion(sessionId, question);
    }
}