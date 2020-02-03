import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSanitizer',
})
export class FileSanitizerPipe implements PipeTransform {
  transform(value: string, ...args: any[]): any {
    let fileName = value;
    return fileName
      .replace(/(www\.\w+\.\w+)|(\[[^\]]+\])|(\([^\)]+\))|(\.\w+$)/gi, '')
      .replace(/([^\w-])|_/gi, ' ')
      .trim();
  }
}
