import { Greenhouse } from '@/interfaces/greenhouse';
import { User } from '@/interfaces/user';
import { supabase } from '@/util/supabase';

const INVITE_TABLE = 'invitations';

export async function createGreenhouse(greenhouseName: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Not authenticated' };
    const userId = user.id;

    // Check for duplicates WITHOUT using a join
    // First get all user's greenhouse IDs
    const { data: userPermissions, error: permError } = await supabase
        .from('permissions')
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
        .from('permissions')
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
        .from('permissions')
        .select('role_id, users(user_id, first_name, last_name, email, avatar_url, private, created_at)')
        .eq('greenhouse_id', greenhouse_id);

    if (error) return { error: 'There was an error retrieving your greenhouses from our database. Please try again later.'};

    const users = data?.map(item => ({ ...(item.users as unknown as User), role_id: item.role_id })).filter(Boolean) || [];

    return { data: users};
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
