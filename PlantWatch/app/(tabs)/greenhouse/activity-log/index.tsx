import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GreenhouseHeader } from '@/components/greenhouse-header';
import { ThemeColors } from '@/hooks/get-theme-colors';

export default function ActivityLogScreen() {

  const router = useRouter();
  const styles = getStyles();
  const { greenhouse_id, greenhouse_name, from } = useLocalSearchParams<{
    greenhouse_id: string;
    greenhouse_name: string;
    from?: string;
  }>();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ animation: from === 'menu' ? 'fade' : 'default' }} />

      <GreenhouseHeader
        greenhouse_id={greenhouse_id}
        greenhouse_name={greenhouse_name}
        currentPage="activity-log"
        pageTitle="Activity Log"
      />

      {/* Buttons */}
      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/greenhouse/activity-log/log-activity', params: { greenhouse_id, greenhouse_name } })}>
          <ThemedText style={styles.buttonText}>Log Activity</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/greenhouse/activity-log/new-activity-type', params: { greenhouse_id, greenhouse_name } })}>
          <ThemedText style={styles.buttonText}>Create New Activity Type</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/greenhouse/activity-log/edit-logs', params: { greenhouse_id, greenhouse_name } })}>
          <ThemedText style={styles.buttonText}>Edit Existing Logs</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    width: '70%',
    backgroundColor: ThemeColors.button,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
