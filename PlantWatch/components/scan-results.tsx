import { ThemeColors } from '@/hooks/get-theme-colors';
import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, TouchableOpacity, StyleSheet, Alert, useWindowDimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getUserGreenhouses } from '@/services/greenhouse';
import { useAuth } from '@/hooks/useAuth';
import { AddPlant } from '@/components/add-plant';
import { Plant } from '@/interfaces/plant';

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
  const [selectedGreenhouseId, setSelectedGreenhouseId] = useState<string | null>(null);
  const [addPlantModalOpen, setAddPlantModalOpen] = useState(false);
  const { session, user } = useAuth();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  
  useEffect(() => {
    fetchGreenhouses();
  }, []);

  async function fetchGreenhouses() {
      if (!session || !user) return;
      const { data, error } = await getUserGreenhouses(user.id);
      if (error) {
          Alert.alert('Error', error);
      } else {
          setGreenhouses(data || []);
      }
  }

  function selectGreenhouse(greenhouse_id: string) {
    setSelectedGreenhouseId(greenhouse_id);
    setModalOpen(false);
    setAddPlantModalOpen(true);
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
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modal}>
            <ThemedText style={styles.modalTitle}>Select Greenhouse</ThemedText>
            {greenhouses.length === 0 ? (
              <ThemedText style={styles.emptyText}>No greenhouses found.</ThemedText>
            ) : (
              greenhouses.map(g => (
                <TouchableOpacity
                  key={g.greenhouse_id}
                  style={styles.greenhouseItem}
                  onPress={() => selectGreenhouse(g.greenhouse_id)}
                >
                  <ThemedText style={styles.greenhouseItemText}>{g.name}</ThemedText>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity onPress={() => setModalOpen(false)}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>

      {selectedGreenhouseId && (
        <AddPlant
          key={selectedGreenhouseId + addPlantModalOpen}
          visible={addPlantModalOpen}
          greenhouseId={selectedGreenhouseId}
          initialCommonName={commonName}
          initialScientificName={scientificName}
          initialLabel={commonName}
          initialNotes={description}
          initialImageUri={imageUri}
          onAdd={(plant: Plant) => {
            setAdded(true);
            setAddPlantModalOpen(false);
            Alert.alert('Success', `${plant.common_name} added to greenhouse!`);
          }}
          onClose={() => setAddPlantModalOpen(false)}
        />
      )}
    </ScrollView>
  );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: width * 0.051, paddingTop: height * 0.142 },
  topSection: { flexDirection: 'row', marginBottom: height * 0.028, height: height * 0.213, borderRadius: 12 },
  image: { width: width * 0.308, height: height * 0.213, borderRadius: 12, marginRight: width * 0.041 },
  infoRows: { flex: 1, justifyContent: 'space-between' },
  row: { flex: 1, justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#888888', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 17, fontWeight: '600' },
  descriptionContainer: { borderRadius: 12, padding: width * 0.046, minHeight: height * 0.178 },
  descriptionLabel: { fontSize: 13, fontWeight: '600', color: '#888888', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  descriptionText: { fontSize: 16, lineHeight: 24, marginBottom: 5 },
  addButton: { backgroundColor: '#2d6a4f', padding: height * 0.019, borderRadius: 12, alignItems: 'center', marginTop: height * 0.019, marginBottom: height * 0.047 },
  addButtonDone: { backgroundColor: '#888' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { borderRadius: 12, padding: width * 0.062, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: height * 0.019 },
  emptyText: { color: '#999', textAlign: 'center', marginBottom: 12 },
  greenhouseItem: { padding: height * 0.0166, borderRadius: 8, backgroundColor: ThemeColors.inputBackground, marginBottom: height * 0.009 },
  greenhouseItemText: { fontSize: 16 },
  cancelText: { textAlign: 'center', marginTop: height * 0.009, color: '#999', fontSize: 14 },
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