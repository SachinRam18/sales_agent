import axios from "axios";
import * as cheerio from "cheerio";

async function testGoogleScrape() {
  console.log("=== Google Search HTML Scraping Test ===");
  const query = "crm software India";
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  try {
    const startTime = Date.now();
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 10000
    });
    
    console.log(`Status: ${res.status}, Time: ${Date.now() - startTime}ms`);
    const $ = cheerio.load(res.data);
    
    // Google results typically reside in div.g or div.MjjYbeb
    let resultsCount = 0;
    $("div.g").each((_, element) => {
      const linkEl = $(element).find("a");
      const titleText = $(element).find("h3").text().trim();
      const rawUrl = linkEl.attr("href");
      
      // Snippet is usually in div.VwiC3b
      const snippetEl = $(element).find("div.VwiC3b");
      const snippetText = snippetEl.text().trim();

      if (titleText && rawUrl && rawUrl.startsWith("http")) {
        resultsCount++;
        if (resultsCount <= 5) {
          console.log(`Result ${resultsCount}:`);
          console.log(`- Title: "${titleText}"`);
          console.log(`- Url: "${rawUrl}"`);
          console.log(`- Snippet: "${snippetText.substring(0, 100)}..."`);
        }
      }
    });

    console.log(`Total Google results extracted: ${resultsCount}`);
  } catch (e: any) {
    console.error(`Google Search request failed: ${e.message}`);
    if (e.response) {
      console.error(`Status: ${e.response.status}`);
    }
  }
}

testGoogleScrape();
