import { supabase } from "@/util/supabase";

const ACTIVITY_TABLE = 'activity_log';

export function formatTimestamp(date: Date, time: Date): string {
  const combined = new Date(date);
  combined.setUTCHours(time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds(), 0);
  return combined.toISOString();
}

export async function getPlantLogs(plant_id: string) {
  const { data, error } = await supabase
    .from(ACTIVITY_TABLE)
    .select('*')
    .eq('plant_id', plant_id)
    .order('time', { ascending: false });
  return { data, error };
}

export async function createLog(plant_id: string, activity: string, notes: string, time: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated' };
  const userId = user.id;

  const { data, error } = await supabase
      .from(ACTIVITY_TABLE)
      .insert({
          user_id: userId,
          plant_id: plant_id,
          activity: activity,
          notes: notes,
          time: time,
      })
      .select()
      .single();
  return { data, error };
}