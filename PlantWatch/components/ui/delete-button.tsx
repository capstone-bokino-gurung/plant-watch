import { TouchableOpacity, StyleSheet, useWindowDimensions, ViewStyle } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeColors } from '@/hooks/get-theme-colors';

interface DeleteButtonProps {
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
}

export function DeleteButton({ onPress, size, style }: DeleteButtonProps) {
  const { height } = useWindowDimensions();
  const btnSize = size ?? height * 0.047;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { width: btnSize, height: btnSize }, style]}
    >
      <IconSymbol name="trash" size={btnSize * 0.5} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: ThemeColors.button,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
