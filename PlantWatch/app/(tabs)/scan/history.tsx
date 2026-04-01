import { LoadingSpinner } from "@/components/loading-spin";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from '@/components/themed-view';
import { ThemeColors } from "@/hooks/get-theme-colors";
import { useAuth } from "@/hooks/useAuth";
import { PlantScanResult } from '@/interfaces/plant';
import { getScans } from "@/services/plant";
import { formatTime } from "@/util/supabase";
import { router } from 'expo-router';
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";

interface ScanHistoryProps {
  onScanPress: (scan: any) => void;
}

interface ScanCardProps {
  imageUri: string;
  commonName: string;
  time: string;
  onPress?: () => void;
}

const ScanCard = ({ imageUri, commonName, time, onPress }: ScanCardProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
    <ThemedView style={styles.card}>
      <Image
        source={{ uri: imageUri }}
        style={styles.cardImage}
      />
      
      <ThemedView style={styles.cardContent}>
        <ThemedText style={styles.labelText}>COMMON NAME</ThemedText>
        <ThemedText style={styles.valueText}>{commonName}</ThemedText>
        <ThemedText style={styles.labelText}>TIME</ThemedText>
        <ThemedText style={styles.valueText}>{time}</ThemedText>
      </ThemedView>
    </ThemedView>
    </TouchableOpacity>
  );
};

export default function HistoryScreen() {
    const theme = useColorScheme() ?? 'light'; 
    const {session, user} = useAuth();
    const [scanHistory, setScanHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadScans() {
            if (!session || !user) {
                setIsLoading(false);
                return;
            }

            try {
                const scans = await getScans(user.id);
                setScanHistory(scans);
            } catch (error) {
                console.error('Failed to load scans:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadScans();
    }, [session, user]);

    const handleScanPress = (scan: any) => {
        const scanData: PlantScanResult = {
            imageUri: scan.scan_img_uri,
            commonName: scan.common_name,
            scientificName: scan.scientific_name,
            genus: scan.genus,
            family: scan.family,
            confidenceScore: String(scan.confidence_score),
            description: 'No description available.'
        };

        // Navigate to results with the historical scan data
        router.push({
            pathname: '/scan/results',
            params: {
                imageUri: scan.scan_img_url,
                scanData: JSON.stringify(scanData),
                from: 'history'
            },
        });
    };

    if (!session || !user) {
        return <ThemedView />;
    }

    if (isLoading) {
        return (
            <ThemedView style={styles.centeredContainer}>
                <ThemedText style={{paddingBottom: 5, fontWeight: 600}}>Loading...</ThemedText>
                <LoadingSpinner />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={{flex: 1, alignItems: "center"}}>
            <ThemedView style={styles.scrollContainer}>
                <ScrollView contentContainerStyle={{paddingLeft: '5%'}}>
                    {scanHistory.map(scan => (
                        <ScanCard
                            key={scan.scan_id}
                            imageUri={scan.scan_img_url}
                            commonName={scan.common_name}
                            time={formatTime(scan.created_at)}
                            onPress={() => handleScanPress(scan)} // Pass the scan data up
                        />
                    ))}
                </ScrollView>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centeredContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 62, // Adjust for status bar / safe area
        paddingBottom: 16,
        alignItems: 'center',
    },
    scrollContainer: {
        top: '2.5%',
        paddingTop: 20,
        justifyContent: 'center',
        width: '85%',
        height: '95%',
        borderRadius: 12,
        backgroundColor: ThemeColors.darkerBackground
    },
    card: {
        width: '95%',
        height: 110, 
        flexDirection: 'row',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    cardImage: {
        width: '30%',
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: 8,
        paddingLeft: 18,
        justifyContent: 'space-around',
    },
    labelText: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
    valueText: {
        fontSize: 14,
        fontWeight: '500',
    }
})