import { useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/hooks/get-theme-colors';

export type GreenhousePage =
  | 'dashboard'
  | 'plants'
  | 'devices'
  | 'users'
  | 'userRoles'
  | 'notifications'
  | 'settings';

interface GreenhouseMenuProps {
  greenhouse_id: string;
  greenhouse_name: string;
  currentPage: GreenhousePage;
}

const MENU_ITEMS: { label: string; page: GreenhousePage; pathname: string }[] = [
  { label: 'Dashboard',     page: 'dashboard',     pathname: '/greenhouse/dashboard' },
  { label: 'Plants',        page: 'plants',        pathname: '/greenhouse/plants' },
  { label: 'Devices',       page: 'devices',       pathname: '/greenhouse/devices' },
  { label: 'Users',         page: 'users',         pathname: '/greenhouse/users' },
  { label: 'User Roles',    page: 'userRoles',     pathname: '/greenhouse/user-roles' },
  { label: 'Notifications', page: 'notifications', pathname: '/greenhouse/notifications' },
  { label: 'Settings',      page: 'settings',      pathname: '/greenhouse/settings' },
];

export function GreenhouseMenu({ greenhouse_id, greenhouse_name, currentPage }: GreenhouseMenuProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = getStyles(width);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(-width * 0.70)).current;

  const openMenu = () => {
    menuAnim.setValue(-width * 0.70);
    setMenuOpen(true);
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuAnim, {
      toValue: -width * 0.70,
      duration: 280,
      useNativeDriver: true,
    }).start(() => setMenuOpen(false));
  };

  const navigate = (pathname: string) => {
    setMenuOpen(false);
    router.replace({ pathname: pathname as any, params: { greenhouse_id, greenhouse_name, from: 'menu' } });
  };

  return (
    <>
      <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
        <IconSymbol name="line.3.horizontal" size={22} color="#ffffff" />
      </TouchableOpacity>

      <Modal visible={menuOpen} transparent animationType="none" onRequestClose={closeMenu}>
        <TouchableOpacity style={styles.menuBackdrop} onPress={closeMenu} activeOpacity={1} />
        <Animated.View style={[styles.menuPanel, { transform: [{ translateX: menuAnim }] }]}>
          <View style={[styles.menuContent, { paddingTop: insets.top + 16 }]}>
            <View style={styles.menuHeader}>
              <ThemedText style={styles.menuTitle}>{greenhouse_name}</ThemedText>
              <TouchableOpacity
                onPress={() => { setMenuOpen(false); router.back(); }}
                style={styles.menuBackButton}
              >
                <IconSymbol name="arrow.right.arrow.left" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {MENU_ITEMS.map(item => (
              <TouchableOpacity
                key={item.page}
                style={styles.menuItem}
                onPress={() => currentPage === item.page ? closeMenu() : navigate(item.pathname)}
              >
                <ThemedText style={currentPage === item.page ? styles.menuItemActive : styles.menuItemText}>
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            ))}

            <View style={styles.menuBranding}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.menuLogo}
                resizeMode="contain"
              />
              <ThemedText style={styles.menuBrandingText}>plantwatch</ThemedText>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
}

const getStyles = (width: number) => StyleSheet.create({
  menuButton: {
    width: width * 0.113,
    height: width * 0.113,
    borderRadius: width * 0.056,
    backgroundColor: ThemeColors.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  menuPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.70,
    backgroundColor: ThemeColors.button,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: width * 0.062,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  menuBackButton: {
    paddingTop: 8,
    paddingRight: 8,
  },
  menuTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 17,
    fontWeight: '300',
    color: '#ffffff',
  },
  menuItemActive: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  menuBranding: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingBottom: 24,
  },
  menuLogo: {
    width: width * 0.082,
    height: width * 0.082,
    marginRight: 8,
  },
  menuBrandingText: {
    fontSize: 18,
    lineHeight: 35,
    fontWeight: '400',
    color: '#ffffff',
  },
});
