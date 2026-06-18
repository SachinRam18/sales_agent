export interface IndustryProfile {
  industry: string;
  allowedCompanyTypes: string[];
  positiveSignals: string[];
  negativeSignals: string[];
  discoveryQueries: string[];
  scoringWeights: {
    industry: number;
    industryRelevance: number;
    companyType: number;
    employee: number;
    technology: number;
    geography: number;
    contacts: number;
  };
}

export function normalizeIndustry(industry: string): string {
  const ind = (industry || "").toLowerCase();
  if (ind.includes("saas") || ind.includes("software") || ind.includes("crm") || ind.includes("helpdesk")) {
    return "SaaS";
  }
  if (ind.includes("manufacturing") || ind.includes("machinery") || ind.includes("factory")) {
    return "Manufacturing";
  }
  if (ind.includes("logistics") || ind.includes("supply chain") || ind.includes("shipping") || ind.includes("transport")) {
    return "Logistics";
  }
  if (ind.includes("healthcare") || ind.includes("medical") || ind.includes("hospital") || ind.includes("healthtech")) {
    return "Healthcare";
  }
  if (ind.includes("financ") || ind.includes("fintech") || ind.includes("banking") || ind.includes("investment")) {
    return "Financial Services";
  }
  if (ind.includes("industrial") || ind.includes("cnc") || ind.includes("heavy machinery")) {
    return "Industrial";
  }
  if (ind.includes("retail") || ind.includes("ecommerce") || ind.includes("e-commerce") || ind.includes("shop")) {
    return "Retail";
  }
  if (ind.includes("education") || ind.includes("school") || ind.includes("university") || ind.includes("edtech")) {
    return "Education";
  }
  if (ind.includes("real estate") || ind.includes("property") || ind.includes("brokerage")) {
    return "Real Estate";
  }
  if (ind.includes("energy") || ind.includes("solar") || ind.includes("power") || ind.includes("renewables")) {
    return "Energy";
  }
  if (ind.includes("telecommunication") || ind.includes("telecom") || ind.includes("carrier") || ind.includes("network")) {
    return "Telecommunications";
  }
  return "SaaS"; // Default fallback
}

