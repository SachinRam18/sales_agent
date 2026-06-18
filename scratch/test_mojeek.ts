async function testMojeek() {
  const query = "fintech companies USA";
  const url = `https://www.mojeek.com/search?q=${encodeURIComponent(query)}`;
  console.log(`Querying: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.google.com/"
      }
    });
    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML Length:", html.length);
    if (html.includes("results")) {
      console.log("Results found in html!");
      const count = (html.match(/class="title"/g) || []).length;
      console.log("Number of class='title' links:", count);
    } else {
      console.log("Snippet of HTML:", html.substring(0, 1000));
    }
  } catch (err: any) {
    console.error("Mojeek failed:", err.message);
  }
}

testMojeek().then(() => process.exit(0));
