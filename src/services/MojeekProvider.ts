import axios from "axios";
import * as cheerio from "cheerio";
import { SearchProvider, SearchResult } from "./SearchProvider";

export class MojeekProvider implements SearchProvider {
  private static readonly EXCLUDED_DOMAINS = [
    "wikipedia.org", "linkedin.com", "facebook.com", "twitter.com", 
    "instagram.com", "youtube.com", "yelp.com", "yellowpages.com", 
    "tripadvisor.com", "amazon.com", "glassdoor.com", "indeed.com",
    "reddit.com", "pinterest.com", "medium.com", "dy77.com", "ezilon.com"
  ];

  async search(query: string): Promise<SearchResult[]> {
    const searchUrl = `https://www.mojeek.com/search?q=${encodeURIComponent(query)}`;
    const results: SearchResult[] = [];
    const startTime = Date.now();

    try {
      console.log(`[MojeekProvider] Querying endpoint: ${searchUrl}`);
      const response = await axios.get(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Referer": "https://www.mojeek.com/",
          "Connection": "keep-alive"
        },
        timeout: 8000
      });

      const duration = Date.now() - startTime;
      console.log(`[MojeekProvider] Request succeeded. Status: ${response.status}. Duration: ${duration}ms`);
      const { data } = response;

      const $ = cheerio.load(data);

      $(".results li").each((_, element) => {
        const linkEl = $(element).find("a.title");
        const titleText = linkEl.text().trim();
        const rawUrl = linkEl.attr("href");
        const snippetText = $(element).find("p.s").text().trim();

        if (titleText && rawUrl) {
          try {
            const domainObj = new URL(rawUrl);
            const domain = domainObj.hostname.toLowerCase();

            const isExcluded = MojeekProvider.EXCLUDED_DOMAINS.some(excluded => domain.includes(excluded));
            if (!isExcluded) {
              const cleanName = titleText
                .replace(/\b(GmbH|Co\.? KG|Inc\.?|Ltd\.?|LLC|Corporation|Glow|Official Site|Homepage)\b.*/gi, "$1")
                .split(" - ")[0]
                .split(" | ")[0]
                .trim();

              results.push({
                name: cleanName || titleText,
                website: `${domainObj.protocol}//${domainObj.hostname}`,
                source: "mojeek",
                snippet: snippetText || "No snippet available."
              });
            }
          } catch (e) {
            // Ignore parse errors for individual links
          }
        }
      });
    } catch (error: any) {
      console.error("[MojeekProvider] Search request failed:", error.message);
    }

    // De-duplicate results by domain website
    const uniqueMap = new Map<string, SearchResult>();
    results.forEach(r => uniqueMap.set(r.website, r));
    return Array.from(uniqueMap.values());
  }
}

export const mojeekProvider = new MojeekProvider();
