async function testSearches() {
  const query = "fintech companies USA";
  
  // Test Google
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  console.log(`\n--- Google Search test: ${googleUrl} ---`);
  try {
    const res = await fetch(googleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/",
        "Connection": "keep-alive"
      }
    });
    console.log("Google Status:", res.status);
    const html = await res.text();
    console.log("Google HTML length:", html.length);
    // Find all links containing href starting with /url?q= or http
    const linkMatches = html.match(/href="([^"]+)"/g) || [];
    console.log(`Found ${linkMatches.length} links in Google response.`);
    console.log("First 15 links:", linkMatches.slice(0, 15));
  } catch (err: any) {
    console.error("Google failed:", err.message);
  }

  // Test Qwant
  const qwantUrl = `https://lite.qwant.com/?q=${encodeURIComponent(query)}&t=web`;
  console.log(`\n--- Qwant Search test: ${qwantUrl} ---`);
  try {
    const res = await fetch(qwantUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://lite.qwant.com/",
        "Connection": "keep-alive"
      }
    });
    console.log("Qwant Status:", res.status);
    const html = await res.text();
    console.log("Qwant HTML length:", html.length);
    const linkMatches = html.match(/href="([^"]+)"/g) || [];
    console.log(`Found ${linkMatches.length} links in Qwant response.`);
    console.log("First 15 links:", linkMatches.slice(0, 15));
  } catch (err: any) {
    console.error("Qwant failed:", err.message);
  }
}

testSearches().then(() => process.exit(0));
