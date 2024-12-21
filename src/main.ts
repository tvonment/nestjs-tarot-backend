import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FurhatModule } from './furhat/furhat.module';
import { OpenaiModule } from './openai/openai.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available throughout the app
    }),
    FurhatModule,
    OpenaiModule,
    DatabaseModule,
  ],
})
export class AppModule { }