import axios from "axios";
import * as cheerio from "cheerio";
import { SearchProvider, SearchResult } from "./SearchProvider";

export class GoogleProvider implements SearchProvider {
  private static readonly EXCLUDED_DOMAINS = [
    "wikipedia.org", "linkedin.com", "facebook.com", "twitter.com", 
    "instagram.com", "youtube.com", "yelp.com", "yellowpages.com", 
    "tripadvisor.com", "amazon.com", "glassdoor.com", "indeed.com",
    "reddit.com", "pinterest.com", "medium.com"
  ];

  async search(query: string): Promise<SearchResult[]> {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const results: SearchResult[] = [];
    const startTime = Date.now();

    try {
      console.log(`[GoogleProvider] Querying endpoint: ${searchUrl}`);
      const response = await axios.get(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://www.google.com/",
          "Connection": "keep-alive"
        },
        timeout: 8000
      });

      const duration = Date.now() - startTime;
      console.log(`[GoogleProvider] Request succeeded. Status: ${response.status}. Duration: ${duration}ms`);
      const { data } = response;

      const $ = cheerio.load(data);

      $("div.g").each((_, element) => {
        const linkEl = $(element).find("a");
        const titleEl = $(element).find("h3");
        const titleText = titleEl.text().trim();
        const rawUrl = linkEl.attr("href");
        const snippetText = $(element).find("div.VwiC3b").text().trim();

        if (titleText && rawUrl && rawUrl.startsWith("http")) {
          try {
            const domainObj = new URL(rawUrl);
            const domain = domainObj.hostname.toLowerCase();

            const isExcluded = GoogleProvider.EXCLUDED_DOMAINS.some(excluded => domain.includes(excluded));
            if (!isExcluded) {
              const cleanName = titleText
                .replace(/\b(GmbH|Co\.? KG|Inc\.?|Ltd\.?|LLC|Corporation|Glow|Official Site|Homepage)\b.*/gi, "$1")
                .split(" - ")[0]
                .split(" | ")[0]
                .trim();

              results.push({
                name: cleanName || titleText,
                website: `${domainObj.protocol}//${domainObj.hostname}`,
                source: "google",
                snippet: snippetText || "No snippet available."
              });
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      });
    } catch (error: any) {
      console.error("[GoogleProvider] Search request failed:", error.message);
    }

    // De-duplicate results by domain website
    const uniqueMap = new Map<string, SearchResult>();
    results.forEach(r => uniqueMap.set(r.website, r));
    return Array.from(uniqueMap.values());
  }
}

export const googleProvider = new GoogleProvider();
