import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CosmosClient } from '@azure/cosmos';

@Injectable()
export class CosmosService {
    private readonly client: CosmosClient;
    private readonly databaseId = 'fortuneTelling';
    private readonly containerId = 'sessions';

    constructor(private readonly configService: ConfigService) {
        const connectionString = this.configService.get<string>('COSMOS_DB_CONNECTION_STRING');
        this.client = new CosmosClient(connectionString);
    }

    async saveSession(session: any): Promise<void> {
        const database = this.client.database(this.databaseId);
        const container = database.container(this.containerId);
        await container.items.create(session);
    }

    async getSession(sessionId: string): Promise<any> {
        const database = this.client.database(this.databaseId);
        const container = database.container(this.containerId);
        const { resource } = await container.item(sessionId).read();
        return resource;
    }
}