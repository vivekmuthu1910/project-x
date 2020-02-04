/* import {connect, , IClientOptions} from 'mqtt';
import * as net from 'net';
import { BrowserWindow } from 'electron';
import {ConfigManager} from '../config-manager/config-manager'

export class Messenger {
  private _mqtt = null;
  private _initialized = false;

  constructor(private win:BrowserWindow, private config: ConfigManager) {}

  initialize() {
    try {
      const mqttConfig: IClientOptions = {};
      mqttConfig.host =
      this._mqtt = connect()
    } catch (error) {}
    this.initialized = true;
  }

  reinitialize() {
    this.initialized = false;

    this.initialized = true;

  }

  uninitialize() {

    this.initialized = false;
  }
  get initialized() {
    return this._initialized;
  }
  set initialized(v: boolean) {
    this._initialized = v;
  }
}
 */
