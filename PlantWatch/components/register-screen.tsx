import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';


import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { useAuth } from '@/hooks/useAuth';

export function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const { width, height } = useWindowDimensions();
    const styles = getStyles(width, height);

    const { signInWithEmail, signUpWithEmail, loading } = useAuth()
    return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <ThemedView style={styles.logoContainer}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.logoText}>plantwatch</Text>
          </ThemedView>

          {/* Center Section */}
          <ThemedView style={styles.formContainer}>
              <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#aaa"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
              />
              <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="#aaa"
                  value={first_name}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  keyboardType="default"
              />
              <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="#aaa"
                  value={last_name}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  keyboardType="default"
              />
              <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#aaa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
              />

              <TouchableOpacity style={styles.registerButton} onPress={() => {signUpWithEmail(email, password, first_name, last_name)}} disabled={loading}>
                <ThemedText style={styles.registerButtonText}>Register</ThemedText>
              </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 24,
    paddingHorizontal: width * 0.082,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: height * 0.12,
    paddingBottom: height * 0.035,
  },
  logo: {
    width: width * 0.26,
    height: width * 0.26,
  },
  logoText: {
    paddingTop: 20,
    fontSize: width * 0.077,
    color: ThemeColors.button,
    fontWeight: '600'
  },
  input: {
    backgroundColor: ThemeColors.inputBackground,
    borderWidth: 1,
    borderColor: ThemeColors.inputBackground,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
    color: ThemeColors.text
  },
  registerButton: {
    backgroundColor: ThemeColors.button,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.047,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    color: ThemeColors.link,
    fontSize: 14,
    fontWeight: '600',
  },
});