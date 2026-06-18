async function testQwantApi() {
  const query = "fintech companies USA";
  const url = `https://api.qwant.com/v3/search/web?q=${encodeURIComponent(query)}&count=10&locale=en_US`;
  console.log(`Querying: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("Status:", res.status);
    const json = await res.json() as any;
    console.log("JSON Keys:", Object.keys(json));
    if (json.data && json.data.result && json.data.result.items) {
      console.log(`Found ${json.data.result.items.length} results!`);
      console.log("First result title:", json.data.result.items[0].title);
      console.log("First result URL:", json.data.result.items[0].url);
    } else {
      console.log("No result items found in JSON:", JSON.stringify(json).substring(0, 1000));
    }
  } catch (err: any) {
    console.error("Qwant API failed:", err.message);
  }
}

testQwantApi().then(() => process.exit(0));
