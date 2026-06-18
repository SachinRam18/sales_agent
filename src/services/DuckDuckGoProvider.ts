import axios from "axios";
import * as cheerio from "cheerio";
import { SearchProvider, SearchResult } from "./SearchProvider";

export class DuckDuckGoProvider implements SearchProvider {
  private static readonly EXCLUDED_DOMAINS = [
    "wikipedia.org", "linkedin.com", "facebook.com", "twitter.com", 
    "instagram.com", "youtube.com", "yelp.com", "yellowpages.com", 
    "tripadvisor.com", "amazon.com", "glassdoor.com", "indeed.com",
    "reddit.com", "pinterest.com", "medium.com"
  ];

  async search(query: string): Promise<SearchResult[]> {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const results: SearchResult[] = [];
    const startTime = Date.now();

    try {
      console.log(`[DuckDuckGoProvider] Querying endpoint: ${searchUrl}`);
      const response = await axios.get(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Referer": "https://html.duckduckgo.com/",
          "Connection": "keep-alive"
        },
        timeout: 8000
      });

      const duration = Date.now() - startTime;
      console.log(`[DuckDuckGoProvider] Request succeeded. Status: ${response.status}. Duration: ${duration}ms`);
      const { data } = response;

      const $ = cheerio.load(data);

      $(".result__body").each((_, element) => {
        const titleEl = $(element).find(".result__a");
        const titleText = titleEl.text().trim();
        const rawUrl = titleEl.attr("href");
        const snippetText = $(element).find(".result__snippet").text().trim();

        if (titleText && rawUrl) {
          try {
            const urlObj = new URL(rawUrl);
            let targetUrl = urlObj.searchParams.get("uddg") || rawUrl;
            
            const domainObj = new URL(targetUrl);
            const domain = domainObj.hostname.toLowerCase();

            const isExcluded = DuckDuckGoProvider.EXCLUDED_DOMAINS.some(excluded => domain.includes(excluded));
            if (!isExcluded) {
              const cleanName = titleText
                .replace(/\b(GmbH|Co\.? KG|Inc\.?|Ltd\.?|LLC|Corporation|Glow|Official Site|Homepage)\b.*/gi, "$1")
                .split(" - ")[0]
                .split(" | ")[0]
                .trim();

              results.push({
                name: cleanName || titleText,
                website: `${domainObj.protocol}//${domainObj.hostname}`,
                source: "duckduckgo",
                snippet: snippetText || "No snippet available."
              });
            }
          } catch (e) {
            // Ignore malformed URLs or parser errors
          }
        }
      });
    } catch (error: any) {
      console.error("[DuckDuckGoProvider] Request failed:", error.message);
    }

    // De-duplicate results by domain homepage URL
    const uniqueMap = new Map<string, SearchResult>();
    results.forEach(r => uniqueMap.set(r.website, r));
    return Array.from(uniqueMap.values());
  }
}
export const duckDuckGoProvider = new DuckDuckGoProvider();
