import axios from "axios";
import * as fs from "fs";

async function saveQwantHtml() {
  const query = "crm software India";
  const url = `https://lite.qwant.com/?q=${encodeURIComponent(query)}&t=web`;
  
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 10000
    });
    fs.writeFileSync("qwant_response.html", res.data);
    console.log("Saved qwant_response.html successfully");
  } catch (e: any) {
    console.error("Error", e.message);
  }
}

saveQwantHtml();
