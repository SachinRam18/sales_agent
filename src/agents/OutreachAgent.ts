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
  day1Email?: string;
  day3Email?: string;
  day7Email?: string;
  day14Email?: string;
  callScript?: string;
  personalOpeningLine?: string;
  meetingRequest?: string;
  valueProposition?: string;
  subjectVariants?: string[];
  ctaVariants?: string[];
  objectionHandling?: Array<{ objection: string; response: string }>;
  executiveIntelligence?: {
    seniority: string;
    department: string;
    buyingInfluence: "High" | "Medium" | "Low";
    painPoints: string[];
    interestAreas: string[];
    outreachAngle: string;
    likelihoodToRespond: "High" | "Medium" | "Low";
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
        body: `Hi ${contactName}, just following up on my previous note. I know things move fast at ${companyName}. I recently put together a short 2-page brief on how modern ${company.industry || "companies"} are leveraging AI SDR workflows to hit pipeline targets faster — happy to share if relevant?`
      },
      day1Email: `Dear ${contactName},\n\nI wanted to share a brief case study on how we helped another ${company.industry || "similar"} company reduce manual prospecting time by 60% using automated SDR workflows.\n\nWould you have 5 minutes this Thursday at 10 AM to discuss if this fits ${companyName}?`,
      day3Email: `Hi ${contactName},\n\nI know you're busy leading the team. Just wanted to see if you had a chance to read my previous email about optimizing sales outreach.\n\nLet me know if we can connect briefly.`,
      day7Email: `Dear ${contactName},\n\nSince I haven't heard back, I assume sales pipeline optimization isn't a top priority for ${companyName} right now. That's completely fine!\n\nIf anything changes, feel free to reach out.`,
      day14Email: `Hi ${contactName},\n\nOne last try — I thought you might appreciate this list of the top 3 tools modern sales teams are using to automate data enrichment and qualification.\n\nWishing you and ${companyName} the best!`,
      callScript: `SDR: "Hi ${contactName}, this is Sachin from SalesPilot. I noticed your team at ${companyName} is working with ${company.industry || "modern systems"} and wanted to see if you are looking to automate lead discovery and enrich contacts automatically. Do you have 2 minutes to chat?"`,
      personalOpeningLine: `Hi ${contactName}, congratulations on your impressive role as ${contactRole} at ${companyName}.`,
      meetingRequest: `Would you be open to a quick 10-minute introduction call next Tuesday at 2 PM?`,
      valueProposition: `We help ${company.industry || "B2B"} companies automate lead sourcing and contact validation directly into their CRM, boosting output by 3x.`,
      subjectVariants: [
        `Improving prospecting efficiency at ${companyName}`,
        `Quick question regarding sales stack at ${companyName}`,
        `Automated lead discovery for modern SDRs`
      ],
      ctaVariants: [
        `Are you open to a brief call this week?`,
        `Would you like me to send a 2-page brief?`,
        `Can we connect for 5 minutes?`
      ],
      objectionHandling: [
        { objection: "We already have an in-house tool or database.", response: "That's great! SalesPilot actually integrates directly with existing lists to automatically clean and profile websites in real-time, saving hours of manual cleanup." },
        { objection: "No budget this quarter.", response: "No worries at all. I'd still love to share our free sandbox trial so you can see the data accuracy first-hand before your next planning cycle." }
      ],
      executiveIntelligence: {
        seniority: contactRole.toLowerCase().includes("vp") || contactRole.toLowerCase().includes("chief") || contactRole.toLowerCase().includes("director") ? "Senior Executive" : "Manager / Specialist",
        department: contactRole.toLowerCase().includes("sales") || contactRole.toLowerCase().includes("marketing") || contactRole.toLowerCase().includes("business") ? "Sales & Growth" : "Engineering / Operations",
        buyingInfluence: contactRole.toLowerCase().includes("vp") || contactRole.toLowerCase().includes("chief") ? "High" : "Medium",
        painPoints: [
          "Manual lead qualification bottlenecks",
          "Duplicate entries and inaccurate contact info in CRM"
        ],
        interestAreas: [
          "Sales efficiency gains",
          "Automated contact list validation"
        ],
        outreachAngle: `Leverage their role as ${contactRole} to discuss direct ROI and pipeline time savings.`,
        likelihoodToRespond: "Medium"
      }
    };

    if (!isAIEnabled()) {
      await db.addActivity("outreach_generated", `Generated outreach sequence for "${contactName}" (${contactRole}) at ${companyName}`, "sachinram6363@gmail.com", companyName);
      return fallback;
    }

    const prompt = `You are a professional B2B Outreach Agent at SalesPilot AI.
Generate personalized, high-converting outbound sales copy and executive profiles for this exact recipient:

Contact Name: ${contactName}
Contact Role: ${contactRole}
Company: ${companyName}
Industry: ${company.industry || "Unknown"}
Company Description: ${company.description || "A growing business."}
Location: ${company.location || "Unknown"}
ICP Context: ${JSON.stringify(icp || {}, null, 2)}

Create an outreach package returning ONLY valid JSON.
Fields required:
{
  "linkedinMessageObj": {
    "connectionRequest": "Friendly, personalized connection request under 290 chars",
    "followUpPitch": "Soft value-focused DM pitch under 500 chars"
  },
  "emailObj": {
    "subject": "Clear, curiosity-peaking subject line",
    "body": "Personalized 3-paragraph cold email body"
  },
  "followUpObj": {
    "body": "Simple reference follow-up email body"
  },
  "day1Email": "Day 1 follow-up email body, value-heavy",
  "day3Email": "Day 3 follow-up email body, checking in",
  "day7Email": "Day 7 follow-up email body, breakup/soft pitch",
  "day14Email": "Day 14 follow-up email body, final utility offering",
  "callScript": "Short SDR call script starting with intro, hooks and questions",
  "personalOpeningLine": "One-sentence personalized opener based on company/role",
  "meetingRequest": "Short, low-friction meeting request call-to-action",
  "valueProposition": "1-sentence value statement tailored to company space",
  "subjectVariants": ["Variant Subject 1", "Variant Subject 2", "Variant Subject 3"],
  "ctaVariants": ["Variant CTA 1", "Variant CTA 2", "Variant CTA 3"],
  "objectionHandling": [
    { "objection": "We already have tools", "response": "Objection handling response" },
    { "objection": "No budget", "response": "Budget objection handling response" }
  ],
  "executiveIntelligence": {
    "seniority": "Seniority level of contact",
    "department": "Department of contact",
    "buyingInfluence": "High, Medium, or Low",
    "painPoints": ["Pain point 1", "Pain point 2"],
    "interestAreas": ["Interest area 1", "Interest area 2"],
    "outreachAngle": "Outreach messaging angle recommendation",
    "likelihoodToRespond": "High, Medium, or Low"
  }
}`;

    try {
      const result = await generateJSON(prompt, null, 3000);
      if (result && result.linkedinMessageObj && result.emailObj && result.followUpObj && result.day1Email) {
        await db.addActivity("outreach_generated", `AI-generated outreach sequence for "${contactName}" (${contactRole}) at ${companyName}`, "sachinram6363@gmail.com", companyName);
        return {
          ...fallback,
          ...result
        };
      }
    } catch (e: any) {
      console.error("[OutreachAgent] AI generation failed, using template copy:", e.message);
    }

    await db.addActivity("outreach_generated", `Generated outreach (template) for "${contactName}" at ${companyName}`, "sachinram6363@gmail.com", companyName);
    return fallback;
  }
}

export const outreachAgent = new OutreachAgent();
