import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { WebSocketService } from './websocket.service';
import { Cubicle } from './cubicle.interface';

@Injectable()
export class MqttService implements OnModuleInit {
  private client;
  private sensorStatus: Record<string, Cubicle & { createdAt: number }> = {};
  private deviceLastActive: Map<string, NodeJS.Timeout> = new Map();
  private readonly INACTIVITY_THRESHOLD = 2 * 60 * 1000; // 2 minutes

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
    if (data.occupancy !== undefined && data.occupancy !== null) {
      const deviceId = data.devEUI;
      const name = data.deviceName;
      const occupancyStatus = data.occupancy ? 'Occupied' : 'Vacant';

      if (!this.sensorStatus[deviceId]) {
        // Set createdAt only when the device is first seen
        this.sensorStatus[deviceId] = { deviceId, name, status: occupancyStatus, createdAt: Date.now() };
      } else {
        // Preserve the existing createdAt timestamp
        this.sensorStatus[deviceId] = {
          ...this.sensorStatus[deviceId],
          status: occupancyStatus,
        };
      }
      
      this.webSocketService.sendOccupancyUpdate(deviceId, occupancyStatus, name);
      this.updateDeviceActivity(deviceId);
    }
  }

  private updateDeviceActivity(deviceId: string) {
    if (this.deviceLastActive.has(deviceId)) {
      clearTimeout(this.deviceLastActive.get(deviceId));
    }

    const timeout = setTimeout(() => {
      delete this.sensorStatus[deviceId];
      this.deviceLastActive.delete(deviceId);
      this.webSocketService.sendDeviceRemoved(deviceId);
      console.log(`⚠️ Device removed due to inactivity: ${deviceId}`);
    }, this.INACTIVITY_THRESHOLD);

    this.deviceLastActive.set(deviceId, timeout);
  }

  public getAllSensorStatuses() {
    return Object.values(this.sensorStatus).sort((a, b) => a.createdAt - b.createdAt);
  }
}
