import { Stack } from 'expo-router';

export default function ActivityLogLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false
          }}
        />
      <Stack.Screen 
        name="log-activity"
        options={{ 
          headerShown: false,
          animation: 'fade' 
        }} 
      />
      <Stack.Screen
        name="select-plants"
        options={{ 
          headerShown: false,
          animation: 'fade'
        }}
      />
    </Stack>
  );
}
