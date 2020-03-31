import { connect, IClientOptions, MqttClient, Packet } from 'mqtt';
import { ConfigManager } from '../config-manager/config-manager';
import { join } from 'path';
import { request } from 'http';
import * as querystring from 'querystring';
import { DownloaderHelper } from 'node-downloader-helper';
import { BrowserWindow } from 'electron';
import { unlinkSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { FileExplorer } from '../file-explorer/file-explorer';

const ackTopicBase = 'ProjectX/TS/ACK';
const commandTopicBase = 'ProjectX/TS/COMMAND';

export class Messenger {
  private _mqtt: MqttClient = null;
  private _initialized = false;

  constructor(private win: BrowserWindow, private config: ConfigManager) {}

  initialize(fileExp: FileExplorer) {
    try {
      const mqttConfig: IClientOptions = {
        host: this.config.mqtt.Host,
        port: this.config.mqtt.Port,
      };

      this._mqtt = connect(mqttConfig);

      this._mqtt.subscribe(this.config.mqtt.VideoTopic);

      this._mqtt.subscribe(`${commandTopicBase}/#`);

      this._mqtt.on(
        `message`,
        (topic: string, payload: Buffer, packet: Packet) => {
          if (topic === `${commandTopicBase}/RUAlive`) {
            this._mqtt.publish(`${ackTopicBase}/RUAlive`, `yes`);
            this.notify(
              `Alive`,
              `Hi I am alive. Files count: ${fileExp.videosSize}.`
            );
            return;
          }
          if (topic === `${commandTopicBase}/RUAliveACKOnly`) {
            this._mqtt.publish(`${ackTopicBase}/RUAliveACKOnly`, `yes`);
            return;
          }

          if (topic === `${commandTopicBase}/Reboot`) {
            this._mqtt.publish(`${ackTopicBase}/Reboot`, `yes`);
            exec(`sudo reboot`);
            return;
          }

          if (topic === `${commandTopicBase}/ShutDown`) {
            this._mqtt.publish(`${ackTopicBase}/ShutDown`, 'yes');
            exec('sudo shutdown now');
            return;
          }

          this.processMessage(topic, payload);
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

  processMessage(topic: string, payload: Buffer) {
    if (topic === this.config.mqtt.VideoTopic) {
      const message = JSON.parse(payload.toString());

      const videoFile = join(
        this.config.video.Directories[0],
        message.videoFileName
      );
      if (existsSync(videoFile)) {
        unlinkSync(videoFile);
        this.notify(
          'Deleted',
          `Already existing ${message.videoFileName} has been deleted`
        );
      }

      const videoDl = new DownloaderHelper(
        message.videoUrl,
        this.config.video.Directories[0],
        { fileName: message.videoFileName }
      );

      const imgDl = new DownloaderHelper(
        message.imgUrl,
        this.config.video.Directories[0],
        { fileName: message.imgFileName }
      );

      videoDl.start();
      imgDl.start();

      const statusInterval = setInterval(() => {
        const stat = videoDl.getStats();
        this._mqtt.publish(
          `${this.config.mqtt.VideoTopic}/PROGRESS`,
          JSON.stringify({
            downloaded: stat.downloaded / 1024 / 1024,
            speed: stat.speed / 1024 / 1024,
            remaining: (stat.total - stat.downloaded) / 1024 / 1024,
            fileName: message.videoFileName,
          })
        );
      }, 5000);

      this.notify('Download started', message.videoFileName);
      videoDl.on('end', () => {
        clearInterval(statusInterval);
        const stats = videoDl.getStats();
        if (stats.total > stats.downloaded) {
          this.notify('Download Failed', message.videoFileName);
        } else {
          this.notify('Download completed', message.videoFileName);
        }
        this.win.reload();
      });

      videoDl.on('error', err => {
        unlinkSync(
          join(this.config.video.Directories[0], message.videoFileName)
        );
        unlinkSync(join(this.config.video.Directories[0], message.imgFileName));
        this.notify(
          'Download Failed',
          `${message.videoFileName} was not able to download due to ${err.message}`
        );
      });
    }
  }
  get initialized() {
    return this._initialized;
  }
  set initialized(v: boolean) {
    this._initialized = v;
  }

  notify(title: string, message: string) {
    const postData = querystring.stringify({
      message,
      title,
      notifyMe: 'yes',
    });

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

    const req = request(options, () => {});

    req.on('error', e => {
      console.error(`Problem with request: ${e.message}`);
    });
    req.write(postData);
    req.end();
  }
}
