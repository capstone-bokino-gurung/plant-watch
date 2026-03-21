import { Greenhouse } from '@/interfaces/greenhouse';
import { supabase } from '@/util/supabase';

export async function createGreenhouse(userId: string, greenhouseName: string) {
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
    
    return { data: data[0]?.greenhouse_id };
}

export async function getUserGreenhouses(userId: string) {
    const { data, error } = await supabase
        .from('permissions')
        .select('greenhouses(greenhouse_id, name, created_at)')
        .eq('user_id', userId);
    
    if (error) return { error: 'There was an error retrieving your greenhouses from our database. Please try again later.'};

    const greenhouses = data?.map(item => item.greenhouses as Greenhouse[]).flat().filter(Boolean) || [];

    return { data: greenhouses};
}

export async function deleteGreenhouse(greenhouseId: string) {
  const { error } = await supabase
    .from('greenhouses')
    .delete()
    .eq('greenhouse_id', greenhouseId);

  return { error };
}
