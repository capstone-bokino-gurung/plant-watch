import { Stack, useGlobalSearchParams } from 'expo-router';
import { GreenhouseRoleProvider } from '@/contexts/greenhouse-role-context';
import { useAuth } from '@/hooks/useAuth';

export default function GreenhouseLayout() {
  const { greenhouse_id } = useGlobalSearchParams<{ greenhouse_id: string }>();
  const { session } = useAuth();

  return (
    <GreenhouseRoleProvider greenhouse_id={greenhouse_id ?? ''}>
    <Stack key={session?.user.id ?? 'unauthenticated'}>
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
      <Stack.Screen
        name="notifications"
        options={{
            headerShown: false,
            animation: 'fade',
        }}
      />
    </Stack>
    </GreenhouseRoleProvider>
  );
}