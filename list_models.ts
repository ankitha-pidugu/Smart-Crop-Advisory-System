import fs from 'fs';

const apiKey = "AIzaSyA6HCEObpZbY2DTuMvOVh_eqZMzBV7pjvQ";

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    fs.writeFileSync("models_list.txt", JSON.stringify(data, null, 2), "utf-8");
  } catch (e: any) {
    fs.writeFileSync("models_list.txt", "Error: " + e.message, "utf-8");
  }
}

listModels();
