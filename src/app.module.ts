import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MqttService } from './mqtt.service';
import { MqttController } from './mqtt.controller';
import { WebSocketService } from './websocket.service';

@Module({
  imports: [],
  controllers: [AppController, MqttController],
  providers: [AppService, MqttService, WebSocketService],
})
export class AppModule {}
