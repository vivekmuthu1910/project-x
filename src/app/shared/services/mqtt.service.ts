import { Injectable } from '@angular/core';
import { connect } from 'mqtt';
@Injectable({
  providedIn: 'root',
})
export class MqttService {
  mqttClient = connect('mqtt://broker.hivemq.com');
  constructor() {
    this.mqttClient.on('message', (topic, message) => {
      console.log(JSON.parse(message.toString()));
    });
  }

  subscribe(topic: string) {
    this.mqttClient.subscribe(topic, { qos: 0 }, (err, success) => {
      if (err) {
        console.warn('Unable to subscribe', err);
      }
    });
  }
}
