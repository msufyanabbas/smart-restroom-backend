import { Controller, Get } from '@nestjs/common';
import { MqttService } from './mqtt.service';

@Controller('mqtt') 
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  @Get('statuses') 
  getAllSensorStatuses() {
    return this.mqttService.getAllSensorStatuses();
  }
}