export const IndustryProfiles: Record<string, IndustryProfile> = {
  SaaS: {
    industry: "SaaS",
    allowedCompanyTypes: [
      "CRM Vendor",
      "Helpdesk Vendor",
      "SaaS Product",
      "Software Vendor"
    ],
    positiveSignals: [
      "crm", "saas", "cloud", "platform", "software", "workflow", "automation", "analytics", "ticketing", "sales", "marketing"
    ],
    negativeSignals: [
      "agency", "consulting", "outsourcing", "software development services"
    ],
    discoveryQueries: [
      "{keywords} SaaS companies {country}",
      "B2B SaaS product companies {country}",
      "{keywords} software providers {country}"
    ],
    scoringWeights: {
      industry: 30,
      industryRelevance: 0,
      companyType: 15,
      employee: 10,
      technology: 25,
      geography: 10,
      contacts: 10
    }
  },
  Manufacturing: {
    industry: "Manufacturing",
    allowedCompanyTypes: [
      "Manufacturer"
    ],
    positiveSignals: [
      "manufacturing", "factory", "machinery", "industrial", "production", "cnc", "engineering"
    ],
    negativeSignals: [
      "agency", "consulting", "marketing", "blog"
    ],
    discoveryQueries: [
      "{keywords} manufacturers {country}",
      "industrial automation {country}",
      "cnc manufacturers {country}"
    ],
    scoringWeights: {
      industry: 30,
      industryRelevance: 0,
      companyType: 15,
      employee: 10,
      technology: 25,
      geography: 10,
      contacts: 10
    }
  },
  Logistics: {
    industry: "Logistics",
    allowedCompanyTypes: [
      "Logistics Provider",
      "Supply Chain Platform"
    ],
    positiveSignals: [
      "logistics", "transportation", "freight", "warehouse", "supply chain", "fleet", "shipping"
    ],
    negativeSignals: [
      "marketing", "consulting"
    ],
    discoveryQueries: [
      "logistics companies {country}",
      "{keywords} platforms {country}"
    ],
    scoringWeights: {
      industry: 30,
      industryRelevance: 0,
      companyType: 15,
      employee: 10,
      technology: 25,
      geography: 10,
      contacts: 10
    }
  },
  Healthcare: {
    industry: "Healthcare",
    allowedCompanyTypes: [
      "Healthcare Provider",
      "Medical Device Company",
      "Healthcare Software Vendor"
    ],
    positiveSignals: [
      "healthcare", "medical", "hospital", "patient", "diagnostics", "clinical", "healthtech"
    ],
    negativeSignals: [
      "marketing agency", "consulting"
    ],
    discoveryQueries: [
      "{keywords} companies {country}",
      "healthcare software companies {country}"
    ],
    scoringWeights: {
      industry: 30,
      industryRelevance: 0,
      companyType: 15,
      employee: 10,
      technology: 25,
      geography: 10,
      contacts: 10
    }
  },
  "Financial Services": {
    industry: "Financial Services",
    allowedCompanyTypes: [
      "Fintech",
      "Banking Software Vendor",
      "Financial Institution"
    ],
    positiveSignals: [
      "finance", "financial", "payments", "banking", "lending", "investment", "fintech"
    ],
    negativeSignals: [
      "agency", "consulting"
    ],
    discoveryQueries: [
      "fintech companies {country}",
      "banking software companies {country}"
    ],
    scoringWeights: {
      industry: 30,
      industryRelevance: 0,
      companyType: 15,
      employee: 10,
      technology: 25,
      geography: 10,
      contacts: 10
    }
  },
  "Industrial": {
    industry: "Industrial",
    allowedCompanyTypes: [
      "Manufacturer",
      "Supplier",
      "Industrial Company"
    ],
    positiveSignals: [
      "industrial", "machinery", "automation", "manufacturing", "engineering", "equipment", "plant"
    ],
    negativeSignals: [
      "agency", "consulting"
    ],
    discoveryQueries: [
      "{keywords} industrial companies {country}",
      "industrial equipment suppliers {country}"
    ],
    scoringWeights: {
      industry: 30,
      industryRelevance: 0,
      companyType: 15,
      employee: 10,
      technology: 25,
      geography: 10,
      contacts: 10
    }
  },
  "Retail": {
    industry: "Retail",
    allowedCompanyTypes: [
      "Retailer",
      "E-commerce Brand",
      "Merchant"
    ],
    positiveSignals: [
      "retail", "e-commerce", "store", "shop", "merchant", "brand", "retailer"
    ],
    negativeSignals: [
      "agency", "consulting", "directory"
    ],
    discoveryQueries: [
      "{keywords} retail brands {country}",
      "e-commerce merchants {country}"
    ],
    scoringWeights: {
      industry: 30,
      industryRelevance: 0,
      companyType: 15,
      employee: 10,
      technology: 25,
      geography: 10,
      contacts: 10
    }
  },
  "Education": {
    industry: "Education",
    allowedCompanyTypes: [
      "School",
      "University",
      "EdTech Platform"
    ],
    positiveSignals: [
      "education", "school", "university", "college", "learning", "edtech", "academy", "training"
    ],
    negativeSignals: [
      "agency", "consulting"
    ],
    discoveryQueries: [
      "{keywords} education institutions {country}",
      "edtech companies {country}"
    ],
    scoringWeights: {
      industry: 30,
      industryRelevance: 0,
      companyType: 15,
      employee: 10,
      technology: 25,
      geography: 10,
      contacts: 10
    }
  },
  "Real Estate": {
    industry: "Real Estate",
    allowedCompanyTypes: [
      "Real Estate Developer",
      "Property Manager",
      "Real Estate Platform"
    ],
    positiveSignals: [
      "real estate", "property", "developer", "brokerage", "housing", "apartment", "leasing", "realtor"
    ],
    negativeSignals: [
      "agency", "consulting"
    ],
    discoveryQueries: [
      "{keywords} real estate developers {country}",
      "property management companies {country}"
    ],
    scoringWeights: {
      industry: 30,
      industryRelevance: 0,
      companyType: 15,
      employee: 10,
      technology: 25,
      geography: 10,
      contacts: 10
    }
  },
  "Energy": {
    industry: "Energy",
    allowedCompanyTypes: [
      "Energy Provider",
      "Utility Company",
      "Renewables Company"
    ],
    positiveSignals: [
      "energy", "solar", "wind", "renewables", "utility", "power", "grid", "oil", "gas", "electricity"
    ],
    negativeSignals: [
      "agency", "consulting"
    ],
    discoveryQueries: [
      "{keywords} energy companies {country}",
      "utility providers {country}"
    ],
    scoringWeights: {
      industry: 30,
      industryRelevance: 0,
      companyType: 15,
      employee: 10,
      technology: 25,
      geography: 10,
      contacts: 10
    }
  },
  "Telecommunications": {
    industry: "Telecommunications",
    allowedCompanyTypes: [
      "Telecom Operator",
      "Internet Provider",
      "Telecom Vendor"
    ],
    positiveSignals: [
      "telecom", "telecommunications", "carrier", "broadband", "network", "wireless", "fiber", "mobile provider", "satellite"
    ],
    negativeSignals: [
      "agency", "consulting"
    ],
    discoveryQueries: [
      "{keywords} telecom companies {country}",
      "network operators {country}"
    ],
    scoringWeights: {
      industry: 30,
      industryRelevance: 0,
      companyType: 15,
      employee: 10,
      technology: 25,
      geography: 10,
      contacts: 10
    }
  }
};
