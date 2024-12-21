import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SessionModule } from './session/session.module';
import { OpenAIModule } from './openai/openai.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Global config
    SessionModule, // For session management
    OpenAIModule, // For OpenAI integration (if modularized further)
    DatabaseModule, // For CosmosDB and Blob storage logic
  ],
  controllers: [], // Keep this lean
  providers: [],   // Global providers, if any
})
export class AppModule { }