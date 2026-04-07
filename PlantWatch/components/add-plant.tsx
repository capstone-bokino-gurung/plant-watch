import { useEffect, useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { useAuth } from '@/hooks/useAuth';
import { addGreenhousePlant, updateGreenhousePlant, saveImageToDatabase, PLANT_IMG_BUCKET } from '@/services/plant';
import { Plant } from '@/interfaces/plant';

const fallbackImage = require('@/assets/images/no-image-placeholder.png');

interface AddPlantProps {
  visible: boolean;
  greenhouseId: string;
  onClose: () => void;
  onAdd: (plant: Plant) => void;
  // Create mode pre-fill
  initialCommonName?: string;
  initialScientificName?: string;
  initialLabel?: string;
  initialNotes?: string;
  initialImageUri?: string;
  // Edit mode: pass the existing plant
  plant?: Plant;
}

export function AddPlant({
  visible,
  greenhouseId,
  onClose,
  onAdd,
  initialCommonName = '',
  initialScientificName = '',
  initialLabel = '',
  initialNotes = '',
  initialImageUri,
  plant,
}: AddPlantProps) {
  const { user } = useAuth();
  const isEditMode = !!plant;

  const [commonName, setCommonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [label, setLabel] = useState('');
  const [count, setCount] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);       // local file URI from picker
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null); // already-uploaded URL

  useEffect(() => {
    if (visible) {
      if (plant) {
        setCommonName(plant.common_name);
        setScientificName(plant.scientific_name);
        setLabel(plant.label);
        setCount(String(plant.count));
        setNotes(plant.notes);
        setImageUri(null);
        setExistingImageUrl(plant.image_url ?? null);
      } else {
        setCommonName(initialCommonName);
        setScientificName(initialScientificName);
        setLabel(initialLabel);
        setCount('');
        setNotes(initialNotes);
        setImageUri(initialImageUri ?? null);
        setExistingImageUrl(null);
      }
    }
  }, [visible, plant]);

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!commonName.trim()) {
      Alert.alert('Error', 'Please enter a plant name.');
      return;
    }
    const parsedCount = count.trim() ? parseInt(count.trim(), 10) : 1;
    if (count.trim() && isNaN(parsedCount)) {
      Alert.alert('Error', 'Count must be a number.');
      return;
    }

    // Use newly picked image if available, otherwise fall back to existing URL
    let imageUrl: string | undefined = existingImageUrl ?? undefined;
    if (imageUri && user) {
      try {
        imageUrl = await saveImageToDatabase(user.id, imageUri, PLANT_IMG_BUCKET);
      } catch {
        Alert.alert('Error', 'Failed to upload image.');
        return;
      }
    }

    if (isEditMode) {
      const { data, error } = await updateGreenhousePlant(
        plant.plant_id,
        commonName.trim(),
        scientificName.trim(),
        notes.trim(),
        label.trim(),
        parsedCount,
        imageUrl,
      );
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        onAdd(data);
        onClose();
      }
    } else {
      const { data, error } = await addGreenhousePlant(
        greenhouseId,
        commonName.trim(),
        scientificName.trim(),
        notes.trim(),
        label.trim(),
        parsedCount,
        imageUrl,
      );
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        onAdd(data);
        onClose();
      }
    }
  }

  const displayImage = imageUri ?? (existingImageUrl ? { uri: existingImageUrl } : null);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <ThemedText style={styles.modalTitle}>{isEditMode ? 'Edit Plant' : 'Add Plant'}</ThemedText>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.imageRow}>
              <Image
                source={displayImage ? (typeof displayImage === 'string' ? { uri: displayImage } : displayImage) : fallbackImage}
                style={styles.image}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                <IconSymbol name="square.and.arrow.up" size={24} color={ThemeColors.button} />
                <ThemedText style={styles.uploadText}>Upload</ThemedText>
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.fieldLabel}>Label</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Optional"
              value={label}
              onChangeText={setLabel}
            />
            <ThemedText style={styles.fieldLabel}>Common Name</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Required"
              value={commonName}
              onChangeText={setCommonName}
            />
            <ThemedText style={styles.fieldLabel}>Scientific Name</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Optional"
              value={scientificName}
              onChangeText={setScientificName}
            />
            <ThemedText style={styles.fieldLabel}>Count</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Defaults to 1"
              value={count}
              onChangeText={setCount}
              keyboardType="numeric"
            />
            <ThemedText style={styles.fieldLabel}>Notes</ThemedText>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Optional"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
              <ThemedText style={styles.addButtonText}>{isEditMode ? 'Save Changes' : 'Add Plant'}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  imageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  image: { width: 120, height: 160, borderRadius: 8, backgroundColor: '#eee' },
  uploadButton: { marginLeft: 20, alignItems: 'center', gap: 4 },
  uploadText: { fontSize: 12, color: ThemeColors.button },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#888888', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 10 },
  notesInput: { height: 80, textAlignVertical: 'top' },
  addButton: { backgroundColor: ThemeColors.button, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelText: { textAlign: 'center', marginTop: 12, color: '#999', fontSize: 14 },
});
