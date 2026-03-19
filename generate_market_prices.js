const fs = require('fs');
const readline = require('readline');
const path = require('path');

const csvPath = path.join(__dirname, 'market_prices_per_quintal.csv');

async function processMarketCSV() {
  const fileStream = fs.createReadStream(csvPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  const h = {};
  const latestPrices = {};

  for await (const line of rl) {
    if (isFirstLine) {
      const headers = line.split(',');
      headers.forEach((hdr, i) => h[hdr.trim()] = i);
      isFirstLine = false;
      continue;
    }

    const parts = line.split(',');
    if (parts.length < 10) continue;

    const crop = parts[h['crop']].trim();
    const date = parts[h['date']].trim();
    const currentPrice = parseFloat(parts[h['current_price_inr']]);
    const change = parts[h['change_24h_inr']].trim();
    const pct = parts[h['change_24h_pct']].trim();
    const trend = parts[h['trend']].trim();
    const trendSymbol = parts[h['trend_symbol']].trim();
    const market = parts[h['market']].trim().replace(/^"|"$/g, '');

    // Simple string comparison for dates (YYYY-MM-DD works well)
    if (!latestPrices[crop] || date >= latestPrices[crop].date) {
      latestPrices[crop] = {
        crop,
        date,
        currentPrice,
        change,
        pct,
        trend,
        trendSymbol,
        market
      };
    }
  }

  const finalMarketDB = Object.values(latestPrices).sort((a, b) => a.crop.localeCompare(b.crop));

  const codeOut = `export interface MarketPriceEntry {
  crop: string;
  date: string;
  currentPrice: number;
  change: string;
  pct: string;
  trend: string;
  trendSymbol: string;
  market: string;
}

export const EXTRACTED_MARKET_DATABASE: MarketPriceEntry[] = ${JSON.stringify(finalMarketDB, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, 'src', 'utils', 'extractedMarketDatabase.ts'), codeOut);
  console.log('Successfully generated market price database with', finalMarketDB.length, 'crops!');
}

processMarketCSV().catch(err => console.error(err));
