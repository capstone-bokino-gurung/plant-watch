import { useEffect, useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { createDevice } from '@/services/device';
import { Device } from '@/interfaces/device';
import { suppDevices } from '@/constants/supported-devices';

interface AddDeviceProps {
  visible: boolean;
  greenhouseId: string;
  onClose: () => void;
  onAdd: (device: Device) => void;
}

export function AddDevice({ visible, greenhouseId, onClose, onAdd }: AddDeviceProps) {
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const [displayName, setDisplayName] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [trackHistory, setTrackHistory] = useState(false);
  const [historyLength, setHistoryLength] = useState('');

  useEffect(() => {
    if (visible) {
      setDisplayName('');
      setSelectedType(null);
      setDropdownOpen(false);
      setTrackHistory(false);
      setHistoryLength('');
    }
  }, [visible]);

  async function handleSubmit() {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a display name.');
      return;
    }
    if (!selectedType) {
      Alert.alert('Error', 'Please select a device type.');
      return;
    }
    if (trackHistory) {
      if (!historyLength.trim()) {
        Alert.alert('Error', 'Please enter a history length in days.');
        return;
      }
      const parsed = parseInt(historyLength.trim(), 10);
      if (isNaN(parsed) || parsed <= 0 || String(parsed) !== historyLength.trim()) {
        Alert.alert('Error', 'History length must be a whole number greater than 0.');
        return;
      }
    }

    const length = trackHistory ? parseInt(historyLength.trim(), 10) : 0;
    const { data, error } = await createDevice(
      displayName.trim(),
      selectedType,
      greenhouseId,
      trackHistory,
      length,
    );

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      onAdd(data as Device);
      onClose();
    }
  }

  const selectedDevice = suppDevices.find(d => d.name === selectedType);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modal}>
            <ThemedText style={styles.modalTitle}>Add Device</ThemedText>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <ThemedText style={styles.fieldLabel}>Display Name</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Required"
                value={displayName}
                onChangeText={setDisplayName}
              />

              <ThemedText style={styles.fieldLabel}>Device Type</ThemedText>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setDropdownOpen(curr => !curr)}
                activeOpacity={0.8}
              >
                {selectedDevice ? (
                  <View>
                    <ThemedText style={styles.dropdownSelected}>{selectedDevice.name}</ThemedText>
                    <ThemedText style={styles.dropdownModel}>{selectedDevice.modelNo}</ThemedText>
                  </View>
                ) : (
                  <ThemedText style={styles.dropdownPlaceholder}>Select a device type</ThemedText>
                )}
                <IconSymbol name={dropdownOpen ? 'arrowtriangle.up.fill' : 'arrowtriangle.down.fill'} size={13} color="#888" />
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={styles.dropdownList}>
                  {suppDevices.map(device => (
                    <TouchableOpacity
                      key={device.name}
                      style={[
                        styles.dropdownItem,
                        selectedType === device.name && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setSelectedType(device.name);
                        setDropdownOpen(false);
                      }}
                    >
                      <ThemedText style={styles.dropdownItemName}>{device.name}</ThemedText>
                      <ThemedText style={styles.dropdownItemModel}>{device.modelNo}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setTrackHistory(curr => !curr)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, trackHistory && styles.checkboxChecked]}>
                  {trackHistory && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </View>
                <ThemedText style={styles.checkboxLabel}>Track History</ThemedText>
              </TouchableOpacity>

              {trackHistory && (
                <>
                  <ThemedText style={styles.fieldLabel}>History Length (days)</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Whole number"
                    value={historyLength}
                    onChangeText={text => setHistoryLength(text.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                  />
                </>
              )}

              <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
                <ThemedText style={styles.addButtonText}>Add Device</ThemedText>
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

const getStyles = (width: number, height: number) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: width * 0.062,
    width: '85%',
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: ThemeColors.header,
    marginBottom: height * 0.019,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: height * 0.014,
    fontSize: 16,
    marginBottom: height * 0.0166,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: height * 0.014,
    marginBottom: height * 0.005,
    minHeight: height * 0.057,
  },
  dropdownSelected: {
    fontSize: 16,
    color: '#333',
  },
  dropdownModel: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#aaa',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: height * 0.0166,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.031,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemActive: {
    backgroundColor: '#f0f7f4',
  },
  dropdownItemName: {
    fontSize: 15,
    color: '#333',
  },
  dropdownItemModel: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.022,
    marginTop: height * 0.022,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ThemeColors.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 0.026,
  },
  checkboxChecked: {
    backgroundColor: ThemeColors.button,
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: ThemeColors.button,
    padding: height * 0.0166,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: height * 0.005,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelText: {
    textAlign: 'center',
    marginTop: height * 0.014,
    color: '#999',
    fontSize: 14,
  },
});
