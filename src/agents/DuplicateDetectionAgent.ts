import * as db from "../db";

export class DuplicateDetectionAgent {
  async checkDuplicate(name: string, website: string, addLog: (message: string) => void): Promise<{ isDuplicate: boolean, existingId?: string, existingNotes?: string }> {
    addLog(`Running Duplicate Detection scan for "${name}" (${website})...`);

    try {
      const duplicateRes = await db.query(
        "SELECT id, name, website, notes FROM companies WHERE LOWER(name) = LOWER($1) OR LOWER(website) = LOWER($2) LIMIT 1",
        [name, website]
      );

      if (duplicateRes.rows.length > 0) {
        const existing = duplicateRes.rows[0];
        addLog(`Duplicate detected: Record already exists for "${existing.name}".`);
        return {
          isDuplicate: true,
          existingId: existing.id,
          existingNotes: existing.notes
        };
      }
    } catch (e: any) {
      console.error("[DuplicateDetectionAgent] Database query failed:", e.message);
    }

    addLog(`No duplicate found for "${name}". Clear to proceed.`);
    return { isDuplicate: false };
  }
}

export const duplicateDetectionAgent = new DuplicateDetectionAgent();
