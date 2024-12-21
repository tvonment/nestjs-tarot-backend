import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CosmosClient } from '@azure/cosmos';
import { Session } from '../types/session.interface';

@Injectable()
export class CosmosService {
    private readonly client: CosmosClient;
    private readonly databaseId = 'fortuneTelling';
    private readonly containerId = 'sessions';

    constructor(private readonly configService: ConfigService) {
        const connectionString = this.configService.get<string>('COSMOS_DB_CONNECTION_STRING');
        this.client = new CosmosClient(connectionString);
    }

    async createSession(session: Session): Promise<Session> {
        const database = this.client.database(this.databaseId);
        const container = database.container(this.containerId);

        const { resource } = await container.items.create(session);

        // Map the result to only include relevant fields
        return this.mapToSession(resource);
    }

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

    // Get a session by ID
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
        const { id, topic, cards, fortune } = resource;
        return { id, topic, cards, fortune }; // Only include relevant fields
    }
}