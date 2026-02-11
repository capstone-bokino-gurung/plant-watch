import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function Profile() {
  return (
    <ThemedView style={styles.centeredContainer}>
      <ThemedText>W.I.P.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
