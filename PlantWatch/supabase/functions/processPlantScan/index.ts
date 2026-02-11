// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";

const PLANTNET_API_KEY = Deno.env.get("PLANTNET_API_KEY");
const PLANTNET_API_URL = `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}`;

Deno.serve(async (req) => {
  try {
    console.log("on server");
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
      
    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const plantScannerForm = new FormData();  
    plantScannerForm.append('images', imageFile);
    
    const response = await fetch(PLANTNET_API_URL, {
      method: 'POST',
      body: plantScannerForm,
    });

    const result = await response.json();

    const bestMatch = result.results[0];
    let reformattedResult: Record<string, string> = {
      commonName: bestMatch.species.commonNames[0],
      genus: bestMatch.species.genus.scientificName,
      family: bestMatch.species.family.scientificName,
      scientificName: bestMatch.species.scientificNameWithoutAuthor,
      confidenceScore: String(bestMatch.score)
    };
    

    
    return new Response(JSON.stringify(reformattedResult), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/processPlantScan' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
