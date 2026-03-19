import fs from 'fs';

const apiKey = "AIzaSyA6HCEObpZbY2DTuMvOVh_eqZMzBV7pjvQ";

async function testModel(model: string) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello!" }] }]
      })
    });
    
    const data = await response.json();
    return `[${model}] Status: ${response.status} | Data: ${JSON.stringify(data).substring(0, 150)}`;
  } catch (e: any) {
    return `[${model}] Exception: ${e.message}`;
  }
}

async function main() {
  const r1 = await testModel("gemini-1.5-flash-latest");
  const r2 = await testModel("gemini-pro");
  const r3 = await testModel("gemini-1.0-pro");
  const output = r1 + "\n" + r2 + "\n" + r3;
  fs.writeFileSync("test_results.txt", output, "utf-8");
}

main();
