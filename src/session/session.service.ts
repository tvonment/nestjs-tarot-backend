import { Injectable } from '@nestjs/common';
import { CosmosService } from '../database/cosmos.service';
import { Session } from '../types/session.interface';
import { Card } from '../types/card.interface';
import { OpenAIService } from 'src/openai/openai.service';

@Injectable()
export class SessionService {
    constructor(private readonly cosmosService: CosmosService, private readonly openAIService: OpenAIService) { }

    async createSession(sessionId: string, topic: string): Promise<Session> {
        const session: Session = {
            id: sessionId,
            topic: topic, // Save the topic in the session
            cards: undefined, // No cards yet
            fortune: undefined, // No fortune yet
        };

        return this.cosmosService.createSession(session);
    }

    async getSession(sessionId: string): Promise<Session | null> {
        return this.cosmosService.getSession(sessionId);
    }

    async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
        return this.cosmosService.updateSession(sessionId, updates);
    }

    async addCardsToSession(sessionId: string, cardFileName: string): Promise<Session> {
        const cards: Card[] = await this.openAIService.getCards(cardFileName); // Fetch cards using the OpenAIService
        return this.cosmosService.updateSession(sessionId, { cards });
    }

    async addFortuneToSession(sessionId: string): Promise<Session> {
        const session = await this.getSession(sessionId);

        if (!session || !session.cards) {
            throw new Error('No cards available for this session.');
        }

        const fortune = await this.openAIService.readCards(session.cards, session.topic);

        session.fortune = fortune;

        return this.cosmosService.updateSession(session.id, { fortune: session.fortune });
    }
}