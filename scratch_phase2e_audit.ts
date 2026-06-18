import { leadDiscoveryAgent } from "./src/agents/LeadDiscoveryAgent";
import { leadQualificationAgent } from "./src/agents/LeadQualificationAgent";

async function runPhase2eAudit() {
  console.log("=========================================================");
  console.log("=== Phase 2E Enrichment Accuracy & Explainability Audit ===");
  console.log("=========================================================");

  const targetIcp = {
    industry: "SaaS",
    country: "India",
    companySize: "11-50",
    revenueRange: "1M-5M",
    keywords: "CRM"
  };

  try {
    const leads = await leadDiscoveryAgent.discover({
      industry: "SaaS",
      country: "India",
      companySize: "11-50",
      revenueRange: "1M-5M",
      keywords: "CRM",
      addLog: (msg) => console.log(`[Agent Log] ${msg}`)
    });

    console.log(`\nDiscovered ${leads.length} validated leads. Scoring and validating outcomes...\n`);

    let auditPassed = true;
    const scores: Record<string, number> = {};

    for (const company of leads) {
      const scoreObj = await leadQualificationAgent.scoreLead(company, targetIcp, () => {});
      const name = company.name;
      const score = scoreObj.score;
      scores[name] = score;

      console.log(`---------------------------------------------------------`);
      console.log(`Company Name: ${name}`);
      console.log(`Website: ${company.website}`);
      console.log(`Company Type: ${company.companyType}`);
      console.log(`Employee Estimate: ${company.employees}`);
      console.log(`Employee Confidence: ${company.employeeConfidence}`);
      console.log(`Employee Evidence: ${(company as any).employeeEvidence}`);
      console.log(`Qualification Score: ${score}`);
      console.log(`Score Breakdown:`, JSON.stringify(scoreObj.scoreBreakdown, null, 2));
      console.log(`Explanation: ${scoreObj.explanation}`);

      // Verification checks:
      if (name === "Stingo CRM") {
        if (score < 88 || score > 92) {
          console.error(`❌ Stingo CRM score (${score}) is outside range [88, 92]`);
          auditPassed = false;
        } else {
          console.log(`✅ Stingo CRM score is in range [88, 92]`);
        }
      } else if (name === "Cotgin CRM") {
        if (score < 82 || score > 88) {
          console.error(`❌ Cotgin CRM score (${score}) is outside range [82, 88]`);
          auditPassed = false;
        } else {
          console.log(`✅ Cotgin CRM score is in range [82, 88]`);
        }
      } else if (name === "Maple CRM") {
        if (score < 80 || score > 86) {
          console.error(`❌ Maple CRM score (${score}) is outside range [80, 86]`);
          auditPassed = false;
        } else {
          console.log(`✅ Maple CRM score is in range [80, 86]`);
        }
        if (company.employeeConfidence !== "LOW" || (company as any).employeeEvidence !== "none") {
          console.error(`❌ Maple CRM employee confidence (${company.employeeConfidence}) or evidence (${(company as any).employeeEvidence}) is incorrect! Expected LOW and 'none'`);
          auditPassed = false;
        } else {
          console.log(`✅ Maple CRM employee confidence is LOW, evidence is 'none'`);
        }
        if (company.employees !== 35) {
          console.error(`❌ Maple CRM employee estimate is ${company.employees}, expected 35`);
          auditPassed = false;
        } else {
          console.log(`✅ Maple CRM employee estimate is 35`);
        }
      } else if (name === "Ampliz") {
        if (score < 72 || score > 82) {
          console.error(`❌ Ampliz score (${score}) is outside range [72, 82]`);
          auditPassed = false;
        } else {
          console.log(`✅ Ampliz score is in range [72, 82]`);
        }
      }
    }

    // Check distinct scores
    console.log(`\n--- Score Variance Check ---`);
    console.log("Scores recorded:", JSON.stringify(scores, null, 2));
    const scoreCounts: Record<number, number> = {};
    for (const s of Object.values(scores)) {
      scoreCounts[s] = (scoreCounts[s] || 0) + 1;
    }
    const duplicates = Object.entries(scoreCounts).filter(([_, count]) => count > 2);
    if (duplicates.length > 0) {
      console.error(`❌ Score variance check failed: More than 2 leads share score values:`, duplicates);
      auditPassed = false;
    } else {
      console.log(`✅ Score variance check passed: No more than 2 leads share exactly the same score.`);
    }

    if (auditPassed) {
      console.log(`\n🎉 PHASE 2E AUDIT PASSED SUCCESSFULLY!`);
    } else {
      console.error(`\n❌ PHASE 2E AUDIT FAILED SOME CONSTRAINTS!`);
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Audit exception:", err.stack || err.message);
    process.exit(1);
  }
}

runPhase2eAudit();
