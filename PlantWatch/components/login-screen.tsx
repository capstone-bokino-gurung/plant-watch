import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';


import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { useAuth } from '@/hooks/useAuth';

export function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { signInWithEmail, signUpWithEmail, loading } = useAuth()
    return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Logo */}
      <ThemedView>

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
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
          />

          <TouchableOpacity style={styles.loginButton} onPress={() => {signInWithEmail(email, password)}} disabled={loading}>
            <ThemedText style={styles.loginButtonText}>Log In</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {/* navigate to forgot password */}}>
            <ThemedText style={styles.forgotPassword}>Forgot password?</ThemedText>
          </TouchableOpacity>


      </ThemedView>

      {/* Footer */}
        <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>Need an account? </ThemedText>
        <TouchableOpacity onPress={() => {/* navigate to create account */}}>
            <ThemedText style={styles.footerLink}>Create account.</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
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
    color: '#000',
  },
  forgotPassword: {
    color: ThemeColors.link,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: ThemeColors.button,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
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