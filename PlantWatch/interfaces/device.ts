export interface Device {
  device_id: string;
  data: any;
  created_at: string;
  name: string;
  track_history: boolean;
  history_length: number;
  type: string;
}