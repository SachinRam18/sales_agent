import { searchService } from "../services/SearchService";
import { companyProfiler } from "../services/CompanyProfiler";
import { websiteEnrichmentService } from "../services/WebsiteEnrichmentService";

export interface DiscoveredCompany {
  name: string;
  industry: string;
  website: string;
  location: string;
  revenue: string;
  employees: number | null;
  companySize?: string;
  employeeConfidence?: "HIGH" | "MEDIUM" | "LOW";
  employeeEvidence?: string;
  employeeSource?: "EMPLOYEE_EVIDENCE" | "CUSTOMER_HEURISTIC" | "SIZE_HEURISTIC" | "UNKNOWN";
  description: string;
  technologies: string;
  technologyRelevance?: number;
  primaryIndustry?: string;
  industryConfidence?: number;
  servedIndustries?: string[];
  source?: string;
  snippet?: string;
  companyType?: string;
  companyTypeConfidence?: number;
  businessSignals?: string[];
  matchedQuery?: string;
  contacts: Array<{
    name: string;
    role: string;
    linkedin?: string;
    email: string;
    phone: string;
  }>;
  discoverySources?: string[];
  discoveryConfidence?: number;
  discoveryConfidenceLevel?: "Low" | "Medium" | "High";
  discoverySourceCount?: number;
  sourceUrls?: string[];
}

function parseCompanySizeRange(sizeStr: string): { min: number; max: number } {
  const clean = sizeStr.replace(/\s+/g, "").trim();
  if (clean.endsWith("+")) {
    const min = parseInt(clean.slice(0, -1));
    return { min: isNaN(min) ? 0 : min, max: Infinity };
  }
  const parts = clean.split("-");
  if (parts.length === 2) {
    const min = parseInt(parts[0]);
    const max = parseInt(parts[1]);
    return {
      min: isNaN(min) ? 0 : min,
      max: isNaN(max) ? Infinity : max
    };
  }
  const singleVal = parseInt(clean);
  if (!isNaN(singleVal)) {
    return { min: singleVal, max: singleVal };
  }
  return { min: 0, max: Infinity };
}

