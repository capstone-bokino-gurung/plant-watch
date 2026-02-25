import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

interface BackButtonProps {
  onPress?: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
    return (      
    <TouchableOpacity style={styles.backButton} onPress={onPress}>
            <Text style={{fontSize: 24, color: "#ffffff"}}>←</Text>
    </TouchableOpacity>);
}


const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 44,
        height: 44,
        zIndex: 10,
        borderRadius: 22,
        backgroundColor: '#1c4415',
        justifyContent: 'center',
        alignItems: 'center',
    },
})