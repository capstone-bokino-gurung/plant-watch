import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { GreenhouseHeader } from '@/components/greenhouse-header';

export default function SettingsScreen() {
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
        currentPage="settings"
        pageTitle="Settings"
      />

      <View style={styles.content} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
