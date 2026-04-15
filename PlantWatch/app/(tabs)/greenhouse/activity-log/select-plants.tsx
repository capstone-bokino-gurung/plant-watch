import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ImageBackground,
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
import { getGreenhousePlants } from '@/services/plant';
import { createLog, formatTimestamp } from '@/services/activity_log';
import { Plant } from '@/interfaces/plant';

export default function SelectPlantsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const { greenhouse_id, greenhouse_name, activity, date, time, notes } = useLocalSearchParams<{
    greenhouse_id: string;
    greenhouse_name: string;
    activity: string;
    date: string;
    time: string;
    notes: string;
  }>();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      const { data, error } = await getGreenhousePlants(greenhouse_id);
      if (error) Alert.alert('Error', error.message);
      else setPlants(data || []);
    }
    load();
  }, [greenhouse_id]);

  function toggleSelect(id: string) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleConfirm() {
    const timestamp = formatTimestamp(new Date(date), new Date(time));
    let successCount = 0;
    for (const [id, isSelected] of Object.entries(selected)) {
      if (!isSelected) continue;
      const { error } = await createLog(id, activity, notes, timestamp);
      if (error) {
        console.log(error);
        Alert.alert('Error', `Logged ${successCount} of ${selectedCount} successfully before an error occurred.`);
        router.push({ pathname: '/greenhouse/activity-log', params: { greenhouse_id, greenhouse_name } });
        return;
      }
      successCount++;
    }
    Alert.alert('Success', `Logged ${successCount} plant${successCount !== 1 ? 's' : ''} successfully.`);
    router.push({ pathname: '/greenhouse/activity-log', params: { greenhouse_id, greenhouse_name } });
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;

  const CARD_GAP = 12;
  const PADDING = width * 0.041;
  const cardSize = (width - PADDING * 2 - CARD_GAP) / 2;

  function renderCard({ item }: { item: Plant }) {
    const isSelected = selected[item.plant_id];
    return (
      <TouchableOpacity
        style={[styles.card, { width: cardSize, height: cardSize }, isSelected && styles.cardSelected]}
        onPress={() => toggleSelect(item.plant_id)}
        activeOpacity={0.85}
      >
        {item.image_url ? (
          <ImageBackground source={{ uri: item.image_url }} style={styles.cardBg} imageStyle={styles.cardImage}>
            <View style={styles.overlay} />
            <ThemedText style={styles.cardLabel}>{item.label}</ThemedText>
          </ImageBackground>
        ) : (
          <View style={[styles.cardBg, styles.cardNoImage]}>
            <ThemedText style={styles.cardLabel}>{item.label}</ThemedText>
          </View>
        )}
        {isSelected && (
          <View style={styles.checkBadge}>
            <ThemedText style={styles.checkMark}>✓</ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <GreenhouseMenu
          greenhouse_id={greenhouse_id}
          greenhouse_name={greenhouse_name}
          currentPage="activity-log"
        />
        <ThemedText style={styles.headerTitle}>{greenhouse_name}</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={router.back}>
          <ThemedText style={styles.backButtonText}>←</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={plants}
        keyExtractor={p => p.plant_id}
        renderItem={renderCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 90 }]}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No plants in this greenhouse yet.</ThemedText>
        }
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <ThemedText style={styles.footerCount}>
          {selectedCount} plant{selectedCount !== 1 ? 's' : ''} selected
        </ThemedText>
        <TouchableOpacity
          style={[styles.confirmButton, !selectedCount && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!selectedCount}
        >
          <ThemedText style={styles.confirmText}>Confirm</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: ThemeColors.header,
  },
  backButton: {
    width: width * 0.113,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 22,
    color: ThemeColors.button,
    fontWeight: 'bold',
  },
  grid: {
    padding: width * 0.041,
    gap: 12,
  },
  row: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: ThemeColors.button,
  },
  cardBg: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 8,
  },
  cardImage: {
    borderRadius: 10,
  },
  cardNoImage: {
    backgroundColor: '#c8ddd0',
    borderRadius: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  cardLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: ThemeColors.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ThemeColors.inputBackground,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: width * 0.051,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerCount: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: ThemeColors.button,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#598c62',
  },
  confirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
