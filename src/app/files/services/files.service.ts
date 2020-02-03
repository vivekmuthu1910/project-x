import { Injectable } from '@angular/core';
import * as fs from 'fs-extra';
import { exec } from 'child_process';
import * as path from 'path';
import { ipcRenderer } from 'electron';
import { Router } from '@angular/router';

@Injectable()
export class FilesService {
  videosHomeDir = '';

  constructor(private router: Router) {
    ipcRenderer.on('videosHomeDir', (event, arg) => {
      this.videosHomeDir = arg;
    });
  }

  listFiles(): Promise<Array<{ fileName: string; thumbnail: string }>> {
    return fs.readJSON(path.join(this.videosHomeDir, 'files.json'));
  }

  openFile(folder: string, file: string) {
    const filePath = path.join(folder, file);
    const vlcCommand = `vlc -f "${filePath}"`;
    exec(vlcCommand, (err, stdout) => {
      if (err) {
        console.error(err);
      }
    });
  }
}
