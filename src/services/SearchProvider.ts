export interface SearchResult {
  name: string;
  website: string;
  source: string;
  sources?: string[];
  sourceUrls?: string[];
  location?: string;
  snippet: string;
  companyType?: "SaaS Product" | "Software Agency" | "Consultancy" | "Manufacturer" | "Marketplace" | "Directory" | "Logistics Provider" | "Supply Chain Platform" | "Healthcare Provider" | "Medical Device Company" | "Healthcare Software Vendor" | "Fintech" | "Banking Software Vendor" | "Financial Institution" | "Other" | "Software Vendor" | "CRM Vendor" | "Helpdesk Vendor";
  companyTypeConfidence?: number;
  businessSignals?: string[];
  matchedQuery?: string;
}

export interface SearchProvider {
  search(query: string): Promise<SearchResult[]>;
}
