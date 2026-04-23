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
import { AddPlant } from '@/components/modals/add-plant';
import { GreenhouseHeader } from '@/components/greenhouse-header';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { getGreenhousePlants, deleteGreenhousePlant } from '@/services/plant';
import { Plant } from '@/interfaces/plant';
import { useGreenhouseRole } from '@/contexts/greenhouse-role-context';
import { DeleteButton } from '@/components/ui/delete-button';

export default function PlantsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const { greenhouse_id, greenhouse_name } = useLocalSearchParams<{
    greenhouse_id: string;
    greenhouse_name: string;
  }>();

  const { role } = useGreenhouseRole();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useFocusEffect(useCallback(() => {
    if (greenhouse_id) fetchPlants();
  }, [greenhouse_id]));

  async function fetchPlants() {
    setLoading(true);
    const { data, error } = await getGreenhousePlants(greenhouse_id);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setPlants(data || []);
    }
    setLoading(false);
  }

  async function deletePlant(id: string) {
    Alert.alert('Delete Plant', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const { error } = await deleteGreenhousePlant(id);
          if (error) {
            Alert.alert('Error', error.message);
          } else {
            setPlants(prev => prev.filter(p => p.plant_id !== id));
          }
        }
      }
    ]);
  }

  const handlePlantPress = (plant: Plant) => {
    router.push({
      pathname: '/greenhouse/plant',
      params: {
        plantData: JSON.stringify(plant),
        greenhouse_name,
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <GreenhouseHeader
        greenhouse_id={greenhouse_id}
        greenhouse_name={greenhouse_name}
        currentPage="plants"
        pageTitle="Plants"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.sectionLabel}>PLANTS ({plants.length})</ThemedText>
        {loading ? (
          <ThemedText style={styles.emptyText}>Loading...</ThemedText>
        ) : !role?.view_plants ? (
          <ThemedText style={styles.emptyText}>You don't have permission to view plants.</ThemedText>
        ) : plants.length === 0 ? (
          <ThemedText style={styles.emptyText}>No plants added yet.</ThemedText>
        ) : (
          plants.map(plant => (
            <TouchableOpacity onPress={() => handlePlantPress(plant)} key={plant.plant_id} style={styles.plantCard}>
              <View style={styles.plantInfo}>
                <ThemedText style={styles.plantName}>{plant.label}</ThemedText>
                {plant.scientific_name ? (
                  <ThemedText style={styles.plantScientific}>Common Name: {plant.common_name}</ThemedText>
                ) : null}
              </View>
              {role?.delete_plants || role?.owner && (
                <DeleteButton onPress={() => deletePlant(plant.plant_id)} style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {(role?.create_plants || role?.owner) && (
        <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 24 }]} onPress={() => setAddModalOpen(true)}>
          <ThemedText style={styles.fabText}>+</ThemedText>
        </TouchableOpacity>
      )}

      <AddPlant
        visible={addModalOpen}
        greenhouseId={greenhouse_id}
        onClose={() => setAddModalOpen(false)}
        onAdd={plant => setPlants(prev => [...prev, plant])}
      />
    </ThemedView>
  );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
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
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.inputBackground,
    borderRadius: 10,
    padding: width * 0.036,
    marginBottom: 12,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  plantScientific: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 2,
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
