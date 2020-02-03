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
  host: { role: 'list', tabindex: '0' },
})
export class FilesListComponent implements OnInit, AfterViewInit {
  files: Array<{ fileName: string; thumbnail: string }> = [];

  @ViewChildren(ListViewItemComponent) items: QueryList<ListViewItemComponent>;

  private keyManager: FocusKeyManager<ListViewItemComponent>;

  constructor(private fileSer: FilesService) {}

  ngOnInit() {
    this.fileSer.listFiles().then(val => {
      this.files = val;
    });
  }

  ngAfterViewInit() {
    console.log(this.items);
    this.keyManager = new FocusKeyManager(this.items)
      .withWrap()
      .withHorizontalOrientation('ltr');
    this.keyManager.setActiveItem(0);
  }

  openFile(file: string) {
    this.fileSer.openFile(file);
  }
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.openFile(this.keyManager.activeItem.file);
    } else {
      this.keyManager.onKeydown(event);
    }
  }
}
