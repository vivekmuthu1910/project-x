import { connect, IClientOptions, MqttClient, Packet } from 'mqtt';
import { BrowserWindow } from 'electron';
import { ConfigManager } from '../config-manager/config-manager';

export class Messenger {
  private _mqtt: MqttClient = null;
  private _initialized = false;

  constructor(private win: BrowserWindow, private config: ConfigManager) {}

  initialize() {
    try {
      const mqttConfig: IClientOptions = {
        host: this.config.mqtt.Host,
        port: this.config.mqtt.Port,
      };

      this._mqtt = connect(mqttConfig);

      this._mqtt.subscribe(this.config.mqtt.VideoTopic);

      this._mqtt.on(
        'message',
        (topic: string, payload: Buffer, packet: Packet) => {
          this.processMessage(topic, payload, packet);
        }
      );
    } catch (error) {}
    this.initialized = true;
  }

  reinitialize() {
    this.initialized = false;

    this.initialized = true;
  }

  uninitialize() {
    this.initialized = false;
  }

  processMessage(topic: string, payload: Buffer, packet: Packet) {
    console.log(topic, payload, packet);
  }
  get initialized() {
    return this._initialized;
  }
  set initialized(v: boolean) {
    this._initialized = v;
  }
}
