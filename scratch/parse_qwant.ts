async function parseQwant() {
  const query = "fintech companies USA";
  const url = `https://lite.qwant.com/?q=${encodeURIComponent(query)}&t=web`;
  console.log(`Querying: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://lite.qwant.com/",
        "Connection": "keep-alive"
      }
    });
    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML length:", html.length);
    console.log("Snippet of HTML:");
    console.log(html.substring(0, 2000));
  } catch (err: any) {
    console.error("Failed:", err.message);
  }
}

parseQwant().then(() => process.exit(0));
