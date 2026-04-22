export interface DeviceReading {
  value: any,
  unit: string
}

export interface DeviceData {
  [key: string]: DeviceReading;
}

export interface Device {
  device_id: string;
  created_at: string;
  name: string;
  enabled: boolean;
  data: DeviceData,
  track_history: boolean;
  history_length: number;
  type: string;
}