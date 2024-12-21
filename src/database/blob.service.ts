import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient } from '@azure/storage-blob';

@Injectable()
export class BlobService {
    private readonly blobServiceClient: BlobServiceClient;
    private readonly containerName = 'card-images';

    constructor(private readonly configService: ConfigService) {
        const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    }

    async uploadImage(fileName: string, fileBuffer: Buffer): Promise<string> {
        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        const blobClient = containerClient.getBlockBlobClient(fileName);
        await blobClient.upload(fileBuffer, fileBuffer.length);
        return blobClient.url;
    }
}