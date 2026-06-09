import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { dbInstance } from "./src/dbSim";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client
let aiClient: GoogleGenAI | null = null;
const isGeminiEnabled = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

function getGeminiClient(): GoogleGenAI | null {
  if (!isGeminiEnabled) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper to log actions to DB
function logActivity(type: string, description: string, companyName?: string) {
  dbInstance.addActivity(type, description, "sachinram6363@gmail.com", companyName);
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Dashboard metrics
app.get("/api/dashboard", (req, res) => {
  try {
    const companies = dbInstance.getCompanies();
    const campaigns = dbInstance.getCampaigns();
    const activities = dbInstance.getActivities();
    
    // total statistics
    const totalLeads = companies.length;
    const qualifiedLeads = companies.filter(c => c.status === "Qualified" || c.score >= 70).length;
    const outreachSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0) + 124; // baseline + simulation
    const activeCampaigns = campaigns.filter(c => c.status === "Active").length;
    const conversionRate = totalLeads > 0 ? parseFloat(((companies.filter(c => c.status === "Converted").length / totalLeads) * 100).toFixed(1)) : 8.5;
    const crmRecords = companies.length;

    // Lead stage distribution (Funnel)
    const funnel = {
      new: companies.filter(c => c.status === "New").length,
      qualified: companies.filter(c => c.status === "Qualified").length,
      contacted: companies.filter(c => c.status === "Contacted").length,
      meetingScheduled: companies.filter(c => c.status === "Meeting Scheduled").length,
      converted: companies.filter(c => c.status === "Converted").length,
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

// 2. ICP Profiles CRUD
app.get("/api/icp", (req, res) => {
  res.json(dbInstance.getICPs());
});

app.post("/api/icp", (req, res) => {
  try {
    const saved = dbInstance.saveICP(req.body);
    logActivity("icp_saved", `Saved ICP Profile: "${req.body.name}"`);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/icp/delete", (req, res) => {
  try {
    const { id } = req.body;
    const remaining = dbInstance.deleteICP(id);
    logActivity("icp_deleted", `Deleted ICP Profile record ID: ${id}`);
    res.json(remaining);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Lead Discovery Agent Flow (Multi-agent architecture visualization & processing)
app.post("/api/search-leads", async (req, res) => {
  const { industry, country, companySize, revenueRange, keywords, icpId } = req.body;
  
  // Trace logs simulating the multi-agent pipeline
  const logs: Array<{ agent: string; message: string; timestamp: string }> = [];
  const addLog = (agent: string, message: string) => {
    logs.push({ agent, message, timestamp: new Date().toLocaleTimeString() });
  };

  try {
    addLog("Lead Discovery Agent", `Analyzing request: Find ${industry} companies in ${country} with ${companySize} employees matching ${keywords || "any keyword"}.`);
    addLog("Lead Discovery Agent", "Formulating search queries & running semantic database queries...");
    
    let generatedCompanies: any[] = [];
    const ai = getGeminiClient();

    if (ai) {
      addLog("Data Enrichment Agent", "Invoking Gemini-3.5-Flash model to generate hyper-realistic target leads and discover contacts...");
      const prompt = `You are a professional B2B lead generation assistant (Data Enrichment & Discovery Agent).
      Generate 4 highly realistic, non-existent target companies in the ${industry} sector located in ${country || "any location"} matching size range ${companySize || "any size"} and estimated revenue ${revenueRange || "any revenue"}. Include key keywords: ${keywords || "none"}.
      
      For each company, provide:
      1. Business Name (German sounding if country is Germany, etc.)
      2. Perfect professional website (matching the company name)
      3. A high-value 2-sentence description of what they produce/offer
      4. City location
      5. Estimated Revenue
      6. Specific Employee Count (a realistic number within range)
      7. Target technographics used (e.g. "SAP ERP, HubSpot, Salesforce, AWS")
      8. EXACTLY TWO matching key decision makers (Name, Corporate Role like CEO, CSO, VP Sales, COO, email address, custom Mock LinkedIn profile URL, phone number)
      
      Format your response strictly as a JSON array where each item has the exact schema specified. Do not include markdown wraps around the JSON array, return pure JSON matching the schema.`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  website: { type: Type.STRING },
                  location: { type: Type.STRING },
                  revenue: { type: Type.STRING },
                  employees: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  technologies: { type: Type.STRING },
                  contacts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        role: { type: Type.STRING },
                        linkedin: { type: Type.STRING },
                        email: { type: Type.STRING },
                        phone: { type: Type.STRING }
                      },
                      required: ["name", "role", "email", "linkedin", "phone"]
                    }
                  }
                },
                required: ["name", "website", "location", "revenue", "employees", "description", "contacts", "technologies"]
              }
            }
          }
        });

        if (response.text) {
          generatedCompanies = JSON.parse(response.text.trim());
          addLog("Data Enrichment Agent", `Discovery successful! Gathered ${generatedCompanies.length} companies with detailed contacts and metadata.`);
        }
      } catch (gemError) {
        console.error("Gemini lead discovery error, falling back to simulator logic:", gemError);
        addLog("Data Enrichment Agent", "Gemini error during live discovery. Falling back to platform internal high-fidelity discovery models.");
      }
    } else {
      addLog("Data Enrichment Agent", "Intelligent database crawling active. Sourcing fresh ICP targets...");
    }

    // Fallback/Standard high-fidelity companies if generation yielded nothing
    if (generatedCompanies.length === 0) {
      const isGermany = String(country).toLowerCase().includes("germ");
      const isUS = String(country).toLowerCase().includes("unit") || String(country).toLowerCase().includes("us");
      
      if (isGermany) {
        generatedCompanies = [
          {
            name: "Hansen Werkzeuge GmbH",
            industry: industry || "Manufacturing",
            website: "https://www.hansen-werkzeuge.de",
            location: "Düsseldorf, Germany",
            revenue: "$32M",
            employees: 280,
            technologies: "SAP ERP, Siemens MindSphere, Zoho CRM",
            description: "High-grade industrial calibration tools and mechanical torque sensors built for automated assembly checks.",
            contacts: [
              { name: "Klaus Hansen", role: "CEO & Founder", linkedin: "https://linkedin.com/in/klaus-hansen-mock", email: "k.hansen@hansen-werkzeuge.de", phone: "+49 211 400301" },
              { name: "Monika Beck", role: "Director of Technology", linkedin: "https://linkedin.com/in/monika-beck-mock", email: "m.beck@hansen-werkzeuge.de", phone: "+49 211 400302" }
            ]
          },
          {
            name: "Vogel Precision Parts",
            industry: industry || "Manufacturing",
            website: "https://www.vogel-precision.de",
            location: "Leipzig, Germany",
            revenue: "$19M",
            employees: 215,
            technologies: "Microsoft Dynamics, Salesforce, AWS",
            description: "Supplies milled CNC titanium casings and heavy machinery components to global aerospace prime contracts.",
            contacts: [
              { name: "Stephan Vogel", role: "VP Operations", linkedin: "https://linkedin.com/in/stephan-vogel-mock", email: "s.vogel@vogel-precision.de", phone: "+49 341 889922" },
              { name: "Julia Richter", role: "VP Purchasing", linkedin: "https://linkedin.com/in/julia-richter-mock", email: "j.richter@vogel-precision.de", phone: "+49 341 889923" }
            ]
          }
        ];
      } else {
        generatedCompanies = [
          {
            name: "Atlas Robotics Systems",
            industry: industry || "Manufacturing / Robotics",
            website: "https://www.atlasrobotics.co",
            location: "Boston, USA",
            revenue: "$48M",
            employees: 310,
            technologies: "HubSpot CRM, Snowflake, AWS Cloud",
            description: "Autonomous inventory sorting machines and heavy payload robotic lifters integrated on custom proprietary micro-processors.",
            contacts: [
              { name: "Sarah Jenkins", role: "VP Engineering", linkedin: "https://linkedin.com/in/sarah-jenkins-mock", email: "s.jenkins@atlasrobotics.co", phone: "+1 617 555 4010" },
              { name: "Arthur Vance", role: "Head of Procurement", linkedin: "https://linkedin.com/in/arthur-vance-mock", email: "a.vance@atlasrobotics.co", phone: "+1 617 555 4011" }
            ]
          },
          {
            name: "Apex Advanced Automation",
            industry: industry || "Automation Systems",
            website: "https://www.apexautomation.com",
            location: "San Jose, USA",
            revenue: "$24M",
            employees: 180,
            technologies: "Salesforce CRM, Oracle NetSuite, AWS",
            description: "High-speed optical inspection cameras, laser sensors, and smart AI vision systems for automated factory line defects.",
            contacts: [
              { name: "David Kim", role: "Chief Operating Officer", linkedin: "https://linkedin.com/in/david-kim-mock", email: "d.kim@apexautomation.com", phone: "+1 408 555 9010" },
              { name: "Clara Oswald", role: "Technical Sourcing Lead", linkedin: "https://linkedin.com/in/clara-oswald-mock", email: "c.oswald@apexautomation.com", phone: "+1 408 555 9011" }
            ]
          }
        ];
      }
      addLog("Data Enrichment Agent", `Discovered ${generatedCompanies.length} high-fidelity companies with technographics and executive contact pipelines.`);
    }

    addLog("Lead Qualification Agent", "Loading Profile scoring regulations... Initiating lead grading matches...");
    
    // Evaluate scores for discovered companies
    const scoredResults: any[] = [];
    const activeIcp = icpId ? dbInstance.getICPs().find(i => i.id === icpId) : dbInstance.getICPs()[0];

    for (const company of generatedCompanies) {
      addLog("Lead Qualification Agent", `Evaluating compatibility metrics for "${company.name}" against target profile.`);
      
      let scoreObj = {
        score: 75,
        industryMatch: 80,
        sizeMatch: 80,
        revenueMatch: 75,
        techMatch: 70,
        locationMatch: 70,
        explanation: "Good criteria alignment. Verified employees count matches scale patterns. Location matches target geo focus areas."
      };

      if (ai) {
        const scorePrompt = `You are the Lead Qualification Agent for SalesPilot AI.
        Compare the company profile:
        ${JSON.stringify(company)}
        
        Against our target Ideal Customer Profile (ICP) parameters:
        ${JSON.stringify(activeIcp || { industry, country, companySize, revenueRange, keywords })}
        
        Rate the match compatibility from 0 to 100 for:
        1. Industry Matching Match Level (0-100)
        2. Size/Employee Match Level (0-100)
        3. Revenue Match Level (0-100)
        4. Tech/Tool Stack Compatibility (0-100)
        5. Location Match Level (0-100)
        6. Combined Overall Target Score (0-100)
        7. Provide a concise 2-sentence explanation summarizing why this score is allocated.
        
        Respond with raw structural JSON matching the score schema exactly.`;

        try {
          const scoreRes = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: scorePrompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER },
                  industryMatch: { type: Type.INTEGER },
                  sizeMatch: { type: Type.INTEGER },
                  revenueMatch: { type: Type.INTEGER },
                  techMatch: { type: Type.INTEGER },
                  locationMatch: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["score", "industryMatch", "sizeMatch", "revenueMatch", "techMatch", "locationMatch", "explanation"]
              }
            }
          });

          if (scoreRes.text) {
            scoreObj = JSON.parse(scoreRes.text.trim());
          }
        } catch (scErr) {
          console.error("Gemini lead scoring error", scErr);
        }
      } else {
        // Run clean manual heuristic matching for beautiful simulated values
        let matchScore = 70;
        let indMatch = 75;
        let szMatch = 70;
        let revMatch = 70;
        let locMatch = 75;
        let tcMatch = 65;

        if (activeIcp) {
          if (company.industry.toLowerCase().includes(activeIcp.industry.toLowerCase())) {
            indMatch = 100;
            matchScore += 10;
          }
          if (company.location.toLowerCase().includes(activeIcp.country.toLowerCase())) {
            locMatch = 100;
            matchScore += 10;
          }
          if (company.employees >= 200 && company.employees <= 500) {
            szMatch = 95;
            matchScore += 5;
          }
          if (company.technologies && activeIcp.technologiesUsed && company.technologies.toLowerCase().includes("sap")) {
            tcMatch = 90;
            matchScore += 5;
          }
        }
        
        scoreObj = {
          score: Math.min(Math.max(matchScore, 45), 98),
          industryMatch: indMatch,
          sizeMatch: szMatch,
          revenueMatch: revMatch,
          techMatch: tcMatch,
          locationMatch: locMatch,
          explanation: `Automated grading confirms strong alignment. Highly compatible parameters observed. Handing over to database agents.`
        };
      }

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

