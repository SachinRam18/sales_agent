async function testBing() {
  const query = "fintech companies USA";
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  console.log(`Querying Bing: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    });
    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML length:", html.length);
    // Find all links containing href
    const linkMatches = html.match(/href="([^"]+)"/g) || [];
    console.log(`Found ${linkMatches.length} links in Bing response.`);
    // Look for typical Bing search result container classes, like li.b_algo
    const algoMatches = html.match(/class="b_algo"/g) || [];
    console.log("Found class='b_algo' elements:", algoMatches.length);
    if (algoMatches.length > 0) {
      console.log("SUCCESS! Bing is active and returning results!");
    } else {
      console.log("Snippet of HTML:", html.substring(0, 1000));
    }
  } catch (err: any) {
    console.error("Bing failed:", err.message);
  }
}

testBing().then(() => process.exit(0));
