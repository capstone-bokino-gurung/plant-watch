const FUNCTION_ENDPOINT = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/processPlantScan`;

export async function scan_plant(uri: string) {
    try {
        console.log(`${process.env.EXPO_PUBLIC_SUPABASE_URL}`);
        const formData = new FormData();  
        formData.append('image', {
        uri: uri,
        type: 'image/jpeg',
        name: 'scan.jpg',
        } as any);

        const response = await fetch(FUNCTION_ENDPOINT, {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: formData,
        });

        return await response.json();
    } catch (error) {
        console.error('Plant scan error:', error);
        return { 
            data: null, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
        };
    }
}