export class Downloader {
  private _initialized = false;

  constructor() {}

  initialize() {
    try {
    } catch (error) {}
    this.initialized = true;
  }

  get initialized() {
    return this._initialized;
  }
  set initialized(v: boolean) {
    this._initialized = v;
  }
}
