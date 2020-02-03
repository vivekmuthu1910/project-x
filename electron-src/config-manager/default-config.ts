import { homedir } from 'os';
import { join } from 'path';

export const video = {
  Directories: [join(homedir(), 'Videos')],
};

export const mqtt = {
  Host: 'broker.hivemq.com',
  Port: 1883,
  TLS: false,
};
