import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { FilesService } from '../../services/files.service';
import { ListViewItemComponent } from '../list-view-item/list-view-item.component';
import { FocusKeyManager } from '@angular/cdk/a11y';

@Component({
  selector: 'app-files-list',
  templateUrl: './files-list.component.html',
  styleUrls: ['./files-list.component.scss'],
  host: { role: 'list' },
})
export class FilesListComponent implements OnInit, AfterViewInit {
  files: Array<{ fileName: string; thumbnail?: string }> = [];

  videoDirs: Array<string> = [];

  @ViewChildren(ListViewItemComponent) items: QueryList<ListViewItemComponent>;

  private keyManager: FocusKeyManager<ListViewItemComponent>;
  activeItem = 0;
  constructor(private fileSer: FilesService) {}

  ngOnInit() {
    this.fetchAllFiles();
  }

  async fetchAllFiles() {
    this.videoDirs = await this.fileSer.getVideosDirectories();
    const videoFiles = await this.fileSer.listVideos(this.videoDirs[0]);

    for (let i = 0; i < videoFiles.length; i++) {
      const thumb = await this.fileSer.getThumbs(
        this.videoDirs[0],
        videoFiles[i]
      );
      this.files.push({
        fileName: videoFiles[i],
        thumbnail: thumb,
      });
    }
  }

  ngAfterViewInit() {
    this.keyManager = new FocusKeyManager(this.items)
      // .withWrap()
      .withHorizontalOrientation('ltr');
    this.keyManager.setActiveItem(0);

    setTimeout(() => {
      console.log(this.items.first);
      this.items.first.element.nativeElement.dispatchEvent(
        new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        })
      );
    }, 2000);
  }

  openFile(file: string) {
    this.fileSer.openFile(this.videoDirs[0], file);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.openFile(this.keyManager.activeItem.file);
    } else {
      this.keyManager.onKeydown(event);
      this.activeItem = this.keyManager.activeItemIndex;
    }
  }
}
