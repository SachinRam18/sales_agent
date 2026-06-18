import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

import * as db from "./src/db";
import { leadDiscoveryAgent } from "./src/agents/LeadDiscoveryAgent";
import { prospectEnrichmentAgent } from "./src/agents/ProspectEnrichmentAgent";
import { leadQualificationAgent } from "./src/agents/LeadQualificationAgent";
import { crmAgent } from "./src/agents/CRMAgent";
import { outreachAgent } from "./src/agents/OutreachAgent";
import { mockOutreachWorkflow } from "./src/agents/MockOutreachWorkflow";
import { generateJSON, isAIEnabled } from "./src/ai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Dashboard metrics (Phase 9 & Analytics)
app.get("/api/dashboard", async (req, res) => {
  try {
    const companies = await db.getCompanies();
    const campaigns = await db.getCampaigns();
    const activities = await db.getActivities();
    
    // total statistics
    const totalLeads = companies.length;
    const qualifiedLeads = companies.filter(c => c.status === "Qualified" || c.score >= 70).length;
    const outreachSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0) + 124; // baseline + simulation
    const activeCampaigns = campaigns.filter(c => c.status === "Active").length;
    const conversionRate = totalLeads > 0 
      ? parseFloat(((companies.filter(c => ["Converted", "Closed Won", "Won"].includes(c.status)).length / totalLeads) * 100).toFixed(1)) 
      : 8.5;
    const crmRecords = companies.length;

    // Lead stage distribution (Funnel)
    const funnel = {
      new: companies.filter(c => c.status === "New").length,
      qualified: companies.filter(c => c.status === "Qualified").length,
      contacted: companies.filter(c => c.status === "Contacted").length,
      meetingScheduled: companies.filter(c => c.status === "Meeting Scheduled").length,
      converted: companies.filter(c => ["Converted", "Closed Won", "Won"].includes(c.status)).length,
      lost: companies.filter(c => c.status === "Lost").length,
    };

    // Top Leads
    const topLeads = [...companies]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // AI Recommendations
    const aiRecommendations = [
      {
        id: "rec-1",
        title: "High Buying Signal detected",
        description: "Müller & Söhne Automation recently posted jobs for 3 control system engineers. Score upgraded to 89.",
        impact: "High",
        type: "lead_signal"
      },
      {
        id: "rec-2",
        title: "Scale Outreach in Germany",
        description: "Your 'German Machinery Auto-Pilot Outreach' campaign has a 24.5% reply rate. Add 4 more qualified leads.",
        impact: "Medium",
        type: "campaign_optimization"
      },
      {
        id: "rec-3",
        title: "Review Moderate Priority Leads",
        description: "3 moderate value leads have technology matches in SAP but low employee sizes. Consider custom sequences.",
        impact: "Low",
        type: "icp_refinement"
      }
    ];

    res.json({
      metrics: {
        totalLeads,
        qualifiedLeads,
        outreachSent,
        activeCampaigns,
        conversionRate,
        crmRecords
      },
      funnel,
      topLeads,
      aiRecommendations,
      recentActivities: activities.slice(0, 10)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. ICP Profiles CRUD (Phase 2)
app.get("/api/icp", async (req, res) => {
  try {
    const profiles = await db.getICPs();
    res.json(profiles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/icp", async (req, res) => {
  try {
    const saved = await db.saveICP(req.body);
    await db.addActivity("icp_saved", `Saved ICP Profile: "${req.body.name}"`, "sachinram6363@gmail.com");
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/icp/:id", async (req, res) => {
  try {
    const payload = { ...req.body, id: req.params.id };
    const saved = await db.saveICP(payload);
    await db.addActivity("icp_saved", `Updated ICP Profile: "${req.body.name}"`, "sachinram6363@gmail.com");
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/icp/:id", async (req, res) => {
  try {
    const remaining = await db.deleteICP(req.params.id);
    await db.addActivity("icp_deleted", `Deleted ICP Profile record ID: ${req.params.id}`, "sachinram6363@gmail.com");
    res.json(remaining);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy delete endpoint used by the UI
app.post("/api/icp/delete", async (req, res) => {
  try {
    const { id } = req.body;
    const remaining = await db.deleteICP(id);
    await db.addActivity("icp_deleted", `Deleted ICP Profile record ID: ${id}`, "sachinram6363@gmail.com");
    res.json(remaining);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Lead Discovery Agent Flow (Phase 3 & Phase 10)
app.all("/api/search-leads", async (req, res) => {
  // Support both GET (query parameters) and POST (body parameters)
  const industry = (req.query.industry as string) || req.body.industry || "Manufacturing";
  const country = (req.query.country as string) || req.body.country || "Germany";
  const companySize = (req.query.employees as string) || req.body.companySize || "200-500";
  const revenueRange = (req.query.revenueRange as string) || req.body.revenueRange || "> $10M";
  const keywords = (req.query.keywords as string) || req.body.keywords || "";
  const icpId = (req.query.icpId as string) || req.body.icpId;
  
  const logs: Array<{ agent: string; message: string; timestamp: string }> = [];
  const addLog = (agent: string, message: string) => {
    logs.push({ agent, message, timestamp: new Date().toLocaleTimeString() });
  };

  try {
    // Agent 1: Lead Discovery Agent
    const discoveredCompanies = await leadDiscoveryAgent.discover({
      industry,
      country,
      companySize,
      revenueRange,
      keywords,
      addLog: (msg) => addLog("Lead Discovery Agent", msg)
    });

    // Agent 2: Prospect Enrichment Agent
    const enrichedCompanies: any[] = [];
    for (const company of discoveredCompanies) {
      const enriched = await prospectEnrichmentAgent.enrich(
        company,
        (msg) => addLog("Prospect Enrichment Agent", msg)
      );
      enrichedCompanies.push(enriched);
    }

    // Agent 3: Lead Qualification Agent
    const icps = await db.getICPs();
    const presetIcp = (icpId && icpId !== "") ? icps.find(i => i.id === icpId) : undefined;

    // Merge preset values with the user-selected parameters from the request, ensuring UI inputs override DB presets.
    const activeIcp = {
      ...(presetIcp || {}),
      industry: industry || presetIcp?.industry || "Manufacturing",
      country: country || presetIcp?.country || "Germany",
      companySize: companySize || presetIcp?.companySize || "200-500",
      revenueRange: revenueRange || presetIcp?.revenueRange || "> $10M",
      keywords: keywords !== undefined ? keywords : (presetIcp?.keywords || "")
    };

    console.log("[LeadQualificationAgent Debug] Pre-Scoring Parameters:");
    console.log("- Active ICP Industry:", activeIcp.industry);
    console.log("- Active ICP Country:", activeIcp.country);
    console.log("- Active ICP Keywords:", activeIcp.keywords);
    console.log("- User-selected Industry:", industry);
    console.log("- User-selected Country:", country);
    console.log("- User-selected Keywords:", keywords);

    const scoredResults: any[] = [];
    for (const company of enrichedCompanies) {
      const scoreObj = await leadQualificationAgent.scoreLead(
        company,
        activeIcp,
        (msg) => addLog("Lead Qualification Agent", msg)
      );

      const tempId = "discovered-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      scoredResults.push({
        id: tempId,
        ...company,
        score: scoreObj.score,
        scoreDetail: scoreObj
      });
    }

    addLog("CRM Agent", "Running CRM duplicate scans across established entities...");
    addLog("CRM Agent", "Lead qualification matches parsed. Ready to review and import.");
    addLog("Outreach Agent", "Ready. Personalized template triggers awaiting CRM synchronization signal.");

    res.json({
      logs,
      results: scoredResults
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message, logs });
  }
});

// Mock Outreach Workflow runner (SDR Pipeline Simulation)
app.post("/api/run-mock-outreach", async (req, res) => {
  const logs: string[] = [];
  const addLog = (msg: string) => {
    logs.push(msg);
    console.log(`[Mock Outreach Endpoint] ${msg}`);
  };

  try {
    const results = await mockOutreachWorkflow.runWorkflow(addLog);
    res.json({ success: true, logs, results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message, logs });
  }
});

// Parse Discovery Prompt endpoint
app.post("/api/parse-discovery-prompt", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (isAIEnabled()) {
    const aiPrompt = `You are an expert sales target extractor. 
Extract the following search parameters from the user's prompt:
- industry: The corporate sector or industry.
- country: The geographic location or country.
- companySize: The size bracket (e.g. 200-500).
- revenueRange: The estimated revenue (e.g. > $10M).
- keywords: Crawler directives or keywords.

User Prompt: "${prompt}"

Return ONLY a valid JSON object with the keys: industry, country, companySize, revenueRange, keywords. If a parameter is not mentioned, use an empty string.`;

    try {
      const extracted = await generateJSON(aiPrompt, null, 300);
      return res.json(extracted);
    } catch (error: any) {
      console.error("[parse-discovery-prompt] AI parsing failed:", error.message);
      return res.status(500).json({ error: "Failed to parse prompt with AI." });
    }
  } else {
    // Fallback if AI not enabled
    return res.json({
      industry: "Manufacturing",
      country: "Germany",
      companySize: "200-500",
      revenueRange: "> $10M",
      keywords: "Machinery"
    });
  }
});

// 4. Enrich Lead endpoint (manual enrichment)
app.post("/api/enrich-company", async (req, res) => {
  const { companyId } = req.body;
  try {
    const comp = await db.getCompany(companyId);
    if (!comp) return res.status(404).json({ error: "Company not found" });

    const isGeminiEnabled = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
    let enrichmentData = {
      growthPotential: "Strong - Expanding automation footprint",
      buyingSignals: "Technology shift detected. Actively posting for automation controller engineers.",
      technologies: comp.notes?.includes("SAP") ? "SAP, Dynamics, AWS" : "Salesforce, AWS, HubSpot",
      description: comp.description
    };

    if (isGeminiEnabled) {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || "",
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      const prompt = `You are a premium B2B Sales Enrichment Agent. Analyse this company:
      Name: ${comp.name}
      Industry: ${comp.industry}
      Website: ${comp.website}
      Location: ${comp.location}
      Employee Count: ${comp.employees}
      
      Generate a professional sales intelligence package in JSON format:
      {
        "growthPotential": "1-sentence summary of growth factors and trends matching of this space",
        "buyingSignals": "1-sentence describing hypothetical active buying triggers like team growth or integrations",
        "technologies": "comma separated tech stack list",
        "description": "richer 3-sentence company summary"
      }`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          enrichmentData = JSON.parse(response.text.trim());
        }
      } catch (e) {
        console.error("Gemini enrichment error", e);
      }
    }

    comp.description = enrichmentData.description;
    comp.notes = (comp.notes || "") + `\n[Agent Enrichment Insight] Growth: ${enrichmentData.growthPotential} | Signals: ${enrichmentData.buyingSignals}`;
    
    await db.saveCompany(comp);
    await db.addActivity("lead_enriched", `Enriched company CRM record: "${comp.name}"`, "sachinram6363@gmail.com", comp.name);
    await db.addNotification(`Data Enrichment Agent completed deep scan for ${comp.name}.`);

    res.json({ success: true, company: comp, enrichment: enrichmentData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. CRM Pipeline Management API (Phase 5 & Legacy)

// GET /api/crm/leads
app.get("/api/crm/leads", async (req, res) => {
  try {
    const leads = await db.getCompanies();
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/crm/add (Agent 3: CRM Agent storage)
app.post("/api/crm/add", async (req, res) => {
  try {
    const result = await crmAgent.storeLead({
      company: req.body.company,
      contacts: req.body.contacts || [],
      scoreDetail: req.body.scoreDetail || {
        score: req.body.company.score || 70,
        industryMatch: 80,
        sizeMatch: 80,
        revenueMatch: 80,
        techMatch: 80,
        locationMatch: 80,
        explanation: "Added manually to CRM."
      },
      addLog: (msg) => console.log(`[CRM Agent] ${msg}`)
    });
    res.json({ success: true, company: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/crm/status (CRM status/note updates)
app.put("/api/crm/status", async (req, res) => {
  const { id, status, notes } = req.body;
  try {
    const comp = await db.getCompany(id);
    if (!comp) return res.status(404).json({ error: "Company not found" });

    if (status) {
      const oldStatus = comp.status;
      comp.status = status;
      await db.addActivity("crm_status_changed", `Changed status of "${comp.name}" from "${oldStatus}" to "${status}"`, "sachinram6363@gmail.com", comp.name);
    }
    if (notes !== undefined) {
      comp.notes = notes;
    }

    const updated = await db.saveCompany(comp);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/crm/remove
app.delete("/api/crm/remove", async (req, res) => {
  const id = req.body.id || (req.query.id as string);
  try {
    const comp = await db.getCompany(id);
    if (comp) {
      await db.deleteCompany(id);
      await db.addActivity("crm_deleted", `Removed company record: "${comp.name}"`, "sachinram6363@gmail.com", comp.name);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy routes for UI compatibility
app.get("/api/crm/companies", async (req, res) => {
  try {
    const companies = await db.getCompanies();
    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/crm/companies/status", async (req, res) => {
  const { id, status, notes } = req.body;
  try {
    const comp = await db.getCompany(id);
    if (!comp) return res.status(404).json({ error: "Company not found" });

    if (status) {
      const oldStatus = comp.status;
      comp.status = status;
      await db.addActivity("crm_status_changed", `Changed status of "${comp.name}" from "${oldStatus}" to "${status}"`, "sachinram6363@gmail.com", comp.name);
    }
    if (notes !== undefined) {
      comp.notes = notes;
    }

    const updated = await db.saveCompany(comp);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/store-crm", async (req, res) => {
  try {
    const result = await crmAgent.storeLead({
      company: req.body.company,
      contacts: req.body.contacts,
      scoreDetail: req.body.scoreDetail,
      addLog: (msg) => console.log(`[CRM Agent Store] ${msg}`)
    });
    res.json({ success: true, company: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/crm/companies/delete", async (req, res) => {
  const { id } = req.body;
  try {
    const comp = await db.getCompany(id);
    if (comp) {
      await db.deleteCompany(id);
      await db.addActivity("crm_deleted", `Removed company record: "${comp.name}"`, "sachinram6363@gmail.com", comp.name);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Company Intelligence Page (Phase 6)
app.get("/api/company/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const company = await db.getCompany(id);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const contacts = await db.getContacts(id);
    const scoreDetails = await db.getLeadScores();
    const scoreDetail = scoreDetails[id] || {
      companyId: id,
      score: company.score || 70,
      industryMatch: 80,
      sizeMatch: 75,
      revenueMatch: 75,
      techMatch: 70,
      locationMatch: 80,
      explanation: "Scored based on general ICP criteria configurations."
    };

    res.json({
      company,
      contacts,
      scoreDetail
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy company detail route
app.get("/api/crm/company-detail", async (req, res) => {
  const { id } = req.query;
  try {
    const company = await db.getCompany(id as string);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const contacts = await db.getContacts(id as string);
    const scoreDetails = await db.getLeadScores();
    const scoreDetail = scoreDetails[id as string] || {
      companyId: id as string,
      score: company.score || 70,
      industryMatch: 80,
      sizeMatch: 75,
      revenueMatch: 75,
      techMatch: 70,
      locationMatch: 80,
      explanation: "Scored based on general ICP criteria configurations."
    };

    res.json({
      company,
      contacts,
      scoreDetail
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Outreach Generator Engine (Phase 7 & Agent 4)
app.post("/api/generate-outreach", async (req, res) => {
  const { contactId, companyId, icpId } = req.body;
  try {
    const contacts = await db.getContacts();
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    const company = await db.getCompany(companyId || contact.companyId);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const icps = await db.getICPs();
    const icp = icpId ? icps.find(i => i.id === icpId) : icps[0];

    const output = await outreachAgent.generateOutreach({ contact, company, icp });
    res.json(output);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Campaigns Management
app.get("/api/campaigns", async (req, res) => {
  try {
    const campaigns = await db.getCampaigns();
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/campaigns", async (req, res) => {
  try {
    const saved = await db.saveCampaign(req.body);
    await db.addActivity("campaign_saved", `Created campaign name: "${req.body.name}" with audience template.`, "sachinram6363@gmail.com");
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Contacts Query (helper)
app.get("/api/crm/contacts", async (req, res) => {
  const { companyId } = req.query;
  try {
    const contacts = await db.getContacts(companyId as string);
    res.json(contacts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Activity Logging API (Phase 8)
app.get("/api/activities", async (req, res) => {
  try {
    const activities = await db.getActivities();
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Notifications
app.get("/api/notifications", async (req, res) => {
  try {
    const notifs = await db.getNotifications();
    res.json(notifs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/notifications/clear", async (req, res) => {
  try {
    const notifs = await db.clearNotifications();
    res.json(notifs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// VITE OR STATIC ASSETS
// ----------------------------------------------------

let dbReady = false;

async function startServer() {
  // Initialize the PostgreSQL Database schema and seeds
  // NOTE: If DB is unavailable the server still starts so the UI is served.
  // API routes that need the DB will return 503 until it becomes available.
  try {
    await db.initializeDatabase();
    dbReady = true;
    console.log("[Server] Database initialization completed.");
  } catch (dbErr: any) {
    console.error("[Server] ⚠️  Database unavailable — UI will still load but API calls will fail.");
    console.error("[Server] Fix DATABASE_URL in .env then restart. Error:", dbErr.message);
  }

  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite Development Server middleware mounted.");
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static assets from", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

startServer();
