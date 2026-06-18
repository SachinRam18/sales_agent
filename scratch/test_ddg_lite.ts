async function testDdgLite() {
  const query = "fintech companies USA";
  
  // Test DDG Lite GET
  const getUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
  console.log(`\nTesting DDG Lite GET: ${getUrl}`);
  try {
    const res = await fetch(getUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"
      }
    });
    console.log("GET Status:", res.status);
    const html = await res.text();
    console.log("GET HTML length:", html.length);
    const resultCount = (html.match(/class="result-link"/g) || []).length;
    console.log("result-link count (GET):", resultCount);
  } catch (err: any) {
    console.error("GET failed:", err.message);
  }

  // Test DDG Lite POST
  console.log(`\nTesting DDG Lite POST to https://lite.duckduckgo.com/lite/`);
  try {
    const res = await fetch("https://lite.duckduckgo.com/lite/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"
      },
      body: `q=${encodeURIComponent(query)}`
    });
    console.log("POST Status:", res.status);
    const html = await res.text();
    console.log("POST HTML length:", html.length);
    const resultCount = (html.match(/class="result-link"/g) || []).length;
    console.log("result-link count (POST):", resultCount);
    if (resultCount > 0) {
      console.log("SUCCESS! DDG Lite POST works!");
    } else {
      console.log("Snippet of HTML:", html.substring(0, 1000));
    }
  } catch (err: any) {
    console.error("POST failed:", err.message);
  }
}

testDdgLite().then(() => process.exit(0));
