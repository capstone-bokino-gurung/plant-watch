import { Greenhouse } from '@/interfaces/greenhouse';
import { User } from '@/interfaces/user';
import { supabase } from '@/util/supabase';

const INVITE_TABLE = 'invitations';
const PERMISSION_TABLE = 'permissions';

export async function createGreenhouse(greenhouseName: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Not authenticated' };
    const userId = user.id;

    // Check for duplicates WITHOUT using a join
    // First get all user's greenhouse IDs
    const { data: userPermissions, error: permError } = await supabase
        .from(PERMISSION_TABLE)
        .select('greenhouse_id')
        .eq('user_id', userId);

    if (permError) return { error: permError };

    if (userPermissions && userPermissions.length > 0) {
        const greenhouseIds = userPermissions.map(p => p.greenhouse_id);
        
        // Then check if any have this name
        const { data: existingGreenhouse, error: checkError } = await supabase
        .from('greenhouses')
            .select('greenhouse_id')
            .in('greenhouse_id', greenhouseIds)
            .eq('name', greenhouseName)
            .maybeSingle();

        if (checkError) return { error: checkError };
        
        if (existingGreenhouse) {
            return { error: 'You already have a greenhouse with this name' };
        }
    }

    const { data, error } = await supabase
        .rpc('create_greenhouse_with_permission', {
            p_user_id: userId,
            p_greenhouse_name: greenhouseName
        });

    if (error) return { error };
    return { data: data };
    
}

export async function getUserGreenhouses() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
        .from(PERMISSION_TABLE)
        .select('greenhouses(greenhouse_id, name, created_at)')
        .eq('user_id', user.id);
    console.log(error);
    if (error) return { error: 'There was an error retrieving your greenhouses from our database. Please try again later.'};

    const greenhouses = data?.map(item => item.greenhouses as Greenhouse[]).flat().filter(Boolean) || [];

    return { data: greenhouses};
}

export async function getGreenhouse(greenhouse_id: string) {
  const { data, error } = await supabase
    .from('greenhouses')
    .select('greenhouse_id, name, created_at')
    .eq('greenhouse_id', greenhouse_id)
    .single();

  if (error) return { error: error.message };
  return { data: data as Greenhouse };
}

export async function getGreenhouseUsers(greenhouse_id: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from(PERMISSION_TABLE)
    .select('user_id, role_id')
    .eq('greenhouse_id', greenhouse_id);

  if (error) return { error: 'There was an error retrieving users from our database. Please try again later.' };

  const users: User[] = [];
  for (const perm of data || []) {
    const { data: profile } = await supabase.rpc('get_user_profile', { p_user_id: perm.user_id });
    const p = Array.isArray(profile) ? profile[0] : profile;
    if (!p) continue;
    users.push({ ...p, user_id: perm.user_id, role_id: perm.role_id } as User);
  }

  return { data: users };
}

export async function deleteGreenhouse(greenhouse_id: string) {
  const { error } = await supabase
    .from('greenhouses')
    .delete()
    .eq('greenhouse_id', greenhouse_id);

  return { error };
}

export async function inviteUser(greenhouse_id: string, email: string): Promise<{ error?: string }> {
  const { data, error } = await supabase
    .rpc('invite_to_greenhouse', {
      p_greenhouse_id: greenhouse_id,
      p_email: email,
    });

  if (error) return { error: error.message };
  if (data === false) return { error: 'User not found, already invited, or account is private.' };
  return {};
}

export async function updateRoleGroup(greenhouse_id: string, user_id: string, role_id: string) {
  const { error } = await supabase
    .from(PERMISSION_TABLE)
    .update({ role_id })
    .eq('greenhouse_id', greenhouse_id)
    .eq('user_id', user_id);
  return { error };
}
