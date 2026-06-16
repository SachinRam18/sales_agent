
export interface DiscoveredCompany {
  name: string;
  industry: string;
  website: string;
  location: string;
  revenue: string;
  employees: number;
  description: string;
  technologies: string;
  contacts: Array<{
    name: string;
    role: string;
    linkedin: string;
    email: string;
    phone: string;
  }>;
}



export class LeadDiscoveryAgent {
  async discover(params: {
    industry: string;
    country: string;
    companySize: string;
    revenueRange: string;
    keywords?: string;
    addLog: (message: string) => void;
  }): Promise<DiscoveredCompany[]> {
    const { industry, country, companySize, revenueRange, keywords, addLog } = params;

    addLog(`Analyzing request: Find ${industry} companies in ${country} with size ${companySize}.`);
    addLog("Formulating search queries & running semantic database queries...");

    let results: DiscoveredCompany[] = [];

    const webhookUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/lead-discovery";
    
    addLog(`Sending request to n8n orchestration webhook at ${webhookUrl}...`);
    
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          location: country,
          companySize,
          revenueRange,
          keywords
        })
      });

      if (!response.ok) {
        throw new Error(`n8n webhook returned status ${response.status}`);
      }

      const data = await response.json();
      addLog(`n8n Webhook responded successfully! Response: ${JSON.stringify(data)}`);
      
      // If the n8n response contains an array of companies (e.g. from Option A), use it.
      if (data && Array.isArray(data.companies)) {
        results = data.companies;
        addLog(`Successfully extracted ${results.length} companies from n8n response.`);
      } else if (data && typeof data.companiesFound === 'number') {
        // Option B: n8n returned a summary count, but no company data.
        addLog(`n8n pushed ${data.companiesFound} companies to Google Sheets. Note: UI table requires actual company data from n8n to render.`);
        // For demonstration, we could generate mock data here, or just return an empty array
        // Since we didn't get actual company data, we'll return an empty array, so the UI relies on the sheets.
        results = [];
      } else if (Array.isArray(data)) {
        // In case n8n returned an array directly
        results = data;
        addLog(`Successfully extracted ${results.length} companies directly from n8n array.`);
      } else {
        addLog(`Warning: Unrecognized response format from n8n. Cannot populate table.`);
        results = [];
      }

    } catch (e: any) {
      console.error("[LeadDiscoveryAgent] n8n webhook call failed:", e.message);
      addLog(`n8n Connection Failed: ${e.message}. Is your n8n workflow active and running?`);
      results = [];
    }

    return results;
  }
}

export const leadDiscoveryAgent = new LeadDiscoveryAgent();

