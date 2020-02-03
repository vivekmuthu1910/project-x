import {
  Component,
  OnInit,
  Input,
  HostBinding,
  ElementRef,
} from '@angular/core';
import { Highlightable, FocusableOption } from '@angular/cdk/a11y';
import * as path from 'path';
import * as fs from 'fs-extra';

@Component({
  selector: 'app-list-view-item',
  templateUrl: './list-view-item.component.html',
  styleUrls: ['./list-view-item.component.scss'],
  host: {
    tabindex: '-1',
    role: 'list-item',
  },
})
export class ListViewItemComponent implements OnInit, FocusableOption {
  @Input() file: string;
  @Input() thumbnail: string;
  @Input() baseDir: string;

  thumbnailImageBase64: string;
  disabled = false;

  constructor(private element: ElementRef) {}

  ngOnInit() {
    console.log(this.baseDir, this.thumbnail);
    fs.readFile(path.join(this.baseDir, this.thumbnail)).then(val => {
      this.thumbnailImageBase64 =
        'data:image/jpg;base64,' + Buffer.from(val).toString('base64');
    });
  }

  getLabel() {
    return this.file;
  }

  focus() {
    this.element.nativeElement.focus();
  }
}
