import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
const genAI = new GoogleGenerativeAI(geminiApiKey)

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { soilType, phLevel, location, preferredCrop } = await req.json()

    if (!soilType || !phLevel || !location) {
      return new Response(
        JSON.stringify({ error: `Missing required data. Received: soil=${soilType}, ph=${phLevel}, loc=${location}, pref=${preferredCrop}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const preferredList = preferredCrop ? preferredCrop : 'any suitable crop';

    const prompt = `You are an expert agronomist AI acting as the backend engine for a Smart Crop Advisory App.
    A farmer in ${location} has submitted their farm details:
    - Soil Type: ${soilType}
    - pH Level: ${phLevel}
    - Preferred Category: ${preferredList}

    Please recommend 3 specific crops that best fit these conditions. 
    Format your response EXACTLY as a JSON array of objects, with no markdown, no \`\`\`json wrappers, just the raw array.
    Each object must have exactly these keys:
    - "name" (string, the name of the crop)
    - "confidence" (number between 0 and 100 representing how well it matches)
    - "reason" (string, a short exactly 1-sentence reason why it is recommended based on their specific soil/pH/location).

    Example output:
    [
      {"name": "Wheat", "confidence": 95, "reason": "Wheat thrives in loamy soil and your pH of 6.5 is perfect for its growth cycle in your region."},
      {"name": "Barley", "confidence": 88, "reason": "Barley is a hardy crop that tolerates a wide range of soils..."}
    ]
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Attempt to parse out the JSON if the model added markdown wrappers anyway
    let cleanedText = responseText.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.substring(7)
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3)
    }
    
    const cropData = JSON.parse(cleanedText.trim())

    return new Response(
      JSON.stringify(cropData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})
