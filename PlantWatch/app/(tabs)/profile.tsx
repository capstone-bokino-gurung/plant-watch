import { LoadingSpinner } from '@/components/loading-spin';
import { LoginScreen } from '@/components/login-screen';
import { RegisterScreen } from '@/components/register-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BackButton } from '@/components/ui/back-button';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { useAuth } from '@/hooks/useAuth';
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const { session, user, loading, signOut } = useAuth();
  const screens = {
    LOGIN: "login",
    REGISTER: "register",
    PROFILE: "profile"
  };

  const [currScreen, setScreen] = useState(screens.LOGIN);

  if (!session && currScreen == screens.PROFILE)
    setScreen(screens.LOGIN);
  if (session && (currScreen == screens.LOGIN || currScreen == screens.REGISTER))
    setScreen(screens.PROFILE);

  if (loading) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={{paddingBottom: 5, fontWeight: 600}}>Loading...</ThemedText>
        <LoadingSpinner />
      </ThemedView>
    );
  }

  if (currScreen == "login") {
    return (<LoginScreen createAccountOnPress={() => setScreen(screens.REGISTER)}/>);
  } else if (currScreen == "register") {
    return(
      <View style={styles.flexContainer}>
        <BackButton onPress={() => setScreen(screens.LOGIN)}/>  
        <RegisterScreen/>
      </View>
    );
  } else if (currScreen == "profile") {

    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText>{user?.email}</ThemedText>
        <TouchableOpacity style={styles.loginButton} onPress={signOut} disabled={loading}>
          <ThemedText style={styles.loginButtonText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  } else {  
    return (<LoginScreen createAccountOnPress={() => setScreen(screens.REGISTER)}/>);
  }

}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
    centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
});
