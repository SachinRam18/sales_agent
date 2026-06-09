import { generateJSON, isAIEnabled } from "../ai";
import * as db from "../db";

export interface OutreachSequence {
  linkedinMessageObj: {
    connectionRequest: string;
    followUpPitch: string;
  };
  emailObj: {
    subject: string;
    body: string;
  };
  followUpObj: {
    body: string;
  };
}

export class OutreachAgent {
  async generateOutreach(params: {
    contact: any;
    company: any;
    icp?: any;
  }): Promise<OutreachSequence> {
    const { contact, company, icp } = params;

    const contactName = contact.name || "there";
    const contactRole = contact.role || contact.job_title || "Executive";
    const companyName = company.name || "your company";

    // Default copy (used as fallback or when AI is not configured)
    const fallback: OutreachSequence = {
      linkedinMessageObj: {
        connectionRequest: `Hi ${contactName}, I noticed your work at ${companyName} and would love to connect to discuss how we help similar ${company.industry || "companies"} optimize their sales pipelines.`,
        followUpPitch: `Thanks for connecting! We help ${company.industry || "mid-market"} teams like ${companyName} reduce manual prospecting by 60% with AI-powered lead workflows. Would a quick 10-min call this week work?`
      },
      emailObj: {
        subject: `Streamlining Sales Operations at ${companyName}`,
        body: `Dear ${contactName},\n\nI came across ${companyName} and was impressed by your position as a leader in ${company.industry || "the industry"}.\n\nAt SalesPilot AI, we help ${company.industry || "companies"} automate prospecting, qualify leads faster, and generate personalized outreach at scale. Teams in your space typically see a 3x improvement in outreach response rates within the first 60 days.\n\nGiven your role as ${contactRole}, I'd love to share how we have helped similar organizations. Would you be open to a quick 15-minute call this week?\n\nBest regards,\nSachin Ram\nSalesPilot AI`
      },
      followUpObj: {
        body: `Hi ${contactName}, just following up on my previous note. I know things move fast at ${companyName}. I recently put together a short 2-page brief on how similar ${company.industry || "companies"} are leveraging AI SDR workflows to hit pipeline targets faster — happy to share if relevant?`
      }
    };

    if (!isAIEnabled()) {
      await db.addActivity("outreach_generated", `Generated outreach sequence for "${contactName}" (${contactRole}) at ${companyName}`, "sachinram6363@gmail.com", companyName);
      return fallback;
    }

    const prompt = `You are a professional B2B Outreach Agent at SalesPilot AI.
Generate personalized, high-converting outbound sales copy for this exact recipient:

Contact Name: ${contactName}
Contact Role: ${contactRole}
Company: ${companyName}
Industry: ${company.industry || "Unknown"}
Company Description: ${company.description || "A growing business."}
Location: ${company.location || "Unknown"}
ICP Context: ${JSON.stringify(icp || {}, null, 2)}

Create 3 outreach assets:
1. A LinkedIn connection request (under 290 characters, friendly and specific)
2. A LinkedIn follow-up DM pitch (after connecting, value-focused, under 500 characters)
3. A cold email subject line (curiosity-peaking, specific to their role/company)
4. A cold email body (professional, personalized, 3 short paragraphs, end with a soft CTA)
5. A follow-up email body (short, value-add angle, reference previous email)

Return ONLY valid JSON with no markdown or extra text:
{
  "linkedinMessageObj": {
    "connectionRequest": "...",
    "followUpPitch": "..."
  },
  "emailObj": {
    "subject": "...",
    "body": "..."
  },
  "followUpObj": {
    "body": "..."
  }
}`;

    try {
      const result = await generateJSON(prompt);
      if (result && result.linkedinMessageObj && result.emailObj && result.followUpObj) {
        await db.addActivity("outreach_generated", `AI-generated outreach sequence for "${contactName}" (${contactRole}) at ${companyName}`, "sachinram6363@gmail.com", companyName);
        return result as OutreachSequence;
      }
    } catch (e: any) {
      console.error("[OutreachAgent] AI generation failed, using template copy:", e.message);
    }

    await db.addActivity("outreach_generated", `Generated outreach (template) for "${contactName}" at ${companyName}`, "sachinram6363@gmail.com", companyName);
    return fallback;
  }
}

export const outreachAgent = new OutreachAgent();
