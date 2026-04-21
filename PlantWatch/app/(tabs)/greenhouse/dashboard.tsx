import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { AddPlant } from '@/components/modals/add-plant';
import { ThemedView } from '@/components/themed-view';
import { GreenhouseHeader } from '@/components/greenhouse-header';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { getGreenhousePlants, deleteGreenhousePlant } from '@/services/plant';
import { Plant } from '@/interfaces/plant';

const MOCK_TEMP = 70;
const MOCK_HUMIDITY = 65;
const MOCK_SOIL_MOISTURE = 42;
const LAST_UPDATED = new Date().toLocaleString();

function ConditionCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  return (
    <View style={styles.conditionCard}>
      <ThemedText style={styles.conditionLabel}>{label}</ThemedText>
      <ThemedText style={styles.conditionValue}>{value}{unit}</ThemedText>
    </View>
  );
}

export default function GreenhouseDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const { greenhouse_id, greenhouse_name, from } = useLocalSearchParams<{
    greenhouse_id: string;
    greenhouse_name: string;
    from?: string;
  }>();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useFocusEffect(useCallback(() => {
    if (greenhouse_id) fetchPlants();
  }, [greenhouse_id]));

  async function fetchPlants() {
    setLoading(true);
    const { data, error } = await getGreenhousePlants(greenhouse_id);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setPlants(data || []);
    }
    setLoading(false);
  }

  async function deletePlant(id: string) {
    Alert.alert('Delete Plant', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const { error } = await deleteGreenhousePlant(id);
          if (error) {
            Alert.alert('Error', error.message);
          } else {
            setPlants(prev => prev.filter(p => p.plant_id !== id));
          }
        }
      }
    ]);
  }

  const handlePlantPress = (plant: Plant) => {
    router.push({
      pathname: '/greenhouse/plant',
      params: { plantData: JSON.stringify(plant) },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ animation: from === 'menu' ? 'fade' : 'default' }} />
      <GreenhouseHeader
        greenhouse_id={greenhouse_id}
        greenhouse_name={greenhouse_name}
        currentPage="dashboard"
        pageTitle="Dashboard"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</ThemedText>

        <ThemedText style={styles.sectionLabel}>CONDITIONS</ThemedText>
        <View style={styles.conditionsRow}>
          <ConditionCard label="Temp" value={MOCK_TEMP} unit="°F" />
          <ConditionCard label="Humidity" value={MOCK_HUMIDITY} unit="%" />
          <ConditionCard label="Soil" value={MOCK_SOIL_MOISTURE} unit="%" />
        </View>

        <ThemedText style={styles.sectionLabel}>PLANTS ({plants.length})</ThemedText>
        {loading ? (
          <ThemedText style={styles.emptyText}>Loading...</ThemedText>
        ) : plants.length === 0 ? (
          <ThemedText style={styles.emptyText}>No plants added yet.</ThemedText>
        ) : (
          plants.map(plant => (
            <TouchableOpacity onPress={() => handlePlantPress(plant)} key={plant.plant_id} style={styles.plantCard}>
              <View style={styles.plantInfo}>
                <ThemedText style={styles.plantName}>{plant.label}</ThemedText>
                {plant.scientific_name ? (
                  <ThemedText style={styles.plantScientific}>Common Name: {plant.common_name}</ThemedText>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => deletePlant(plant.plant_id)} style={styles.deleteButton}>
                <ThemedText style={styles.deleteText}>🗑</ThemedText>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 24 }]} onPress={() => setAddModalOpen(true)}>
        <ThemedText style={styles.fabText}>+</ThemedText>
      </TouchableOpacity>

      <AddPlant
        visible={addModalOpen}
        greenhouseId={greenhouse_id}
        onClose={() => setAddModalOpen(false)}
        onAdd={plant => setPlants(prev => [...prev, plant])}
      />
    </ThemedView>
  );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: width * 0.041,
    paddingBottom: height * 0.118,
  },
  lastUpdated: {
    fontSize: 11,
    color: '#999',
    marginBottom: 16,
    textAlign: 'right',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    marginBottom: 8,
    letterSpacing: 1,
  },
  conditionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  conditionCard: {
    flex: 1,
    backgroundColor: ThemeColors.inputBackground,
    borderRadius: 10,
    padding: width * 0.036,
    alignItems: 'center',
  },
  conditionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: ThemeColors.sectionHeader,
    letterSpacing: 1,
    marginBottom: 4,
  },
  conditionValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: ThemeColors.button,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 16,
  },
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.inputBackground,
    borderRadius: 10,
    padding: width * 0.036,
    marginBottom: 12,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  plantScientific: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 20,
  },
  fab: {
    position: 'absolute',
    right: width * 0.062,
    width: width * 0.144,
    height: width * 0.144,
    borderRadius: width * 0.072,
    backgroundColor: ThemeColors.button,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 36,
  },
});
