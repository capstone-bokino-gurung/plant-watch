import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import { getPermissionsAsync, requestPermissionsAsync, SchedulableTriggerInputTypes, scheduleNotificationAsync, setNotificationHandler } from "expo-notifications";
import { useEffect } from "react";

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await requestPermissionsAsync();
  return status;
}

export async function triggerNotification() {
  const { status } = await getPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission required', 'Please enable notifications to receive updates about your plants.');
    return { error: 'Permission required' };
  }

  await scheduleNotificationAsync({
    content: {
      title: "Alert from PlantWatch",
      body: "Your plant needs watering!",
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      repeats: false,
    },
  });
  return { error: null };
}

export default function NotificationsScreen() {
  useEffect(() => {
    (async () => {
      const status = await requestNotificationPermission();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please enable notifications to receive updates about your plants.');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Notification Example</Text>
      <StatusBar style="auto" />
      <Button title="Notify" onPress={triggerNotification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});