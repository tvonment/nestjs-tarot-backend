import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { CosmosService } from '../database/cosmos.service';
import { OpenAIService } from 'src/openai/openai.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SessionController],
  providers: [SessionService, CosmosService, OpenAIService],
})
export class SessionModule { }