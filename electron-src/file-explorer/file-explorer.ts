import { promises as fs } from 'fs';
import { parse, join } from 'path';
import { Buffer } from 'buffer';
import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { async } from '@angular/core/testing';

const ping = require('ping');
const network = require('network');

interface GetAllFilesOptions {
  sortBy: 'name' | 'time' | 'size';
  sortOrder: 'ascending' | 'descending';
}

const videoFileExts = ['.mp4', '.wmv', '.mkv', '.avi', '.flv', '.mov'];

async function* getStats(dir: string, files: Array<string>) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const stat = await fs.stat(join(dir, file));
    const parseFilePath = parse(file);
    if (videoFileExts.includes(parseFilePath.ext)) {
      yield {
        name: file,
        birthtime: stat.mtime,
        size: stat.size,
      };
    }
  }
}

export class FileExplorer {
  private _initialized = false;

  videosSize = 0;
  constructor() {}

  initialize() {
    ipcMain
      .on('getVideos', (event, dir, options?) => {
        this.getAllVideoFiles(dir, options).then(val => {
          event.reply('getVideos', val);
        });
      })
      .on('getThumbnail', (event, dir, file) => {
        this.getThumbnail(dir, file).then(val => {
          event.reply('getThumbnail', val);
        });
      })
      .on('playVideo', (event, dir, file) => {
        this.playVideo(dir, file);
      });

    let gatewayIp: string = '';
    network.get_gateway_ip((err, obj) => {
      if (err) {
        console.error(err);
      } else {
        gatewayIp = obj;
      }
    });

    let lastTimePingSuccess = 0;
    setInterval(async () => {
      try {
        const pingState = await ping.promise.probe(gatewayIp);
        if (!pingState.alive) {
          if (Date.now() - lastTimePingSuccess > 30000) {
            exec('sudo shutdown now', (err, stdout) => {
              if (err) {
                console.error(err);
              }
            });
          }
          // exec('sudo shutdown now', (err, stdout) => {
          //   if (err) {
          //     console.error(err);
          //   }
          // });
        } else {
          lastTimePingSuccess = Date.now();
        }
      } catch (error) {}
    }, 5000);
    this._initialized = true;
  }

  async getAllVideoFiles(dir: string, options?: GetAllFilesOptions) {
    let opts = options || {
      sortBy: 'time',
      sortOrder: 'descending',
    };

    const subFilFol = await fs.readdir(dir);

    const fileStats: Array<{
      name: string;
      birthtime: Date;
      size: number;
    }> = [];

    for await (let stat of getStats(dir, subFilFol)) {
      fileStats.push(stat);
    }

    console.log(fileStats);
    fileStats.sort((fileA, fileB) => {
      switch (opts.sortBy) {
        case 'time':
          const fileATime = fileA.birthtime.getTime();
          const fileBTime = fileB.birthtime.getTime();
          return opts.sortOrder === 'ascending'
            ? fileATime - fileBTime
            : fileBTime - fileATime;
        case 'size':
          return opts.sortOrder === 'ascending'
            ? fileA.size - fileB.size
            : fileB.size - fileA.size;
        case 'name':
          return (opts.sortOrder === 'ascending'
          ? fileA.name < fileB.name
          : fileB.name < fileA.name)
            ? -1
            : 1;
        default:
          return 0;
      }
    });

    this.videosSize = fileStats.length;
    return fileStats.map(val => val.name);
  }

  async getThumbnail(dir: string, fileName: string) {
    const files = await fs.readdir(dir);
    const parsedPath = parse(join(dir, fileName));

    for (let i = 0; i < imageFileNames.length; i++) {
      const file = parsedPath.name + imageFileNames[i];

      if (files.includes(file)) {
        return (await fs.readFile(join(dir, file))).toString('base64');
      }
    }

    return '';
  }

  playVideo(dir: string, file: string) {
    const filePath = join(dir, file);
    const vlcCommand = `vlc -f "${filePath}"`;
    exec(vlcCommand, (err, stdout) => {
      if (err) {
        console.error(err);
      }
    });
  }

  get initialized() {
    return this._initialized;
  }

  set initialized(v: boolean) {
    this._initialized = v;
  }
}

const imageFileNames = ['.jpg', '.png', '.jpeg'];
