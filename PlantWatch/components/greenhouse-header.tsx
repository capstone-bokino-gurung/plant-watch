import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { GreenhouseMenu, GreenhousePage } from '@/components/greenhouse-menu';
import { BackButton } from '@/components/ui/back-button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/hooks/get-theme-colors';
import { router } from 'expo-router';

interface GreenhouseHeaderProps {
  greenhouse_id: string;
  greenhouse_name: string;
  currentPage: GreenhousePage;
  pageTitle: string;
  leftButton?: 'menu' | 'back';
  onEdit?: () => void;
}

export function GreenhouseHeader({
  greenhouse_id,
  greenhouse_name,
  currentPage,
  pageTitle,
  leftButton = 'menu',
  onEdit,
}: GreenhouseHeaderProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = getStyles(width);

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      {leftButton === 'back' ? (
        <BackButton onPress={() => router.back()} floating={false} />
      ) : (
        <GreenhouseMenu
          greenhouse_id={greenhouse_id}
          greenhouse_name={greenhouse_name}
          currentPage={currentPage}
        />
      )}
      <View style={styles.titleContainer}>
        <ThemedText style={styles.headerTitle}>{greenhouse_name}</ThemedText>
        <ThemedText style={styles.pageTitle}>{pageTitle}</ThemedText>
      </View>
      {onEdit ? (
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <IconSymbol name="pencil" size={22} color="#ffffff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSpacer} />
      )}
    </View>
  );
}

const getStyles = (width: number) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.041,
    paddingBottom: 12,
    backgroundColor: ThemeColors.inputBackground,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: ThemeColors.header,
    textAlign: 'center',
  },
  pageTitle: {
    fontSize: 14,
    fontWeight: '300',
    color: ThemeColors.subHeader,
    marginTop: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: width * 0.113,
  },
  editButton: {
    width: width * 0.113,
    height: 44,
    borderRadius: 22,
    backgroundColor: ThemeColors.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
