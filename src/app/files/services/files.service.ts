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

  listVideos(
    dir: string
  ): Promise<
    Array<{
      name: string;
      birthtime: Date;
      size: number;
    }>
  > {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .once(
          'getVideos',
          (
            event,
            filestat: Array<{
              name: string;
              birthtime: Date;
              size: number;
            }>
          ) => {
            resolve(filestat);
          }
        )
        .send('getVideos', dir, {
          sortBy: 'time',
          sortOrder: 'descending',
        });
    });
  }

  // openFile(folder: string, file: string) {
  //   const filePath = path.join(folder, file);
  //   const vlcCommand = `vlc -f "${filePath}"`;
  //   exec(vlcCommand, (err, stdout) => {
  //     if (err) {
  //       console.error(err);
  //     }
  //   });
  // }
}
