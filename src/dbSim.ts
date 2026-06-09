import fs from "fs";
import path from "path";

// DB file path
const DB_FILE = path.join(process.cwd(), "db_store.json");

export interface User {
  email: string;
  name: string;
  role: "Admin" | "Team Member" | "Viewer";
}

export interface ICPProfile {
  id: string;
  name: string;
  industry: string;
  country: string;
  companySize: string; // e.g. "200-500"
  revenueRange: string; // e.g. "> $10M"
  technologiesUsed: string; // e.g. "SAP, Salesforce"
  keywords: string;
  departments: string;
  jobTitles: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  location: string;
  revenue: string;
  employees: number;
  description: string;
  status: "New" | "Qualified" | "Contacted" | "Meeting Scheduled" | "Converted" | "Lost";
  score: number;
  addedAt: string;
  notes?: string;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  role: string;
  linkedin: string;
  email: string;
  phone: string;
}

export interface LeadScore {
  companyId: string;
  score: number;
  industryMatch: number;
  sizeMatch: number;
  revenueMatch: number;
  techMatch: number;
  locationMatch: number;
  explanation: string;
}

export interface Campaign {
  id: string;
  name: string;
  audience: string;
  template: string;
  schedule: string;
  sentCount: number;
  openRate: number;
  replyRate: number;
  conversionRate: number;
  status: "Active" | "Paused" | "Completed";
  createdAt: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userEmail: string;
  companyName?: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface DatabaseSchema {
  users: User[];
  icpProfiles: ICPProfile[];
  companies: Company[];
  contacts: Contact[];
  leadScores: Record<string, LeadScore>;
  campaigns: Campaign[];
  activities: Activity[];
  notifications: Notification[];
}

const DEFAULT_DB: DatabaseSchema = {
  users: [
    { email: "sachinram6363@gmail.com", name: "Sachin Ram", role: "Admin" },
    { email: "team@company.com", name: "Alex Mercer", role: "Team Member" },
    { email: "viewer@company.com", name: "Sarah Connor", role: "Viewer" }
  ],
  icpProfiles: [
    {
      id: "icp-1",
      name: "German Manufacturing Leader",
      industry: "Manufacturing",
      country: "Germany",
      companySize: "200-500",
      revenueRange: "> $10M",
      technologiesUsed: "SAP, Siemens MindSphere, Salesforce",
      keywords: "Machinery, Automation, Industry 4.0, Logistics",
      departments: "Engineering, Operations, Procurement",
      jobTitles: "VP Operations, Head of Automation, Chief Procurement Officer"
    },
    {
      id: "icp-2",
      name: "US SaaS Series A/B",
      industry: "Software / SaaS",
      country: "United States",
      companySize: "50-200",
      revenueRange: "> $5M",
      technologiesUsed: "React, Stripe, HubSpot, AWS",
      keywords: "Sales automation, Marketing analytics, Artificial intelligence",
      departments: "Sales, Business Development, Engineering",
      jobTitles: "VP Sales, Head of Business Development, Sales Director"
    }
  ],
  companies: [
    {
      id: "comp-1",
      name: "Schulz Maschinenbau GmbH",
      industry: "Manufacturing",
      website: "https://www.schulz-maschinenbau.de",
      location: "Stuttgart, Germany",
      revenue: "$45M",
      employees: 340,
      description: "Manufacturer of custom industrial automated machinery and robotic assembly lines for the automotive industry.",
      status: "Qualified",
      score: 95,
      addedAt: "2026-06-01T10:00:00Z",
      notes: "Met via initial email. Interested in automated ERP sync. They are currently planning to upgrade their factory floors by Q4 2026."
    },
    {
      id: "comp-2",
      name: "Müller & Söhne Automation",
      industry: "Manufacturing",
      website: "https://www.mueller-sons-automation.de",
      location: "Munich, Germany",
      revenue: "$28M",
      employees: 220,
      description: "Provides high-precision sensors, PLC assemblies, and smart industrial measurement integrations for EU markets.",
      status: "New",
      score: 89,
      addedAt: "2026-06-03T14:30:00Z",
      notes: "Enriched. Buying signal detected: Recently hired 3 control system engineers."
    },
    {
      id: "comp-3",
      name: "Summit Logistics Solutions",
      industry: "Logistics",
      website: "https://www.summitlogistics.com",
      location: "Chicago, USA",
      revenue: "$75M",
      employees: 450,
      description: "Third-party logistics operator specializing in temp-controlled pharmaceutical transport and predictive cargo tracking.",
      status: "Contacted",
      score: 72,
      addedAt: "2026-06-05T09:15:00Z",
      notes: "LinkedIn outreach sequence standard started."
    },
    {
      id: "comp-4",
      name: "Zeta Analytics Corporation",
      industry: "Software / SaaS",
      website: "https://www.zetaanalytics.com",
      location: "Austin, USA",
      revenue: "$14M",
      employees: 120,
      description: "Cloud-native visual analytics platform designed to aggregate multi-channel ad spend recommendations via heuristic algorithms.",
      status: "Meeting Scheduled",
      score: 92,
      addedAt: "2026-06-07T11:00:00Z"
    }
  ],
  contacts: [
    {
      id: "cnt-1",
      companyId: "comp-1",
      name: "Hans Schulz",
      role: "Managing Director",
      linkedin: "https://linkedin.com/in/hans-schulz-mock",
      email: "h.schulz@schulz-maschinenbau.de",
      phone: "+49 711 500223"
    },
    {
      id: "cnt-2",
      companyId: "comp-1",
      name: "Dieter Brand",
      role: "Chief of Operations",
      linkedin: "https://linkedin.com/in/dieter-brand-mock",
      email: "d.brand@schulz-maschinenbau.de",
      phone: "+49 711 500224"
    },
    {
      id: "cnt-3",
      companyId: "comp-2",
      name: "Erich Müller",
      role: "VP Engineering",
      linkedin: "https://linkedin.com/in/erich-mueller-mock",
      email: "e.mueller@mueller-sons-automation.de",
      phone: "+49 89 224411"
    },
    {
      id: "cnt-4",
      companyId: "comp-3",
      name: "Marcus Vance",
      role: "VP Supply Chain",
      linkedin: "https://linkedin.com/in/marcus-vance-mock",
      email: "m.vance@summitlogistics.com",
      phone: "+1 312 555 0192"
    },
    {
      id: "cnt-5",
      companyId: "comp-4",
      name: "Nora Gilcrest",
      role: "VP Marketing & Sales",
      linkedin: "https://linkedin.com/in/nora-gilcrest-mock",
      email: "n.gilcrest@zetaanalytics.com",
      phone: "+1 512 555 3302"
    }
  ],
  leadScores: {
    "comp-1": {
      companyId: "comp-1",
      score: 95,
      industryMatch: 100,
      sizeMatch: 95,
      revenueMatch: 95,
      techMatch: 90,
      locationMatch: 100,
      explanation: "Excellent industry fit (German Manufacturing). Employee count of 340 is securely in target and revenue range of $45M exceeds the minimum ICP threshold. They utilize SAP, perfect match for our operation middleware integrations."
    },
    "comp-2": {
      companyId: "comp-2",
      score: 89,
      industryMatch: 100,
      sizeMatch: 90,
      revenueMatch: 85,
      techMatch: 75,
      locationMatch: 100,
      explanation: "Superb location and industry match. Revenue is healthy ($28M) and within scope. Technologies used could represent lower complexity, but growth signals are highly active."
    }
  },
  campaigns: [
    {
      id: "camp-1",
      name: "German Machinery Auto-Pilot Outreach",
      audience: "German Manufacturing Leader",
      template: "Automation Solutions & Efficiency",
      schedule: "Mon-Fri, 9:00 AM CET",
      sentCount: 42,
      openRate: 68.2,
      replyRate: 24.5,
      conversionRate: 11.9,
      status: "Active",
      createdAt: "2026-06-02T08:00:00Z"
    },
    {
      id: "camp-2",
      name: "US SaaS Tech Stack Integrations",
      audience: "US SaaS Series A/B",
      template: "Outreach CRM Sync Personalized Pitch",
      schedule: "Tuesday & Thursday",
      sentCount: 18,
      openRate: 55.5,
      replyRate: 15.0,
      conversionRate: 5.5,
      status: "Active",
      createdAt: "2026-06-05T15:00:00Z"
    }
  ],
  activities: [
    {
      id: "act-1",
      type: "lead_discovered",
      description: "Discovered and qualified Schulz Maschinenbau GmbH based on 'German Manufacturing' ICP profile.",
      timestamp: "2026-06-01T10:05:00Z",
      userEmail: "sachinram6363@gmail.com",
      companyName: "Schulz Maschinenbau GmbH"
    },
    {
      id: "act-2",
      type: "outreach_generated",
      description: "Generated email pitch for Hans Schulz regarding executive operations middleware optimization.",
      timestamp: "2026-06-01T10:11:00Z",
      userEmail: "sachinram6363@gmail.com",
      companyName: "Schulz Maschinenbau GmbH"
    },
    {
      id: "act-3",
      type: "crm_stored",
      description: "Stored Müller & Söhne Automation in CRM with status 'New' and score 89.",
      timestamp: "2026-06-03T14:32:00Z",
      userEmail: "sachinram6363@gmail.com",
      companyName: "Müller & Söhne Automation"
    }
  ],
  notifications: [
    {
      id: "notif-1",
      message: "Lead Discovery Agent completed qualification for Müller & Söhne Automation (Score: 89)",
      read: false,
      timestamp: "2026-06-03T14:31:00Z"
    },
    {
      id: "notif-2",
      message: "New booking signal detected for Schulz Maschinenbau (German Manufacturing)",
      read: true,
      timestamp: "2026-06-01T11:45:00Z"
    }
  ]
};

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = { ...DEFAULT_DB };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (e) {
      console.warn("Could not load database file, using in-memory store", e);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Could not write to database file", e);
    }
  }

  getSchema(): DatabaseSchema {
    return this.data;
  }

  getUsers(): User[] {
    return this.data.users;
  }

  registerUser(name: string, email: string, role: "Admin" | "Team Member" | "Viewer" = "Team Member") {
    const existing = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return existing;
    const user: User = { name, email, role };
    this.data.users.push(user);
    this.save();
    return user;
  }

  getICPs(): ICPProfile[] {
    return this.data.icpProfiles;
  }

  saveICP(icp: Omit<ICPProfile, "id"> & { id?: string }) {
    if (icp.id) {
      const idx = this.data.icpProfiles.findIndex(i => i.id === icp.id);
      if (idx !== -1) {
        this.data.icpProfiles[idx] = icp as ICPProfile;
      }
    } else {
      const newIcp: ICPProfile = {
        ...icp,
        id: "icp-" + Date.now()
      };
      this.data.icpProfiles.push(newIcp);
    }
    this.save();
    return this.data.icpProfiles;
  }

  deleteICP(id: string) {
    this.data.icpProfiles = this.data.icpProfiles.filter(i => i.id !== id);
    this.save();
    return this.data.icpProfiles;
  }

  getCompanies(): Company[] {
    return this.data.companies;
  }

  getCompany(id: string) {
    return this.data.companies.find(c => c.id === id);
  }

  saveCompany(company: Company) {
    const idx = this.data.companies.findIndex(c => c.id === company.id);
    if (idx !== -1) {
      this.data.companies[idx] = company;
    } else {
      this.data.companies.push(company);
    }
    this.save();
    return company;
  }

  deleteCompany(id: string) {
    this.data.companies = this.data.companies.filter(c => c.id !== id);
    this.data.contacts = this.data.contacts.filter(con => con.companyId !== id);
    if (this.data.leadScores[id]) {
      delete this.data.leadScores[id];
    }
    this.save();
  }

  getContacts(companyId?: string): Contact[] {
    if (companyId) {
      return this.data.contacts.filter(c => c.companyId === companyId);
    }
    return this.data.contacts;
  }

  saveContact(contact: Contact) {
    const idx = this.data.contacts.findIndex(c => c.id === contact.id);
    if (idx !== -1) {
      this.data.contacts[idx] = contact;
    } else {
      this.data.contacts.push(contact);
    }
    this.save();
    return contact;
  }

  getLeadScores(): Record<string, LeadScore> {
    return this.data.leadScores;
  }

  saveLeadScore(score: LeadScore) {
    this.data.leadScores[score.companyId] = score;
    this.save();
    return score;
  }

  getCampaigns(): Campaign[] {
    return this.data.campaigns;
  }

  saveCampaign(campaign: Omit<Campaign, "id" | "createdAt" | "sentCount" | "openRate" | "replyRate" | "conversionRate" | "status"> & { id?: string }) {
    if (campaign.id) {
      const idx = this.data.campaigns.findIndex(c => c.id === campaign.id);
      if (idx !== -1) {
        this.data.campaigns[idx] = {
          ...this.data.campaigns[idx],
          name: campaign.name,
          audience: campaign.audience,
          template: campaign.template,
          schedule: campaign.schedule
        };
      }
    } else {
      const newCamp: Campaign = {
        ...campaign,
        id: "camp-" + Date.now(),
        createdAt: new Date().toISOString(),
        sentCount: 0,
        openRate: 0,
        replyRate: 0,
        conversionRate: 0,
        status: "Active"
      };
      this.data.campaigns.push(newCamp);
    }
    this.save();
    return this.data.campaigns;
  }

  getActivities(): Activity[] {
    return this.data.activities;
  }

  addActivity(type: string, description: string, userEmail: string, companyName?: string) {
    const activity: Activity = {
      id: "act-" + Date.now() + Math.random().toString(36).substr(2, 4),
      type,
      description,
      timestamp: new Date().toISOString(),
      userEmail,
      companyName
    };
    this.data.activities.unshift(activity);
    
    // limit activities size
    if (this.data.activities.length > 100) {
      this.data.activities.pop();
    }
    
    this.save();
    return activity;
  }

  getNotifications(): Notification[] {
    return this.data.notifications;
  }

  addNotification(message: string) {
    const notif: Notification = {
      id: "notif-" + Date.now(),
      message,
      read: false,
      timestamp: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  clearNotifications() {
    this.data.notifications.forEach(n => n.read = true);
    this.save();
    return this.data.notifications;
  }
}

export const dbInstance = new Database();
