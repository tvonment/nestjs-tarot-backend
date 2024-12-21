import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FurhatModule } from './furhat/furhat.module';
import { OpenaiModule } from './openai/openai.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [FurhatModule, OpenaiModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
