import { Stack } from 'expo-router';

export default function ScanLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="preview" 
        options={{ 
          headerShown: false,
          animation: 'fade'
        }} 
      />
      <Stack.Screen 
        name="results" 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right'
        }} 
      />
      <Stack.Screen
        name="history"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}