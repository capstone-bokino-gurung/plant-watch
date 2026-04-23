import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { GreenhouseHeader } from '@/components/greenhouse-header';

export default function NewActivityTypeScreen() {
  const { greenhouse_id, greenhouse_name } = useLocalSearchParams<{
    greenhouse_id: string;
    greenhouse_name: string;
  }>();

  return (
    <ThemedView style={styles.container}>
      <GreenhouseHeader
        greenhouse_id={greenhouse_id}
        greenhouse_name={greenhouse_name}
        currentPage="activity-log"
        pageTitle="New Activity Type"
        leftButton="back"
      />

      <View style={styles.content}>
        <ThemedText style={styles.wip}>Work in progress.</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  wip: { fontSize: 16, color: '#999' },
});
