import { Injectable } from '@nestjs/common';
import { CosmosService } from '../database/cosmos.service';
import { Session } from '../types/session.interface';
import { Card } from '../types/card.interface';
import { OpenAIService } from 'src/openai/openai.service';
import { Fortune } from 'src/types/fortune.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionService {
    constructor(private readonly cosmosService: CosmosService, private readonly openAIService: OpenAIService) { }

    async createSession(rawTopic: string): Promise<Session> {

        const id = randomUUID();
        const topic = await this.openAIService.getTopic(rawTopic); // Fetch the topic using the OpenAIService
        const session: Session = {
            id: id,
            topic: topic, // Save the topic in the session
            cards: [], // No cards yet
            fortune: [], // No fortune yet
            openQuestions: [], // No open questions yet
        };

        return this.cosmosService.createSession(session);
    }

    async getSession(sessionId: string): Promise<Session | null> {
        return this.cosmosService.getSession(sessionId);
    }

    async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
        return this.cosmosService.updateSession(sessionId, updates);
    }

    async addCardsByFile(sessionId: string, cardFileName: string): Promise<Session> {
        const cards: Card[] = await this.openAIService.getCards(cardFileName); // Fetch cards using the OpenAIService
        return this.cosmosService.updateSession(sessionId, { cards });
    }

    async addCardByDescriptionOrReturnQuestionCard(sessionId: string, position: number, conversation: { question: string, description: string }[]): Promise<Card> {
        const tmpCard: { name: string, description: string } = await this.openAIService.getCardByDescriptionOrQuestionCard(conversation);
        const card: Card = {
            name: tmpCard.name,
            description: tmpCard.description,
            position: position,
        };
        if (tmpCard.name == "Unknown") {
            card.position = 0;
        } else {
            // save the card to the session
            const session = await this.getSession(sessionId);
            session.cards.push(card);
            await this.updateSession(sessionId, { cards: session.cards });
        }
        return card;
    }

    async addFortune(sessionId: string): Promise<Session> {
        const session = await this.getSession(sessionId);

        if (!session || !session.cards) {
            throw new Error('No cards available for this session.');
        }

        const fortune: Fortune[] = await this.openAIService.readCards(session.cards, session.topic);

        session.fortune = fortune;

        return this.cosmosService.updateSession(session.id, { fortune: session.fortune });
    }

    async addOpenQuestion(sessionId: string, question: string): Promise<{ answer: string }> {
        const session = await this.getSession(sessionId);
        if (!session) {
            throw new Error('Session not found.');
        }
        const answer = await this.openAIService.getOpenQuestionAnswer(session, question);
        session.openQuestions.push({ question, answer });
        this.cosmosService.updateSession(session.id, { openQuestions: session.openQuestions });
        return { answer: answer };
    }
}