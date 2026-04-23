import { Invitation, InvitationDisplay } from "@/interfaces/invitation";
import { ProfileInfo } from "@/interfaces/user";
import { getGreenhouse } from "@/services/greenhouse";
import { supabase } from "@/util/supabase";

const INVITE_TABLE = 'invitations';
const PERMISSIONS_TABLE = 'permissions';

export async function getProfileInfo(user_id: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .rpc('get_user_profile', {
      p_user_id: user_id,
    });

  if (error) return { error: error }

  const profile = Array.isArray(data) ? data[0] : data;
  return { data: profile as ProfileInfo }
}

export async function getGreenhouseInvites(): Promise<{ data?: InvitationDisplay[]; error?: string }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from(INVITE_TABLE)
    .select('*')
    .eq('receiver_id', user.id);
  if (error) return { error: 'There was an error retrieving your invitations from our database. Please try again later.' };

  const invitations = (data || []) as Invitation[];

  const results: InvitationDisplay[] = [];

  for (const inv of invitations) {
    const [greenhouseResult, profileResult] = await Promise.all([
      getGreenhouse(inv.greenhouse_id),
      getProfileInfo(inv.sender_id),
    ]);

    if (greenhouseResult.error || profileResult.error) continue;
    const profile = profileResult.data as ProfileInfo;

    results.push({
      greenhouse_id: inv.greenhouse_id,
      greenhouse_name: greenhouseResult.data!.name,
      sender_id: inv.sender_id,
      sender_name: `${profile.first_name} ${profile.last_name}`,
      sender_email: profile.email,
    });
  }

  return { data: results };
}

export async function getRoleId(greenhouse_id: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from(PERMISSIONS_TABLE)
    .select('role_id')
    .eq('user_id', user.id)
    .eq('greenhouse_id', greenhouse_id)
    .single();
  return { data: data?.role_id as string | null, error };
}

export async function acceptInvite(greenhouse_id: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .rpc('accept_greenhouse_invite', {
      p_greenhouse_id: greenhouse_id,
    });

  if (error) return { error: error }
}

export async function rejectInvite(greenhouse_id: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from(INVITE_TABLE)
    .delete()
    .eq('greenhouse_id', greenhouse_id)
    .eq('receiver_id', user.id);

  if (error) return { error: error.message };
  return {};
}

export async function rescindInvite(greenhouse_id: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from(INVITE_TABLE)
    .delete()
    .eq('greenhouse_id', greenhouse_id)
    .eq('sender_id', user.id);

  if (error) return { error: error.message };
  return {};
}
