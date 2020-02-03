import { BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs-extra';

export class Settings {
  private _initialized = false;

  constructor() {}

  initialize() {
    try {
    } catch (error) {}
    this._initialized = true;
  }

  getVideosDir() {
    ipcMain.on('getVideosDir', (event, args) => {});
  }

  public get initialized(): boolean {
    return this._initialized;
  }

  public set initialized(v: boolean) {
    this._initialized = v;
  }

  async getVideosHomeFolder() {
    this.settings = await fs.readJSON(
      join(this.appFolderPath, 'settings.json')
    );
  }

  setVideosHomeFolder(event: IpcMainEvent, folder: string) {
    this.settings.VideoHome = folder;
    fs.writeJSON(
      join(this.appFolderPath, 'settings.json'),
      JSON.stringify(this.settings)
    )
      .then(() => {
        event.reply('success');
      })
      .catch(err => {
        event.reply(JSON.stringify(err));
      });
  }
}
