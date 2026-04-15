import {
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GreenhouseMenu } from '@/components/greenhouse-menu';
import { ThemeColors } from '@/hooks/get-theme-colors';

export default function ActivityLogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const styles = getStyles(width);
  const { greenhouse_id, greenhouse_name, from } = useLocalSearchParams<{
    greenhouse_id: string;
    greenhouse_name: string;
    from?: string;
  }>();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ animation: from === 'menu' ? 'fade' : 'default' }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <GreenhouseMenu
          greenhouse_id={greenhouse_id}
          greenhouse_name={greenhouse_name}
          currentPage="activity-log"
        />
        <ThemedText style={styles.headerTitle}>{greenhouse_name}</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Buttons */}
      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/greenhouse/activity-log/log-activity', params: { greenhouse_id, greenhouse_name } })}>
          <ThemedText style={styles.buttonText}>Log Activity</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <ThemedText style={styles.buttonText}>Create New Activity Type</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <ThemedText style={styles.buttonText}>Edit Existing Logs</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const getStyles = (width: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.041,
    paddingBottom: 12,
    backgroundColor: ThemeColors.inputBackground,
  },
  headerSpacer: {
    width: width * 0.113,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: ThemeColors.header,
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
