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
//import { router } from 'expo-router';
//import { useRouter } from 'expo-router';

const MOCK_TEMP = [60, 63, 65, 68, 70, 69, 71, 70];
const MOCK_HUMIDITY = [55, 58, 62, 65, 70, 68, 72, 70];

function LineGraph({ data, color }: { data: number[]; color: string }) {
  const width = 120;
  const height = 70;
  const min = Math.min(...data);
  const max = Math.max(...data);

  return (
    <View style={{ width, height }}>
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: (i / 3) * height, height: 1, backgroundColor: '#ddd' }} />
      ))}
      {data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / (max - min || 1)) * height;
        return <View key={i} style={{ position: 'absolute', left: x - 3, top: y - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />;
      })}
      {data.slice(1).map((val, i) => {
        const x1 = (i / (data.length - 1)) * width;
        const y1 = height - ((data[i] - min) / (max - min || 1)) * height;
        const x2 = ((i + 1) / (data.length - 1)) * width;
        const y2 = height - ((val - min) / (max - min || 1)) * height;
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        return <View key={i} style={{ position: 'absolute', left: x1, top: y1, width: length, height: 2, backgroundColor: color, transform: [{ rotate: `${angle}deg` }] }} />;
      })}
    </View>
  );
}

//const MENU_ITEMS = ['Dashboard', 'Plants', 'Devices', 'Users', 'User Roles', 'Notifications', 'Settings'];

type Greenhouse = { greenhouse_id: string; name: string; created_at: string };

export default function GreenhouseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [selectedGreenhouse, setSelectedGreenhouse] = useState<Greenhouse | null>(null);
  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newGreenhouseName, setNewGreenhouseName] = useState('');
  const [loading, setLoading] = useState(true);

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
      if (data && data.length > 0) setSelectedGreenhouse(data[0]);
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
      setSelectedGreenhouse(data);
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
            const updated = greenhouses.filter(g => g.greenhouse_id !== id);
            setGreenhouses(updated);
            setSelectedGreenhouse(updated[0] || null);
            setSwitchModalOpen(false);
          }
        }
      }
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerTitleButton}
          onPress={() => {
            if (selectedGreenhouse) {
              router.push({
                pathname: '/plants',
                params: {
                  greenhouse_id: selectedGreenhouse.greenhouse_id,
                  greenhouse_name: selectedGreenhouse.name,
                },
              });
            }
          }}
        >
          <ThemedText style={styles.headerTitle}>
            {loading ? 'Loading...' : selectedGreenhouse?.name ?? 'No Greenhouse'}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSwitchModalOpen(true)} style={styles.switchButton}>
          <ThemedText style={styles.switchIcon}>⇄</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Notifications */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>NOTIFICATIONS</ThemedText>
          <View style={styles.notificationCard}>
            <ThemedText style={styles.notificationText}>⚠️ Plant A needs to be watered!</ThemedText>
          </View>
        </View>

        {/* Sensor Cards */}
        <View style={styles.cardsRow}>
          <View style={styles.sensorCard}>
            <ThemedText style={styles.cardLabel}>TEMPERATURE</ThemedText>
            <ThemedText style={styles.cardValue}>70°F</ThemedText>
            <LineGraph data={MOCK_TEMP} color="#00b4b4" />
          </View>
          <View style={styles.sensorCard}>
            <ThemedText style={styles.cardLabel}>HUMIDITY</ThemedText>
            <ThemedText style={styles.cardValue}>70%</ThemedText>
            <LineGraph data={MOCK_HUMIDITY} color="#00b4b4" />
          </View>
        </View>

        {/* Add Card Button */}
        <TouchableOpacity style={styles.addCard}>
          <ThemedText style={styles.addIcon}>+</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Greenhouse Modal */}
      <Modal visible={switchModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <ThemedText style={styles.modalTitle}>Your Greenhouses</ThemedText>
            {greenhouses.map(g => (
              <View key={g.greenhouse_id} style={styles.greenhouseRow}>
                <TouchableOpacity
                  style={[styles.greenhouseItem, selectedGreenhouse?.greenhouse_id === g.greenhouse_id && styles.selectedItem]}
                  onPress={() => { setSelectedGreenhouse(g); setSwitchModalOpen(false); }}
                >
                  <ThemedText style={styles.greenhouseItemText}>{g.name}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteGreenhouse(g.greenhouse_id)} style={styles.deleteButton}>
                  <ThemedText style={styles.deleteText}>🗑</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.createButton} onPress={() => { setSwitchModalOpen(false); setCreateModalOpen(true); }}>
              <ThemedText style={styles.createButtonText}>+ Create New Greenhouse</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSwitchModalOpen(false)}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Greenhouse Modal */}
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitleButton: { flex: 1 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#2d6a4f' },
  switchButton: { padding: 8 },
  switchIcon: { fontSize: 20 },
  content: { padding: 16 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#999', marginBottom: 8, letterSpacing: 1 },
  notificationCard: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 },
  notificationText: { fontSize: 14 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  sensorCard: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, alignItems: 'center' },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#999', letterSpacing: 1, marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  addCard: { width: 120, height: 120, backgroundColor: '#f0f0f0', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addIcon: { fontSize: 40, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  greenhouseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  greenhouseItem: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#f5f5f5' },
  selectedItem: { backgroundColor: '#d8f3dc' },
  greenhouseItemText: { fontSize: 16 },
  deleteButton: { padding: 8 },
  deleteText: { fontSize: 18 },
  createButton: { backgroundColor: '#2d6a4f', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  createButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelText: { textAlign: 'center', marginTop: 12, color: '#999', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 },
});