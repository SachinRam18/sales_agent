import * as db from "../db";

export class CRMAgent {
  async storeLead(params: {
    company: {
      name: string;
      industry: string;
      website: string;
      location: string;
      revenue: string;
      employees: number;
      description: string;
      score: number;
      status?: string;
      notes?: string;
    };
    contacts: Array<{
      name: string;
      role: string;
      linkedin?: string;
      email: string;
      phone?: string;
    }>;
    scoreDetail: {
      score: number;
      industryMatch: number;
      sizeMatch: number;
      revenueMatch: number;
      techMatch: number;
      locationMatch: number;
      explanation: string;
    };
    addLog: (message: string) => void;
  }) {
    const { company, contacts, scoreDetail, addLog } = params;
    addLog("Running CRM duplicate scans across established entities...");

    // Duplicate detection by name or website
    const duplicateRes = await db.query(
      "SELECT id, name, website, notes FROM companies WHERE LOWER(name) = LOWER($1) OR LOWER(website) = LOWER($2) LIMIT 1",
      [company.name, company.website]
    );

    let targetCompanyId: string;
    let targetCompany: any;

    if (duplicateRes.rows.length > 0) {
      const existing = duplicateRes.rows[0];
      targetCompanyId = existing.id;
      addLog(`Duplicate detected: Syncing existing CRM record attributes for "${existing.name}".`);

      const updatedNotes = (existing.notes || "") + "\nSynced from discovery agent request.";
      
      // Update existing company
      await db.query(`
        UPDATE companies
        SET industry = $1, country = $2, employees = $3, website = $4, description = $5, revenue = $6, notes = $7
        WHERE id = $8
      `, [
        company.industry, company.location, company.employees, company.website,
        company.description, company.revenue, updatedNotes, targetCompanyId
      ]);

      // Update lead
      await db.query(`
        UPDATE leads
        SET score = $1, status = $2, qualification_reason = $3, industry_match = $4, size_match = $5,
            revenue_match = $6, tech_match = $7, location_match = $8
        WHERE company_id = $9
      `, [
        company.score, company.status || "New", scoreDetail.explanation,
        scoreDetail.industryMatch, scoreDetail.sizeMatch, scoreDetail.revenueMatch,
        scoreDetail.techMatch, scoreDetail.locationMatch, targetCompanyId
      ]);

      targetCompany = await db.getCompany(targetCompanyId);
      await db.addActivity("crm_stored", `Synced existing CRM record attributes: "${company.name}"`, "sachinram6363@gmail.com", company.name);
    } else {
      // Create new company
      targetCompanyId = "comp-" + Date.now();
      addLog(`No duplicate found. Importing fresh qualified lead "${company.name}" into CRM.`);

      await db.query(`
        INSERT INTO companies (id, name, industry, country, employees, website, description, revenue, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        targetCompanyId, company.name, company.industry, company.location, company.employees,
        company.website, company.description, company.revenue, company.notes || ""
      ]);

      // Create new lead
      const leadId = "lead-" + Date.now();
      await db.query(`
        INSERT INTO leads (id, company_id, score, status, qualification_reason, industry_match, size_match, revenue_match, tech_match, location_match)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        leadId, targetCompanyId, company.score, company.status || "New", scoreDetail.explanation,
        scoreDetail.industryMatch, scoreDetail.sizeMatch, scoreDetail.revenueMatch,
        scoreDetail.techMatch, scoreDetail.locationMatch
      ]);

      // Create contacts
      if (contacts && Array.isArray(contacts)) {
        for (const contact of contacts) {
          const contactId = "cnt-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
          await db.query(`
            INSERT INTO contacts (id, company_id, name, job_title, email, linkedin_url, phone)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            contactId, targetCompanyId, contact.name, contact.role, contact.email,
            contact.linkedin || "#", contact.phone || ""
          ]);
        }
      }

      targetCompany = await db.getCompany(targetCompanyId);
      await db.addActivity("crm_stored", `Imported fresh qualified lead into CRM: "${company.name}"`, "sachinram6363@gmail.com", company.name);
      await db.addNotification(`CRM Agent added newly qualified lead: ${company.name}`);
    }

    return targetCompany;
  }
}
export const crmAgent = new CRMAgent();
