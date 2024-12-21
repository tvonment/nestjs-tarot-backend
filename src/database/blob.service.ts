import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient } from '@azure/storage-blob';

@Injectable()
export class BlobService {
    private readonly blobServiceClient: BlobServiceClient;
    private readonly cardsContainerName = 'card-images';
    private readonly blueprintsContainerName = 'blueprint-images';
    private readonly blueprintFileName = 'celtic-cross-spread.png';

    constructor(private readonly configService: ConfigService) {
        const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    }

    async uploadImage(fileName: string, fileBuffer: Buffer): Promise<string> {
        const containerClient = this.blobServiceClient.getContainerClient(this.cardsContainerName);
        const blobClient = containerClient.getBlockBlobClient(fileName);
        await blobClient.upload(fileBuffer, fileBuffer.length);
        return blobClient.url;
    }

    async getImageUrl(fileName: string): Promise<string> {
        const containerClient = this.blobServiceClient.getContainerClient(this.cardsContainerName);
        const blobClient = containerClient.getBlockBlobClient(fileName);
        return blobClient.url;
    }

    async getBlueprintUrl(): Promise<string> {
        const containerClient = this.blobServiceClient.getContainerClient(this.blueprintsContainerName);
        const blobClient = containerClient.getBlockBlobClient(this.blueprintFileName);
        return blobClient.url;
    }
}