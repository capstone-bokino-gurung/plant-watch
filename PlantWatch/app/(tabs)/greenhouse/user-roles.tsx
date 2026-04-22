import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { GreenhouseHeader } from '@/components/greenhouse-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Dropdown } from '@/components/ui/dropdown';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { getRoleGroups, createRoleGroup, updateRoleGroup } from '@/services/role_groups';
import { RoleGroup } from '@/interfaces/role_group';
import { CreateRole } from '@/components/modals/create-role';
import { InfoModal } from '@/components/modals/info-modal';
import { colToRoleInfo } from '@/constants/permission-descriptions';

const PERMISSION_KEYS = Object.keys(colToRoleInfo) as (keyof RoleGroup)[];

export default function UserRolesScreen() {
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const { greenhouse_id, greenhouse_name, from } = useLocalSearchParams<{
    greenhouse_id: string;
    greenhouse_name: string;
    from?: string;
  }>();

  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleGroup | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createRoleVisible, setCreateRoleVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    if (greenhouse_id) fetchRoles();
  }, [greenhouse_id]));

  async function fetchRoles() {
    const { data, error } = await getRoleGroups(greenhouse_id);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setRoleGroups(data || []);
    }
  }

  function selectRole(role: RoleGroup) {
    setSelectedRole(role);
    setDropdownOpen(false);
    const perms: Record<string, boolean> = {};
    for (const key of PERMISSION_KEYS) {
      perms[key as string] = role[key] as boolean;
    }
    setPermissions(perms);
  }

  function togglePermission(key: string) {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSavePermissions() {
    if (!selectedRole) return;
    const updated: RoleGroup = { ...selectedRole, ...permissions };
    const { error } = await updateRoleGroup(updated);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setRoleGroups(prev => prev.map(r => r.role_id === updated.role_id ? updated : r));
      setSelectedRole(updated);
      setInfoVisible(true);
    }
  }

  async function handleCreateRole(name: string) {
    const { data, error } = await createRoleGroup(greenhouse_id, name);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      const newRole = data as RoleGroup;
      setRoleGroups(prev => [...prev, newRole]);
      selectRole(newRole);
      setCreateRoleVisible(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ animation: from === 'menu' ? 'fade' : 'default' }} />

      <GreenhouseHeader
        greenhouse_id={greenhouse_id}
        greenhouse_name={greenhouse_name}
        currentPage="userRoles"
        pageTitle="User Roles"
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Role dropdown */}
        <ThemedText style={styles.fieldLabel}>Role</ThemedText>
        <Dropdown
          items={roleGroups}
          selectedValue={selectedRole}
          onSelect={role => { selectRole(role); setDropdownOpen(false); }}
          getLabel={role => role.name}
          getKey={role => role.role_id}
          isOpen={dropdownOpen}
          onToggle={() => setDropdownOpen(curr => !curr)}
          placeholder="Select a role group"
          emptyText="No role groups found"
        />

        {/* Permissions */}
        <ThemedText style={[styles.fieldLabel, { marginTop: height * 0.022 }]}>Permissions</ThemedText>

        {PERMISSION_KEYS.map(key => {
          const keyStr = key as string;
          const info = colToRoleInfo[keyStr];
          const isOn = permissions[keyStr] ?? false;
          const ownerActive = !!(permissions['owner'] ?? false);
          const dimmed = ownerActive && keyStr !== 'owner';

          return (
            <View key={keyStr} style={[styles.permissionRow, dimmed && styles.permissionRowDimmed]}>
              <TouchableOpacity
                style={styles.permissionNameCol}
                activeOpacity={0.7}
              >
                <ThemedText style={[styles.permissionName, dimmed && styles.permissionNameDimmed]}>{info.name}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioCol}
                onPress={() => selectedRole && !dimmed && togglePermission(keyStr)}
                activeOpacity={0.7}
              >
                <View style={[styles.radio, isOn && !dimmed && styles.radioOn]} />
              </TouchableOpacity>
            </View>
          );
        })}

      </ScrollView>

      <View style={[styles.footer]}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSavePermissions}>
            <ThemedText style={styles.actionButtonText}>Save Permissions</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
            <ThemedText style={styles.actionButtonText}>Delete Role</ThemedText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setCreateRoleVisible(true)}>
          <ThemedText style={styles.addButtonText}>Add New Role</ThemedText>
        </TouchableOpacity>
      </View>

      <InfoModal
        visible={infoVisible}
        title="Success"
        message="Permissions saved successfully."
        onClose={() => setInfoVisible(false)}
      />
      <CreateRole
        visible={createRoleVisible}
        onCreate={handleCreateRole}
        onCancel={() => setCreateRoleVisible(false)}
      />
    </ThemedView>
  );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: { flex: 1 },
  content: { padding: width * 0.051, paddingBottom: height * 0.05 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.012,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  permissionNameCol: { width: '85%' },
  permissionName: { fontSize: 15 },
  permissionRowDimmed: { opacity: 0.35 },
  permissionNameDimmed: { color: '#aaa' },
  radioCol: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  radioOn: {
    backgroundColor: ThemeColors.button,
    borderColor: ThemeColors.button,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: ThemeColors.inputBackground,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addButton: {
    width: '85%',
    backgroundColor: ThemeColors.button,
    borderRadius: 12,
    paddingVertical: height * 0.019,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: width * 0.03,
    marginBottom: 10,
  },
  actionButton: {
    width: '40%',
    backgroundColor: ThemeColors.button,
    borderRadius: 12,
    paddingVertical: height * 0.019,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: ThemeColors.denyRed,
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
