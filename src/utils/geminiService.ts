import { FarmerFormData } from "../components/FarmerInputForm";
import { EXTRACTED_MARKET_DATABASE } from "./extractedMarketDatabase";
import { KAGGE_PEST_DATABASE } from "./pestDatabase";

export async function getChatbotResponse(message: string, language: string, formData?: FarmerFormData | null): Promise<string> {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY in .env file");
  }

  let contextInfo = "";
  if (formData) {
    contextInfo = `
    CURRENT FARMER CONTEXT:
    - Soil Type: ${formData.soilType}
    - pH Level: ${formData.phLevel}
    - Location: ${formData.district}, ${formData.location}
    - Existing Crop: ${formData.existingCrop || 'None'}
    - Preferred Crop: ${formData.preferredCrop || 'Not specified'}
    `;
  }

  // Add some market awareness (sample from top 3 crops)
  const sampleMarkets = EXTRACTED_MARKET_DATABASE.slice(0, 5).map(m => `${m.crop}: ₹${m.currentPrice} (${m.trend})`).join(", ");
  contextInfo += `\nLATEST MARKET TRENDS: ${sampleMarkets}`;

  const prompt = `You are a helpful and knowledgeable agricultural assistant. 
  A farmer has asked you a question. Please answer it accurately and concisely.
  The user is speaking in language code: ${language}.
  
  ${contextInfo}

  If the question is not related to farming, crops, weather, or agriculture, politely guide them back to agricultural topics.
  Directly address the farmer's specific conditions if relevant to their question.
  
  Question: "${message}"`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      if (response.status === 429) {
        return getLocalAgriculturalResponse(message, language, formData);
      }
      throw new Error(data.error?.message || response.statusText);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ? reply.trim() : "I'm sorry, I couldn't understand that. Please try again.";
  } catch (error) {
    return getLocalAgriculturalResponse(message, language, formData);
  }
}

function getLocalAgriculturalResponse(message: string, language: string, formData?: FarmerFormData | null): string {
  const query = message.toLowerCase();
  
  // 1. Specific Pest Check
  for (const [key, pest] of Object.entries(KAGGE_PEST_DATABASE)) {
    if (query.includes(key.toLowerCase())) {
      return `[OFFLINE ADVISORY] For ${pest.pestName}: ${pest.description} \nSymptoms: ${pest.symptoms.join(", ")} \nRecommended: ${pest.recommendedPesticides[0].name} (${pest.recommendedPesticides[0].dosage}).`;
    }
  }

  // Generic Pest Check
  if (query.includes("pest") || query.includes("insect") || query.includes("worm") || query.includes("bug")) {
    return "[OFFLINE ADVISORY] I detected you're asking about pests. While offline, I recommend checking our 'Pest Advisory Guide' on the sidebar for detailed symptoms and organic treatments for 9 common agricultural pests like Stem Borer and Aphids.";
  }

  // 2. Market Check
  if (query.includes("price") || query.includes("market") || query.includes("cost") || query.includes("sell") || query.includes("rate") || query.includes("quintal")) {
    const crops = EXTRACTED_MARKET_DATABASE.slice(0, 3).map(m => `${m.crop}: ₹${m.currentPrice} (${m.trend})`).join(", ");
    return `[OFFLINE MARKET] Latest local market rates: ${crops}. You can see the full list of 40 crops and trends on your Dashboard.`;
  }

  // 3. Farm Profile Check
  if (formData && (query.includes("my soil") || query.includes("my farm") || query.includes("what should i plant") || query.includes("recommend") || query.includes("advice"))) {
    return `[OFFLINE PROFILE] Using your offline profile (${formData.soilType} soil, pH ${formData.phLevel}), our Smart Engine recommends crops suitable for ${formData.district}. Check the 'Recommendations' section on your Dashboard for prioritized results!`;
  }

  // 4. Default Offline Message
  return "I am currently in Offline Mode due to AI quota limits. However, I can still provide info on 'pests', 'market prices', or advice based on 'my soil'. Try asking: 'What is the price of wheat?' or 'How to control stem borer?'";
}
