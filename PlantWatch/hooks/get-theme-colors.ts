/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function getThemeColors() {
    const theme = useColorScheme() ?? 'light';
    return Colors[theme];
}

export const ThemeColors = getThemeColors();

