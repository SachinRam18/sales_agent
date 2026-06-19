import axios from "axios";
import { SearchProvider, SearchResult } from "./SearchProvider";

export function getSerperCountryCode(countryName: string): string {
  const clean = countryName.toLowerCase().trim();
  if (clean === "usa" || clean === "us" || clean === "united states" || clean === "united states of america" || clean === "america") {
    return "us";
  }
  if (clean === "uk" || clean === "united kingdom" || clean === "great britain" || clean === "england" || clean === "gb") {
    return "gb";
  }
  if (clean === "india" || clean === "in") {
    return "in";
  }
  if (clean === "germany" || clean === "de" || clean === "deutschland") {
    return "de";
  }
  if (clean === "canada" || clean === "ca") {
    return "ca";
  }
  if (clean === "australia" || clean === "au") {
    return "au";
  }
  // Fallback to the country name if it is 2 letters, otherwise default to "us"
  return clean.length === 2 ? clean : "us";
}

export class SerperProvider implements SearchProvider {
  private static readonly EXCLUDED_DOMAINS = [
    "wikipedia.org", "linkedin.com", "facebook.com", "twitter.com", 
    "instagram.com", "youtube.com", "yelp.com", "yellowpages.com", 
    "tripadvisor.com", "amazon.com", "glassdoor.com", "indeed.com",
    "reddit.com", "pinterest.com", "medium.com"
  ];

  async search(query: string): Promise<SearchResult[]> {
    // Note: SearchService will supply the country context, but if not set we fallback
    return this.searchWithCountry(query, "us");
  }

  async searchWithCountry(query: string, country: string): Promise<SearchResult[]> {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      console.warn("[SerperProvider] SERPER_API_KEY is not set in environment.");
      return [];
    }

    const gl = getSerperCountryCode(country);
    const results: SearchResult[] = [];
    const startTime = Date.now();

    try {
      console.log(`[SerperProvider] Querying Google Search via Serper for query: "${query}" (gl: ${gl})`);
      const response = await axios.post(
        "https://google.serper.dev/search",
        {
          q: query,
          gl: gl,
          hl: "en"
        },
        {
          headers: {
            "X-API-KEY": apiKey,
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );

      const duration = Date.now() - startTime;
      console.log(`[SerperProvider] Request succeeded. Duration: ${duration}ms`);

      const organic = response.data.organic || [];
      organic.forEach((item: any) => {
        const titleText = item.title || "";
        const rawUrl = item.link || "";
        const snippetText = item.snippet || "";

        if (titleText && rawUrl && rawUrl.startsWith("http")) {
          try {
            const domainObj = new URL(rawUrl);
            const domain = domainObj.hostname.toLowerCase();

            const isExcluded = SerperProvider.EXCLUDED_DOMAINS.some(excluded => domain.includes(excluded));
            if (!isExcluded) {
              const cleanName = titleText
                .replace(/\b(GmbH|Co\.? KG|Inc\.?|Ltd\.?|LLC|Corporation|Glow|Official Site|Homepage)\b.*/gi, "$1")
                .split(" - ")[0]
                .split(" | ")[0]
                .trim();

              results.push({
                name: cleanName || titleText,
                website: `${domainObj.protocol}//${domainObj.hostname}`,
                source: "serper",
                snippet: snippetText || "No snippet available."
              });
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      });
    } catch (error: any) {
      console.error("[SerperProvider] Google Search request failed:", error.response?.data || error.message);
    }

    // De-duplicate results by domain website
    const uniqueMap = new Map<string, SearchResult>();
    results.forEach(r => uniqueMap.set(r.website, r));
    return Array.from(uniqueMap.values());
  }
}

export const serperProvider = new SerperProvider();
