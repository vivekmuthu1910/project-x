import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSanitizerPipe } from './pipes/file-sanitizer.pipe';



@NgModule({
  declarations: [FileSanitizerPipe],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
