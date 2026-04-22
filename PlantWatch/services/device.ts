import { Device } from "@/interfaces/device";
import { suppDevices } from "@/constants/supported-devices";
import { supabase } from '@/util/supabase';

const DEVICES_TABLE = 'devices';
const HISTORY_TABLE = 'device_history';

export async function getDevices(greenhouse_id: string) {
  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .select('*')
    .eq('greenhouse_id', greenhouse_id);
  return { data: data as Device[] | null, error };
}

export async function createDevice(
  name: string,
  type: string,
  greenhouse_id: string,
  track_history: boolean,
  history_length: number
) {
  const { data, error } = await supabase
      .from(DEVICES_TABLE)
      .insert({
          name: name,
          type: type,
          greenhouse_id: greenhouse_id,
          track_history: track_history,
          history_length: history_length
      })
      .select()
      .single();
  return { data, error };
}

export async function getDevice(device_id: string) {
  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .select('*')
    .eq('device_id', device_id)
    .single();
  return { data: data as Device | null, error };
}

export async function deleteDevice(device_id: string) {
  const { error } = await supabase
    .from(DEVICES_TABLE)
    .delete()
    .eq('device_id', device_id);
  return { error };
}

export function formatDeviceReading(device: Device) {
  const readings: Record<string, string> = {}
  for (const [type, reading] of Object.entries(device.data)) {
    if (reading.unit == 'percent') {
      readings[type] = (reading.value) * 100 + '%';
    } else {
      readings[type] = reading.value + ' ' + reading.unit;
    }
  }
  return readings;
}

export function formatDeviceReadingType(type: string) {
  const words = type.split('_');
  const capitalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalized.join(' ');
}