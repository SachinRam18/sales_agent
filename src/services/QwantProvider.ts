import axios from "axios";
import * as cheerio from "cheerio";
import { SearchProvider, SearchResult } from "./SearchProvider";

export class QwantProvider implements SearchProvider {
  private static readonly EXCLUDED_DOMAINS = [
    "wikipedia.org", "linkedin.com", "facebook.com", "twitter.com", 
    "instagram.com", "youtube.com", "yelp.com", "yellowpages.com", 
    "tripadvisor.com", "amazon.com", "glassdoor.com", "indeed.com",
    "reddit.com", "pinterest.com", "medium.com"
  ];

  async search(query: string): Promise<SearchResult[]> {
    const searchUrl = `https://lite.qwant.com/?q=${encodeURIComponent(query)}&t=web`;
    const results: SearchResult[] = [];
    const startTime = Date.now();

    try {
      console.log(`[QwantProvider] Querying endpoint: ${searchUrl}`);
      const response = await axios.get(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://lite.qwant.com/",
          "Connection": "keep-alive"
        },
        timeout: 8000
      });

      const duration = Date.now() - startTime;
      console.log(`[QwantProvider] Request succeeded. Status: ${response.status}. Duration: ${duration}ms`);
      const { data } = response;

      const $ = cheerio.load(data);

      // In Qwant Lite, results typically exist in div.result or list items
      // We can also find any anchor element with href starting with http (not qwant)
      $("div.result, li.result, .result").each((_, element) => {
        const linkEl = $(element).find("a");
        const titleText = linkEl.text().trim();
        const rawUrl = linkEl.attr("href");
        const snippetText = $(element).find("p.desc, p.snippet, .description").text().trim();

        if (titleText && rawUrl && rawUrl.startsWith("http") && !rawUrl.includes("qwant.com")) {
          try {
            const domainObj = new URL(rawUrl);
            const domain = domainObj.hostname.toLowerCase();

            const isExcluded = QwantProvider.EXCLUDED_DOMAINS.some(excluded => domain.includes(excluded));
            if (!isExcluded) {
              const cleanName = titleText
                .replace(/\b(GmbH|Co\.? KG|Inc\.?|Ltd\.?|LLC|Corporation|Glow|Official Site|Homepage)\b.*/gi, "$1")
                .split(" - ")[0]
                .split(" | ")[0]
                .trim();

              results.push({
                name: cleanName || titleText,
                website: `${domainObj.protocol}//${domainObj.hostname}`,
                source: "qwant",
                snippet: snippetText || "No snippet available."
              });
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      });

      // Fallback: search all links if no result divs matched
      if (results.length === 0) {
        $("a").each((_, el) => {
          const href = $(el).attr("href") || "";
          const text = $(el).text().trim();
          if (href.startsWith("http") && !href.includes("qwant.com") && text.length > 2) {
            try {
              const domainObj = new URL(href);
              const domain = domainObj.hostname.toLowerCase();

              const isExcluded = QwantProvider.EXCLUDED_DOMAINS.some(excluded => domain.includes(excluded));
              if (!isExcluded) {
                const cleanName = text
                  .replace(/\b(GmbH|Co\.? KG|Inc\.?|Ltd\.?|LLC|Corporation|Glow|Official Site|Homepage)\b.*/gi, "$1")
                  .split(" - ")[0]
                  .split(" | ")[0]
                  .trim();

                // Check siblings for description
                const parent = $(el).parent();
                const siblingText = parent.siblings().text().trim() || parent.text().trim();

                results.push({
                  name: cleanName || text,
                  website: `${domainObj.protocol}//${domainObj.hostname}`,
                  source: "qwant",
                  snippet: siblingText.substring(0, 200) || "No snippet available."
                });
              }
            } catch (e) {
              // Ignore
            }
          }
        });
      }
    } catch (error: any) {
      console.error("[QwantProvider] Search request failed:", error.message);
    }

    // De-duplicate results by domain website
    const uniqueMap = new Map<string, SearchResult>();
    results.forEach(r => uniqueMap.set(r.website, r));
    return Array.from(uniqueMap.values());
  }
}

export const qwantProvider = new QwantProvider();
