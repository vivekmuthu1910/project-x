import { Injectable } from '@angular/core';
import * as path from 'path';
import { ipcRenderer } from 'electron';
import { Router } from '@angular/router';

@Injectable()
export class FilesService {
  videosHomeDir = '';

  constructor(private router: Router) {}

  getVideosDirectories(): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .once('getVideoDirs', (event, dirs: Array<string>) => {
          resolve(dirs);
        })
        .send('getVideoDirs');
    });
  }

  listVideos(dir: string): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .once('getVideos', (event, filestat: Array<string>) => {
          resolve(filestat);
        })
        .send('getVideos', dir, {
          sortBy: 'time',
          sortOrder: 'descending',
        });
    });
  }

  getThumbs(dir: string, file: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .once('getThumbnail', (event, thumbnailBuffer: string) => {
          resolve(thumbnailBuffer);
        })
        .send('getThumbnail', dir, file);
    });
  }

  openFile(folder: string, file: string) {
    ipcRenderer.send('playVideo', folder, file);
  }
}
