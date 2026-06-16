import { mockCompanies } from "../mockCompanies";
import { leadQualificationAgent } from "./LeadQualificationAgent";
import { outreachAgent } from "./OutreachAgent";
import { crmAgent } from "./CRMAgent";
import * as db from "../db";

export interface MockOutreachResult {
  companyName: string;
  email: string;
  leadScore: number;
  leadStatus: "Hot" | "Warm" | "Cold";
  subject: string;
  emailBody: string;
  sentStatus: "Success" | "Failed";
  sentTimestamp: string;
}

export class MockOutreachWorkflow {
  async runWorkflow(addLog: (message: string) => void): Promise<MockOutreachResult[]> {
    addLog(`Starting Mock Outreach Workflow for ${mockCompanies.length} companies...`);
    const results: MockOutreachResult[] = [];

    // Get an ICP preset to qualify against
    const icps = await db.getICPs();
    const activeIcp = icps[0] || {
      industry: "Manufacturing",
      country: "Germany",
      companySize: "200-500",
      revenueRange: "> $10M"
    };

    for (const company of mockCompanies) {
      addLog(`Processing pipeline for "${company.companyName}"...`);

      // 1. Lead Qualification Step
      // Convert MockCompany properties to the format expected by LeadQualificationAgent
      const evalCompany = {
        name: company.companyName,
        industry: company.industry,
        website: company.website,
        location: company.location,
        employees: company.employeeCount,
        description: company.description,
        revenue: "$10M - $50M"
      };

      const scoreDetail = await leadQualificationAgent.scoreLead(
        evalCompany,
        activeIcp,
        (msg) => addLog(`[Qualify] ${msg}`)
      );

      // Determine Lead Status based on score
      let leadStatus: "Hot" | "Warm" | "Cold" = "Cold";
      if (scoreDetail.score >= 80) {
        leadStatus = "Hot";
      } else if (scoreDetail.score >= 50) {
        leadStatus = "Warm";
      }

      // Map Lead Status to CRM Stage
      let crmStatus = "New";
      if (leadStatus === "Hot") crmStatus = "Qualified";
      else if (leadStatus === "Warm") crmStatus = "Contacted";
      else crmStatus = "Lost";

      // 2. Outreach Agent Step
      // Call outreach generation using company, contact, and ICP details
      const outreachSeq = await outreachAgent.generateOutreach({
        company: evalCompany,
        contact: { name: "Prospect Contact", role: "Decision Maker" },
        icp: activeIcp
      });

      const subject = outreachSeq.emailObj.subject;
      const emailBody = outreachSeq.emailObj.body;

      // 3. Email Sending Module (Simulated)
      // Force sending to sachinram6363@gmail.com as requested
      const targetEmail = "sachinram6363@gmail.com";
      addLog(`[Email Sender] Dispatching personalized email to "${targetEmail}" (subject: "${subject}")...`);
      const sentStatus = "Success"; // Simulating successful delivery
      const sentTimestamp = new Date().toISOString();

      // 4. CRM Onboarding & Duplicate Detection
      // Store lead in CRM using CRMAgent (which triggers the DuplicateDetectionAgent automatically)
      addLog(`[CRM Agent] Synced CRM lead state for "${company.companyName}"...`);
      await crmAgent.storeLead({
        company: {
          ...evalCompany,
          score: scoreDetail.score,
          status: crmStatus,
          notes: `Mock outreach sent on ${new Date().toLocaleDateString()}. Status: ${leadStatus}.`
        },
        contacts: [
          {
            name: "Decision Maker",
            role: "Executive",
            email: targetEmail,
            linkedin: "#"
          }
        ],
        scoreDetail,
        addLog: (msg) => addLog(`[CRM Sync] ${msg}`)
      });

      // 5. Track Email Activity
      // Store the specific email activity parameters inside db activities log as requested
      const activityPayload = {
        companyName: company.companyName,
        email: targetEmail,
        leadScore: scoreDetail.score,
        leadStatus: leadStatus,
        subject,
        emailBody,
        sentStatus,
        sentTimestamp
      };

      await db.addActivity(
        "email_sent",
        `Outreach email successfully sent to ${targetEmail}. Subject: "${subject}". Status: ${leadStatus} (Score: ${scoreDetail.score})`,
        "sachinram6363@gmail.com",
        company.companyName
      );

      // Save in notifications feed to raise dashboard alerts
      await db.addNotification(`Mock Outreach Workflow sent ${leadStatus} email to ${company.companyName}`);

      results.push({
        companyName: company.companyName,
        email: targetEmail,
        leadScore: scoreDetail.score,
        leadStatus,
        subject,
        emailBody,
        sentStatus,
        sentTimestamp
      });
    }

    addLog(`Workflow completed! Processed ${results.length} companies.`);
    return results;
  }
}

export const mockOutreachWorkflow = new MockOutreachWorkflow();
