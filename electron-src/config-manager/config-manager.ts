import * as fs from 'fs-extra';
import { platform } from 'process';
import { homedir } from 'os';
import { join } from 'path';
import { MQTT, Video } from './interface';
import { BrowserWindow } from 'electron';
import * as defaultConfig from './default-config';

const eJFile = require('edit-json-file');

export class StateManager {
  private appFolderPath: string;

  private videoFile = null;
  private mqttFile = null;

  private _initialized = false;

  constructor(private win: BrowserWindow) {
    this.appFolderPath = this.getAppFolderPath();

    this.videoFile = eJFile(join(this.appFolderPath, 'Video.json'), {
      autosave: true,
    });
    this.mqttFile = eJFile(join(this.appFolderPath, 'Mqtt.json'), {
      autosave: true,
    });

    this.initializeDefaultConfig();
  }

  initialize() {
    this.initialized = true;
  }

  get initialized() {
    return this._initialized;
  }

  set initialized(v: boolean) {
    this._initialized = true;
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

  private initializeDefaultConfig() {
    if (!fs.existsSync(join(this.appFolderPath))) {
      fs.mkdirpSync(this.appFolderPath);

      this.video = defaultConfig.video;
      fs.writeJSONSync(
        join(this.appFolderPath, 'Video.json'),
        JSON.stringify(this.video)
      );

      this.mqtt = defaultConfig.mqtt;
      fs.writeJSONSync(
        join(this.appFolderPath, 'Mqtt.json'),
        JSON.stringify(this.mqtt)
      );
      this.win.webContents.send('firstTime');
    }
  }

  changeState(setting: string, key: string, value: any) {
    switch (setting) {
      case 'Video':
        eJFile(join(this.appFolderPath, 'Video.json')).set();
        break;

      default:
        break;
    }

    fs.writeJSONSync(
      join(this.appFolderPath, this.stateFile),
      JSON.stringify(this.state)
    );
  }

  getState(key: string) {
    return get(this.state, key);
  }
}