export class LeadDiscoveryAgent {
  async discover(params: {
    industry: string;
    country: string;
    companySize: string;
    revenueRange: string;
    keywords?: string;
    addLog: (message: string) => void;
  }): Promise<DiscoveredCompany[]> {
    const { industry, country, companySize, revenueRange, keywords, addLog } = params;

    addLog(`Analyzing request: Find ${industry} companies in ${country} with size ${companySize}.`);
    addLog("Formulating search queries & running local search discovery agent...");

    try {
      const searchResults = await searchService.discover({
        industry,
        country,
        keywords
      });

      addLog(`Discovered ${searchResults.length} potential corporate targets via SearchService.`);
      addLog("Profiling and validating candidate websites...");

      // Implement concurrency-controlled batching (batch size of 4) to profile candidate websites
      const profiles: Array<{ res: typeof searchResults[0]; profile: any }> = [];
      const batchSize = 4;
      for (let i = 0; i < searchResults.length; i += batchSize) {
        const batch = searchResults.slice(i, i + batchSize);
        const batchProfiles = await Promise.all(
          batch.map(async (res) => {
            const profile = await companyProfiler.profile(res.website, industry, country);
            return { res, profile };
          })
        );
        profiles.push(...batchProfiles);
      }

      // Filter out rejected profiles for all industry queries (strict validation gate)
      const validatedProfiles = profiles.filter(({ profile }) => {
        return profile.validationStatus === "VALIDATED";
      });

      addLog(`Retained ${validatedProfiles.length} validated target companies.`);

      addLog("Enriching validated candidates...");
      const results: DiscoveredCompany[] = [];
      for (let i = 0; i < validatedProfiles.length; i++) {
        const { res, profile } = validatedProfiles[i];
        addLog(`Enriching candidate: "${profile.companyName}" (${res.website})`);
        const enriched = await websiteEnrichmentService.enrich(res.website, profile);

        // 1. Company Size Validation Gate
        const reqRange = parseCompanySizeRange(companySize);
        const empCount = enriched.employeeEstimate;
        const detSize = enriched.companySize;

        let sizeMatches = false;
        if (empCount !== null && empCount !== undefined) {
          sizeMatches = (empCount >= reqRange.min && empCount <= reqRange.max);
        } else if (detSize) {
          const detRange = parseCompanySizeRange(detSize);
          sizeMatches = (detRange.max >= reqRange.min && detRange.min <= reqRange.max);
        } else {
          sizeMatches = true; // Default to true if no size information
        }

        const sizeDecision = sizeMatches ? "ACCEPTED" : "REJECTED";
        addLog(`[Size Validation] Requested size: ${companySize}, Detected size: ${detSize} (employees: ${empCount !== null ? empCount : "null"}). Decision: ${sizeDecision}`);

        if (!sizeMatches) {
          addLog(`Size mismatch detected for "${profile.companyName}" (Requested: ${companySize}, Detected: ${detSize || "unknown"}). Retaining candidate under soft-filtering.`);
        }

        // 2. Country / Location Validation Gate
        const reqCountry = country.toLowerCase().trim();
        const detectedCountry = (enriched.location || res.location || "").toLowerCase().trim();

        let countryMatches = false;
        if (detectedCountry && reqCountry) {
          countryMatches = (detectedCountry.includes(reqCountry) || reqCountry.includes(detectedCountry));
        } else {
          countryMatches = true; // Default accept if no location info
        }

        const locationDecision = countryMatches ? "ACCEPTED" : "REJECTED";
        addLog(`[Location Validation] Requested country: ${country}, Detected country: ${detectedCountry || "unknown"}. Decision: ${locationDecision}`);

        if (!countryMatches) {
          addLog(`Skipping candidate "${profile.companyName}" due to country mismatch (Requested: ${country}, Detected: ${detectedCountry || "unknown"}).`);
          continue;
        }
        
        // Calculate Discovery Confidence Score
        const sourcesList = res.sources || [res.source || "Unknown"];
        const sourceCount = sourcesList.length;
        
        let baseConfidence = 0;
        if (sourceCount === 1) {
          baseConfidence = 30;
        } else if (sourceCount === 2) {
          baseConfidence = 60;
        } else if (sourceCount >= 3) {
          baseConfidence = 85;
        }

        let modifiers = 0;
        if (profile.validationStatus === "VALIDATED") {
          modifiers += 15; // Official website verified
        }

        const hasLinkedIn = sourcesList.includes("LinkedIn") || !!(enriched as any).hasLinkedInPage;
        if (hasLinkedIn) {
          modifiers += 10; // LinkedIn company page found
        }

        const directoriesList = ["G2", "Capterra", "Clutch", "GoodFirms", "Crunchbase", "Kompass", "Europages", "DirectIndustry", "MedicalExpo", "FreightWaves"];
        const hasDirectory = sourcesList.some(s => directoriesList.includes(s));
        if (hasDirectory) {
          modifiers += 10; // Industry directory validation
        }

        const discoveryConfidence = Math.min(100, baseConfidence + modifiers);

        let discoveryConfidenceLevel: "Low" | "Medium" | "High" = "Low";
        if (discoveryConfidence >= 80) {
          discoveryConfidenceLevel = "High";
        } else if (discoveryConfidence >= 50) {
          discoveryConfidenceLevel = "Medium";
        }

        results.push({
          name: enriched.companyName,
          industry,
          website: res.website,
          location: enriched.location || res.location || country,
          revenue: revenueRange,
          employees: enriched.employeeEstimate,
          companySize: enriched.companySize,
          employeeConfidence: enriched.employeeConfidence,
          employeeEvidence: enriched.employeeEvidence,
          employeeSource: enriched.employeeSource,
          description: enriched.description,
          technologies: enriched.technologies.join(", "),
          technologyRelevance: enriched.technologyRelevance,
          primaryIndustry: profile.primaryIndustry,
          industryConfidence: profile.industryConfidence,
          servedIndustries: profile.servedIndustries,
          source: res.source,
          snippet: res.snippet,
          companyType: enriched.companyType,
          companyTypeConfidence: enriched.confidence,
          businessSignals: enriched.technologies,
          matchedQuery: res.matchedQuery,
          contacts: enriched.contacts,
          discoverySources: sourcesList,
          discoveryConfidence,
          discoveryConfidenceLevel,
          discoverySourceCount: sourceCount,
          sourceUrls: res.sourceUrls || [res.website]
        });
      }

      return results;
    } catch (e: any) {
      addLog(`Local search discovery failed: ${e.message}`);
      return [];
    }
  }
}

export const leadDiscoveryAgent = new LeadDiscoveryAgent();
