import { StyleSheet, TouchableOpacity } from 'react-native';
//import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.greeting}>Hi there,</ThemedText>
      <ThemedText style={styles.subtitle}>What would you like to do today?</ThemedText>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/greenhouse')}>
        <ThemedText style={styles.buttonText}>Greenhouse Portal</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
   // flex: 1,
  },
  container: {
    flex: 1,
    //padding: 24,
    //paddingTop: 80,
    paddingLeft: 16,
    paddingRight: 16,
    //alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
    marginBottom: 32
  },
  button: {
    backgroundColor: '#2d6a4f',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