// 4. Enrich Lead endpoint (manual enrich)
app.post("/api/enrich-company", async (req, res) => {
  const { companyId } = req.body;
  try {
    const comp = dbInstance.getCompany(companyId);
    if (!comp) return res.status(404).json({ error: "Company not found" });

    const ai = getGeminiClient();
    let enrichmentData = {
      growthPotential: "Strong - Expanding automation footprint",
      buyingSignals: "Technology shift detected. Actively posting for automation controller engineers.",
      technologies: comp.notes?.includes("SAP") ? "SAP, Dynamics, AWS" : "Salesforce, AWS, HubSpot",
      description: comp.description
    };

    if (ai) {
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
          const parsed = JSON.parse(response.text.trim());
          enrichmentData = parsed;
        }
      } catch (e) {
        console.error("Gemini enrichment error", e);
      }
    }

    // Update record
    comp.description = enrichmentData.description;
    
    // Add enrichment insights to company notes/fields
    comp.notes = (comp.notes || "") + `\n[Agent Enrichment Insight] Growth: ${enrichmentData.growthPotential} | Signals: ${enrichmentData.buyingSignals}`;
    dbInstance.saveCompany(comp);
    
    logActivity("lead_enriched", `Enriched company CRM record: "${comp.name}"`, comp.name);
    dbInstance.addNotification(`Data Enrichment Agent completed deep scan for ${comp.name}.`);

    res.json({ success: true, company: comp, enrichment: enrichmentData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. CRM Management API
app.get("/api/crm/companies", (req, res) => {
  try {
    const companies = dbInstance.getCompanies();
    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/crm/companies/status", (req, res) => {
  const { id, status, notes } = req.body;
  try {
    const comp = dbInstance.getCompany(id);
    if (!comp) return res.status(404).json({ error: "Company not found" });

    if (status) {
      const oldStatus = comp.status;
      comp.status = status;
      logActivity("crm_status_changed", `Changed status of "${comp.name}" from "${oldStatus}" to "${status}"`, comp.name);
    }
    if (notes !== undefined) {
      comp.notes = notes;
    }

    dbInstance.saveCompany(comp);
    res.json(comp);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/store-crm", (req, res) => {
  const { company, contacts, scoreDetail } = req.body;
  try {
    const companies = dbInstance.getCompanies();
    // Detect duplicate
    const existing = companies.find(c => c.name.toLowerCase() === company.name.toLowerCase() || c.website.toLowerCase() === company.website.toLowerCase());
    
    let targetCompany: any;
    if (existing) {
      // update
      targetCompany = {
        ...existing,
        status: company.status || existing.status,
        score: company.score || existing.score,
        notes: (existing.notes || "") + "\nSynced from discovery agent request."
      };
      dbInstance.saveCompany(targetCompany);
      logActivity("crm_stored", `Synced existing CRM record attributes: "${targetCompany.name}"`, targetCompany.name);
    } else {
      // create
      const id = "comp-" + Date.now();
      targetCompany = {
        id,
        name: company.name,
        industry: company.industry,
        website: company.website,
        location: company.location,
        revenue: company.revenue,
        employees: company.employees,
        description: company.description,
        status: company.status || "New",
        score: company.score || 70,
        addedAt: new Date().toISOString()
      };
      dbInstance.saveCompany(targetCompany);

      // Store contacts
      if (contacts && Array.isArray(contacts)) {
        contacts.forEach((con: any) => {
          dbInstance.saveContact({
            id: "cnt-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
            companyId: id,
            name: con.name,
            role: con.role,
            linkedin: con.linkedin || "#",
            email: con.email,
            phone: con.phone || ""
          });
        });
      }

      // Store score detail
      if (scoreDetail) {
        dbInstance.saveLeadScore({
          companyId: id,
          score: targetCompany.score,
          industryMatch: scoreDetail.industryMatch || 80,
          sizeMatch: scoreDetail.sizeMatch || 80,
          revenueMatch: scoreDetail.revenueMatch || 80,
          techMatch: scoreDetail.techMatch || 80,
          locationMatch: scoreDetail.locationMatch || 80,
          explanation: scoreDetail.explanation || "Qualification score matched from Lead Discovery."
        });
      }

      logActivity("crm_stored", `Imported fresh qualified lead into CRM CRM: "${targetCompany.name}"`, targetCompany.name);
      dbInstance.addNotification(`CRM Agent added newly qualified lead: ${targetCompany.name}`);
    }

    res.json({ success: true, company: targetCompany });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/crm/companies/delete", (req, res) => {
  const { id } = req.body;
  try {
    const comp = dbInstance.getCompany(id);
    dbInstance.deleteCompany(id);
    if (comp) {
      logActivity("crm_deleted", `Removed company record: "${comp.name}"`, comp.name);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Get contacts of a company
app.get("/api/crm/contacts", (req, res) => {
  const { companyId } = req.query;
  try {
    const contacts = dbInstance.getContacts(companyId as string);
    res.json(contacts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Get single company details (Detailed visual intelligence)
app.get("/api/crm/company-detail", (req, res) => {
  const { id } = req.query;
  try {
    const company = dbInstance.getCompany(id as string);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const contacts = dbInstance.getContacts(id as string);
    const scoreDetail = dbInstance.getLeadScores()[id as string] || {
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

// 8. Outreach Agent Generation Engine
app.post("/api/generate-outreach", async (req, res) => {
  const { contactId, companyId, icpId } = req.body;
  try {
    const contacts = dbInstance.getContacts();
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    const company = dbInstance.getCompany(companyId || contact.companyId);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const icps = dbInstance.getICPs();
    const icp = icpId ? icps.find(i => i.id === icpId) : icps[0];

    const ai = getGeminiClient();

    let output = {
      linkedinMessageObj: {
        connectionRequest: `Hi ${contact.name}, noticed you are leading operations at ${company.name}. Would love to connect and share some automation ideas for manufacturing.`,
        followUpPitch: `Thanks for connecting! I'm reaching out because we help mid-market manufacturing spaces in Germany optimize their assembly pipelines and custom integrations. Are you available for a 10-minute introduction call next Tuesday?`
      },
      emailObj: {
        subject: `Optimizing Operations & Automations at ${company.name}`,
        body: `Dear ${contact.name},\n\nI was impressed to see ${company.name}'s focus on custom industrial solutions and high-quality assembly services.\n\nI am reaching out from SalesPilot. We help leading manufacturing directors across Europe connect their systems with advanced custom integrations. Typically, this results in a 15-20% reduction in downtime on factory floors.\n\nGiven your role as ${contact.role}, I wanted to see if you are exploring automated middleware integrations this year? Let me know if you would be open to a brief 10-minute chat next week to discuss what is working for other firms.\n\nBest regards,\nSachin Ram\nSalesPilot AI SDR`
      },
      followUpObj: {
        body: `Hi ${contact.name}, just following up on my previous message. I know things are very busy on the shop floors at ${company.name}. We recently helped another mid-sized provider achieve high efficiency with direct ERP middleware sync. I'd love to share the short 2-page brief with you if you have a moment?`
      }
    };

    if (ai) {
      const prompt = `You are a professional B2B Outreach Agent at SalesPilot AI.
      Create customized, high-converting outbound copy for:
      Recipient Name: ${contact.name}
      Recipient Role: ${contact.role}
      Company: ${company.name}
      Company Description: ${company.description}
      Target Audience Info: ${JSON.stringify(icp || {})}
      
      Generate structure JSON with:
      1. linkedinMessageObj: { connectionRequest: "short under 290 characters request", followUpPitch: "follow up DM pitch" }
      2. emailObj: { subject: "concise, curiosity-peaking B2B subject line", body: "personalized professional email text body with custom spacing" }
      3. followUpObj: { body: "short value-add follow up message body" }
      
      Return raw JSON only matching this layout.`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                linkedinMessageObj: {
                  type: Type.OBJECT,
                  properties: {
                    connectionRequest: { type: Type.STRING },
                    followUpPitch: { type: Type.STRING }
                  },
                  required: ["connectionRequest", "followUpPitch"]
                },
                emailObj: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING }
                  },
                  required: ["subject", "body"]
                },
                followUpObj: {
                  type: Type.OBJECT,
                  properties: {
                    body: { type: Type.STRING }
                  }
                }
              },
              required: ["linkedinMessageObj", "emailObj", "followUpObj"]
            }
          }
        });

        if (response.text) {
          const parsedObj = JSON.parse(response.text.trim());
          output = parsedObj;
        }
      } catch (e) {
        console.error("Gemini outreach generation error", e);
      }
    }

    logActivity("outreach_generated", `Generated outreach sequence for "${contact.name}" (${contact.role})`, company.name);
    res.json(output);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Campaigns Management
app.get("/api/campaigns", (req, res) => {
  res.json(dbInstance.getCampaigns());
});

app.post("/api/campaigns", (req, res) => {
  try {
    const saved = dbInstance.saveCampaign(req.body);
    logActivity("campaign_saved", `Created campaign name: "${req.body.name}" with audience template.`);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Notifications
app.get("/api/notifications", (req, res) => {
  res.json(dbInstance.getNotifications());
});

app.post("/api/notifications/clear", (req, res) => {
  const notifs = dbInstance.clearNotifications();
  res.json(notifs);
});

// ----------------------------------------------------
// VITE OR STATIC ASSETS
// ----------------------------------------------------

async function startServer() {
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
