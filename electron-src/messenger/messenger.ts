import { connect, IClientOptions, MqttClient, Packet } from 'mqtt';
import { ConfigManager } from '../config-manager/config-manager';
import { join, basename, parse } from 'path';
import { request } from 'http';
import * as querystring from 'querystring';

var Downloader = require('mt-files-downloader');
export class Messenger {
  private _mqtt: MqttClient = null;
  private _initialized = false;

  constructor(private config: ConfigManager) {}

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
    } catch (error) {
      console.error(error);
    }
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
    if (topic === this.config.mqtt.VideoTopic) {
      const message = JSON.parse(payload.toString());

      let videoFilePath: string = basename(message.videoUrl).split('?')[0];
      const fileName = parse(videoFilePath).name;
      const dl = new Downloader().download(
        message.videoUrl,
        join(this.config.video.Directories[0], videoFilePath)
      );

      let imagePath = basename(message.imageUrl).split('?')[0];
      let imageExt = parse(imagePath).ext;

      const imgDl = new Downloader().download(
        message.imageUrl,
        join(this.config.video.Directories[0], fileName, imageExt)
      );

      dl.start();
      imgDl.start();

      dl.on('end', err => {
        let postData: string;
        if (err) {
          postData = querystring.stringify({
            message: JSON.stringify(err),
            topic: `Download failed for ${fileName}`,
            notifyMe: 'yes',
          });
        } else {
          postData = querystring.stringify({
            message: '',
            topic: `Downloaded ${fileName}`,
            notifyMe: 'yes',
          });
        }

        const options = {
          hostname: '35.244.47.236',
          port: 80,
          path: '/ThanosSnapUtility/Notify',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
          },
        };

        const req = request(options, res => {});

        req.on('error', e => {
          console.error(`Problem with request: ${e.message}`);
        });

        // Write data to request body
        req.write(postData);
        req.end();
      });
    }
  }
  get initialized() {
    return this._initialized;
  }
  set initialized(v: boolean) {
    this._initialized = v;
  }
}
