import { useEffect, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/util/supabase';

type Greenhouse = { greenhouse_id: string; name: string; created_at: string };

export default function GreenhouseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newGreenhouseName, setNewGreenhouseName] = useState('');

  useEffect(() => {
    fetchGreenhouses();
  }, []);

  async function fetchGreenhouses() {
    setLoading(true);
    const { data, error } = await supabase.from('greenhouse').select('*');
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setGreenhouses(data || []);
    }
    setLoading(false);
  }

  async function createGreenhouse() {
    if (!newGreenhouseName.trim()) return;
    const { data, error } = await supabase
      .from('greenhouse')
      .insert({ name: newGreenhouseName.trim() })
      .select()
      .single();
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setGreenhouses(prev => [...prev, data]);
      setNewGreenhouseName('');
      setCreateModalOpen(false);
    }
  }

  async function deleteGreenhouse(id: string) {
    Alert.alert('Delete Greenhouse', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const { error } = await supabase.from('greenhouse').delete().eq('greenhouse_id', id);
          if (error) {
            Alert.alert('Error', error.message);
          } else {
            setGreenhouses(prev => prev.filter(g => g.greenhouse_id !== id));
          }
        }
      }
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <ThemedText style={styles.headerTitle}>My Greenhouses</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ThemedText style={styles.emptyText}>Loading...</ThemedText>
        ) : greenhouses.length === 0 ? (
          <ThemedText style={styles.emptyText}>No greenhouses yet. Create one!</ThemedText>
        ) : (
          greenhouses.map(g => (
            <View key={g.greenhouse_id} style={styles.greenhouseRow}>
              <TouchableOpacity
                style={styles.greenhouseCard}
                onPress={() => router.push({
                  pathname: '/plants',
                  params: {
                    greenhouse_id: g.greenhouse_id,
                    greenhouse_name: g.name,
                  },
                })}
              >
                <ThemedText style={styles.greenhouseName}>{g.name}</ThemedText>
                <ThemedText style={styles.greenhouseArrow}>→</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteGreenhouse(g.greenhouse_id)} style={styles.deleteButton}>
                <ThemedText style={styles.deleteText}>🗑</ThemedText>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={() => setCreateModalOpen(true)}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </TouchableOpacity>

      {/* Create Greenhouse Modal */}
      <Modal visible={createModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <ThemedText style={styles.modalTitle}>New Greenhouse</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Greenhouse name"
              value={newGreenhouseName}
              onChangeText={setNewGreenhouseName}
            />
            <TouchableOpacity style={styles.createButton} onPress={createGreenhouse}>
              <ThemedText style={styles.createButtonText}>Create</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCreateModalOpen(false)}>
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
  header: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2d6a4f' },
  content: { padding: 16, paddingBottom: 100 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
  greenhouseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  greenhouseCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16 },
  greenhouseName: { flex: 1, fontSize: 16, fontWeight: '600' },
  greenhouseArrow: { fontSize: 18, color: '#2d6a4f' },
  deleteButton: { padding: 8, marginLeft: 8 },
  deleteText: { fontSize: 20 },
  fab: { position: 'absolute', right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2d6a4f', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 36 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 },
  createButton: { backgroundColor: '#2d6a4f', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  createButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelText: { textAlign: 'center', marginTop: 12, color: '#999', fontSize: 14 },
});