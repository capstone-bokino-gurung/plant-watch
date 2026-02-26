import { useState } from 'react';
import { 
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Modal,
  Dimensions,
 } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const MOCK_TEMP = [65, 68, 70, 72, 75];
const MOCK_HUMIDITY = [55, 58, 62, 65, 68];

function LineGraph({ data, color }: { data: number[]; color: string }) {
  const width = 120;
  const height = 70;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  });
  const polyline = points.join(' ');

  return (
    <View style={{ width, height }}>
      {/* Grid lines */}
      {[0, 1, 2, 3].map(i => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: (i / 3) * height,
            height: 1,
            backgroundColor: '#ddd',
          }}
        />
      ))}
      {/* Simple dot-based chart */}
      {data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / (max - min || 1)) * height;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: x - 3,
              top: y - 3,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: color,
            }}
          />
        );
      })}
      {/* Line between dots */}
      {data.slice(1).map((val, i) => {
        const x1 = (i / (data.length - 1)) * width;
        const y1 = height - ((data[i] - min) / (max - min || 1)) * height;
        const x2 = ((i + 1) / (data.length - 1)) * width;
        const y2 = height - ((val - min) / (max - min || 1)) * height;
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: x1,
              top: y1,
              width: length,
              height: 2,
              backgroundColor: color,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: 'left center',
            }}
          />
        );
      })}
    </View>
  );
}

const MENU_ITEMS = ['Dashboard', 'Plants', 'Devices', 'Users', 'User Roles', 'Notifications', 'Settings'];

export default function GreenhouseScreen() {
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.menuButton}>
          <ThemedText style={styles.menuIcon}>☰</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Test Greenhouse</ThemedText>
        <TouchableOpacity style={styles.switchButton}>
          <ThemedText style={styles.switchIcon}>⇄</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Notifications */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>NOTIFICATIONS</ThemedText>
          <View style={styles.notificationCard}>
            <ThemedText style={styles.notificationText}>⚠️ Plant A needs to be watered!</ThemedText>
          </View>
        </View>

        {/* Sensor Cards */}
        <View style={styles.cardsRow}>
          <View style={styles.sensorCard}>
            <ThemedText style={styles.cardLabel}>TEMPERATURE</ThemedText>
            <ThemedText style={styles.cardValue}>70°F</ThemedText>
            <LineGraph data={MOCK_TEMP} color="#00b4b4" />
          </View>
          <View style={styles.sensorCard}>
            <ThemedText style={styles.cardLabel}>HUMIDITY</ThemedText>
            <ThemedText style={styles.cardValue}>70%</ThemedText>
            <LineGraph data={MOCK_HUMIDITY} color="#00b4b4" />
          </View>
        </View>

        {/* Add Card Button */}
        <TouchableOpacity style={styles.addCard}>
          <ThemedText style={styles.addIcon}>+</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Side Drawer */}
      <Modal visible={drawerOpen} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <View style={[styles.drawer, { paddingTop: insets.top + 16 }]}>
            <ThemedText style={styles.drawerBrand}>🌿 plantwatch</ThemedText>
            <ThemedText style={styles.drawerTitle}>Test Greenhouse</ThemedText>
            {MENU_ITEMS.map(item => (
              <TouchableOpacity key={item} style={styles.drawerItem}>
                <ThemedText style={styles.drawerItemText}>{item}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.drawerDismiss} onPress={() => setDrawerOpen(false)} />
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuButton: { padding: 8 },
  menuIcon: { fontSize: 22 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#2d6a4f' },
  switchButton: { padding: 8 },
  switchIcon: { fontSize: 20 },
  content: { padding: 16 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#999', marginBottom: 8, letterSpacing: 1 },
  notificationCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  notificationText: { fontSize: 14 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  sensorCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#999', letterSpacing: 1, marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  addCard: {
    width: 120,
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: { fontSize: 40, color: '#999' },
  drawerOverlay: { flex: 1, flexDirection: 'row' },
  drawer: {
    width: '70%',
    backgroundColor: '#2d6a4f',
    padding: 24,
  },
  drawerBrand: { color: '#fff', fontSize: 12, opacity: 0.8, marginBottom: 4 },
  drawerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  drawerItem: { paddingVertical: 12 },
  drawerItemText: { color: '#fff', fontSize: 16 },
  drawerDismiss: { flex: 1 },
});