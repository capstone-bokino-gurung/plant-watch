import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';


import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { useAuth } from '@/hooks/useAuth';

interface LoginScreenProps {
  createAccountOnPress?: () => void;
}

export function LoginScreen({ createAccountOnPress }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { width, height } = useWindowDimensions();
    const styles = getStyles(width, height);

    const { signInWithEmail, loading } = useAuth()
    return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
        <TouchableOpacity onPress={createAccountOnPress}>
            <ThemedText style={styles.footerLink}>Create account.</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
    );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
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
  formContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 24,
    paddingHorizontal: width * 0.082,
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
    color: ThemeColors.text,
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