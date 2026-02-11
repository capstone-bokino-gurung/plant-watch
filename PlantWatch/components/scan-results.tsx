import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface ScanResultsProps {
  imageUri: string;
  commonName: string;
  scientificName: string;
  genus: string;
  family: string;
  confidenceScore: string;
  description: string;
}

// TODO: Rework to use themedview OR consider the use of themed view at all in the project?
// Ask client if dark/light mode is important

export function ScanResults({ imageUri, commonName, scientificName, genus, family, confidenceScore, description }: ScanResultsProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.topSection}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
        />
        
        <View style={styles.infoRows}>
          <View style={styles.row}>
            <Text style={styles.label}>Common Name:</Text>
            <Text style={styles.value}>{commonName}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Genus:</Text>
            <Text style={styles.value}>{genus}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Family:</Text>
            <Text style={styles.value}>{family}</Text>
          </View>
        </View>
      </View>
      

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionLabel}>AI Confidence Score:</Text>
        <Text style={styles.descriptionText}>{confidenceScore}</Text>
        <Text style={styles.descriptionLabel}>Scientific Name:</Text>
        <Text style={styles.descriptionText}>{scientificName}</Text>
        <Text style={styles.descriptionLabel}>Additional information:</Text>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 120,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 24,
    height: 180,
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
    backgroundColor: '#f8f8f8',
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
    color: '#333333',
    marginBottom: 5
  },
});
