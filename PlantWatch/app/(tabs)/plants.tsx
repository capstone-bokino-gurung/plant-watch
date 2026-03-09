import { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/util/supabase';

type Plant = {
  plant_id: string;
  common_name: string;
  scientific_name: string;
  notes: string;
  created_at: string;
};

export default function PlantsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { greenhouse_id, greenhouse_name } = useLocalSearchParams<{
    greenhouse_id: string;
    greenhouse_name: string;
  }>();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [commonName, setCommonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (greenhouse_id) fetchPlants();
  }, [greenhouse_id]);

  async function fetchPlants() {
    setLoading(true);
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('greenhouse_id', greenhouse_id);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setPlants(data || []);
    }
    setLoading(false);
  }

  async function addPlant() {
    if (!commonName.trim()) {
      Alert.alert('Error', 'Please enter a plant name.');
      return;
    }
    const { data, error } = await supabase
      .from('plants')
      .insert({
        greenhouse_id,
        common_name: commonName.trim(),
        scientific_name: scientificName.trim(),
        notes: notes.trim(),
      })
      .select()
      .single();
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setPlants(prev => [...prev, data]);
      setCommonName('');
      setScientificName('');
      setNotes('');
      setAddModalOpen(false);
    }
  }

  async function deletePlant(id: string) {
    Alert.alert('Delete Plant', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const { error } = await supabase.from('plants').delete().eq('plant_id', id);
          if (error) {
            Alert.alert('Error', error.message);
          } else {
            setPlants(prev => prev.filter(p => p.plant_id !== id));
          }
        }
      }
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backText}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{greenhouse_name} — Plants</ThemedText>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ThemedText style={styles.emptyText}>Loading...</ThemedText>
        ) : plants.length === 0 ? (
          <ThemedText style={styles.emptyText}>No plants added yet.</ThemedText>
        ) : (
          plants.map(plant => (
            <View key={plant.plant_id} style={styles.plantCard}>
              <View style={styles.plantInfo}>
                <ThemedText style={styles.plantName}>{plant.common_name}</ThemedText>
                {plant.scientific_name ? (
                  <ThemedText style={styles.plantScientific}>{plant.scientific_name}</ThemedText>
                ) : null}
                {plant.notes ? (
                  <ThemedText style={styles.plantNotes}>{plant.notes}</ThemedText>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => deletePlant(plant.plant_id)} style={styles.deleteButton}>
                <ThemedText style={styles.deleteText}>🗑</ThemedText>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 24 }]} onPress={() => setAddModalOpen(true)}>
        <ThemedText style={styles.fabText}>+</ThemedText>
      </TouchableOpacity>

      {/* Add Plant Modal */}
      <Modal visible={addModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <ThemedText style={styles.modalTitle}>Add Plant</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Common name (required)"
              value={commonName}
              onChangeText={setCommonName}
            />
            <TextInput
              style={styles.input}
              placeholder="Scientific name (optional)"
              value={scientificName}
              onChangeText={setScientificName}
            />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <TouchableOpacity style={styles.addButton} onPress={addPlant}>
              <ThemedText style={styles.addButtonText}>Add Plant</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddModalOpen(false)}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { padding: 8, width: 80 },
  backText: { color: '#2d6a4f', fontSize: 16 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#2d6a4f' },
  content: { padding: 16, paddingBottom: 100 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
  plantCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, padding: 14, marginBottom: 12 },
  plantInfo: { flex: 1 },
  plantName: { fontSize: 16, fontWeight: 'bold' },
  plantScientific: { fontSize: 13, fontStyle: 'italic', color: '#666', marginTop: 2 },
  plantNotes: { fontSize: 13, color: '#888', marginTop: 4 },
  deleteButton: { padding: 8 },
  deleteText: { fontSize: 20 },
  fab: { position: 'absolute', right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2d6a4f', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 36 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 10 },
  notesInput: { height: 80, textAlignVertical: 'top' },
  addButton: { backgroundColor: '#2d6a4f', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelText: { textAlign: 'center', marginTop: 12, color: '#999', fontSize: 14 },
});