import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, Alert, useWindowDimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GreenhouseHeader } from '@/components/greenhouse-header';
import { getUserGreenhouses } from '@/services/greenhouse';
import { getPlantLogs } from '@/services/activity_log';
import { useAuth } from '@/hooks/useAuth';
import { Plant } from '@/interfaces/plant';
import { router, useLocalSearchParams } from 'expo-router';

import { AddPlant } from '@/components/modals/add-plant';
import { useGreenhouseRole } from '@/contexts/greenhouse-role-context';


type Greenhouse = { greenhouse_id: string; name: string };

type ActivityLog = { id: string; user_id: string; activity: string; time: string; notes: string };
type LinkedDevice = { id: string; name: string; type: string };

export default function PlantScreen() {
  const { plantData, greenhouse_name } = useLocalSearchParams<{ plantData: string; greenhouse_name: string }>();
  const initialPlant: Plant | null = plantData ? JSON.parse(plantData) : null;

  const { role } = useGreenhouseRole();

  const [currentPlant, setCurrentPlant] = useState<Plant | null>(initialPlant);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [wateringExpanded, setWateringExpanded] = useState(false);
  const [devicesExpanded, setDevicesExpanded] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [linkedDevices, setLinkedDevices] = useState<LinkedDevice[]>([]);
  const { session, user } = useAuth();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);

  useEffect(() => {
    fetchGreenhouses();
    fetchActivityLogs();
    fetchLinkedDevices();
  }, []);

  if (!currentPlant) {
    router.back();
    return null;
  }

  const { label, image_url, common_name, scientific_name, notes, greenhouse_id } = currentPlant;

  async function fetchGreenhouses() {
      if (!session || !user) return;
      const { data, error } = await getUserGreenhouses();
      if (error) {
          Alert.alert('Error', error);
      } else {
          setGreenhouses(data || []);
      }
  }

  async function fetchActivityLogs() {
    if (!currentPlant) return;
    const { data, error } = await getPlantLogs(currentPlant.plant_id);
    if (error) Alert.alert('Error', error.message);
    else setActivityLogs(data || []);
  }

  async function fetchLinkedDevices() {
    // TODO: Fetch linked devices from database
    setLinkedDevices([]);
  }


  return (
    <ThemedView style={{ flex: 1 }}>
      <GreenhouseHeader
        greenhouse_id={greenhouse_id ?? ''}
        greenhouse_name={greenhouse_name ?? ''}
        currentPage="plants"
        pageTitle={`Plants / ${label}`}
        leftButton="back"
        onEdit={(role?.edit_plants || role?.owner) ? () => setEditModalOpen(true) : undefined}
      />

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
            <ThemedText style={styles.dropdownLabel}>Activity Logs</ThemedText>
            <ThemedText style={styles.dropdownButton}>{wateringExpanded ? '-' : '+'}</ThemedText>
          </TouchableOpacity>
          {wateringExpanded && (
            <ThemedView style={styles.dropdownContent}>
              {activityLogs.length === 0
                ? <ThemedText style={styles.dropdownEmpty}>NO ACTIVITY LOGS</ThemedText>
                : activityLogs.map(log => (
                    <ThemedText key={log.user_id} style={styles.dropdownItem}>
                      {log.user_id} — {log.activity} — {new Date(log.time).toLocaleString()}
                    </ThemedText>
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

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: width * 0.051,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 24,
    height: height * 0.213,
    borderRadius: 12,
  },
  image: {
    width: width * 0.308,
    height: height * 0.213,
    borderRadius: 12,
    marginRight: width * 0.041,
  },
  infoRows: {
    flex: 1,
    justifyContent: 'space-between',
  },
  row: {
    flex: 1,
    justifyContent: 'center',
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
  descriptionContainer: {
    borderRadius: 12,
    padding: 18,
    minHeight: 150,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
  },
  editButton: {
    position: 'absolute',
    top: height * 0.059,
    right: width * 0.051,
    width: width * 0.113,
    height: width * 0.113,
    zIndex: 10,
    borderRadius: width * 0.056,
    backgroundColor: '#1c4415',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownButton: {
    fontSize: 18,
    color: '#888888',
  },
  dropdownContent: {
    paddingBottom: 8,
  },
  dropdownEmpty: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
  dropdownItem: {
    fontSize: 15,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});
