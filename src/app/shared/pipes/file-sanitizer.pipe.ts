import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSanitizer'
})
export class FileSanitizerPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return null;
  }

}
