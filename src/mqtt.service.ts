import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { WebSocketService } from './websocket.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private client;
  private sensorStatus: Record<string, string> = {};

  constructor(private readonly webSocketService: WebSocketService) {}

  onModuleInit() {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883';
    const topic = process.env.MQTT_TOPIC || 'ug65uplink';

    this.client = mqtt.connect(brokerUrl);

    this.client.on('connect', () => {
      this.client.subscribe(topic);
    });

    this.client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        this.processUplink(data);
      } catch (error) {
        console.error('❌ Error parsing message:', error);
      }
    });
  }

  private processUplink(data: any) {
    const deviceId = data.devEUI;
    const occupancyStatus = data.occupancy ? 'Occupied' : 'Vacant';

    this.sensorStatus[deviceId] = occupancyStatus;

    this.webSocketService.sendOccupancyUpdate(deviceId, occupancyStatus);
  }

  public getAllSensorStatuses() {
    return this.sensorStatus;
  }
}
