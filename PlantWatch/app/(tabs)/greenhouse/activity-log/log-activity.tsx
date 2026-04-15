import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GreenhouseMenu } from '@/components/greenhouse-menu';
import { ThemeColors } from '@/hooks/get-theme-colors';

const ACTIVITY_TYPES = ['Watering', 'Soil Change'];

export default function LogActivityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const { greenhouse_id, greenhouse_name } = useLocalSearchParams<{
    greenhouse_id: string;
    greenhouse_name: string;
  }>();

  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [activityError, setActivityError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState('');

  function handleSelectPlants() {
    if (!selectedActivity) {
      setActivityError(true);
      return;
    }
    router.push({
      pathname: '/greenhouse/activity-log/select-plants',
      params: {
        greenhouse_id,
        greenhouse_name,
        activity: selectedActivity,
        date: date.toISOString(),
        time: time.toISOString(),
        notes,
      },
    });
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <GreenhouseMenu
          greenhouse_id={greenhouse_id}
          greenhouse_name={greenhouse_name}
          currentPage="activity-log"
        />
        <ThemedText style={styles.headerTitle}>{greenhouse_name}</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>←</ThemedText>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <ThemedText style={styles.fieldLabel}>Activity</ThemedText>
          <TouchableOpacity
            style={[styles.dropdownTrigger, activityError && styles.dropdownTriggerError]}
            onPress={() => setDropdownOpen(curr => !curr)}
            activeOpacity={0.8}
          >
            <ThemedText style={selectedActivity ? styles.dropdownSelected : styles.dropdownPlaceholder}>
              {selectedActivity ?? 'Select an activity type'}
            </ThemedText>
            <ThemedText style={styles.dropdownChevron}>{dropdownOpen ? '▲' : '▾'}</ThemedText>
          </TouchableOpacity>
          {activityError && (
            <ThemedText style={styles.errorText}>This field is required</ThemedText>
          )}
          {dropdownOpen && (
            <View style={styles.dropdownList}>
              {ACTIVITY_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.dropdownItem, selectedActivity === type && styles.dropdownItemActive]}
                  onPress={() => { setSelectedActivity(type); setActivityError(false); setDropdownOpen(false); }}
                >
                  <ThemedText style={styles.dropdownItemText}>{type}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <ThemedText style={styles.fieldLabel}>Date</ThemedText>
          <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowDatePicker(curr => !curr)}>
            <ThemedText style={styles.pickerText}>{date.toLocaleDateString()}</ThemedText>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={(_, selected) => { if (selected) setDate(selected); }}
            />
          )}

          <ThemedText style={styles.fieldLabel}>Time</ThemedText>
          <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowTimePicker(curr => !curr)}>
            <ThemedText style={styles.pickerText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</ThemedText>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={(_, selected) => { if (selected) setTime(selected); }}
            />
          )}

          <ThemedText style={styles.fieldLabel}>Notes</ThemedText>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes..."
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.selectPlantsButton} onPress={handleSelectPlants}>
            <ThemedText style={styles.selectPlantsText}>Select Plants to Log →</ThemedText>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
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
  backButton: {
    width: width * 0.113,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 22,
    color: ThemeColors.button,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: ThemeColors.header,
  },
  content: {
    padding: width * 0.051,
    paddingBottom: height * 0.1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: height * 0.014,
    fontSize: 16,
    marginBottom: height * 0.022,
  },
  pickerTrigger: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: height * 0.014,
    marginBottom: height * 0.022,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: height * 0.014,
    fontSize: 16,
    height: height * 0.18,
    marginBottom: height * 0.03,
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
  dropdownTriggerError: {
    borderColor: '#d9534f',
  },
  errorText: {
    color: '#d9534f',
    fontSize: 12,
    marginBottom: height * 0.014,
    marginTop: 2,
  },
  dropdownSelected: {
    fontSize: 16,
    color: '#333',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#aaa',
  },
  dropdownChevron: {
    fontSize: 16,
    color: '#888',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: height * 0.022,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: height * 0.014,
    paddingHorizontal: width * 0.041,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemActive: {
    backgroundColor: '#f0f7f4',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  selectPlantsButton: {
    backgroundColor: ThemeColors.button,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  selectPlantsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
