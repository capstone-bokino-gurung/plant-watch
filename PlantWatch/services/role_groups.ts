import { RoleGroup } from '@/interfaces/role_group';
import { supabase } from '@/util/supabase';
import { Role } from 'react-native';

const ROLE_TABLE = 'role_groups';

export async function getRoleGroups(greenhouse_id: string) {
  const { data, error } = await supabase
    .from(ROLE_TABLE)
    .select('*')
    .eq('greenhouse_id', greenhouse_id);
  return { data: data as RoleGroup[] | null, error };
}

export async function createRoleGroup(greenhouse_id: string, name: string) {
  const { data, error } = await supabase
    .rpc('create_role_group', { p_name: name, p_greenhouse_id: greenhouse_id });
  return { data: data as RoleGroup | null, error };
}

export async function updateRoleGroup(role_group: RoleGroup) {
  const { role_id, greenhouse_id, name, ...permissions } = role_group;
  const { error } = await supabase
    .from(ROLE_TABLE)
    .update(permissions)
    .eq('role_id', role_id);
  return { error };
}

export async function deleteRoleGroup(role_id: string) {
  const { error } = await supabase
    .from(ROLE_TABLE)
    .delete()
    .eq('role_id', role_id);
  return { error };
}
