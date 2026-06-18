import * as cheerio from "cheerio";
import { SearchProvider, SearchResult } from "./SearchProvider";

export class BingProvider implements SearchProvider {
  private static readonly EXCLUDED_DOMAINS = [
    "wikipedia.org", "linkedin.com", "facebook.com", "twitter.com", 
    "instagram.com", "youtube.com", "yelp.com", "yellowpages.com", 
    "tripadvisor.com", "amazon.com", "glassdoor.com", "indeed.com",
    "reddit.com", "pinterest.com", "medium.com", "dy77.com", "ezilon.com"
  ];

  private extractTargetUrl(rawUrl: string): string {
    try {
      const urlObj = new URL(rawUrl);
      const uParam = urlObj.searchParams.get("u");
      if (uParam) {
        // Bing 'u' parameter starts with 'a1' or 'a0' followed by base64-encoded URL.
        const base64Str = uParam.substring(2);
        const decoded = Buffer.from(base64Str, "base64").toString("utf-8");
        if (decoded.startsWith("http")) {
          return decoded;
        }
      }
    } catch (e) {
      // Fallback to rawUrl
    }
    return rawUrl;
  }

  async search(query: string): Promise<SearchResult[]> {
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    const results: SearchResult[] = [];
    const startTime = Date.now();

    try {
      console.log(`[BingProvider] Querying endpoint: ${searchUrl}`);
      
      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Referer": "https://www.bing.com/",
          "Connection": "keep-alive"
        }
      });

      const duration = Date.now() - startTime;
      console.log(`[BingProvider] Request succeeded. Status: ${response.status}. Duration: ${duration}ms`);
      
      const html = await response.text();
      const $ = cheerio.load(html);

      $("li.b_algo").each((_, element) => {
        const linkEl = $(element).find("h2 a");
        const titleText = linkEl.text().trim();
        const rawUrl = linkEl.attr("href");

        let snippetText = $(element).find(".b_caption p").text().trim() || 
                          $(element).find(".b_algoSlug").text().trim() ||
                          $(element).find("p").first().text().trim();

        if (titleText && rawUrl) {
          try {
            const decodedUrl = this.extractTargetUrl(rawUrl);
            const domainObj = new URL(decodedUrl);
            const domain = domainObj.hostname.toLowerCase();

            const isExcluded = BingProvider.EXCLUDED_DOMAINS.some(excluded => domain.includes(excluded));
            if (!isExcluded) {
              const cleanName = titleText
                .replace(/\b(GmbH|Co\.? KG|Inc\.?|Ltd\.?|LLC|Corporation|Glow|Official Site|Homepage)\b.*/gi, "$1")
                .split(" - ")[0]
                .split(" | ")[0]
                .trim();

              results.push({
                name: cleanName || titleText,
                website: `${domainObj.protocol}//${domainObj.hostname}`,
                source: "bing",
                snippet: snippetText || "No snippet available."
              });
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      });
    } catch (error: any) {
      console.error("[BingProvider] Search request failed:", error.message);
    }

    // De-duplicate results by domain website
    const uniqueMap = new Map<string, SearchResult>();
    results.forEach(r => uniqueMap.set(r.website, r));
    return Array.from(uniqueMap.values());
  }
}

export const bingProvider = new BingProvider();
