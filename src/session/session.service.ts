import { Injectable } from '@nestjs/common';
import { CosmosService } from '../database/cosmos.service';
import { Session } from '../types/session.interface';
import { Card } from '../types/card.interface';

@Injectable()
export class SessionService {
    constructor(private readonly cosmosService: CosmosService) { }

    async createSession(sessionId: string): Promise<Session> {
        return this.cosmosService.createSession(sessionId);
    }

    async getSession(sessionId: string): Promise<Session | null> {
        return this.cosmosService.getSession(sessionId);
    }

    async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
        return this.cosmosService.updateSession(sessionId, updates);
    }

    async addCardsToSession(sessionId: string, cards: Card[]): Promise<Session> {
        const session = await this.cosmosService.getSession(sessionId);

        if (!session) {
            throw new Error(`Session with ID ${sessionId} does not exist.`);
        }

        return this.cosmosService.updateSession(sessionId, { cards });
    }

    async addFortuneToSession(sessionId: string, fortune: string): Promise<Session> {
        const session = await this.cosmosService.getSession(sessionId);

        if (!session) {
            throw new Error(`Session with ID ${sessionId} does not exist.`);
        }

        return this.cosmosService.updateSession(sessionId, { fortune });
    }
}