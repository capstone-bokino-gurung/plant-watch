import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getUserGreenhouses } from '@/services/greenhouse';
import { useAuth } from '@/hooks/useAuth';
import { Plant } from '@/interfaces/plant';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton } from '@/components/ui/back-button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AddPlant } from '@/components/add-plant';


type Greenhouse = { greenhouse_id: string; name: string };

type WateringRecord = { id: string; date: string; amount: string };
type LinkedDevice = { id: string; name: string; type: string };

export default function PlantScreen() {
  const { plantData } = useLocalSearchParams<{ plantData: string }>();
  const initialPlant: Plant | null = plantData ? JSON.parse(plantData) : null;

  const [currentPlant, setCurrentPlant] = useState<Plant | null>(initialPlant);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [wateringExpanded, setWateringExpanded] = useState(false);
  const [devicesExpanded, setDevicesExpanded] = useState(false);
  const [wateringHistory, setWateringHistory] = useState<WateringRecord[]>([]);
  const [linkedDevices, setLinkedDevices] = useState<LinkedDevice[]>([]);
  const { session, user } = useAuth();

  useEffect(() => {
    fetchGreenhouses();
    fetchWateringHistory();
    fetchLinkedDevices();
  }, []);

  if (!currentPlant) {
    router.back();
    return null;
  }

  const { label, image_url, common_name, scientific_name, notes, greenhouse_id } = currentPlant;

  async function fetchGreenhouses() {
      if (!session || !user) return;
      const { data, error } = await getUserGreenhouses(user.id);
      if (error) {
          Alert.alert('Error', error);
      } else {
          setGreenhouses(data || []);
      }
  }

  async function fetchWateringHistory() {
    // TODO: Fetch watering history from database
    setWateringHistory([]);
  }

  async function fetchLinkedDevices() {
    // TODO: Fetch linked devices from database
    setLinkedDevices([]);
  }


  return (
    <ThemedView style={{ flex: 1 }}>
      <BackButton onPress={() => router.back()} />
      <TouchableOpacity style={styles.editButton} onPress={() => setEditModalOpen(true)}>
        <IconSymbol name="pencil" size={22} color="#ffffff" />
      </TouchableOpacity>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.topSection}>
          <Image
            source={image_url ? { uri: image_url } : require('@/assets/images/no-image-placeholder.png')}
            style={styles.image}
            contentFit="cover"
          />

          <ThemedView style={styles.infoRows}>
            <ThemedView style={styles.row}>
              <ThemedText style={styles.label}>Label:</ThemedText>
              <ThemedText style={styles.value}>{label}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.row}>
              <ThemedText style={styles.label}>Common Name:</ThemedText>
              <ThemedText style={styles.value}>{common_name}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.row}>
              <ThemedText style={styles.label}>Scientific Name:</ThemedText>
              <ThemedText style={styles.value}>{scientific_name}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.descriptionContainer}>
          <ThemedText style={styles.descriptionLabel}>Notes:</ThemedText>
          <ThemedText style={styles.descriptionText}>{notes}</ThemedText>
          <TouchableOpacity style={styles.dropdownHeader} onPress={() => setWateringExpanded(prev => !prev)}>
            <ThemedText style={styles.dropdownLabel}>Watering History</ThemedText>
            <ThemedText style={styles.dropdownButton}>{wateringExpanded ? '-' : '+'}</ThemedText>
          </TouchableOpacity>
          {wateringExpanded && (
            <ThemedView style={styles.dropdownContent}>
              {wateringHistory.length === 0
                ? <ThemedText style={styles.dropdownEmpty}>NO WATERING HISTORY</ThemedText>
                : wateringHistory.map(r => (
                    <ThemedText key={r.id} style={styles.dropdownItem}>{r.date} — {r.amount}</ThemedText>
                  ))
              }
            </ThemedView>
          )}

          <TouchableOpacity style={styles.dropdownHeader} onPress={() => setDevicesExpanded(prev => !prev)}>
            <ThemedText style={styles.dropdownLabel}>Linked Devices</ThemedText>
            <ThemedText style={styles.dropdownButton}>{devicesExpanded ? '-' : '+'}</ThemedText>
          </TouchableOpacity>
          {devicesExpanded && (
            <ThemedView style={styles.dropdownContent}>
              {linkedDevices.length === 0
                ? <ThemedText style={styles.dropdownEmpty}>NO LINKED DEVICES</ThemedText>
                : linkedDevices.map(d => (
                    <ThemedText key={d.id} style={styles.dropdownItem}>{d.name} ({d.type})</ThemedText>
                  ))
              }
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>

      <AddPlant
        visible={editModalOpen}
        greenhouseId={greenhouse_id ?? ''}
        plant={currentPlant}
        onAdd={updated => setCurrentPlant(updated)}
        onClose={() => setEditModalOpen(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingTop: 120 },
  topSection: { flexDirection: 'row', marginBottom: 24, height: 180, borderRadius: 12 },
  image: { width: 120, height: 180, borderRadius: 12, marginRight: 16 },
  infoRows: { flex: 1, justifyContent: 'space-between' },
  row: { flex: 1, justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#888888', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 17, fontWeight: '600' },
  descriptionContainer: { borderRadius: 12, padding: 18, minHeight: 150 },
  descriptionLabel: { fontSize: 13, fontWeight: '600', color: '#888888', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  descriptionText: { fontSize: 16, lineHeight: 24, marginBottom: 5 },
  editButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    zIndex: 10,
    borderRadius: 22,
    backgroundColor: '#1c4415',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0', marginTop: 8 },
  dropdownLabel: { fontSize: 13, fontWeight: '600', color: '#888888', textTransform: 'uppercase', letterSpacing: 0.5 },
  dropdownButton: { fontSize: 18, color: '#888888' },
  dropdownContent: { paddingBottom: 8 },
  dropdownEmpty: { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 12, letterSpacing: 0.5 },
  dropdownItem: { fontSize: 15, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
});
