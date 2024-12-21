import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class FurhatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('fortuneRequest')
  handleFortuneRequest(@MessageBody() data: any): string {
    console.log('Received fortune request:', data);
    // Process the fortune request
    return 'Your fortune is being prepared!';
  }

  sendToFurhat(event: string, data: any) {
    // Use this method to send data back to Furhat
    this.server.emit(event, data);
  }
}