import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AddDevice } from '@/components/add-device';
import { GreenhouseMenu } from '@/components/greenhouse-menu';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { getGreenhouseDevices, deleteDevice } from '@/services/device';
import { Device } from '@/interfaces/device';

export default function DevicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const { greenhouse_id, greenhouse_name } = useLocalSearchParams<{
    greenhouse_id: string;
    greenhouse_name: string;
  }>();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useFocusEffect(useCallback(() => {
    if (greenhouse_id) fetchDevices();
  }, [greenhouse_id]));

  async function fetchDevices() {
    setLoading(true);
    const { data, error } = await getGreenhouseDevices(greenhouse_id);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setDevices(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    Alert.alert('Delete Device', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const { error } = await deleteDevice(id);
          if (error) {
            Alert.alert('Error', error.message);
          } else {
            setDevices(prev => prev.filter(d => d.device_id !== id));
          }
        },
      },
    ]);
  }

  const handleDevicePress = (device: Device) => {
    router.push({
      pathname: '/greenhouse/device',
      params: {
        deviceData: JSON.stringify(device),
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <GreenhouseMenu
          greenhouse_id={greenhouse_id}
          greenhouse_name={greenhouse_name}
          currentPage="devices"
        />
        <ThemedText style={styles.headerTitle}>{greenhouse_name}</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.sectionLabel}>DEVICES ({devices.length})</ThemedText>
        {loading ? (
          <ThemedText style={styles.emptyText}>Loading...</ThemedText>
        ) : devices.length === 0 ? (
          <ThemedText style={styles.emptyText}>No devices added yet.</ThemedText>
        ) : (
          devices.map(device => (
            <TouchableOpacity
              key={device.device_id}
              style={styles.deviceCard}
              onPress={() => handleDevicePress(device)}
            >
              <View style={styles.deviceInfo}>
                <ThemedText style={styles.deviceName}>{device.name}</ThemedText>
                <ThemedText style={styles.deviceType}>{device.type}</ThemedText>
              </View>
              <TouchableOpacity onPress={() => handleDelete(device.device_id)} style={styles.deleteButton}>
                <ThemedText style={styles.deleteText}>🗑</ThemedText>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={() => setAddModalOpen(true)}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </TouchableOpacity>

      <AddDevice
        visible={addModalOpen}
        greenhouseId={greenhouse_id}
        onClose={() => setAddModalOpen(false)}
        onAdd={device => setDevices(prev => [...prev, device])}
      />
    </ThemedView>
  );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.041,
    paddingBottom: 12,
    backgroundColor: ThemeColors.inputBackground,
  },
  headerSpacer: {
    width: width * 0.113,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  content: {
    padding: width * 0.041,
    paddingBottom: height * 0.118,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    marginBottom: 8,
    letterSpacing: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 16,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.inputBackground,
    borderRadius: 10,
    padding: width * 0.036,
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceType: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 20,
  },
  fab: {
    position: 'absolute',
    right: width * 0.062,
    width: width * 0.144,
    height: width * 0.144,
    borderRadius: width * 0.072,
    backgroundColor: ThemeColors.button,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 36,
  },
});
