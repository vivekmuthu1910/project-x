import { existsSync, mkdirSync, promises as fsp } from 'fs';
import { platform } from 'process';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { MQTT, Video, OtherSettings } from './interface';
import { BrowserWindow, ipcMain } from 'electron';
import * as defaultConfig from './default-config';

export class ConfigManager {
  private appFolderPath: string;

  video: Video = null;
  mqtt: MQTT = null;
  otherSettings: OtherSettings = null;

  private _initialized = false;

  constructor(private win: BrowserWindow) {}

  async initialize() {
    try {
      this.appFolderPath = this.getAppFolderPath();
      this.initializeIpcCalls();
      await this.initializeDefaultConfig();
    } catch (error) {}
    this._initialized = true;
  }

  private async initializeDefaultConfig() {
    if (!existsSync(resolve(this.appFolderPath))) {
      mkdirSync(this.appFolderPath, { recursive: true });
    }

    const videoPath = join(this.appFolderPath, 'Video.json');
    const mqttPath = join(this.appFolderPath, 'MQTT.json');
    const otherSettingsPath = join(this.appFolderPath, 'OtherSettings.json');

    try {
      await fsp.stat(videoPath);
      this.video = JSON.parse((await fsp.readFile(videoPath)).toString());
    } catch (error) {
      this.video = defaultConfig.video;
      fsp
        .writeFile(videoPath, JSON.stringify(this.video, null, 2))
        .catch(console.error);
    }

    try {
      await fsp.stat(mqttPath);
      this.mqtt = JSON.parse((await fsp.readFile(mqttPath)).toString());
    } catch (error) {
      this.mqtt = defaultConfig.mqtt;
      fsp
        .writeFile(mqttPath, JSON.stringify(this.mqtt, null, 2))
        .catch(console.error);
    }

    try {
      await fsp.stat(otherSettingsPath);
      this.otherSettings = JSON.parse(
        (await fsp.readFile(otherSettingsPath)).toString()
      );
    } catch (error) {
      this.otherSettings = defaultConfig.otherSettings;
      fsp
        .writeFile(
          otherSettingsPath,
          JSON.stringify(this.otherSettings, null, 2)
        )
        .catch(console.error);
    }
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
    ipcMain.on('getVideoDirs', (event) => {
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
