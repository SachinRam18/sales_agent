import { generateJSON, isAIEnabled } from "../ai";
import { DiscoveredCompany } from "./LeadDiscoveryAgent";

export class ProspectEnrichmentAgent {
  async enrich(company: DiscoveredCompany, addLog: (message: string) => void): Promise<DiscoveredCompany> {
    addLog(`Initiating deep enrichment scan for "${company.name}"...`);

    if (isAIEnabled()) {
      const prompt = `You are a Prospect Enrichment Agent for B2B Sales.
Analyze this basic company data:
${JSON.stringify({
  name: company.name,
  industry: company.industry,
  website: company.website,
  description: company.description
}, null, 2)}

Enrich this profile with logical estimates for missing data based on standard industry knowledge.
Return ONLY a valid JSON object matching this schema, no markdown or text:
{
  "technologies": "Comma separated list of 4-6 likely tech stack tools (e.g. AWS, Salesforce, React)",
  "revenue": "Estimated revenue range (e.g. $10M-$50M)",
  "headquarters": "Likely HQ city/country if not specified, otherwise keep original",
  "richDescription": "A slightly expanded 2-sentence description of what they likely do and their market position."
}`;

      try {
        const result = await generateJSON(prompt, null, 500);
        if (result && result.technologies) {
          addLog(`AI successfully enriched profile for "${company.name}".`);
          return {
            ...company,
            technologies: result.technologies || company.technologies,
            revenue: result.revenue || company.revenue,
            location: result.headquarters || company.location,
            description: result.richDescription || company.description
          };
        }
      } catch (e: any) {
        console.error("[ProspectEnrichmentAgent] AI enrichment failed, using heuristics:", e.message);
      }
    }

    // Heuristic fallback
    return this.heuristicEnrich(company, addLog);
  }

  private heuristicEnrich(company: DiscoveredCompany, addLog: (m: string) => void): DiscoveredCompany {
    let tech = company.technologies || "AWS, Google Workspace, Slack";
    let rev = company.revenue || "$5M - $20M";
    
    if (company.industry.toLowerCase().includes("software") || company.industry.toLowerCase().includes("tech")) {
      tech = "AWS, React, Node.js, GitHub, Stripe";
      rev = "$10M - $50M";
    } else if (company.industry.toLowerCase().includes("manufacturing")) {
      tech = "SAP, Siemens NX, AutoCAD, Microsoft Azure";
      rev = "$50M - $200M";
    } else if (company.industry.toLowerCase().includes("logistics")) {
      tech = "Oracle, Descartes, AWS, Geotab";
    }

    addLog(`Applied heuristic enrichment models for "${company.name}".`);
    return {
      ...company,
      technologies: tech,
      revenue: rev,
      description: company.description || `${company.name} is a growing enterprise in the ${company.industry} sector.`
    };
  }
}

export const prospectEnrichmentAgent = new ProspectEnrichmentAgent();
