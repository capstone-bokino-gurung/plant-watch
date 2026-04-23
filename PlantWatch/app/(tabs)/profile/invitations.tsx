import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { BackButton } from '@/components/ui/back-button';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { getGreenhouseInvites, acceptInvite } from '@/services/user';
import { InvitationDisplay } from '@/interfaces/invitation';
import { InfoModal } from '@/components/modals/info-modal';

export default function InvitationsScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);

  const [invitations, setInvitations] = useState<InvitationDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    fetchInvitations();
  }, []));

  async function fetchInvitations() {
    setLoading(true);
    const { data, error } = await getGreenhouseInvites();
    if (error) {
      Alert.alert('Error', error);
    } else {
      setInvitations(data || []);
    }
    setLoading(false);
  }

  async function handleAccept(inv: InvitationDisplay) {
    const result = await acceptInvite(inv.greenhouse_id);
    if (result?.error) {
      setErrorMessage(typeof result.error === 'string' ? result.error : result.error.message);
    } else {
      setInvitations(prev => prev.filter(i => i.greenhouse_id !== inv.greenhouse_id));
    }
  }

  function handleDeny(inv: InvitationDisplay) {
    // TODO: implement deny
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton onPress={() => from === 'profile' ? router.back() : router.navigate('/(tabs)/profile')} floating={false} />
        <ThemedText style={styles.headerTitle}>Invitations</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Column headers */}
      <View style={styles.columnHeaders}>
        <ThemedText style={[styles.columnHeader, styles.colGreenhouse]}>Greenhouse</ThemedText>
        <ThemedText style={[styles.columnHeader, styles.colSender]}>From</ThemedText>
        <View style={styles.colActions} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchInvitations} />}
      >
        {loading ? (
          <ThemedText style={styles.emptyText}>Loading...</ThemedText>
        ) : invitations.length === 0 ? (
          <ThemedText style={styles.emptyText}>No pending invitations.</ThemedText>
        ) : (
          invitations.map((inv, index) => (
            <View key={index} style={styles.row}>
              <View style={styles.colGreenhouse}>
                <ThemedText style={styles.greenhouseName} numberOfLines={2}>{inv.greenhouse_name}</ThemedText>
              </View>
              <View style={styles.colSender}>
                <ThemedText style={styles.senderName} numberOfLines={1}>{inv.sender_name}</ThemedText>
                <ThemedText style={styles.senderEmail} numberOfLines={1}>{inv.sender_email}</ThemedText>
              </View>
              <View style={styles.colActions}>
                <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(inv)}>
                  <ThemedText style={styles.actionText}>✓</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.denyButton} onPress={() => handleDeny(inv)}>
                  <ThemedText style={styles.actionText}>✕</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <InfoModal
        visible={!!errorMessage}
        title="Error"
        message={errorMessage ?? ''}
        confirmLabel="Acknowledge"
        onClose={() => setErrorMessage(null)}
      />
    </ThemedView>
  );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.041,
    paddingBottom: 5,
    backgroundColor: ThemeColors.inputBackground,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: ThemeColors.header,
  },
  headerSpacer: { width: width * 0.113 },
  columnHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.041,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: ThemeColors.inputBackground,
  },
  columnHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  content: {
    padding: width * 0.041,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.inputBackground,
    borderRadius: 10,
    padding: width * 0.031,
    marginBottom: 10,
  },
  colGreenhouse: { flex: 2.5 },
  colSender: { flex: 3 },
  colActions: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  greenhouseName: { fontSize: 14, fontWeight: '600' },
  senderName: { fontSize: 13, fontWeight: '600' },
  senderEmail: { fontSize: 11, color: '#888', marginTop: 1 },
  acceptButton: {
    backgroundColor: ThemeColors.button,
    borderRadius: 8,
    width: height * 0.042,
    height: height * 0.042,
    alignItems: 'center',
    justifyContent: 'center',
  },
  denyButton: {
    backgroundColor: ThemeColors.denyRed,
    borderRadius: 8,
    width: height * 0.042,
    height: height * 0.042,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
