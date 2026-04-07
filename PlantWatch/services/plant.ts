import { PlantScanResult } from '@/interfaces/plant';
import { supabase } from '@/util/supabase';
import { File } from 'expo-file-system';

const SCAN_ENDPOINT = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/processPlantScan`;
const DESC_ENDPOINT = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/getPlantDesc`;
const SCAN_HISTORY_TABLE = 'scan_history';
const PLANT_TABLE = 'plants'
export const PLANT_IMG_BUCKET = 'plant_images';
const SCAN_LIMIT = 1;

// Return plant's openAI description (string)
export async function getDescription(commonName: string) {
    try {
        const response = await fetch(DESC_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ commonName: commonName }),
        });

        if (response.ok) {
            const responseJSON = await response.json();
            console.log(responseJSON)
            return {data: responseJSON.message};
        }

        console.log("Description retrieval failed");
        return {data: null, error: "Description retrieval failed"};
    } catch (error) {
        console.error('Description retrieval failed:', error);
        return { 
            data: null, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
        };
    }
}

export async function scanPlant(uri: string) {
    try {
        const formData = new FormData();  
            formData.append('image', {
            uri: uri,
            type: 'image/jpeg',
            name: 'scan.jpg',
        } as any);

        const response = await fetch(SCAN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: formData,
        });

        if (response.ok)
            return {data: await response.json()};
        console.log("Identification failed.");
        return {data: null, error: "Identification failed."};
    } catch (error) {
        console.error('Plant scan error:', error);
        return { 
            data: null, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
        };
    }
}

// Return: imageURL (string)
export async function saveImageToDatabase(userId: string, uri: string, tableName: string) {
    const file = new File(uri);
    const fh = file.open();
    const bytes = fh.readBytes(fh.size ?? 0);

    if (bytes.length == 0) throw new Error("Failed to read the file with given URI.")

    const fileName = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage
        .from(tableName)
        .upload(fileName, bytes, {
            contentType: 'image/jpeg',
        });

    if (error) throw new Error(`Failed to upload image: ${error.message}`);

    const { data } = supabase.storage
        .from(tableName)
        .getPublicUrl(fileName);
    
    return data.publicUrl;
}

async function getScanCount(userId: string) {
    const { count, error } = await supabase
        .from(SCAN_HISTORY_TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (error) throw new Error(`Failed to get scan count: ${error.message}`);
    return count ?? 0;
}

async function getOldestScanId(userId: string) {
    const { data, error } = await supabase
        .from(SCAN_HISTORY_TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1).single();

    if (error) throw new Error(`Failed to get oldest scan: ${error.message}`);
    return data.scan_id;
}

export async function getScans(userId: string) {
    const { data, error } = await supabase
        .from(SCAN_HISTORY_TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get user scans: ${error.message}`);
    
    return data;
}

export async function deleteScan(userId: string, scanId: string) {
    const { data, error: fetchError } = await supabase
        .from(SCAN_HISTORY_TABLE)
        .select('scan_img_url')
        .eq('scan_id', scanId)
        .single();

    if (fetchError) throw new Error(`Failed to fetch scan: ${fetchError.message}`);

    if (data?.scan_img_url) {
        const filePath = data.scan_img_url.split(`${PLANT_IMG_BUCKET}/`)[1];
        const { error: storageError } = await supabase.storage
            .from(PLANT_IMG_BUCKET)
            .remove([filePath]);

        if (storageError) throw new Error(`Failed to delete image: ${storageError.message}`);
    }

    const { error: deleteError } = await supabase
        .from(SCAN_HISTORY_TABLE)
        .delete()
        .eq('scan_id', scanId)
         

    if (deleteError) throw new Error(`Failed to delete scan: ${deleteError.message}`);
}

export async function getGreenhousePlants(greenhouseId: string) {
    const { data, error } = await supabase
        .from(PLANT_TABLE)
        .select('*')
        .eq('greenhouse_id', greenhouseId);
    return { data, error };
}

export async function addGreenhousePlant(
    greenhouseId: string,
    commonName: string,
    scientificName: string,
    notes: string,
    label: string,
    count: number,
    imageUrl?: string,
) {
    const { data, error } = await supabase
        .from(PLANT_TABLE)
        .insert({
            greenhouse_id: greenhouseId,
            common_name: commonName,
            scientific_name: scientificName,
            notes: notes,
            label: label,
            count: count,
            image_url: imageUrl ?? null,
        })
        .select()
        .single();
    return { data, error };
}

export async function updateGreenhousePlant(
    plantId: string,
    commonName: string,
    scientificName: string,
    notes: string,
    label: string,
    count: number,
    imageUrl?: string,
) {
    const { data, error } = await supabase
        .from(PLANT_TABLE)
        .update({
            common_name: commonName,
            scientific_name: scientificName,
            notes: notes,
            label: label,
            count: count,
            image_url: imageUrl ?? null,
        })
        .eq('plant_id', plantId)
        .select()
        .single();
    return { data, error };
}

export async function deleteGreenhousePlant(plantId: string) {
    const { error } = await supabase
        .from(PLANT_TABLE)
        .delete()
        .eq('plant_id', plantId);
    return { error };
}

export async function logScan(userId: string, uri: string, scan: PlantScanResult) {

    const { data, error } = await supabase
        .from(SCAN_HISTORY_TABLE)
        .insert({
            user_id: userId,
            common_name: scan.commonName,
            genus: scan.genus,
            family: scan.family,
            scientific_name: scan.scientificName,
            confidence_score: Number(scan.confidenceScore),
        })
        .select().single();

    if (error) {
        console.error('Failed to save scan:', error);
        return;
    }

    try {
        const imgURL = await saveImageToDatabase(userId, uri, PLANT_IMG_BUCKET);
        const { error } = await supabase
        .from(SCAN_HISTORY_TABLE)
        .update({scan_img_url: imgURL})
        .eq('scan_id', data.scan_id);

        if (error) {
            console.error('Failed to save scan:', error);
            return;
        }
        
        // Delete oldest scan if past cap
        const numScans = await getScanCount(userId);
        if (numScans > SCAN_LIMIT) {
            const oldest = await getOldestScanId(userId);
            deleteScan(userId, oldest);
        }
    } catch {
        console.error('Failed to save scan image:', error);
    }

}