import { Module } from '@nestjs/common';
import { CosmosService } from './cosmos.service';
import { BlobService } from './blob.service';

@Module({
  providers: [CosmosService, BlobService],
  exports: [CosmosService, BlobService],
})
export class DatabaseModule { }
