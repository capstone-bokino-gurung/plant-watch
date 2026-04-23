import { createContext, useContext, useEffect, useState } from 'react';
import { RoleGroup } from '@/interfaces/role_group';
import { getRoleId } from '@/services/user';
import { getRoleGroup } from '@/services/role_groups';

interface GreenhouseRoleContextValue {
  role: RoleGroup | null;
  loading: boolean;
  refresh: () => void;
}

const GreenhouseRoleContext = createContext<GreenhouseRoleContextValue>({
  role: null,
  loading: true,
  refresh: () => {},
});

export function useGreenhouseRole() {
  return useContext(GreenhouseRoleContext);
}

interface GreenhouseRoleProviderProps {
  greenhouse_id: string;
  children: React.ReactNode;
}

export function GreenhouseRoleProvider({ greenhouse_id, children }: GreenhouseRoleProviderProps) {
  const [role, setRole] = useState<RoleGroup | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchRole() {
    setLoading(true);
    const { data: roleId, error: roleIdError } = await getRoleId(greenhouse_id);
    if (roleIdError || !roleId) {
      setRole(null);
      setLoading(false);
      return;
    }
    const { data, error } = await getRoleGroup(roleId);
    setRole(error ? null : data);
    setLoading(false);
  }

  useEffect(() => {
    if (greenhouse_id) fetchRole();
  }, [greenhouse_id]);

  return (
    <GreenhouseRoleContext.Provider value={{ role, loading, refresh: fetchRole }}>
      {children}
    </GreenhouseRoleContext.Provider>
  );
}
