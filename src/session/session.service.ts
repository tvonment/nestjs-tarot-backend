import { Injectable } from '@nestjs/common';
import { CosmosService } from '../database/cosmos.service';
import { Session } from '../types/session.interface';
import { Card } from '../types/card.interface';
import { OpenAIService } from 'src/openai/openai.service';
import { Fortune } from 'src/types/fortune.interface';
import { randomUUID } from 'crypto';

/**
 * Service for handling fortune telling sessions
 * Manages session creation, retrieval, and updates
 */
@Injectable()
export class SessionService {
    constructor(private readonly cosmosService: CosmosService, private readonly openAIService: OpenAIService) { }

    /**
     * Creates a new fortune telling session with a given topic
     * @param rawTopic The initial topic provided by the user
     * @returns A new Session object with generated ID and processed topic
     */
    async createSession(rawTopic: string): Promise<Session> {

        const id = randomUUID();
        const topic = await this.openAIService.getTopic(rawTopic); // Fetch the topic using the OpenAIService
        const session: Session = {
            id: id,
            topic: topic, // Save the topic in the session
            cards: [], // No cards yet
            fortune: [], // No fortune yet
            openQuestions: [], // No open questions yet
            fortuneSummary: '', // No fortune summary yet
        };

        return this.cosmosService.createSession(session);
    }

    /**
     * Retrieves a session by its unique identifier
     * @param sessionId The unique identifier of the session
     * @returns The session object if found, null otherwise
     */
    async getSession(sessionId: string): Promise<Session | null> {
        return this.cosmosService.getSession(sessionId);
    }

    /**
     * Updates an existing session with partial session data
     * @param sessionId The unique identifier of the session to update
     * @param updates Partial session data to update
     * @returns The updated session object
     */
    async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
        return this.cosmosService.updateSession(sessionId, updates);
    }

    /**
     * Adds cards to a session based on a card file
     * @param sessionId The unique identifier of the session
     * @param cardFileName The name of the file containing card data
     * @returns The updated session with new cards
     */
    async addCardsByFile(sessionId: string, cardFileName: string): Promise<Session> {
        const cards: Card[] = await this.openAIService.getCards(cardFileName); // Fetch cards using the OpenAIService
        return this.cosmosService.updateSession(sessionId, { cards });
    }

    /**
     * Processes a conversation to either add a card based on description or return a question card
     * @param sessionId The unique identifier of the session
     * @param position The position of the card in the sequence
     * @param conversation Array of question-description pairs from the conversation
     * @returns A new card object based on the conversation
     */
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

    /**
     * Adds a fortune to the session based on the cards and topic
     * @param sessionId The unique identifier of the session
     * @returns The updated session with fortune data
     */
    async addFortune(sessionId: string): Promise<Session> {
        const session = await this.getSession(sessionId);

        if (!session || !session.cards) {
            throw new Error('No cards available for this session.');
        }

        const fortuneResponse = await this.openAIService.readCards(session.cards, session.topic);
        const fortune: Fortune[] = fortuneResponse.fortune;
        const fortuneSummary: string = fortuneResponse.summary;

        session.fortune = fortune;
        session.fortuneSummary = fortuneSummary;

        return this.cosmosService.updateSession(session.id, { fortune: session.fortune, fortuneSummary: session.fortuneSummary });
    }

    /**
     * Adds an open question to the session and retrieves an answer
     * @param sessionId The unique identifier of the session
     * @param question The open question to ask
     * @returns The answer to the open question
     */
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