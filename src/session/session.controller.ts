import { Controller, Post, Get, Patch, Body, Query } from '@nestjs/common';
import { SessionService } from './session.service';
import { Session } from '../types/session.interface';
import { OpenAIService } from '../openai/openai.service';
import { Card } from '../types/card.interface';

/**
 * Controller for the session resource.
 */
@Controller('sessions')
export class SessionController {
    constructor(private readonly sessionService: SessionService, private readonly openAIService: OpenAIService) { }

    /**
     * Creates a new session with the given topic.
     * @param topic The topic for the new session.
     * @returns The created session.
     */
    @Post()
    async createSession(
        @Body('topic') topic: string,
    ): Promise<Session> {
        return this.sessionService.createSession(topic);
    }

    /**
     * Retrieves a session by its ID.
     * @param sessionId The ID of the session to retrieve.
     * @returns The session if found, otherwise null.
     */
    @Get()
    async getSession(@Query('sessionId') sessionId: string): Promise<Session | null> {
        return this.sessionService.getSession(sessionId);
    }

    /**
     * Adds cards to a session from a file.
     * @param sessionId The ID of the session to add cards to.
     * @param cardFileName The name of the file containing the cards.
     * @returns The updated session.
     */
    @Patch('cardsByFile')
    async addCards(
        @Body('sessionId') sessionId: string,
        @Body('cardFileName') cardFileName: string,
    ): Promise<Session> {
        return this.sessionService.addCardsByFile(sessionId, cardFileName);
    }

    /**
     * Retrieves a card based on a description and adds it to the session or returns a card on position 0 with questions to narrow down.
     * @param sessionId The ID of the session to add the card to.
     * @param conversation The conversation containing the question and description.
     * @param position The position to add the card at.
     * @returns The card that was added or a card with position 0 containing questions.
     */
    @Post('cardByDescription')
    async getCardByDescription(
        @Body('sessionId') sessionId: string,
        @Body('conversation') conversation: { question: string, description: string }[],
        @Body('position') position: number,
    ): Promise<Card> {
        return this.sessionService.addCardByDescriptionOrReturnQuestionCard(sessionId, position, conversation);
    }

    /**
     * Adds a fortune to the session.
     * @param sessionId The ID of the session to add the fortune to.
     * @returns The updated session.
     */
    @Patch('fortune')
    async getFortune(@Body('sessionId') sessionId: string): Promise<Session> {
        return this.sessionService.addFortune(sessionId);
    }
}