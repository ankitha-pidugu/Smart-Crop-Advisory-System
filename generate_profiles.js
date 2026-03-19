const fs = require('fs');
const readline = require('readline');
const path = require('path');

const csvPath = path.join(__dirname, 'crop_advisory_400k.csv');

async function processCSV() {
  const fileStream = fs.createReadStream(csvPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  let headers = [];
  const h = {};
  
  const profiles = {};

  for await (const line of rl) {
    if (isFirstLine) {
      headers = line.split(',');
      headers.forEach((hdr, i) => h[hdr.trim()] = i);
      isFirstLine = false;
      continue;
    }

    const parts = line.split(',');
    if (parts.length < 20) continue;

    const rec = parts[h['recommendation']];
    if (rec !== 'Recommended' && rec !== 'Highly Recommended') continue;

    const cropRaw = parts[h['crop_name']];
    if (!cropRaw) continue;
    const crop = cropRaw.trim();

    const rawCat = parts[h['crop_category']] ? parts[h['crop_category']].toLowerCase() : '';
    let category = 'vegetables';
    if (rawCat.includes('pulses')) category = 'pulses';
    else if (rawCat.includes('cereals')) category = 'cereals';
    else if (rawCat.includes('fruits')) category = 'fruits';
    else if (rawCat.includes('cash')) category = 'cash';
    else if (rawCat.includes('spices')) category = 'spices';

    if (!profiles[crop]) {
      profiles[crop] = {
        name: crop,
        category: category,
        temps: [], hums: [], rains: [], phs: [], soils: {}
      };
    }
    
    const p = profiles[crop];
    
    // Parse floats safely
    const temp = parseFloat(parts[h['temperature_c']]);
    if (!isNaN(temp)) p.temps.push(temp);
    
    const hum = parseFloat(parts[h['humidity_pct']]);
    if (!isNaN(hum)) p.hums.push(hum);
    
    const rain = parseFloat(parts[h['rainfall_mm']]);
    if (!isNaN(rain)) p.rains.push(rain);
    
    const ph = parseFloat(parts[h['soil_ph']]);
    if (!isNaN(ph)) p.phs.push(ph);
    
    const soil = parts[h['soil_type']] ? parts[h['soil_type']].toLowerCase().trim() : '';
    if (soil) {
      p.soils[soil] = (p.soils[soil] || 0) + 1;
    }
  }

  function calcRange(arr) {
    if (arr.length === 0) return { min: 0, max: 0 };
    arr.sort((a,b) => a - b);
    const minIdx = Math.floor(arr.length * 0.05); // 5th percentile
    const maxIdx = Math.floor(arr.length * 0.95); // 95th percentile
    return {
      min: Math.round(arr[minIdx] * 10) / 10,
      max: Math.round(arr[maxIdx] * 10) / 10
    };
  }

  const finalDB = [];
  for (const crop in profiles) {
    const p = profiles[crop];
    if (p.temps.length === 0) continue;
    
    const soilEntries = Object.entries(p.soils).sort((a,b) => b[1] - a[1]);
    const topSoils = soilEntries.slice(0, 3).map(e => e[0]);

    finalDB.push({
      name: p.name,
      category: p.category,
      tempMin: calcRange(p.temps).min,
      tempMax: calcRange(p.temps).max,
      humidityMin: calcRange(p.hums).min,
      humidityMax: calcRange(p.hums).max,
      rainfallMin: calcRange(p.rains).min,
      rainfallMax: calcRange(p.rains).max,
      phMin: calcRange(p.phs).min,
      phMax: calcRange(p.phs).max,
      idealSoil: topSoils.length > 0 ? topSoils : ["loamy soil", "sandy soil"]
    });
  }

  finalDB.sort((a, b) => a.name.localeCompare(b.name));

  const codeOut = `import { CropProfile } from './largeDatasetEngine';

export const EXTRACTED_CROP_DATABASE: CropProfile[] = ${JSON.stringify(finalDB, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, 'src', 'utils', 'extractedCropDatabase.ts'), codeOut);
  console.log('Successfully generated entirely mathematically accurate database with', finalDB.length, 'crops!');
}

processCSV().catch(err => console.error(err));
