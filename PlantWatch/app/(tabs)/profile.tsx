import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { View } from 'react-native';
import { LoginScreen } from '@/components/login-screen'

export default function Profile() {
  return (
    <LoginScreen/>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
