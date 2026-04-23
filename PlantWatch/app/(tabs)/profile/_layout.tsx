import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false
        }} 
      />
    <Stack.Screen
        name="invitations"
        options={{
          headerShown: false,
          animation: 'fade'
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          headerShown: false,
          animation: 'fade'
        }}
      />
    </Stack>
  );
}