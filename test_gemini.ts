const apiKey = "AIzaSyA6HCEObpZbY2DTuMvOVh_eqZMzBV7pjvQ";

async function testModels() {
  const models = [
    "gemini-1.5-flash", 
    "gemini-1.5-flash-latest", 
    "gemini-1.5-pro", 
    "gemini-2.0-flash",
    "gemini-pro"
  ];
  
  for (const model of models) {
    try {
      console.log(`Testing ${model}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello!" }] }]
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        console.log(`✅ Success with ${model}`);
        break; // Stop testing models on first success
      } else {
        console.log(`❌ Failed with ${model}: ${data.error?.message || response.statusText}`);
      }
    } catch (e: any) {
      console.error("Error:", e.message);
    }
  }
}

testModels();
