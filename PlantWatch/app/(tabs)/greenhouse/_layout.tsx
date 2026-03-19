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
        name="plants"
        options={{
            headerShown: false
        }}/>
    </Stack>
  );
}