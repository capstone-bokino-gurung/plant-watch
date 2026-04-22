import { ThemeColors } from '@/hooks/get-theme-colors';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

interface BackButtonProps {
  onPress?: () => void;
  floating?: boolean;
}

export function BackButton({ onPress, floating = true }: BackButtonProps) {
    return (
    <TouchableOpacity style={[styles.backButton, floating && styles.floating]} onPress={onPress}>
            <Text style={{fontSize: 24, color: "#ffffff"}}>←</Text>
    </TouchableOpacity>);
}


const styles = StyleSheet.create({
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: ThemeColors.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    floating: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
})