import { bingProvider } from "../src/services/BingProvider";

async function testBingProvider() {
  console.log("Calling bingProvider.search...");
  try {
    const results = await bingProvider.search("fintech companies USA");
    console.log(`Successfully parsed ${results.length} results from BingProvider:`);
    results.forEach((r, i) => {
      console.log(`[Result ${i + 1}] Name: "${r.name}" | Website: "${r.website}" | Source: "${r.source}"`);
    });
  } catch (err: any) {
    console.error("Failed:", err.message);
  }
}

testBingProvider().then(() => process.exit(0));
