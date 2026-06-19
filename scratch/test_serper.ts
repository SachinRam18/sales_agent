import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

import { serperProvider } from "../src/services/SerperProvider";

async function runTest() {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.error("❌ SERPER_API_KEY is not defined in .env! Please add it first.");
    process.exit(1);
  }

  console.log("Starting Serper.dev Integration Test...");
  console.log(`API Key found: ${apiKey.substring(0, 6)}...`);

  const results = await serperProvider.searchWithCountry("crm software companies", "us");
  
  console.log(`\nTest results returned: ${results.length} companies.`);
  results.slice(0, 5).forEach((r, idx) => {
    console.log(`\n[Lead #${idx + 1}]`);
    console.log(`Name: ${r.name}`);
    console.log(`Website: ${r.website}`);
    console.log(`Snippet: ${r.snippet.substring(0, 80)}...`);
  });

  if (results.length > 0) {
    console.log("\n✅ Integration Test Passed Successfully!");
  } else {
    console.warn("\n⚠️ Integration Test completed, but returned 0 results. Check API key status/credits.");
  }
}

runTest().catch(console.error);
