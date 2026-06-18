async function printLogs() {
  const url = `http://localhost:3000/api/search-leads`;
  console.log(`Sending POST request to: ${url}`);
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        industry: "SaaS",
        country: "India",
        companySize: "11-50",
        keywords: "CRM"
      })
    });
    const data = await res.json() as any;
    console.log("Status:", res.status);
    console.log("Logs count:", data.logs?.length);
    console.log("Results count:", data.results?.length);
    console.log("\n--- AGENT LOGS ---");
    if (data.logs) {
      data.logs.forEach((log: any) => {
        console.log(`[${log.timestamp}] [${log.agent}] ${log.message}`);
      });
    }
    if (data.results) {
      console.log("\n--- RESULTS ---");
      console.log(JSON.stringify(data.results, null, 2));
    }
  } catch (err: any) {
    console.error("Request failed:", err.message);
  }
}

printLogs();
