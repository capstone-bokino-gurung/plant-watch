import FormData from 'form-data';
import fs from "fs";
import fetch from "node-fetch";
import path from "path";


const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const FUNCTION_ENDPOINT = `${SUPABASE_URL}/functions/v1/processPlantScan`;
const REAL_PLANT_IMG_PATH = './assets/daisy.jpg'

describe('scan-plant edge function (integration)', () => {
  test('identifies a plant properly', async () => {
    const image = fs.readFileSync(path.resolve(__dirname, REAL_PLANT_IMG_PATH));

    const form = new FormData();
    form.append('image', image, {
      filename: 'daisy.jpg',
      contentType: 'image/jpeg',
    });

    const response = await fetch(FUNCTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        ...form.getHeaders(),
      },
      body: form as any,
    });

    expect(response.ok).toBe(true);

    const data = await response.json();

    expect(data).toMatchObject({
      commonName: expect.any(String),
      genus: expect.any(String),
      family: expect.any(String),
      scientificName: expect.any(String),
      confidenceScore: expect.any(String),
    });

    console.log('Identified plant:', data);
  }, 30000); // 30s timeout

  test('returns 500 when no image is provided', async () => {
    const response = await fetch(FUNCTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(500);
    const data = await response.json();
  }, 15000); // 15s timeout
});