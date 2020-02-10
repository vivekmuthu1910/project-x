import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { FocusableOption } from '@angular/cdk/a11y';

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
  // @Input() baseDir: string;

  thumbnailImageBase64: string;
  disabled = false;

  constructor(public element: ElementRef<HTMLElement>) {}

  ngOnInit() {
    if (this.thumbnail) {
      this.thumbnailImageBase64 = 'data:image/jpg;base64,' + this.thumbnail;
    } else {
      this.thumbnailImageBase64 = 'assets/icons/video512x512.png';
    }
  }

  getLabel() {
    return this.file;
  }

  focus() {
    this.element.nativeElement.focus();
  }
}
