export interface MQTT {
  Host: string;
  Port: number;
  Username?: string;
  Password?: string;
  TLS: boolean;
  KeyPath?: string;
  CertFile?: string;
  CAFile?: string;
  VideoTopic: string;
}

export interface Video {
  Directories: Array<string>;
}
