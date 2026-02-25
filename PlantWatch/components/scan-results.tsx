import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface ScanResultsProps {
  imageUri: string;
  commonName: string;
  scientificName: string;
  genus: string;
  family: string;
  confidenceScore: string;
  description: string;
}

// TODO: Rework to use themedThemedView OR consider the use of themed ThemedView at all in the project?
// Ask client if dark/light mode is important

export function ScanResults({ imageUri, commonName, scientificName, genus, family, confidenceScore, description }: ScanResultsProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.topSection}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
        />
        
        <ThemedView style={styles.infoRows}>
          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Common Name:</ThemedText>
            <ThemedText style={styles.value}>{commonName}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Genus:</ThemedText>
            <ThemedText style={styles.value}>{genus}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Family:</ThemedText>
            <ThemedText style={styles.value}>{family}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      

      <ThemedView style={styles.descriptionContainer}>
        <ThemedText style={styles.descriptionLabel}>AI Confidence Score:</ThemedText>
        <ThemedText style={styles.descriptionText}>{confidenceScore}</ThemedText>
        <ThemedText style={styles.descriptionLabel}>Scientific Name:</ThemedText>
        <ThemedText style={styles.descriptionText}>{scientificName}</ThemedText>
        <ThemedText style={styles.descriptionLabel}>Additional information:</ThemedText>
        <ThemedText style={styles.descriptionText}>{description}</ThemedText>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 120,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 24,
    height: 180,
    borderRadius: 12
  },
  image: {
    width: 120,
    height: 180,
    borderRadius: 12,
    marginRight: 16,
  },
  infoRows: {
    flex: 1,
    justifyContent: 'space-between',
  },
  row: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  descriptionContainer: {
    borderRadius: 12,
    padding: 18,
    minHeight: 150,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5
  },
});
