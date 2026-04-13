import { LoadingSpinner } from '@/components/loading-spin';
import { ThemedView } from '@/components/themed-view';
import { BackButton } from '@/components/ui/back-button';
import { useAuth } from '@/hooks/useAuth';
import { PlantScanResult } from '@/interfaces/plant';
import { scanPlant, getDescription, logScan } from '@/services/plant';
import { Image } from 'expo-image';
import { SaveFormat, useImageManipulator } from 'expo-image-manipulator';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from 'react-native';

export default function PreviewScreen() {
    const { imageUri } = useLocalSearchParams<{ imageUri: string }>(); // gets from router params
    const [isProcessing, setIsProcessing] = useState(false);
    const scanContext = useImageManipulator(imageUri ?? '');
    const { session, user } = useAuth();
    const { width, height } = useWindowDimensions();
    const styles = getStyles(width, height);

    // Convert to JPEG, 90% compression
    const reformatImage = async (uri: string) => {
        const renderedImage = await scanContext.renderAsync();
        const result = await renderedImage.saveAsync({
            base64: true,
            compress: 0.9,
            format: SaveFormat.JPEG,
        });
        return result.uri;
    };

    const submitScan = async () => {
        if (!imageUri) return;
        setIsProcessing(true);

        try {
            const formattedUri = await reformatImage(imageUri);
            const scanResponse = await scanPlant(formattedUri);

            if (!scanResponse.error && scanResponse.data) {
                const result: PlantScanResult = scanResponse.data;
                result.description = "Error retrieving description.";

                const description = await getDescription(result.commonName);
                if (description.data != null) 
                    result.description = description.data;

                if (session && user) 
                    await logScan(user.id, formattedUri, result);

                // Navigate to results with scan data
                router.replace({
                    pathname: '/scan/results',
                    params: {
                        imageUri: formattedUri,
                        scanData: JSON.stringify(result),
                        from: 'camera'
                    },
                });
            } else {
                // Scan failed, go back to camera
                Alert.alert(
                    "Identification Failed",
                    "The A.I. failed to identify the plant. Please try scanning the plant again in better lighting or at a different angle."
                );
                router.back();
            }
        } catch (error) {
            console.error('Scan error:', error);
            Alert.alert("Error", "Something went wrong. Please try again.");
            setIsProcessing(false);
        }
    };

    if (!imageUri) {
        router.back();
        return null;
    }

    return (
        <ThemedView style={styles.container}>
            <BackButton onPress={() => router.back()} />

            <Image 
                source={{ uri: imageUri }}
                contentFit="cover"
                style={styles.image}
            />

            {/* Processing Overlay */}
            {isProcessing && (
            <ThemedView style={styles.processingOverlay}>
                <Text style={styles.processingText}>Processing...</Text>
                <LoadingSpinner />
            </ThemedView>
            )}

            {/* Submit Button */}
            {!isProcessing && (
            <TouchableOpacity 
                style={styles.submitButton}
                onPress={submitScan}
            >
                <Text style={styles.submitButtonText}>Submit Scan</Text>
            </TouchableOpacity>
            )}
        </ThemedView>
    );
}

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: '100%',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  submitButton: {
    position: 'absolute',
    bottom: height * 0.047,
    left: width * 0.051,
    right: width * 0.051,
    backgroundColor: '#1c4415',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});