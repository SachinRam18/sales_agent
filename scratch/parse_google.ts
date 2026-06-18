const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
  "curl/7.81.0",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "" // no user agent
];

async function testGoogleUas() {
  const query = "fintech companies USA";
  for (const ua of userAgents) {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    console.log(`\nTesting Google with UA: "${ua}"`);
    try {
      const headers: Record<string, string> = {};
      if (ua) {
        headers["User-Agent"] = ua;
      }
      const res = await fetch(url, { headers });
      console.log("Status:", res.status);
      const html = await res.text();
      console.log("HTML length:", html.length);
      const hasNoscriptRedirect = html.includes("retry/enablejs");
      console.log("Has enablejs/noscript redirect:", hasNoscriptRedirect);
      // Let's count links containing '/url?q='
      const urlQMatches = html.match(/\/url\?q=/g) || [];
      console.log("Found /url?q= links count:", urlQMatches.length);
      if (urlQMatches.length > 0) {
        console.log("SUCCESS! This User-Agent returned search results!");
      }
    } catch (err: any) {
      console.error("Failed:", err.message);
    }
  }
}

testGoogleUas().then(() => process.exit(0));
