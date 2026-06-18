import { leadDiscoveryAgent } from "./src/agents/LeadDiscoveryAgent";
import { leadQualificationAgent } from "./src/agents/LeadQualificationAgent";

const tests = [
  {
    name: "Test A: SaaS / CRM (India)",
    params: {
      industry: "SaaS",
      country: "India",
      companySize: "11-50",
      revenueRange: "1M-5M",
      keywords: "CRM"
    },
    icp: {
      industry: "SaaS",
      country: "India",
      companySize: "11-50",
      revenueRange: "1M-5M",
      keywords: "CRM"
    }
  },
  {
    name: "Test B: Manufacturing (Germany)",
    params: {
      industry: "Manufacturing",
      country: "Germany",
      companySize: "200-500",
      revenueRange: "10M-50M",
      keywords: "Machinery"
    },
    icp: {
      industry: "Manufacturing",
      country: "Germany",
      companySize: "200-500",
      revenueRange: "10M-50M",
      keywords: "Machinery"
    }
  },
  {
    name: "Test C: Logistics / Supply Chain (India)",
    params: {
      industry: "Logistics",
      country: "India",
      companySize: "51-200",
      revenueRange: "5M-20M",
      keywords: "Supply Chain"
    },
    icp: {
      industry: "Logistics",
      country: "India",
      companySize: "51-200",
      revenueRange: "5M-20M",
      keywords: "Supply Chain"
    }
  },
  {
    name: "Test D: Healthcare (USA)",
    params: {
      industry: "Healthcare",
      country: "USA",
      companySize: "1000+",
      revenueRange: "100M+",
      keywords: "Medical Devices"
    },
    icp: {
      industry: "Healthcare",
      country: "USA",
      companySize: "1000+",
      revenueRange: "100M+",
      keywords: "Medical Devices"
    }
  },
  {
    name: "Test E: Financial Services (USA)",
    params: {
      industry: "Financial Services",
      country: "USA",
      companySize: "51-200",
      revenueRange: "10M-50M",
      keywords: "Fintech"
    },
    icp: {
      industry: "Financial Services",
      country: "USA",
      companySize: "51-200",
      revenueRange: "10M-50M",
      keywords: "Fintech"
    }
  }
];

async function runGeneralizationTests() {
  console.log("=========================================================");
  console.log("=== Phase 2F Industry-Aware Discovery Generalization Tests ===");
  console.log("=========================================================");

  let allPassed = true;

  for (const test of tests) {
    console.log(`\n\n▶ RUNNING: ${test.name}`);
    console.log(`Params: ${JSON.stringify(test.params)}`);
    console.log(`---------------------------------------------------------`);

    try {
      const results = await leadDiscoveryAgent.discover({
        ...test.params,
        addLog: (msg) => {} // Suppress verbose agent logs to keep output clean
      });

      console.log(`Discovered ${results.length} validated leads.`);

      if (results.length === 0) {
        console.warn(`⚠️ Warning: No leads discovered for ${test.name}`);
      }

      for (const company of results) {
        const scoreDetail = await leadQualificationAgent.scoreLead(company, test.icp, () => {});
        console.log(`\n- Company: ${company.name}`);
        console.log(`  Website: ${company.website}`);
        console.log(`  Company Type: ${company.companyType}`);
        console.log(`  Validation: VALIDATED`);
        console.log(`  Employees: ${company.employees === null ? "null" : company.employees} (Source: ${(company as any).employeeSource}, Confidence: ${company.employeeConfidence})`);
        console.log(`  Score: ${scoreDetail.score}`);
        console.log(`  Breakdown: ${JSON.stringify(scoreDetail.scoreBreakdown)}`);
      }
    } catch (err: any) {
      console.error(`❌ Error in ${test.name}:`, err.message);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log(`\n\n🎉 ALL GENERALIZATION TESTS COMPLETED SUCCESSFULLY!`);
  } else {
    console.error(`\n\n❌ SOME GENERALIZATION TESTS FAILED.`);
    process.exit(1);
  }
}

runGeneralizationTests();
