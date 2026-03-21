import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/util/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createGreenhouse, deleteGreenhouse, getUserGreenhouses } from '@/services/greenhouse';
import { Greenhouse } from '@/interfaces/greenhouse';

export default function GreenhouseScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
    const [loadingFetch, setLoadingFetch] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newGreenhouseName, setNewGreenhouseName] = useState('');
    const {session, user, loading} = useAuth();
  

    useEffect(() => {
        if (loading) return;
        fetchGreenhouses();
        setLoadingFetch(false);
    }, [loading]);

    async function fetchGreenhouses() {
        if (!session || !user) return;
        const { data, error } = await getUserGreenhouses(user.id);
        if (error) {
            Alert.alert('Error', error);
        } else {
            setGreenhouses(data || []);
        }
    }

    async function createGreenhouseReact() {
        if (!newGreenhouseName || !user) return;

        const { data, error } = await createGreenhouse(user.id, newGreenhouseName);
        
        if (error) {
            Alert.alert('Error', typeof error === 'string' ? error : error.message);
        } else {
            setGreenhouses(prev => [...prev, data]);
            setNewGreenhouseName('');
            setCreateModalOpen(false);
        }
    }

    async function deleteGreenhouseReact(id: string) {
        Alert.alert('Delete Greenhouse', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
            text: 'Delete', style: 'destructive', onPress: async () => {
            const { error } = await deleteGreenhouse(id);
            if (error) {
                Alert.alert('Error', error.message);
            } else {
                setGreenhouses(prev => prev.filter(g => g.greenhouse_id !== id));
            }
            }
        }
        ]);
    }
    if (session) {
        return (
            <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <ThemedText style={styles.headerTitle}>My Greenhouses</ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loadingFetch ? (
                    <ThemedText style={styles.emptyText}>Loading...</ThemedText>
                ) : greenhouses.length === 0 ? (
                    <ThemedText style={styles.emptyText}>No greenhouses yet. Create one!</ThemedText>
                ) : (
                    greenhouses.map(g => {
                        return (
                            <View key={g.greenhouse_id} style={styles.greenhouseRow}>
                                <TouchableOpacity
                                    style={styles.greenhouseCard}
                                    onPress={() => router.push({
                                        pathname: '/greenhouse/plants',
                                        params: {
                                            greenhouse_id: g.greenhouse_id,
                                            greenhouse_name: g.name,
                                        },
                                    })}
                                >
                                    <ThemedText style={styles.greenhouseName}>{g.name}</ThemedText>
                                    <ThemedText style={styles.greenhouseArrow}>→</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => deleteGreenhouseReact(g.greenhouse_id)} style={styles.deleteButton}>
                                    <ThemedText style={styles.deleteText}>🗑</ThemedText>
                                </TouchableOpacity>
                            </View>)
                        }
                    )
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
                    <TouchableOpacity style={styles.createButton} onPress={createGreenhouseReact}>
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
    } else {
        return (
            <ThemedView style={styles.centeredContainer}>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                    <ThemedText>Want to manage your plants?</ThemedText>
                    <Text style={styles.login}>Login.</Text>
                </TouchableOpacity>
            </ThemedView>
        );
    }
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  login: {
    color: ThemeColors.link,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
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