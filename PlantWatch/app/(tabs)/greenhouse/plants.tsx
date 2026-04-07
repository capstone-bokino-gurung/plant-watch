import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { AddPlant } from '@/components/add-plant';
import { ThemedView } from '@/components/themed-view';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { getGreenhousePlants, deleteGreenhousePlant } from '@/services/plant';
import { Plant } from '@/interfaces/plant';

const MOCK_TEMP = 70;
const MOCK_HUMIDITY = 65;
const MOCK_SOIL_MOISTURE = 42;
const LAST_UPDATED = new Date().toLocaleString();


function ConditionCard({ label, value, unit }: { label: string; value: number; unit: string }) {
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
  const { greenhouse_id, greenhouse_name } = useLocalSearchParams<{
    greenhouse_id: string;
    greenhouse_name: string;
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
          params: {
              plantData: JSON.stringify(plant),
          },
      });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backText}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{greenhouse_name}</ThemedText>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Last Updated */}
        <ThemedText style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</ThemedText>

        {/* Conditions Section */}
        <ThemedText style={styles.sectionLabel}>CONDITIONS</ThemedText>
        <View style={styles.conditionsRow}>
          <ConditionCard label="Temp" value={MOCK_TEMP} unit="°F" />
          <ConditionCard label="Humidity" value={MOCK_HUMIDITY} unit="%" />
          <ConditionCard label="Soil" value={MOCK_SOIL_MOISTURE} unit="%" />
        </View>

        {/* Plants Section */}
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: ThemeColors.inputBackground},
  backButton: { padding: 8, width: 80 },
  backText: { color: '#2d6a4f', fontSize: 16 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#2d6a4f' },
  content: { padding: 16, paddingBottom: 100 },
  lastUpdated: { fontSize: 11, color: '#999', marginBottom: 16, textAlign: 'right' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#999', marginBottom: 8, letterSpacing: 1 },
  conditionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  conditionCard: { flex: 1, backgroundColor: ThemeColors.inputBackground, borderRadius: 10, padding: 14, alignItems: 'center' },
  conditionLabel: { fontSize: 11, fontWeight: '700', color: ThemeColors.sectionHeader, letterSpacing: 1, marginBottom: 4 },
  conditionValue: { fontSize: 22, fontWeight: 'bold', color: ThemeColors.button },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 16 },
  plantCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: ThemeColors.inputBackground, borderRadius: 10, padding: 14, marginBottom: 12 },
  plantInfo: { flex: 1 },
  plantName: { fontSize: 16, fontWeight: 'bold' },
  plantScientific: { fontSize: 13, fontStyle: 'italic', color: '#666', marginTop: 2 },
  plantNotes: { fontSize: 13, color: '#888', marginTop: 4 },
  deleteButton: { padding: 8 },
  deleteText: { fontSize: 20 },
  fab: { position: 'absolute', right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: ThemeColors.button, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 36 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 10 },
  notesInput: { height: 80, textAlignVertical: 'top' },
  addButton: { backgroundColor: ThemeColors.button, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelText: { textAlign: 'center', marginTop: 12, color: '#999', fontSize: 14 },
});