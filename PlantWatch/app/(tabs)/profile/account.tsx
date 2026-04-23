import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { BackButton } from '@/components/ui/back-button';
import { ThemeColors } from '@/hooks/get-theme-colors';

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = getStyles(width);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton onPress={() => router.back()} floating={false} />
        <ThemedText style={styles.headerTitle}>Account Information</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.wip}>Work in progress.</ThemedText>
      </View>
    </ThemedView>
  );
}

const getStyles = (width: number) => StyleSheet.create({
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
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  wip: { fontSize: 16, color: '#999' },
});
