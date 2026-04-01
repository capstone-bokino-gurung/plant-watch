import { ScanResults } from '@/components/scan-results';
import { ThemedView } from '@/components/themed-view';
import { BackButton } from '@/components/ui/back-button';
import { PlantScanResult } from '@/interfaces/plant';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function ResultsScreen() {
    const { imageUri, scanData, from } = useLocalSearchParams<{ 
        imageUri: string;
        scanData: string;
        from?: string;
    }>();

    // Parse the scan data from JSON string
    const parsedScanData: PlantScanResult | null = scanData ? JSON.parse(scanData) : null;

    // If no data, go back
    if (!parsedScanData || !imageUri) {
        router.back();
        return null;
    }

    return (
        <ThemedView style={styles.container}>
        <BackButton onPress={() => router.back()} />
        
        <ScanResults 
            imageUri={imageUri}
            commonName={parsedScanData.commonName}
            scientificName={parsedScanData.scientificName}
            genus={parsedScanData.genus}
            family={parsedScanData.family}
            confidenceScore={parsedScanData.confidenceScore}
            description={parsedScanData.description}
        />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});