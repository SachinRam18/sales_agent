import { normalizeIndustry } from "../config/IndustryProfiles";

export interface IndustryIntentProfile {
  industry: string;
  discoveryQueries: string[];
  requiredSignals: string[];
  disallowedSignals: string[];
  preferredCompanyTypes: string[];
  entityPatterns: string[];
}

export class IndustryIntentEngine {
  private static readonly PROFILES: Record<string, IndustryIntentProfile> = {
    Healthcare: {
      industry: "Healthcare",
      discoveryQueries: [
        "medical device manufacturers {country}",
        "diagnostic equipment companies {country}",
        "clinical technology companies {country}",
        "healthcare equipment providers {country}",
        "patient monitoring companies {country}",
        "hospital software vendors {country}",
        "medical technology providers {country}",
        "healthcare systems developers {country}",
        "clinical registry platforms {country}"
      ],
      requiredSignals: [
        "medical device",
        "diagnostic",
        "clinical",
        "hospital equipment",
        "patient monitoring",
        "healthcare technology"
      ],
      disallowedSignals: [
        "healthcare marketing",
        "email list",
        "lead generation",
        "agency",
        "consulting",
        "directory"
      ],
      preferredCompanyTypes: ["Medical Device Company", "Healthcare Software Vendor", "Healthcare Provider"],
      entityPatterns: ["hospital", "clinic", "medical", "health"]
    },
    Manufacturing: {
      industry: "Manufacturing",
      discoveryQueries: [
        "machinery manufacturers {country}",
        "industrial automation manufacturers {country}",
        "factory equipment companies {country}",
        "cnc machine manufacturers {country}",
        "precision engineering manufacturers {country}",
        "robotics automation providers {country}",
        "industrial machine builders {country}",
        "factory systems manufacturers {country}"
      ],
      requiredSignals: [
        "machinery",
        "factory",
        "industrial",
        "manufacturing",
        "automation",
        "cnc",
        "engineering"
      ],
      disallowedSignals: [
        "directory",
        "supplier list",
        "marketplace",
        "blog",
        "consulting"
      ],
      preferredCompanyTypes: ["Manufacturer"],
      entityPatterns: ["machinery", "industrial", "cnc", "factory"]
    },
    "Financial Services": {
      industry: "Financial Services",
      discoveryQueries: [
        "fintech companies {country}",
        "payment processing companies {country}",
        "digital banking providers {country}",
        "lending platforms {country}",
        "wealth management technology companies {country}",
        "banking software vendors {country}",
        "financial technology platforms {country}",
        "risk management software providers {country}"
      ],
      requiredSignals: [
        "banking",
        "payments",
        "fintech",
        "lending",
        "investment",
        "risk management"
      ],
      disallowedSignals: [
        "finance news",
        "investment blog",
        "marketing agency",
        "consulting",
        "directory"
      ],
      preferredCompanyTypes: ["Fintech", "Banking Software Vendor", "Financial Institution"],
      entityPatterns: ["bank", "payment", "fintech", "lending"]
    },
    Logistics: {
      industry: "Logistics",
      discoveryQueries: [
        "freight companies {country}",
        "warehouse operators {country}",
        "supply chain providers {country}",
        "transportation companies {country}",
        "fleet management companies {country}",
        "logistics software platforms {country}",
        "freight forwarding services {country}",
        "warehouse automation providers {country}"
      ],
      requiredSignals: [
        "logistics",
        "freight",
        "warehouse",
        "supply chain",
        "transportation",
        "shipping",
        "fleet"
      ],
      disallowedSignals: [
        "marketing",
        "agency",
        "consulting",
        "directory"
      ],
      preferredCompanyTypes: ["Logistics Provider", "Supply Chain Platform"],
      entityPatterns: ["logistics", "freight", "warehouse", "supply chain"]
    },
    SaaS: {
      industry: "SaaS",
      discoveryQueries: [
        "crm software companies {country}",
        "helpdesk software providers {country}",
        "saas product companies {country}",
        "workflow automation platforms {country}",
        "crm software vendors {country}",
        "helpdesk software vendors {country}",
        "workflow platforms {country}",
        "saas products {country}",
        "cloud software companies {country}",
        "customer support software {country}",
        "business automation software {country}",
        "sales enablement software {country}"
      ],
      requiredSignals: [
        "crm",
        "software",
        "platform",
        "saas",
        "automation",
        "workflow"
      ],
      disallowedSignals: [
        "agency",
        "outsourcing",
        "consulting",
        "development services"
      ],
      preferredCompanyTypes: ["CRM Vendor", "Helpdesk Vendor", "SaaS Product", "Software Vendor"],
      entityPatterns: ["software", "platform", "saas", "crm"]
    },
    Industrial: {
      industry: "Industrial",
      discoveryQueries: [
        "industrial machinery manufacturers {country}",
        "factory automation systems {country}",
        "heavy machinery builders {country}",
        "precision tooling companies {country}",
        "industrial component suppliers {country}",
        "manufacturing equipment providers {country}",
        "process automation technology {country}",
        "plant equipment builders {country}"
      ],
      requiredSignals: [
        "industrial",
        "machinery",
        "automation",
        "manufacturing",
        "engineering",
        "equipment",
        "plant"
      ],
      disallowedSignals: [
        "agency",
        "consulting",
        "marketing",
        "directory",
        "list"
      ],
      preferredCompanyTypes: ["Manufacturer", "Supplier", "Industrial Company"],
      entityPatterns: ["machinery", "industrial", "cnc", "tooling"]
    },
    Retail: {
      industry: "Retail",
      discoveryQueries: [
        "retail brands {country}",
        "e-commerce merchants {country}",
        "retail store chains {country}",
        "direct to consumer brands {country}",
        "fashion retail companies {country}",
        "consumer goods retailers {country}",
        "online shopping brands {country}",
        "retail commerce companies {country}"
      ],
      requiredSignals: [
        "retail",
        "e-commerce",
        "store",
        "shop",
        "merchant",
        "brand",
        "retailer"
      ],
      disallowedSignals: [
        "marketing agency",
        "e-commerce consulting",
        "directory",
        "development agency"
      ],
      preferredCompanyTypes: ["Retailer", "E-commerce Brand", "Merchant"],
      entityPatterns: ["retail", "shop", "brand", "store"]
    },
    Education: {
      industry: "Education",
      discoveryQueries: [
        "edtech software platforms {country}",
        "online learning platforms {country}",
        "education technology companies {country}",
        "private university networks {country}",
        "corporate training providers {country}",
        "digital learning solutions {country}",
        "student management software {country}",
        "e-learning technology platforms {country}"
      ],
      requiredSignals: [
        "education",
        "school",
        "university",
        "college",
        "learning",
        "edtech",
        "academy",
        "training"
      ],
      disallowedSignals: [
        "marketing agency",
        "education consultant",
        "directory"
      ],
      preferredCompanyTypes: ["School", "University", "EdTech Platform"],
      entityPatterns: ["school", "university", "academy", "learning", "edtech"]
    },
    "Real Estate": {
      industry: "Real Estate",
      discoveryQueries: [
        "real estate developers {country}",
        "property management platforms {country}",
        "commercial real estate developers {country}",
        "residential property developers {country}",
        "proptech platforms {country}",
        "real estate investment firms {country}",
        "housing development companies {country}",
        "property leasing groups {country}"
      ],
      requiredSignals: [
        "real estate",
        "property",
        "developer",
        "brokerage",
        "housing",
        "apartment",
        "leasing",
        "realtor"
      ],
      disallowedSignals: [
        "real estate agent directory",
        "broker listing",
        "consulting"
      ],
      preferredCompanyTypes: ["Real Estate Developer", "Property Manager", "Real Estate Platform"],
      entityPatterns: ["developer", "property", "real estate", "proptech"]
    },
    Energy: {
      industry: "Energy",
      discoveryQueries: [
        "solar energy developers {country}",
        "wind power operators {country}",
        "utility providers {country}",
        "renewable energy companies {country}",
        "power grid technology providers {country}",
        "clean energy systems {country}",
        "oil and gas producers {country}",
        "energy utility companies {country}"
      ],
      requiredSignals: [
        "energy",
        "solar",
        "wind",
        "renewables",
        "utility",
        "power",
        "grid",
        "oil",
        "gas",
        "electricity"
      ],
      disallowedSignals: [
        "energy consultants",
        "advisory",
        "marketing agency"
      ],
      preferredCompanyTypes: ["Energy Provider", "Utility Company", "Renewables Company"],
      entityPatterns: ["energy", "solar", "power", "utility"]
    },
    Telecommunications: {
      industry: "Telecommunications",
      discoveryQueries: [
        "telecom network operators {country}",
        "broadband internet providers {country}",
        "telecommunication services {country}",
        "wireless carrier companies {country}",
        "telecom equipment vendors {country}",
        "fiber broadband providers {country}",
        "mobile network providers {country}",
        "telecommunication system builders {country}"
      ],
      requiredSignals: [
        "telecom",
        "telecommunications",
        "carrier",
        "broadband",
        "network",
        "wireless",
        "fiber",
        "mobile provider",
        "satellite"
      ],
      disallowedSignals: [
        "marketing",
        "telecom consulting",
        "agency"
      ],
      preferredCompanyTypes: ["Telecom Operator", "Internet Provider", "Telecom Vendor"],
      entityPatterns: ["telecom", "network", "broadband", "carrier"]
    }
  };

  static getProfile(industry: string): IndustryIntentProfile {
    const norm = normalizeIndustry(industry);
    return this.PROFILES[norm] || this.PROFILES["SaaS"];
  }

  static generateDiscoveryQueries(industry: string, country: string, keywords?: string): string[] {
    const profile = this.getProfile(industry);
    const variants: string[] = [];
    const normalizedCountry = country || "";
    
    profile.discoveryQueries.forEach(queryTemplate => {
      let q = queryTemplate
        .replace(/{country}/g, normalizedCountry)
        .trim();
      q = q.replace(/\s+/g, " ");
      variants.push(q);
    });

    return Array.from(new Set(variants));
  }
}
