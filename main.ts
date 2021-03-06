import { app, BrowserWindow, screen, Menu } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { promises } from 'fs';

import { ConfigManager } from './electron-src/config-manager/config-manager';
import { FileExplorer } from './electron-src/file-explorer/file-explorer';
import { Messenger } from './electron-src/messenger/messenger';

import { request } from 'http';
import * as querystring from 'querystring';

const diskusage = require('diskusage');

const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

class ProjectX {
  mainWin: BrowserWindow = null;

  configManager: ConfigManager = null;
  fileExplorer: FileExplorer = null;
  messenger: Messenger = null;
  // downloader: Downloader = null;

  private _initialized = false;

  constructor() {}

  initialize() {
    try {
      // This method will be called when Electron has finished
      // initialization and is ready to create browser windows.
      // Some APIs can only be used after this event occurs.
      app.on('ready', async () => {
        this.runApp();
        this.configManager = new ConfigManager(this.mainWin);
        await this.configManager.initialize();

        this.fileExplorer = new FileExplorer(this.configManager);
        this.fileExplorer.initialize();

        this.messenger = new Messenger(this.mainWin, this.configManager);
        this.messenger.initialize(this.fileExplorer);
      });

      // Quit when all windows are closed.
      app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
          app.quit();
        }
      });

      app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (this.mainWin === null) {
          this.runApp();
        }
      });

      this.startupNotify(); // (this.configManager);
    } catch (e) {
      console.log(e);
      // Catch Error
      // throw e;
    }

    this._initialized = true;
  }

  runApp(): BrowserWindow {
    // Create the browser window.
    this.mainWin = new BrowserWindow({
      fullscreen: true,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        allowRunningInsecureContent: serve ? true : false,
      },
    });

    if (serve) {
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
      });
      this.mainWin.loadURL('http://localhost:4200');
    } else {
      this.mainWin.loadURL(
        url.format({
          pathname: path.join(__dirname, 'dist/index.html'),
          protocol: 'file:',
          slashes: true,
        })
      );
    }

    if (serve) {
      this.mainWin.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    this.mainWin.on('closed', () => {
      // Dereference the window object, usually you would store window
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      this.mainWin = null;
    });

    return this.mainWin;
  }

  startupNotify() {
    setTimeout(async () => {
      let message = `App started. ${new Date(
        Date.now() - 90000
      ).toLocaleString()}. Total Videos: ${this.fileExplorer.videosSize}.`;
      try {
        const { free } = await diskusage.check(
          this.configManager.video.Directories[0]
        );
        message += ` Remaining Disk space: ${(free / 1073741824).toFixed(
          2
        )}GB.`;
      } catch (error) {
        console.error(error);
      }

      let shutdownFile = '/home/pi/project-x/shutdown.txt';
      try {
        await promises.readFile(shutdownFile).then((val) => {
          if (val.toString()[0] === '1') {
            message += ` Last shutdown was proper.`;
            return promises.writeFile(shutdownFile, '0');
          } else {
            message += ` Last shutdown was improper.`;
          }
        });
      } catch (error) {
        console.error(error);
      }

      this.messenger.notify('App Notification', message);
    }, 90000);
  }

  get initialized() {
    return this._initialized;
  }

  set initialized(v: boolean) {
    this._initialized = v;
  }
}

const projectX = new ProjectX();
projectX.initialize();
