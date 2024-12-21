import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { BlobService } from 'src/database/blob.service';

@Module({
  providers: [OpenAIService, BlobService],
  exports: [OpenAIService],
})
export class OpenAIModule { }
