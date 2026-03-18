import { ThemeColors } from '@/hooks/get-theme-colors';
import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, TouchableOpacity, StyleSheet, View, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/util/supabase';

interface ScanResultsProps {
  imageUri: string;
  commonName: string;
  scientificName: string;
  genus: string;
  family: string;
  confidenceScore: string;
  description: string;
}

// TODO: Rework to use themedThemedView OR consider the use of themed ThemedView at all in the project?
// Ask client if dark/light mode is important
type Greenhouse = { greenhouse_id: string; name: string };

export function ScanResults({ imageUri, commonName, scientificName, genus, family, confidenceScore, description }: ScanResultsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (modalOpen) fetchGreenhouses();
  }, [modalOpen]);

  async function fetchGreenhouses() {
    const { data, error } = await supabase.from('greenhouse').select('*');
    if (!error) setGreenhouses(data || []);
  }

  async function addToGreenhouse(greenhouse_id: string) {
    const { error } = await supabase.from('plants').insert({
      greenhouse_id,
      common_name: commonName,
      scientific_name: scientificName,
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setAdded(true);
      setModalOpen(false);
      Alert.alert('Success', `${commonName} added to greenhouse!`);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.topSection}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
        />
        
        <ThemedView style={styles.infoRows}>
          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Common Name:</ThemedText>
            <ThemedText style={styles.value}>{commonName}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Genus:</ThemedText>
            <ThemedText style={styles.value}>{genus}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Family:</ThemedText>
            <ThemedText style={styles.value}>{family}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      

      <ThemedView style={styles.descriptionContainer}>
        <ThemedText style={styles.descriptionLabel}>AI Confidence Score:</ThemedText>
        <ThemedText style={styles.descriptionText}>{confidenceScore}</ThemedText>
        <ThemedText style={styles.descriptionLabel}>Scientific Name:</ThemedText>
        <ThemedText style={styles.descriptionText}>{scientificName}</ThemedText>
        <ThemedText style={styles.descriptionLabel}>Additional information:</ThemedText>
        <ThemedText style={styles.descriptionText}>{description}</ThemedText>
      </ThemedView>

       {/* Add to Greenhouse Button */}
      <TouchableOpacity
        style={[styles.addButton, added && styles.addButtonDone]}
        onPress={() => !added && setModalOpen(true)}
      >
        <ThemedText style={styles.addButtonText}>
          {added ? '✓ Added to Greenhouse' : '+ Add to Greenhouse'}
        </ThemedText>
      </TouchableOpacity>

    {/* Greenhouse Picker Modal */}
      <Modal visible={modalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <ThemedText style={styles.modalTitle}>Select Greenhouse</ThemedText>
            {greenhouses.length === 0 ? (
              <ThemedText style={styles.emptyText}>No greenhouses found.</ThemedText>
            ) : (
              greenhouses.map(g => (
                <TouchableOpacity
                  key={g.greenhouse_id}
                  style={styles.greenhouseItem}
                  onPress={() => addToGreenhouse(g.greenhouse_id)}
                >
                  <ThemedText style={styles.greenhouseItemText}>{g.name}</ThemedText>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity onPress={() => setModalOpen(false)}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  contentContainer: { padding: 20, paddingTop: 120 },
  topSection: { flexDirection: 'row', marginBottom: 24, height: 180, borderRadius: 12 },
  image: { width: 120, height: 180, borderRadius: 12, marginRight: 16 },
  infoRows: { flex: 1, justifyContent: 'space-between' },
  row: { flex: 1, justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#888888', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 17, fontWeight: '600', color: '#000000' },
  descriptionContainer: { borderRadius: 12, padding: 18, minHeight: 150 },
  descriptionLabel: { fontSize: 13, fontWeight: '600', color: '#888888', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  descriptionText: { fontSize: 16, lineHeight: 24, marginBottom: 5 },
  addButton: { backgroundColor: '#2d6a4f', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16, marginBottom: 40 },
  addButtonDone: { backgroundColor: '#888' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { color: '#999', textAlign: 'center', marginBottom: 12 },
  greenhouseItem: { padding: 14, borderRadius: 8, backgroundColor: '#f5f5f5', marginBottom: 8 },
  greenhouseItemText: { fontSize: 16 },
  cancelText: { textAlign: 'center', marginTop: 8, color: '#999', fontSize: 14 },
});

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000000',
//   },
//   contentContainer: {
//     padding: 20,
//     paddingTop: 120,
//   },
//   topSection: {
//     flexDirection: 'row',
//     marginBottom: 24,
//     height: 180,
//     borderRadius: 12
//   },
//   image: {
//     width: 120,
//     height: 180,
//     borderRadius: 12,
//     marginRight: 16,
//   },
//   infoRows: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },
//   row: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#888888',
//     marginBottom: 3,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   value: {
//     fontSize: 17,
//     fontWeight: '600',
//     color: '#000000',
//   },
//   descriptionContainer: {
//     borderRadius: 12,
//     padding: 18,
//     minHeight: 150,
//   },
//   descriptionLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#888888',
//     marginBottom: 2,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   descriptionText: {
//     fontSize: 16,
//     lineHeight: 24,
//     marginBottom: 5
//   },
// });</View>


