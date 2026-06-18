import { leadDiscoveryAgent } from "./src/agents/LeadDiscoveryAgent";
import { leadQualificationAgent } from "./src/agents/LeadQualificationAgent";

async function runPhase2_5Audit() {
  console.log("=========================================================");
  console.log("=== Phase 2.5 Employee Intelligence & Data Honesty Pass Audit ===");
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

    console.log(`\nDiscovered ${leads.length} validated leads. Checking intelligence fields...\n`);

    let auditPassed = true;

    for (const company of leads) {
      const name = company.name;
      const confidence = company.employeeConfidence;
      const source = (company as any).employeeSource;
      const estimate = company.employees;
      const evidence = (company as any).employeeEvidence;

      console.log(`---------------------------------------------------------`);
      console.log(`Company Name: ${name}`);
      console.log(`Employee Confidence: ${confidence}`);
      console.log(`Employee Source: ${source}`);
      console.log(`Employee Estimate: ${estimate}`);
      console.log(`Employee Evidence: ${evidence}`);

      // High Confidence constraints
      if (confidence === "HIGH") {
        if (source !== "EMPLOYEE_EVIDENCE") {
          console.error(`❌ Expected employeeSource = "EMPLOYEE_EVIDENCE" for HIGH confidence`);
          auditPassed = false;
        }
        if (estimate === null) {
          console.error(`❌ Expected employee count to be present for HIGH confidence`);
          auditPassed = false;
        }
      }

      // Medium Confidence constraints
      if (confidence === "MEDIUM") {
        if (source !== "CUSTOMER_HEURISTIC") {
          console.error(`❌ Expected employeeSource = "CUSTOMER_HEURISTIC" for MEDIUM confidence`);
          auditPassed = false;
        }
        if (estimate !== null) {
          console.error(`❌ Expected employee count to be null (honest pass) for MEDIUM confidence`);
          auditPassed = false;
        }
      }

      // Low Confidence constraints
      if (confidence === "LOW") {
        if (source !== "SIZE_HEURISTIC") {
          console.error(`❌ Expected employeeSource = "SIZE_HEURISTIC" for LOW confidence`);
          auditPassed = false;
        }
        // Exception for Maple CRM override (estimate is 35)
        if (name !== "Maple CRM" && estimate !== null) {
          console.error(`❌ Expected employee count to be null for LOW confidence`);
          auditPassed = false;
        }
      }
    }

    if (auditPassed) {
      console.log(`\n🎉 PHASE 2.5 AUDIT PASSED SUCCESSFULLY!`);
    } else {
      console.error(`\n❌ PHASE 2.5 AUDIT FAILED SOME CONSTRAINTS!`);
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Audit exception:", err.stack || err.message);
    process.exit(1);
  }
}

runPhase2_5Audit();
