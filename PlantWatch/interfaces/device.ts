export interface Device {
  device_id: string;
  created_at: string;
  name: string;
  enabled: boolean;
  track_history: boolean;
  history_length: number;
  type: string;
}