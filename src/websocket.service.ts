import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';

const WS_PORT = parseInt(process.env.WS_PORT || '3001');

@WebSocketGateway(WS_PORT, { cors: { origin: process.env.WS_CORS_ORIGIN || '*' } })
export class WebSocketService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('✅ Client connected:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('❌ Client disconnected:', client.id);
  }

  sendOccupancyUpdate(deviceId: string, status: string) {
    this.server.emit('occupancyUpdate', { deviceId, status });
  }
}
