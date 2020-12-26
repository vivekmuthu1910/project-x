import { FileSanitizerPipe } from './file-sanitizer.pipe';

describe('FileSanitizerPipe', () => {
  it('create an instance', () => {
    const pipe = new FileSanitizerPipe();
    expect(pipe).toBeTruthy();
  });
});
