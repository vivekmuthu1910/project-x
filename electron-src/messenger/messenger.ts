import {connect, , IClientOptions} from 'mqtt';
import * as net from 'net';
import { BrowserWindow } from 'electron';

export class Messenger {
  private _mqtt = null;
  private _initialized = false;

  constructor(private win:BrowserWindow, private ) {}

  initialize() {
    try {
      const mqttConfig: IClientOptions = {};
      mqttConfig.host =
      this._mqtt = connect()
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
