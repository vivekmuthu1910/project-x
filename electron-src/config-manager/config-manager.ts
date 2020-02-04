import { existsSync, mkdirSync, promises as fsp } from 'fs';
import { platform } from 'process';
import { homedir } from 'os';
import { join } from 'path';
import { MQTT, Video } from './interface';
import { BrowserWindow, ipcMain } from 'electron';
import * as defaultConfig from './default-config';

export class ConfigManager {
  private appFolderPath: string;

  private video: Video = null;
  private mqtt: MQTT = null;

  private _initialized = false;

  constructor(private win: BrowserWindow) {}

  initialize() {
    this.appFolderPath = this.getAppFolderPath();
    this.initializeDefaultConfig();
    this.initializeIpcCalls();
    this._initialized = true;
  }

  private initializeDefaultConfig() {
    if (!existsSync(join(this.appFolderPath))) {
      mkdirSync(this.appFolderPath, { recursive: true });

      this.video = defaultConfig.video;
      fsp
        .writeFile(
          join(this.appFolderPath, 'Video.json'),
          JSON.stringify(this.video)
        )
        .catch();

      this.mqtt = defaultConfig.mqtt;
      fsp
        .writeFile(
          join(this.appFolderPath, 'Mqtt.json'),
          JSON.stringify(this.mqtt)
        )
        .catch();
      // this.win.webContents.send('firstTime');
    } else {
      fsp.readFile(join(this.appFolderPath, 'Video.json')).then(content => {
        this.video = JSON.parse(content.toString());
      });
      fsp.readFile(join(this.appFolderPath, 'Mqtt.json')).then(content => {
        this.mqtt = JSON.parse(content.toString());
      });
    }
  }

  private getAppFolderPath() {
    switch (platform) {
      case 'linux':
        return join(homedir(), '.project-x');
      case 'win32':
        return join(homedir(), 'AppData/Roaming/Project-X');
      case 'darwin':
        return join(homedir(), 'Library/Application Support/Project-X');
      default:
        return join(homedir(), 'project-x');
    }
  }

  initializeIpcCalls() {
    ipcMain.on('getVideoDirs', event => {
      event.reply(this.video.Directories);
    });
  }

  get initialized() {
    return this._initialized;
  }

  set initialized(v: boolean) {
    this._initialized = true;
  }
}
