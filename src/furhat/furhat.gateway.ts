import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OpenAIService } from '../openai/openai.service';

@WebSocketGateway()
export class FurhatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly openAIService: OpenAIService) { }

  @SubscribeMessage('fortuneRequest')
  async handleFortuneRequest(@MessageBody() data: any): Promise<string> {
    console.log('Received fortune request:', data);

    // Call OpenAIService to process the fortune
    const result = await this.openAIService.callChatModel(data.message);

    // Return the result
    return result.choices[0].message.content;
  }
}