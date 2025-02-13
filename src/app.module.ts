import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MqttService } from './mqtt.service';
import { MqttController } from './mqtt.controller';
import { WebSocketService } from './websocket.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path'; 

@Module({
  imports: [
     ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'src', 'assets'), 
      serveRoot: '/assets', 
    }),
  ],
  controllers: [AppController, MqttController],
  providers: [AppService, MqttService, WebSocketService],
})
export class AppModule {}
