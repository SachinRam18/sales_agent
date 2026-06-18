import { normalizeCompanyName, searchService } from "./src/services/SearchService";
import { leadDiscoveryAgent } from "./src/agents/LeadDiscoveryAgent";

async function runPhase3Audit() {
  console.log("=========================================================");
  console.log("=== Phase 3 Multi-Source Discovery Consolidation Audit ===");
  console.log("=========================================================");

  let auditPassed = true;

  // 1. Name Normalization Tests
  console.log("\n--- 1. Name Normalization Tests ---");
  const testNames = [
    { input: "ABC Technologies Pvt Ltd", expected: "abc" },
    { input: "ABC Technologies", expected: "abc" },
    { input: "ABC Tech", expected: "abc" },
    { input: "XYZ Solutions Inc.", expected: "xyz" },
    { input: "Vanguard Systems LLC", expected: "vanguard" }
  ];

  testNames.forEach(({ input, expected }) => {
    const norm = normalizeCompanyName(input);
    if (norm === expected) {
      console.log(`✅ Normalized "${input}" -> "${norm}" (expected: "${expected}")`);
    } else {
      console.error(`❌ Normalization failed: "${input}" -> "${norm}" (expected: "${expected}")`);
      auditPassed = false;
    }
  });

  // 2. Discover and Validate SaaS CRM Leads
  console.log("\n--- 2. SaaS Discovery Consolidation ---");
  try {
    const leads = await leadDiscoveryAgent.discover({
      industry: "SaaS",
      country: "India",
      companySize: "11-50",
      revenueRange: "1M-5M",
      keywords: "CRM",
      addLog: (msg) => console.log(`[Agent Log] ${msg}`)
    });

    console.log(`\nDiscovered ${leads.length} validated leads.\n`);

    // Verify rejection of directories, agencies, lists
    const containsAgency = leads.some(l => l.name.toLowerCase().includes("agency") || l.companyType === "Software Agency");
    const containsDirectory = leads.some(l => l.name.toLowerCase().includes("list") || l.name.toLowerCase().includes("directory") || l.companyType === "Directory");

    if (containsAgency) {
      console.error("❌ Audit failed: Rejection gate failed to filter out Software Agency (saasdevagency.com)");
      auditPassed = false;
    } else {
      console.log("✅ Rejection gate successfully filtered out Software Agencies.");
    }

    if (containsDirectory) {
      console.error("❌ Audit failed: Rejection gate failed to filter out Directory listings");
      auditPassed = false;
    } else {
      console.log("✅ Rejection gate successfully filtered out Listing Directories.");
    }

    // Verify merging and confidence scores
    leads.forEach(lead => {
      console.log(`---------------------------------------------------------`);
      console.log(`Company Name: ${lead.name}`);
      console.log(`Website: ${lead.website}`);
      console.log(`Discovery Sources: ${lead.discoverySources?.join(", ")}`);
      console.log(`Source Count: ${lead.discoverySourceCount}`);
      console.log(`Confidence Score: ${lead.discoveryConfidence}%`);
      console.log(`Confidence Level: ${lead.discoveryConfidenceLevel}`);

      // Basic assertions
      if (!lead.discoverySources || lead.discoverySources.length === 0) {
        console.error(`❌ Company "${lead.name}" has no discovery sources`);
        auditPassed = false;
      }
      if (lead.discoveryConfidence === undefined || lead.discoveryConfidence < 0 || lead.discoveryConfidence > 100) {
        console.error(`❌ Company "${lead.name}" has invalid confidence score: ${lead.discoveryConfidence}`);
        auditPassed = false;
      }
      if (!["Low", "Medium", "High"].includes(lead.discoveryConfidenceLevel || "")) {
        console.error(`❌ Company "${lead.name}" has invalid confidence level: ${lead.discoveryConfidenceLevel}`);
        auditPassed = false;
      }

      // Check specific confidence ranges
      if (lead.name === "Zoho CRM" || lead.name === "Zoho") {
        // Zoho has 4 sources: DuckDuckGo, Mojeek, G2, LinkedIn => Base 85 + verified 15 + LinkedIn 10 + Directory 10 = 120 -> clamped to 100
        if (lead.discoveryConfidence !== 100 || lead.discoveryConfidenceLevel !== "High") {
          console.error(`❌ Zoho CRM confidence is ${lead.discoveryConfidence}% (${lead.discoveryConfidenceLevel}), expected 100% (High)`);
          auditPassed = false;
        } else {
          console.log(`✅ Zoho CRM confidence is 100% (High) as expected.`);
        }
      } else if (lead.name === "Ampliz") {
        // Ampliz has 1 source: DuckDuckGo => Base 30 + verified 15 = 45 => Low
        if (lead.discoveryConfidence !== 45 || lead.discoveryConfidenceLevel !== "Low") {
          console.error(`❌ Ampliz confidence is ${lead.discoveryConfidence}% (${lead.discoveryConfidenceLevel}), expected 45% (Low)`);
          auditPassed = false;
        } else {
          console.log(`✅ Ampliz confidence is 45% (Low) as expected.`);
        }
      }
    });

  } catch (err: any) {
    console.error("Discovery error:", err.stack || err.message);
    auditPassed = false;
  }

  // 3. Verify All 11 Supported Industries
  console.log("\n--- 3. 11 Supported Industries Verification ---");
  const industries = [
    "SaaS", "Manufacturing", "Healthcare", "Logistics", "Financial Services",
    "Industrial", "Retail", "Education", "Real Estate", "Energy", "Telecommunications"
  ];

  for (const ind of industries) {
    try {
      const leads = await leadDiscoveryAgent.discover({
        industry: ind,
        country: "USA",
        companySize: "50-200",
        revenueRange: "5M-20M",
        keywords: "Technology",
        addLog: () => {}
      });
      console.log(`✅ Industry "${ind}" discover query executed successfully. Found ${leads.length} leads.`);
    } catch (e: any) {
      console.error(`❌ Industry "${ind}" failed to query: ${e.message}`);
      auditPassed = false;
    }
  }

  if (auditPassed) {
    console.log(`\n🎉 PHASE 3 AUDIT COMPLETED SUCCESSFULLY!`);
  } else {
    console.error(`\n❌ PHASE 3 AUDIT FAILED SOME CONSTRAINTS!`);
    process.exit(1);
  }
}

runPhase3Audit();
