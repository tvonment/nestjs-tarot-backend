import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient } from '@azure/storage-blob';

/**
 * Service for handling Azure Blob Storage operations related to image uploads
 * Manages blob storage connections and image uploads
 */
@Injectable()
export class BlobService {
    private readonly blobServiceClient: BlobServiceClient;
    private readonly cardsContainerName = 'card-images'; // The container name for card images
    private readonly blueprintsContainerName = 'blueprint-images'; // The container name for blueprint images
    private readonly blueprintFileName = 'celtic-cross-spread.png'; // The blueprint file name

    constructor(private readonly configService: ConfigService) {
        const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    }

    /**
     * Uploads an image to Azure Blob Storage
     * @param fileName The name of the file to upload
     * @param fileBuffer The file buffer to upload
     * @returns The URL of the uploaded image
     */
    async uploadImage(fileName: string, fileBuffer: Buffer): Promise<string> {
        const containerClient = this.blobServiceClient.getContainerClient(this.cardsContainerName);
        const blobClient = containerClient.getBlockBlobClient(fileName);
        await blobClient.upload(fileBuffer, fileBuffer.length);
        return blobClient.url;
    }

    /**
     * Retrieves the URL of an image from Azure Blob Storage
     * @param fileName The name of the file to retrieve
     * @returns The URL of the image
     */
    async getImageUrl(fileName: string): Promise<string> {
        const containerClient = this.blobServiceClient.getContainerClient(this.cardsContainerName);
        const blobClient = containerClient.getBlockBlobClient(fileName);
        return blobClient.url;
    }
    /**
     * Retrieves the URL of the blueprint image from Azure Blob Storage
     * @returns The URL of the blueprint image
     */
    async getBlueprintUrl(): Promise<string> {
        const containerClient = this.blobServiceClient.getContainerClient(this.blueprintsContainerName);
        const blobClient = containerClient.getBlockBlobClient(this.blueprintFileName);
        return blobClient.url;
    }
}