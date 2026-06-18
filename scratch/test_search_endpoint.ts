async function testSearchEndpoint() {
  const params = new URLSearchParams({
    industry: "SaaS",
    country: "India",
    companySize: "11-50",
    keywords: "CRM"
  });
  
  const url = `http://localhost:3000/api/search-leads?${params.toString()}`;
  console.log(`Sending GET request to: ${url}`);
  
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    const data = await res.json() as any;
    console.log("Logs count:", data.logs?.length);
    console.log("Results count:", data.results?.length);
    if (data.results && data.results.length > 0) {
      console.log("First Result Details:");
      console.log("- Name:", data.results[0].name);
      console.log("- Website:", data.results[0].website);
      console.log("- Location:", data.results[0].location);
      console.log("- Score:", data.results[0].score);
      console.log("- Sources:", data.results[0].sources);
    } else {
      console.log("No results returned!");
    }
  } catch (err: any) {
    console.error("Request failed:", err.message);
  }
}

testSearchEndpoint().then(() => process.exit(0));
