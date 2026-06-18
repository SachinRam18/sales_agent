import pg from "pg";
import dotenv from "dotenv";
import { dbInstance } from "./dbSim";

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/salespilot";

export const pool = new Pool({
  connectionString,
});

export let useSim = false;

// Create database and tables if not exist
export async function initializeDatabase() {
  try {
    // 1. Ensure target database exists
    try {
      const urlPattern = /^(postgresql?:\/\/.*:\d+\/)([^?]+)(.*)$/;
      const match = connectionString.match(urlPattern);
      if (match) {
        const baseUrl = match[1];
        const dbName = match[2];
        const queryParams = match[3];

        if (dbName !== "postgres") {
          const defaultPool = new Pool({ connectionString: `${baseUrl}postgres${queryParams}` });
          const res = await defaultPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
          if (res.rowCount === 0) {
            console.log(`[Database] Database "${dbName}" does not exist. Creating...`);
            await defaultPool.query(`CREATE DATABASE "${dbName}"`);
            console.log(`[Database] Database "${dbName}" created successfully.`);
          }
          await defaultPool.end();
        }
      }
    } catch (err) {
      console.error("[Database] Warning: Database check failed. Assuming DB exists or requires manual configuration.", err);
    }

    // 2. Create tables
    const client = await pool.connect();
    try {
      console.log("[Database] Initializing table schemas...");

      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'Team Member',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS icp_profiles (
          id VARCHAR(100) PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          industry VARCHAR(255) NOT NULL,
          country VARCHAR(255) NOT NULL,
          employee_min INTEGER NOT NULL,
          employee_max INTEGER NOT NULL,
          revenue_min VARCHAR(100) NOT NULL,
          keywords TEXT,
          technologies_used VARCHAR(255),
          departments VARCHAR(255),
          job_titles VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS companies (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          industry VARCHAR(255) NOT NULL,
          country VARCHAR(255) NOT NULL,
          employees INTEGER NOT NULL,
          website VARCHAR(255) NOT NULL,
          description TEXT,
          revenue VARCHAR(100),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS contacts (
          id VARCHAR(100) PRIMARY KEY,
          company_id VARCHAR(100) REFERENCES companies(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          job_title VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          linkedin_url VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id VARCHAR(100) PRIMARY KEY,
          company_id VARCHAR(100) REFERENCES companies(id) ON DELETE CASCADE,
          score INTEGER NOT NULL DEFAULT 0,
          status VARCHAR(50) NOT NULL DEFAULT 'New',
          qualification_reason TEXT,
          industry_match INTEGER DEFAULT 0,
          size_match INTEGER DEFAULT 0,
          revenue_match INTEGER DEFAULT 0,
          tech_match INTEGER DEFAULT 0,
          location_match INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS campaigns (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          audience VARCHAR(255),
          template VARCHAR(255),
          schedule VARCHAR(255),
          sent_count INTEGER DEFAULT 0,
          open_rate NUMERIC DEFAULT 0.0,
          reply_rate NUMERIC DEFAULT 0.0,
          conversion_rate NUMERIC DEFAULT 0.0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS activities (
          id VARCHAR(100) PRIMARY KEY,
          activity_type VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          user_email VARCHAR(255),
          company_name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR(100) PRIMARY KEY,
          message TEXT NOT NULL,
          read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("[Database] Schema check completed successfully.");

      // 3. Seed data if users table is empty
      const userCount = await client.query("SELECT COUNT(*) FROM users");
      if (parseInt(userCount.rows[0].count, 10) === 0) {
        console.log("[Database] Database is empty. Seeding mock datasets...");

        // Seed Users
        const usersResult = await client.query(`
          INSERT INTO users (name, email, password, role) VALUES
          ('Sachin Ram', 'sachinram6363@gmail.com', 'password', 'Admin'),
          ('Alex Mercer', 'team@company.com', 'password', 'Team Member'),
          ('Sarah Connor', 'viewer@company.com', 'password', 'Viewer')
          RETURNING id, email;
        `);

        const adminUser = usersResult.rows.find(u => u.email === "sachinram6363@gmail.com");
        const adminUserId = adminUser ? adminUser.id : 1;

        // Seed ICP Profiles
        await client.query(`
          INSERT INTO icp_profiles (id, user_id, name, industry, country, employee_min, employee_max, revenue_min, keywords, technologies_used, departments, job_titles) VALUES
          ('icp-1', $1, 'German Manufacturing Leader', 'Manufacturing', 'Germany', 200, 500, '> $10M', 'Machinery, Automation, Industry 4.0, Logistics', 'SAP, Siemens MindSphere, Salesforce', 'Engineering, Operations, Procurement', 'VP Operations, Head of Automation, Chief Procurement Officer'),
          ('icp-2', $1, 'US SaaS Series A/B', 'Software / SaaS', 'United States', 50, 200, '> $5M', 'Sales automation, Marketing analytics, Artificial intelligence', 'React, Stripe, HubSpot, AWS', 'Sales, Business Development, Engineering', 'VP Sales, Head of Business Development, Sales Director');
        `, [adminUserId]);

        // Seed Companies
        await client.query(`
          INSERT INTO companies (id, name, industry, country, employees, website, description, revenue, notes) VALUES
          ('comp-1', 'Schulz Maschinenbau GmbH', 'Manufacturing', 'Stuttgart, Germany', 340, 'https://www.schulz-maschinenbau.de', 'Manufacturer of custom industrial automated machinery and robotic assembly lines for the automotive industry.', '$45M', 'Met via initial email. Interested in automated ERP sync. They are currently planning to upgrade their factory floors by Q4 2026.'),
          ('comp-2', 'Müller & Söhne Automation', 'Manufacturing', 'Munich, Germany', 220, 'https://www.mueller-sons-automation.de', 'Provides high-precision sensors, PLC assemblies, and smart industrial measurement integrations for EU markets.', '$28M', 'Enriched. Buying signal detected: Recently hired 3 control system engineers.'),
          ('comp-3', 'Summit Logistics Solutions', 'Logistics', 'Chicago, USA', 450, 'https://www.summitlogistics.com', 'Third-party logistics operator specializing in temp-controlled pharmaceutical transport and predictive cargo tracking.', '$75M', 'LinkedIn outreach sequence standard started.'),
          ('comp-4', 'Zeta Analytics Corporation', 'Software / SaaS', 'Austin, USA', 120, 'https://www.zetaanalytics.com', 'Cloud-native visual analytics platform designed to aggregate multi-channel ad spend recommendations via heuristic algorithms.', '$14M', 'Met at SaaS summit.');
        `);

        // Seed Leads
        await client.query(`
          INSERT INTO leads (id, company_id, score, status, qualification_reason, industry_match, size_match, revenue_match, tech_match, location_match) VALUES
          ('lead-1', 'comp-1', 95, 'Qualified', 'Excellent industry fit (German Manufacturing). Employee count of 340 is securely in target and revenue range of $45M exceeds the minimum ICP threshold. They utilize SAP, perfect match for our operation middleware integrations.', 100, 95, 95, 90, 100),
          ('lead-2', 'comp-2', 89, 'New', 'Superb location and industry match. Revenue is healthy ($28M) and within scope. Technologies used could represent lower complexity, but growth signals are highly active.', 100, 90, 85, 75, 100),
          ('lead-3', 'comp-3', 72, 'Contacted', 'Scored based on general ICP criteria configurations.', 75, 70, 70, 65, 75),
          ('lead-4', 'comp-4', 92, 'Meeting Scheduled', 'Excellent US SaaS profile match.', 95, 90, 90, 85, 95);
        `);

        // Seed Contacts
        await client.query(`
          INSERT INTO contacts (id, company_id, name, job_title, email, linkedin_url, phone) VALUES
          ('cnt-1', 'comp-1', 'Hans Schulz', 'Managing Director', 'h.schulz@schulz-maschinenbau.de', 'https://linkedin.com/in/hans-schulz-mock', '+49 711 500223'),
          ('cnt-2', 'comp-1', 'Dieter Brand', 'Chief of Operations', 'd.brand@schulz-maschinenbau.de', 'https://linkedin.com/in/dieter-brand-mock', '+49 711 500224'),
          ('cnt-3', 'comp-2', 'Erich Müller', 'VP Engineering', 'e.mueller@mueller-sons-automation.de', 'https://linkedin.com/in/erich-mueller-mock', '+49 89 224411'),
          ('cnt-4', 'comp-3', 'Marcus Vance', 'VP Supply Chain', 'm.vance@summitlogistics.com', 'https://linkedin.com/in/marcus-vance-mock', '+1 312 555 0192'),
          ('cnt-5', 'comp-4', 'Nora Gilcrest', 'VP Marketing & Sales', 'n.gilcrest@zetaanalytics.com', 'https://linkedin.com/in/nora-gilcrest-mock', '+1 512 555 3302');
        `);

        // Seed Campaigns
        await client.query(`
          INSERT INTO campaigns (id, name, status, audience, template, schedule, sent_count, open_rate, reply_rate, conversion_rate) VALUES
          ('camp-1', 'German Machinery Auto-Pilot Outreach', 'Active', 'German Manufacturing Leader', 'Automation Solutions & Efficiency', 'Mon-Fri, 9:00 AM CET', 42, 68.2, 24.5, 11.9),
          ('camp-2', 'US SaaS Tech Stack Integrations', 'Active', 'US SaaS Series A/B', 'Outreach CRM Sync Personalized Pitch', 'Tuesday & Thursday', 18, 55.5, 15.0, 5.5);
        `);

        // Seed Activities
        await client.query(`
          INSERT INTO activities (id, activity_type, description, user_email, company_name) VALUES
          ('act-1', 'lead_discovered', 'Discovered and qualified Schulz Maschinenbau GmbH based on ''German Manufacturing'' ICP profile.', 'sachinram6363@gmail.com', 'Schulz Maschinenbau GmbH'),
          ('act-2', 'outreach_generated', 'Generated email pitch for Hans Schulz regarding executive operations middleware optimization.', 'sachinram6363@gmail.com', 'Schulz Maschinenbau GmbH'),
          ('act-3', 'crm_stored', 'Stored Müller & Söhne Automation in CRM with status ''New'' and score 89.', 'sachinram6363@gmail.com', 'Müller & Söhne Automation');
        `);

        // Seed Notifications
        await client.query(`
          INSERT INTO notifications (id, message, read) VALUES
          ('notif-1', 'Lead Discovery Agent completed qualification for Müller & Söhne Automation (Score: 89)', false),
          ('notif-2', 'New booking signal detected for Schulz Maschinenbau (German Manufacturing)', true);
        `);

        console.log("[Database] Seeding finished successfully.");
      }
    } catch (err) {
      console.error("[Database] Error during initialization/seeding:", err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("[Database] PostgreSQL connection/initialization failed. Falling back to Simulated JSON Database (dbSim). Error:", err.message);
    useSim = true;
  }
}

// Database helper functions (backward compatible API definitions)

export async function query(text: string, params?: any[]) {
  if (useSim) {
    console.log(`[Database Sim] Intercepting Query: ${text}`);
    const normalizedText = text.trim().replace(/\s+/g, " ");
    const normalizedParams = params || [];

    if (normalizedText.includes("SELECT id, name, website, notes FROM companies")) {
      const nameParam = normalizedParams[0]?.toLowerCase() || "";
      const websiteParam = normalizedParams[1]?.toLowerCase() || "";
      const match = dbInstance.getCompanies().find(c => c.name.toLowerCase() === nameParam || c.website.toLowerCase() === websiteParam);
      return { rows: match ? [match] : [] };
    }

    if (normalizedText.includes("UPDATE companies")) {
      const [industry, location, employees, website, description, revenue, notes, id] = normalizedParams;
      const existing = dbInstance.getCompany(id);
      if (existing) {
        existing.industry = industry;
        existing.location = location;
        existing.employees = employees;
        existing.website = website;
        existing.description = description;
        existing.revenue = revenue;
        existing.notes = notes;
        dbInstance.saveCompany(existing);
      }
      return { rows: [] };
    }

    if (normalizedText.includes("UPDATE leads")) {
      const [score, status, explanation, industryMatch, sizeMatch, revenueMatch, techMatch, locationMatch, companyId] = normalizedParams;
      const comp = dbInstance.getCompany(companyId);
      if (comp) {
        comp.status = status;
        comp.score = score;
        dbInstance.saveCompany(comp);
      }
      dbInstance.saveLeadScore({
        companyId,
        score,
        industryMatch,
        sizeMatch,
        revenueMatch,
        techMatch,
        locationMatch,
        explanation
      });
      return { rows: [] };
    }

    if (normalizedText.includes("INSERT INTO companies")) {
      const [id, name, industry, location, employees, website, description, revenue, notes] = normalizedParams;
      dbInstance.saveCompany({
        id, name, industry, location, employees, website, description, revenue, notes,
        status: "New", score: 0, addedAt: new Date().toISOString()
      });
      return { rows: [] };
    }

    if (normalizedText.includes("INSERT INTO leads")) {
      const [leadId, companyId, score, status, explanation, industryMatch, sizeMatch, revenueMatch, techMatch, locationMatch] = normalizedParams;
      const comp = dbInstance.getCompany(companyId);
      if (comp) {
        comp.status = status;
        comp.score = score;
        dbInstance.saveCompany(comp);
      }
      dbInstance.saveLeadScore({
        companyId, score, industryMatch, sizeMatch, revenueMatch, techMatch, locationMatch, explanation
      });
      return { rows: [] };
    }

    if (normalizedText.includes("INSERT INTO contacts")) {
      const [id, companyId, name, role, email, linkedin, phone] = normalizedParams;
      dbInstance.saveContact({
        id, companyId, name, role, linkedin, email, phone
      });
      return { rows: [] };
    }

    console.warn(`[Database Sim] Query not explicitly handled, returning empty rows: ${normalizedText}`);
    return { rows: [] };
  }
  return pool.query(text, params);
}

export async function getUsers() {
  if (useSim) return dbInstance.getUsers();
  const res = await pool.query("SELECT * FROM users ORDER BY created_at ASC");
  return res.rows;
}

export async function getICPs() {
  if (useSim) return dbInstance.getICPs();
  const res = await pool.query("SELECT * FROM icp_profiles ORDER BY created_at ASC");
  // Map columns to match ICPProfile interface
  return res.rows.map(row => ({
    id: row.id,
    name: row.name,
    industry: row.industry,
    country: row.country,
    companySize: `${row.employee_min}-${row.employee_max}`,
    revenueRange: row.revenue_min,
    technologiesUsed: row.technologies_used || "",
    keywords: row.keywords || "",
    departments: row.departments || "",
    jobTitles: row.job_titles || ""
  }));
}

export async function saveICP(icp: any) {
  if (useSim) return dbInstance.saveICP(icp);
  // Parse company size
  let employeeMin = 0;
  let employeeMax = 999999;
  if (icp.companySize) {
    const parts = icp.companySize.split("-");
    if (parts.length === 2) {
      employeeMin = parseInt(parts[0], 10) || 0;
      employeeMax = parseInt(parts[1], 10) || 999999;
    } else if (icp.companySize.includes(">")) {
      employeeMin = parseInt(icp.companySize.replace(/[^0-9]/g, ""), 10) || 0;
    }
  }

  // Get default user id (Admin or first user)
  const usersRes = await pool.query("SELECT id FROM users LIMIT 1");
  const userId = usersRes.rows.length > 0 ? usersRes.rows[0].id : 1;

  if (icp.id) {
    await pool.query(`
      UPDATE icp_profiles
      SET name = $1, industry = $2, country = $3, employee_min = $4, employee_max = $5,
          revenue_min = $6, keywords = $7, technologies_used = $8, departments = $9, job_titles = $10
      WHERE id = $11
    `, [
      icp.name, icp.industry, icp.country, employeeMin, employeeMax,
      icp.revenueRange, icp.keywords, icp.technologiesUsed, icp.departments, icp.jobTitles,
      icp.id
    ]);
  } else {
    const id = "icp-" + Date.now();
    await pool.query(`
      INSERT INTO icp_profiles (id, user_id, name, industry, country, employee_min, employee_max, revenue_min, keywords, technologies_used, departments, job_titles)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      id, userId, icp.name, icp.industry, icp.country, employeeMin, employeeMax,
      icp.revenueRange, icp.keywords, icp.technologiesUsed, icp.departments, icp.jobTitles
    ]);
  }

  return getICPs();
}

export async function deleteICP(id: string) {
  if (useSim) return dbInstance.deleteICP(id);
  await pool.query("DELETE FROM icp_profiles WHERE id = $1", [id]);
  return getICPs();
}

export async function getCompanies() {
  if (useSim) return dbInstance.getCompanies();
  const queryText = `
    SELECT c.*, l.score, l.status, l.qualification_reason, l.created_at as "addedAt",
           l.industry_match, l.size_match, l.revenue_match, l.tech_match, l.location_match
    FROM companies c
    LEFT JOIN leads l ON c.id = l.company_id
    ORDER BY l.score DESC NULLS LAST
  `;
  const res = await pool.query(queryText);
  return res.rows.map(row => ({
    id: row.id,
    name: row.name,
    industry: row.industry,
    website: row.website,
    location: row.country, // frontend uses location, DB has country
    revenue: row.revenue || "",
    employees: row.employees,
    description: row.description || "",
    status: row.status || "New",
    score: row.score || 0,
    addedAt: row.addedAt ? row.addedAt.toISOString() : new Date().toISOString(),
    notes: row.notes || ""
  }));
}

export async function getCompany(id: string) {
  if (useSim) return dbInstance.getCompany(id) || null;
  const queryText = `
    SELECT c.*, l.score, l.status, l.qualification_reason, l.created_at as "addedAt",
           l.industry_match, l.size_match, l.revenue_match, l.tech_match, l.location_match
    FROM companies c
    LEFT JOIN leads l ON c.id = l.company_id
    WHERE c.id = $1
  `;
  const res = await pool.query(queryText, [id]);
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    website: row.website,
    location: row.country,
    revenue: row.revenue || "",
    employees: row.employees,
    description: row.description || "",
    status: row.status || "New",
    score: row.score || 0,
    addedAt: row.addedAt ? row.addedAt.toISOString() : new Date().toISOString(),
    notes: row.notes || ""
  };
}

export async function saveCompany(company: any) {
  if (useSim) return dbInstance.saveCompany(company);

  // Normalize parameters to avoid database constraint violations
  const companyName = company.name || "Unknown Company";
  const industryStr = company.industry || "Unknown";
  const countryStr = company.location || company.country || "Unknown";
  const websiteStr = company.website || "";

  let employeesCount = 0;
  if (company.employees !== undefined && company.employees !== null) {
    const parsed = Number(company.employees);
    if (!isNaN(parsed)) {
      employeesCount = Math.floor(parsed);
    }
  }

  // Upsert company
  const exists = await pool.query("SELECT 1 FROM companies WHERE id = $1", [company.id]);
  
  if (exists.rows.length > 0) {
    await pool.query(`
      UPDATE companies
      SET name = $1, industry = $2, country = $3, employees = $4, website = $5, description = $6, revenue = $7, notes = $8
      WHERE id = $9
    `, [
      companyName, industryStr, countryStr, employeesCount,
      websiteStr, company.description, company.revenue, company.notes, company.id
    ]);
  } else {
    await pool.query(`
      INSERT INTO companies (id, name, industry, country, employees, website, description, revenue, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      company.id, companyName, industryStr, countryStr, employeesCount,
      websiteStr, company.description, company.revenue, company.notes
    ]);
  }

  // Upsert lead
  const leadExists = await pool.query("SELECT 1 FROM leads WHERE company_id = $1", [company.id]);
  if (leadExists.rows.length > 0) {
    await pool.query(`
      UPDATE leads
      SET score = $1, status = $2
      WHERE company_id = $3
    `, [company.score || 0, company.status || "New", company.id]);
  } else {
    const leadId = "lead-" + Date.now();
    await pool.query(`
      INSERT INTO leads (id, company_id, score, status, qualification_reason)
      VALUES ($1, $2, $3, $4, $5)
    `, [leadId, company.id, company.score || 0, company.status || "New", company.description]);
  }

  return getCompany(company.id);
}

export async function deleteCompany(id: string) {
  if (useSim) {
    dbInstance.deleteCompany(id);
    return;
  }
  // Cascading deletes contacts and leads due to ON DELETE CASCADE
  await pool.query("DELETE FROM companies WHERE id = $1", [id]);
}

export async function getContacts(companyId?: string) {
  if (useSim) return dbInstance.getContacts(companyId);
  if (companyId) {
    const res = await pool.query("SELECT * FROM contacts WHERE company_id = $1 ORDER BY created_at ASC", [companyId]);
    return res.rows.map(row => ({
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      role: row.job_title,
      linkedin: row.linkedin_url,
      email: row.email,
      phone: row.phone || ""
    }));
  } else {
    const res = await pool.query("SELECT * FROM contacts ORDER BY created_at ASC");
    return res.rows.map(row => ({
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      role: row.job_title,
      linkedin: row.linkedin_url,
      email: row.email,
      phone: row.phone || ""
    }));
  }
}

export async function saveContact(contact: any) {
  if (useSim) return dbInstance.saveContact(contact);
  const exists = await pool.query("SELECT 1 FROM contacts WHERE id = $1", [contact.id]);
  if (exists.rows.length > 0) {
    await pool.query(`
      UPDATE contacts
      SET company_id = $1, name = $2, job_title = $3, email = $4, linkedin_url = $5, phone = $6
      WHERE id = $7
    `, [contact.companyId, contact.name, contact.role, contact.email, contact.linkedin, contact.phone, contact.id]);
  } else {
    await pool.query(`
      INSERT INTO contacts (id, company_id, name, job_title, email, linkedin_url, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [contact.id, contact.companyId, contact.name, contact.role, contact.email, contact.linkedin, contact.phone]);
  }
  return contact;
}

export async function getLeadScores() {
  if (useSim) return dbInstance.getLeadScores();
  const res = await pool.query(`
    SELECT l.*, c.id as company_id
    FROM leads l
    JOIN companies c ON l.company_id = c.id
  `);
  
  const scores: Record<string, any> = {};
  res.rows.forEach(row => {
    scores[row.company_id] = {
      companyId: row.company_id,
      score: row.score,
      industryMatch: row.industry_match || 0,
      sizeMatch: row.size_match || 0,
      revenueMatch: row.revenue_match || 0,
      techMatch: row.tech_match || 0,
      locationMatch: row.location_match || 0,
      explanation: row.qualification_reason || ""
    };
  });
  return scores;
}

export async function saveLeadScore(score: any) {
  if (useSim) return dbInstance.saveLeadScore(score);
  await pool.query(`
    UPDATE leads
    SET score = $1, qualification_reason = $2, industry_match = $3, size_match = $4,
        revenue_match = $5, tech_match = $6, location_match = $7
    WHERE company_id = $8
  `, [
    score.score, score.explanation, score.industryMatch, score.sizeMatch,
    score.revenueMatch, score.techMatch, score.locationMatch, score.companyId
  ]);
  return score;
}

export async function getCampaigns() {
  if (useSim) return dbInstance.getCampaigns();
  const res = await pool.query("SELECT * FROM campaigns ORDER BY created_at ASC");
  return res.rows.map(row => ({
    id: row.id,
    name: row.name,
    status: row.status,
    audience: row.audience || "",
    template: row.template || "",
    schedule: row.schedule || "",
    sentCount: row.sent_count || 0,
    openRate: parseFloat(row.open_rate) || 0,
    replyRate: parseFloat(row.reply_rate) || 0,
    conversionRate: parseFloat(row.conversion_rate) || 0,
    createdAt: row.created_at.toISOString()
  }));
}

export async function saveCampaign(campaign: any) {
  if (useSim) return dbInstance.saveCampaign(campaign);
  if (campaign.id) {
    await pool.query(`
      UPDATE campaigns
      SET name = $1, audience = $2, template = $3, schedule = $4, status = $5
      WHERE id = $6
    `, [campaign.name, campaign.audience, campaign.template, campaign.schedule, campaign.status || "Active", campaign.id]);
  } else {
    const id = "camp-" + Date.now();
    await pool.query(`
      INSERT INTO campaigns (id, name, status, audience, template, schedule, sent_count, open_rate, reply_rate, conversion_rate)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      id, campaign.name, "Active", campaign.audience, campaign.template, campaign.schedule,
      0, 0.0, 0.0, 0.0
    ]);
  }
  return getCampaigns();
}

export async function getActivities() {
  if (useSim) return dbInstance.getActivities();
  const res = await pool.query("SELECT * FROM activities ORDER BY created_at DESC LIMIT 100");
  return res.rows.map(row => ({
    id: row.id,
    type: row.activity_type,
    description: row.description,
    timestamp: row.created_at.toISOString(),
    userEmail: row.user_email || "sachinram6363@gmail.com",
    companyName: row.company_name || ""
  }));
}

export async function addActivity(type: string, description: string, userEmail: string, companyName?: string) {
  if (useSim) return dbInstance.addActivity(type, description, userEmail, companyName);
  const id = "act-" + Date.now() + Math.random().toString(36).substr(2, 4);
  await pool.query(`
    INSERT INTO activities (id, activity_type, description, user_email, company_name)
    VALUES ($1, $2, $3, $4, $5)
  `, [id, type, description, userEmail, companyName || null]);
  
  return {
    id,
    type,
    description,
    timestamp: new Date().toISOString(),
    userEmail,
    companyName
  };
}

export async function getNotifications() {
  if (useSim) return dbInstance.getNotifications();
  const res = await pool.query("SELECT * FROM notifications ORDER BY created_at DESC");
  return res.rows.map(row => ({
    id: row.id,
    message: row.message,
    read: row.read,
    timestamp: row.created_at.toISOString()
  }));
}

export async function addNotification(message: string) {
  if (useSim) return dbInstance.addNotification(message);
  const id = "notif-" + Date.now();
  await pool.query(`
    INSERT INTO notifications (id, message, read)
    VALUES ($1, $2, $3)
  `, [id, message, false]);
  
  return {
    id,
    message,
    read: false,
    timestamp: new Date().toISOString()
  };
}

export async function clearNotifications() {
  if (useSim) return dbInstance.clearNotifications();
  await pool.query("UPDATE notifications SET read = TRUE");
  return getNotifications();
}

