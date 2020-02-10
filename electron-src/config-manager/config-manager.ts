import { existsSync, mkdirSync, promises as fsp } from 'fs';
import { platform } from 'process';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { MQTT, Video } from './interface';
import { BrowserWindow, ipcMain } from 'electron';
import * as defaultConfig from './default-config';

export class ConfigManager {
  private appFolderPath: string;

  video: Video = null;
  mqtt: MQTT = null;

  private _initialized = false;

  constructor(private win: BrowserWindow) {}

  initialize() {
    this.appFolderPath = this.getAppFolderPath();
    this.initializeDefaultConfig();
    this.initializeIpcCalls();
    this._initialized = true;
  }

  private initializeDefaultConfig() {
    if (!existsSync(resolve(this.appFolderPath))) {
      mkdirSync(this.appFolderPath, { recursive: true });
    }

    const videoPath = join(this.appFolderPath, 'Video.json');
    const mqttPath = join(this.appFolderPath, 'MQTT.json');
    fsp
      .stat(videoPath)
      .then(() => {
        fsp
          .readFile(videoPath)
          .then(content => {
            this.video = JSON.parse(content.toString());
          })
          .catch(console.error);
      })
      .catch(() => {
        this.video = defaultConfig.video;

        fsp
          .writeFile(videoPath, JSON.stringify(this.video, null, 2))
          .catch(console.error);
      });

    fsp
      .stat(mqttPath)
      .then(() => {
        fsp
          .readFile(mqttPath)
          .then(content => {
            this.mqtt = JSON.parse(content.toString());
          })
          .catch(console.error);
      })
      .catch(() => {
        this.mqtt = defaultConfig.mqtt;
        fsp
          .writeFile(join(mqttPath), JSON.stringify(this.mqtt, null, 2))
          .catch(console.error);
      });
  }

  private getAppFolderPath() {
    switch (platform) {
      case 'linux':
        return join(homedir(), '.project-x');
      case 'win32':
        return join(homedir(), 'AppData/Roaming/project-x');
      case 'darwin':
        return join(homedir(), 'Library/Application Support/Project-X');
      default:
        return join(homedir(), 'project-x');
    }
  }

  initializeIpcCalls() {
    ipcMain.on('getVideoDirs', event => {
      event.reply('getVideoDirs', this.video.Directories);
    });
  }

  get initialized() {
    return this._initialized;
  }

  set initialized(v: boolean) {
    this._initialized = true;
  }
}
