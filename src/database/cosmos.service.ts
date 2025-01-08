import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CosmosClient } from '@azure/cosmos';
import { Session } from '../types/session.interface';

/**
 * Service for handling Azure Cosmos DB operations related to fortune telling sessions
 * Manages database connections and CRUD operations for sessions
 */
@Injectable()
export class CosmosService {
    private readonly client: CosmosClient;
    private readonly databaseId = 'fortuneTelling';
    private readonly containerId = 'sessions';

    constructor(private readonly configService: ConfigService) {
        const connectionString = this.configService.get<string>('COSMOS_DB_CONNECTION_STRING');
        this.client = new CosmosClient(connectionString);
    }

    /**
     * Creates a new session in Cosmos DB
     * @param session The session object to be created
     * @returns Promise containing the created session
     * @throws CosmosError if creation fails
     */
    async createSession(session: Session): Promise<Session> {
        const database = this.client.database(this.databaseId);
        const container = database.container(this.containerId);

        const { resource } = await container.items.create(session);

        // Map the result to only include relevant fields
        return this.mapToSession(resource);
    }

    /**
     * Updates an existing session with new data
     * @param sessionId Unique identifier of the session to update
     * @param updates Partial session data to merge with existing session
     * @returns Promise containing the updated session
     * @throws CosmosError if session not found or update fails
     */
    async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
        const database = this.client.database(this.databaseId);
        const container = database.container(this.containerId);

        const { resource: existingSession } = await container.item(sessionId, sessionId).read();

        const updatedSession = {
            ...existingSession,
            ...updates, // Merge updates with the existing session
        };

        const { resource } = await container.item(sessionId, sessionId).replace(updatedSession);

        // Map the result to only include relevant fields
        return this.mapToSession(resource);
    }

    /**
     * Retrieves a session by its ID
     * @param sessionId Unique identifier of the session to fetch
     * @returns Promise containing the session if found, null otherwise
     * @throws CosmosError if database operation fails
     */
    async getSession(sessionId: string): Promise<Session | null> {
        const database = this.client.database(this.databaseId);
        const container = database.container(this.containerId);

        try {
            const { resource } = await container.item(sessionId, sessionId).read();

            // Map the result to only include relevant fields
            return this.mapToSession(resource);
        } catch (error) {
            if (error.code === 404) {
                return null;
            }
            throw error;
        }
    }

    private mapToSession(resource: any): Session {
        const { id, topic, cards, fortune, openQuestions, fortuneSummary } = resource;
        return { id, topic, cards, fortune, openQuestions, fortuneSummary }; // Only include relevant fields
    }
}