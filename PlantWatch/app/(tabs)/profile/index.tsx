import { LoadingSpinner } from '@/components/loading-spin';
import { LoginScreen } from '@/components/login-screen';
import { RegisterScreen } from '@/components/register-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BackButton } from '@/components/ui/back-button';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function Profile() {
  const { session, user, loading, signOut } = useAuth();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
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
    const firstName = user?.user_metadata?.first_name ?? '';
    const lastName = user?.user_metadata?.last_name ?? '';

    return (
      <ThemedView style={styles.profileContainer}>
        <View style={styles.userSection}>
          <Image
            source={require('@/assets/images/no-image-placeholder.png')}
            style={styles.avatar}
          />
          <ThemedText style={styles.name}>{firstName} {lastName}</ThemedText>
          <ThemedText style={styles.email}>{user?.email}</ThemedText>
        </View>
        <View style={styles.menuList}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/account')}>
            <IconSymbol name="gear" size={20} color={ThemeColors.text} />
            <ThemedText style={styles.menuItemText}>Account Information</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/profile/invitations', params: { from: 'profile' } })}>
            <IconSymbol name="envelope.fill" size={20} color={ThemeColors.text} />
            <ThemedText style={styles.menuItemText}>Invitations</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={signOut} disabled={loading}>
          <ThemedText style={styles.loginButtonText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  } else {  
    return (<LoginScreen createAccountOnPress={() => setScreen(screens.REGISTER)}/>);
  }

}

const getStyles = (width: number, height: number) => StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: height * 0.057,
  },
  userSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '30%',
  },
  avatar: {
    width: width * 0.256,
    height: width * 0.256,
    borderRadius: width * 0.128,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: ThemeColors.header,
    marginBottom: 6,
  },
  email: {
    fontSize: 15,
    color: ThemeColors.header,
    opacity: 0.7,
  },
  loginButton: {
    backgroundColor: ThemeColors.button,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: width * 0.123,
    alignItems: 'center',
    width: '80%',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  menuList: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: height * 0.02,
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: height * 0.019,
    paddingHorizontal: width * 0.051,
    backgroundColor: ThemeColors.inputBackground,
    borderRadius: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: ThemeColors.text,
  },
});
