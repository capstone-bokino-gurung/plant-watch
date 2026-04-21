import { Stack } from 'expo-router';

export default function GreenhouseLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen
        name="dashboard"
        options={{
            headerShown: false
        }}
      />
      <Stack.Screen
        name="plant"
        options={{
            headerShown: false,
            animation: 'fade'
        }}
      />
      <Stack.Screen
        name="plants"
        options={{
            headerShown: false,
            animation: 'fade'
        }}
      />
      <Stack.Screen
        name="devices"
        options={{
            headerShown: false,
            animation: 'fade'
        }}
      />
      <Stack.Screen
        name="device"
        options={{
            headerShown: false,
            animation: 'fade'
        }}
      />
      <Stack.Screen
        name="activity-log"
        options={{
            headerShown: false,
            animation: 'fade',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
            headerShown: false,
            animation: 'fade',
        }}
      />
      <Stack.Screen
        name="user-roles"
        options={{
            headerShown: false,
            animation: 'fade',
        }}
      />
      <Stack.Screen
        name="users"
        options={{
            headerShown: false,
            animation: 'fade',
        }}
      />
      {/* <Stack.Screen
        name="activity-log"
        options={{
            headerShown: false,
            animation: 'fade',
        }}
      /> */}
    </Stack>
  );
}