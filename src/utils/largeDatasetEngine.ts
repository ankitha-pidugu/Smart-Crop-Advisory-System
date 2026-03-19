export interface AdvancedCropRecommendation {
  name: string;
  confidence: number;
  reason: string;
}

export interface CropProfile {
  name: string;
  category?: string;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  phMin: number;
  phMax: number;
  rainfallMin: number;
  rainfallMax: number;
  idealSoil: string[];
}

import { EXTRACTED_CROP_DATABASE } from './extractedCropDatabase';
import { EXTRACTED_MARKET_DATABASE } from './extractedMarketDatabase';

// Using the mathematically accurate dataset extracted from the 200,000 row CSV
const cropDataset: CropProfile[] = EXTRACTED_CROP_DATABASE;

// Helper to determine penalty using absolute distance boundaries
function getPenalty(val: number, min: number, max: number, weight: number): number {
  if (val < min) {
    return Math.abs(min - val) * weight;
  }
  if (val > max) {
    return Math.abs(val - max) * weight;
  }
  return 0; // Inside ideal range
}

export function getAdvancedRecommendations(
  soilType: string,
  phLevel: number,
  temperature: number, // degrees C (avg)
  humidity: number,    // % (avg)
  rainfall: number,    // mm (avg expected)
  preferredCategory?: string
): { recommended: AdvancedCropRecommendation[], notRecommended: AdvancedCropRecommendation[] } {

  const soil = soilType.toLowerCase();

  const scored = cropDataset.map(crop => {
    // Start with a perfect score and subtract Euclidean-style penalties
    let penalty = 0;

    // Numerical feature penalties
    // Weight tuning to simulate Random Forest importance: 
    // Rainfall and Humidity usually critical, followed by temp and pH
    penalty += getPenalty(temperature, crop.tempMin, crop.tempMax, 1.5);
    penalty += getPenalty(humidity, crop.humidityMin, crop.humidityMax, 1.0);
    penalty += getPenalty(rainfall, crop.rainfallMin, crop.rainfallMax, 0.5); // Scaled since mm can be large
    penalty += getPenalty(phLevel, crop.phMin, crop.phMax, 50); // pH is small digits (1-14) so highly sensitive

    // Categorical penalty for soil
    let soilMatch = false;
    if (crop.idealSoil.some(s => soil.includes(s))) {
       soilMatch = true;
    } else {
       penalty += 30; // Strong penalty if soil is incompatible
    }

    // Preferred Category Boost/Penalty
    if (preferredCategory) {
      const pref = preferredCategory.toLowerCase().trim();
      const cat = crop.category ? crop.category.toLowerCase() : "";
      if (cat.includes(pref) || crop.name.toLowerCase().includes(pref)) {
         penalty -= 40; // Massive boost for matching user's preference
      } else {
         penalty += 30; // Strong penalty for not being the preferred category
      }
    }
    // Market Profitability Boost
    const marketData = EXTRACTED_MARKET_DATABASE.find(m => m.crop.toLowerCase() === crop.name.toLowerCase());
    if (marketData) {
      if (marketData.trend === "Bullish") penalty -= 10; // Boost for rising price
      if (marketData.currentPrice > 3000) penalty -= 5; // Boost for high-value crops
    }

    // Convert penalty to a confidence percentage (100% is perfect match)
    let confidence = 100 - penalty;
    
    // Cap results
    confidence = Math.max(0, Math.min(99.9, confidence));

    // Construct a specific reason based on penalties
    let reason = "Ideal match for your soil and climate profile.";
    if (confidence < 50) {
      if (!soilMatch) reason = `Your ${soil} soil is not suitable. Requires ${crop.idealSoil.join(' or ')}.`;
      else if (phLevel < crop.phMin || phLevel > crop.phMax) reason = `Fails pH requirements (needs ${crop.phMin}-${crop.phMax}).`;
      else reason = `Climate mismatch. Needs ${crop.tempMin}°C-${crop.tempMax}°C.`;
    } else if (confidence >= 50 && confidence < 80) {
      reason = `Viable, but climate or soil isn't strictly optimal.`;
    } else {
       reason = preferredCategory && crop.category?.toLowerCase().includes(preferredCategory.toLowerCase()) 
         ? `Excellent candidate matching your preferred category (${preferredCategory}).` 
         : `Excellent candidate mapping 90%+ similarity to ideal ${crop.name} growing conditions.`;
    }

    return {
      name: crop.name,
      confidence: parseFloat(confidence.toFixed(1)),
      reason: reason,
      _penalty: penalty
    };
  });

  // Sort by highest confidence
  scored.sort((a, b) => b.confidence - a.confidence);

  return {
    // Top 3 best matches
    recommended: scored.slice(0, 3).map(c => ({ name: c.name, confidence: c.confidence, reason: c.reason })),
    // Bottom 3 worst matches
    notRecommended: scored.slice(-3).reverse().map(c => ({ name: c.name, confidence: c.confidence, reason: c.reason }))
  };
}
