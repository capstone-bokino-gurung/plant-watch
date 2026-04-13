import { Link } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}

const getStyles = (width: number) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.051,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
