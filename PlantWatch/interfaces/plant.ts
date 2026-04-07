export interface PlantScanResult {
  imageUri: string;
  commonName: string;
  genus: string;
  family: string;
  scientificName: string;
  confidenceScore: string;
  description: string;
}

export interface Plant {
  label: string;
  image_url: string;
  plant_id: string;
  greenhouse_id?: string;
  common_name: string;
  scientific_name: string;
  notes: string;
  count: number;
  created_at: string;
};
