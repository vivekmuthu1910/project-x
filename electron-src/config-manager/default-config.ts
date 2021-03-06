import { homedir } from 'os';
import { join } from 'path';

export const video = {
  Directories: [join(homedir(), 'Videos')],
};

export const mqtt = {
  Host: 'broker.hivemq.com',
  Port: 1883,
  TLS: false,
  VideoTopic: 'TN/ProjX/Dld/Vid',
};

export const otherSettings = {
  SnapServer: '34.105.0.150',
  GatewayIP: '192.168.0.1',
};
