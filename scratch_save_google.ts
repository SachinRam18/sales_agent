import axios from "axios";
import * as fs from "fs";

async function saveGoogleHtml() {
  const query = "crm software India";
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 10000
    });
    fs.writeFileSync("google_response.html", res.data);
    console.log("Saved google_response.html successfully");
  } catch (e: any) {
    console.error("Error", e.message);
  }
}

saveGoogleHtml();
