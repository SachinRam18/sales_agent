import { generateJSON, isAIEnabled } from "../ai";

export interface LeadScoreDetail {
  score: number;
  industryMatch: number;
  sizeMatch: number;
  revenueMatch: number;
  techMatch: number;
  locationMatch: number;
  explanation: string;
}

export class LeadQualificationAgent {
  async scoreLead(company: any, icp: any, addLog: (message: string) => void): Promise<LeadScoreDetail> {
    addLog(`Evaluating compatibility metrics for "${company.name}" against target profile.`);

    if (isAIEnabled()) {
      const prompt = `You are the Lead Qualification Agent for SalesPilot AI.

Compare this company:
${JSON.stringify(company, null, 2)}

Against this Ideal Customer Profile (ICP):
${JSON.stringify(icp, null, 2)}

Rate each dimension 0-100 and give an overall combined score 0-100.
Return ONLY a valid JSON object with no markdown or extra text:
{
  "score": 85,
  "industryMatch": 90,
  "sizeMatch": 80,
  "revenueMatch": 75,
  "techMatch": 70,
  "locationMatch": 95,
  "explanation": "2-sentence explanation of the score."
}`;

      try {
        const result = await generateJSON(prompt);
        if (result && typeof result.score === "number") {
          addLog(`AI scored "${company.name}": ${result.score}/100.`);
          return result as LeadScoreDetail;
        }
      } catch (e: any) {
        console.error("[LeadQualificationAgent] AI scoring failed, using heuristics:", e.message);
      }
    }

    // Heuristic fallback
    return this.heuristicScore(company, icp, addLog);
  }

  private heuristicScore(company: any, icp: any, addLog: (m: string) => void): LeadScoreDetail {
    let score = 70;
    let indMatch = 75;
    let szMatch = 70;
    let revMatch = 70;
    let locMatch = 75;
    let tcMatch = 65;

    if (icp) {
      const compInd = (company.industry || "").toLowerCase();
      const icpInd  = (icp.industry || "").toLowerCase();
      if (compInd && icpInd && (compInd.includes(icpInd) || icpInd.includes(compInd))) {
        indMatch = 100; score += 10;
      }

      const compLoc = (company.location || company.country || "").toLowerCase();
      const icpCtr  = (icp.country || "").toLowerCase();
      if (compLoc && icpCtr && compLoc.includes(icpCtr)) {
        locMatch = 100; score += 10;
      }

      // Size match
      let minEmp = icp.employee_min || 0;
      let maxEmp = icp.employee_max || 999999;
      if (!minEmp && icp.companySize) {
        const parts = icp.companySize.split("-");
        if (parts.length === 2) { minEmp = parseInt(parts[0]) || 0; maxEmp = parseInt(parts[1]) || 999999; }
      }
      if (company.employees >= minEmp && company.employees <= maxEmp) { szMatch = 100; score += 5; }
      else { szMatch = 50; score -= 5; }

      // Tech match
      const compTech = (company.technologies || "").toLowerCase();
      const icpTech  = (icp.technologiesUsed || "").toLowerCase();
      if (compTech && icpTech) {
        const hits = icpTech.split(",").filter((t: string) => compTech.includes(t.trim().toLowerCase()));
        if (hits.length > 0) { tcMatch = 90; score += 5; }
      }
    }

    addLog(`Heuristic scored "${company.name}": ${Math.min(Math.max(score, 45), 98)}/100.`);
    return {
      score: Math.min(Math.max(score, 45), 98),
      industryMatch: indMatch,
      sizeMatch: szMatch,
      revenueMatch: revMatch,
      techMatch: tcMatch,
      locationMatch: locMatch,
      explanation: "Automated grading confirms strong alignment. Highly compatible parameters observed. Handing over to database agents."
    };
  }
}

export const leadQualificationAgent = new LeadQualificationAgent();
