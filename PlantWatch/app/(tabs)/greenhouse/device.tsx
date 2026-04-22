import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GreenhouseHeader } from '@/components/greenhouse-header';
import { Dropdown } from '@/components/ui/dropdown';
import { Device } from '@/interfaces/device';
import { getDevice, formatDeviceReading, formatDeviceReadingType } from '@/services/device';

export default function DeviceScreen() {
  const { greenhouse_id, greenhouse_name, device_id } = useLocalSearchParams<{ 
    greenhouse_id: string;
    greenhouse_name: string; 
    device_id: string;
  }>();

  const [device, setDevice] = useState<Device | null>(null);
  const [formattedReadings, setFormattedReadings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);

  useEffect(() => {
    if (!device_id) { router.back(); return; }
    getDevice(device_id).then(async ({ data, error }) => {
      if (error || !data) {
        Alert.alert('Error', 'Could not load device.');
        router.back();
      } else {
        setDevice(data);
        setFormattedReadings(formatDeviceReading(data));
      }
      setLoading(false);
    });
  }, [device_id]);

  if (loading) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <ThemedText style={{ textAlign: 'center', marginTop: 80 }}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!device) return null;

  const dataKeys = Object.keys(device.data ?? {});

  return (
    <ThemedView style={styles.container}>
      <GreenhouseHeader
        greenhouse_id={greenhouse_id}
        greenhouse_name={greenhouse_name}
        currentPage="devices"
        pageTitle={`Devices / ${device.name}`}
        leftButton="back"
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.topSection}>
          <ThemedView style={styles.infoRows}>
            <ThemedView style={styles.row}>
              <ThemedText style={styles.label}>Name:</ThemedText>
              <ThemedText style={styles.value}>{device.name}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.row}>
              <ThemedText style={styles.label}>Type:</ThemedText>
              <ThemedText style={styles.value}>{device.type}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.row}>
              <ThemedText style={styles.label}>Reading:</ThemedText>
              <Dropdown
                items={dataKeys}
                selectedValue={selectedKey}
                onSelect={key => { setSelectedKey(key); setDropdownOpen(false); }}
                getLabel={formatDeviceReadingType}
                getKey={key => key}
                isOpen={dropdownOpen}
                onToggle={() => setDropdownOpen(curr => !curr)}
                placeholder="Select a reading"
                emptyText="No readings available"
                dropdownOverlays
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {selectedKey !== null && (
          <ThemedView style={styles.bodyContainer}>
            <ThemedText style={styles.fieldLabel}>Current Reading</ThemedText>
            <ThemedText style={styles.readingValue}>
              {formattedReadings[selectedKey] ?? '—'}
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: width * 0.051,
  },
  topSection: {
    borderRadius: 12,
  },
  infoRows: {
    justifyContent: 'space-between',
  },
  row: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
  },
  bodyContainer: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  readingContainer: {
    marginTop: height * 0.022,
    borderRadius: 10,
  },
  readingValue: {
    fontSize: 48,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 60,
  },
});
