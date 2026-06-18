import axios from "axios";
import * as cheerio from "cheerio";

async function inspectQwantLiteClasses() {
  console.log("=== Qwant Lite Parsing Selector Inspection ===");
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
    
    const $ = cheerio.load(res.data);
    
    // Find all links and their parents to see where results reside
    console.log("Analyzing elements...");
    
    // Check common container classes
    console.log("\nSearching for links with href containing HTTP:");
    let count = 0;
    $("a").each((i, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();
      if (href.startsWith("http") && !href.includes("qwant.com")) {
        count++;
        if (count <= 10) {
          console.log(`Link ${count}:`);
          console.log(`- Text: "${text}"`);
          console.log(`- Href: "${href}"`);
          
          // Let's print the parent and grandparent tag names and classes
          const parent = $(el).parent();
          console.log(`- Parent: tag=${parent.prop("tagName")}, class="${parent.attr("class") || ""}"`);
          const grand = parent.parent();
          console.log(`- Grandparent: tag=${grand.prop("tagName")}, class="${grand.attr("class") || ""}"`);
          
          // Check if there is a description/snippet sibling
          const siblings = $(el).siblings().map((_, sib) => $(sib).text().trim()).get();
          console.log(`- Sibling Texts:`, JSON.stringify(siblings));
        }
      }
    });
    
    console.log(`Total non-Qwant external links found: ${count}`);
  } catch (e: any) {
    console.error(`Error: ${e.message}`);
  }
}

inspectQwantLiteClasses();
