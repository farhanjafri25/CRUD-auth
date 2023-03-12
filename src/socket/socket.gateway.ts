import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtStrategy } from '../jwt.strategy';
// import { AuthService } from './auth.strategy';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private authService: JwtStrategy) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: any) {
    // Authenticate and authorize the user using JWT tokens
    const token = socket.handshake.query.token;
    console.log(socket.handshake.query.token);
    const user = await this.authService.validateUser(token);
    if (!user) {
      socket.disconnect(true);
      return;
    }

    // Join the user to a room
    socket.join(user.id);
  }

  async handleDisconnect(socket: any) {
    // Leave the room when the user disconnects
    const token = socket.handshake.query.token;
    const user = await this.authService.validateUser(token);
    if (user) {
      socket.leave(user.id);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() socket: any,
  ) {
    // Broadcast the message to all users in the same room
    const token = socket.handshake.query.token;
    const user = await this.authService.validateUser(token);
    if (user) {
      console.log(`user found`, user);
      const res = this.server.emit('hi you are subscribed', data);
      console.log(`emit response`, res);
    }
  }
}
