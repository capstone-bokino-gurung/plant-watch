import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, Stack } from 'expo-router';
import { InviteUser } from '@/components/modals/invite-user';
import { InfoModal } from '@/components/modals/info-modal';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GreenhouseHeader } from '@/components/greenhouse-header';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { getGreenhouseUsers, updateRoleGroup } from '@/services/greenhouse';
import { getRoleGroups } from '@/services/role_groups';
import { User } from '@/interfaces/user';
import { RoleGroup } from '@/interfaces/role_group';

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const { greenhouse_id, greenhouse_name, from } = useLocalSearchParams<{
    greenhouse_id: string;
    greenhouse_name: string;
    from?: string;
  }>();

  const [users, setUsers] = useState<User[]>([]);
  const [editedUsers, setEditedUsers] = useState<User[]>([]);
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [infoModal, setInfoModal] = useState<{ title: string; message: string } | null>(null);

  function handleEnterEdit() {
    setEditedUsers([...users]);
    setEditMode(true);
  }

  function handleCancel() {
    setEditMode(false);
    setOpenDropdown(null);
  }

  function handleRoleChange(userId: string, roleId: string) {
    setEditedUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role_id: roleId } : u));
    setOpenDropdown(null);
  }

  async function handleSave() {
    const hasOwner = editedUsers.some(u => roleGroups.find(r => r.role_id === u.role_id)?.name === 'Owner');
    if (!hasOwner) {
      setInfoModal({ title: 'Error', message: 'There must be at least one owner in the greenhouse.' });
      return;
    }
    setSaving(true);
    for (const user of editedUsers) {
      const { error } = await updateRoleGroup(greenhouse_id, user.user_id, user.role_id);
      if (error) {
        setInfoModal({ title: 'Error', message: 'Failed to update role for ' + user.first_name });
        setSaving(false);
        return;
      }
    }
    setUsers(editedUsers);
    setEditMode(false);
    setOpenDropdown(null);
    setSaving(false);
    setInfoModal({ title: 'Success', message: 'Roles saved successfully.' });
  }

  useFocusEffect(useCallback(() => {
    if (greenhouse_id) fetchData();
  }, [greenhouse_id]));

  async function fetchData() {
    setLoading(true);
    const [usersResult, rolesResult] = await Promise.all([
      getGreenhouseUsers(greenhouse_id),
      getRoleGroups(greenhouse_id),
    ]);
    if (usersResult.error) {
      Alert.alert('Error', usersResult.error);
    } else {
      setUsers(usersResult.data || []);
    }
    if (rolesResult.error) {
      Alert.alert('Error', rolesResult.error.message);
    } else {
      setRoleGroups(rolesResult.data || []);
    }
    console.log(usersResult);
    setLoading(false);
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ animation: from === 'menu' ? 'fade' : 'default' }} />

      <GreenhouseHeader
        greenhouse_id={greenhouse_id}
        greenhouse_name={greenhouse_name}
        currentPage="users"
        pageTitle="Users"
        onEdit={editMode ? undefined : handleEnterEdit}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ThemedText style={styles.emptyText}>Loading...</ThemedText>
        ) : users.length === 0 ? (
          <ThemedText style={styles.emptyText}>No users found.</ThemedText>
        ) : (
          users.map(user => {
            const editedUser = editedUsers.find(u => u.user_id === user.user_id) ?? user;
            const isOpen = openDropdown === user.user_id;
            return (
              <View key={user.user_id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <ThemedText style={styles.userName}>
                    {user.first_name} {user.last_name}
                  </ThemedText>
                  <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
                </View>

                {editMode ? (
                  <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                      style={styles.dropdownTrigger}
                      onPress={() => setOpenDropdown(isOpen ? null : user.user_id)}
                      activeOpacity={0.8}
                    >
                      <ThemedText style={styles.dropdownTriggerText} numberOfLines={1}>
                        {roleGroups.find(r => r.role_id === editedUser.role_id)?.name ?? 'No role'}
                      </ThemedText>
                      <IconSymbol name={isOpen ? 'arrowtriangle.up.fill' : 'arrowtriangle.down.fill'} size={8} color="#888" />
                    </TouchableOpacity>

                    {isOpen && (
                      <View style={styles.dropdownList}>
                        {roleGroups.length === 0 ? (
                          <View style={styles.dropdownItem}>
                            <ThemedText style={styles.dropdownItemText}>No role groups</ThemedText>
                          </View>
                        ) : (
                          [...roleGroups].sort((a, b) => {
                            if (a.role_id === editedUser.role_id) return -1;
                            if (b.role_id === editedUser.role_id) return 1;
                            return 0;
                          }).map(role => (
                            <TouchableOpacity
                              key={role.role_id}
                              style={styles.dropdownItem}
                              onPress={() => handleRoleChange(user.user_id, role.role_id)}
                            >
                              <ThemedText style={styles.dropdownItemText}>{role.name}</ThemedText>
                            </TouchableOpacity>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                ) : (
                  <ThemedText style={styles.roleText}>
                    {roleGroups.find(r => r.role_id === user.role_id)?.name ?? 'No role'}
                  </ThemedText>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        {editMode ? (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSave} disabled={saving}>
              <ThemedText style={styles.actionButtonText}>{saving ? 'Saving...' : 'Save Roles'}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancel} disabled={saving}>
              <ThemedText style={styles.actionButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.inviteButton} onPress={() => setInviteModalOpen(true)}>
            <ThemedText style={styles.inviteButtonText}>Invite User +</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      <InviteUser
        visible={inviteModalOpen}
        greenhouseId={greenhouse_id}
        onClose={() => setInviteModalOpen(false)}
      />
      <InfoModal
        visible={!!infoModal}
        title={infoModal?.title}
        message={infoModal?.message ?? ''}
        onClose={() => setInfoModal(null)}
      />
    </ThemedView>
  );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: width * 0.041,
    paddingBottom: height * 0.118,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.inputBackground,
    borderRadius: 10,
    padding: width * 0.036,
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  dropdownContainer: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: height * 0.007,
    paddingHorizontal: width * 0.026,
    maxWidth: width * 0.36,
    gap: 4,
  },
  dropdownTriggerText: {
    fontSize: 13,
    color: '#444',
    flexShrink: 1,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    minWidth: width * 0.36,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.031,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#333',
  },
  footer: {
    paddingHorizontal: width * 0.051,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: ThemeColors.inputBackground,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inviteButton: {
    backgroundColor: ThemeColors.button,
    borderRadius: 12,
    paddingVertical: height * 0.019,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
  },
  saveButton: {
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: width * 0.03,
  },
  actionButton: {
    width: '40%',
    backgroundColor: ThemeColors.button,
    borderRadius: 12,
    paddingVertical: height * 0.019,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: ThemeColors.denyRed,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
