import React, { useState, useEffect } from "react";
import { Search, Loader2, ArrowRight, Server, ShieldCheck, Database, FileText, CheckCircle2, Award, ExternalLink, SlidersHorizontal } from "lucide-react";

interface ICPProfile {
  id: string;
  name: string;
  industry: string;
  country: string;
  companySize: string;
  revenueRange: string;
  technologiesUsed: string;
  keywords: string;
}

interface DiscoveredLead {
  id: string;
  name: string;
  industry: string;
  website: string;
  location: string;
  revenue: string;
  employees: number;
  description: string;
  technologies: string;
  score: number;
  scoreDetail: {
    score: number;
    industryMatch: number;
    sizeMatch: number;
    revenueMatch: number;
    techMatch: number;
    locationMatch: number;
    explanation: string;
  };
  contacts: Array<{
    name: string;
    role: string;
    linkedin: string;
    email: string;
    phone: string;
  }>;
}

interface LeadDiscoveryProps {
  onLeadSynced?: () => void;
  userRole: "Admin" | "Team Member" | "Viewer";
}

export default function LeadDiscovery({ onLeadSynced, userRole }: LeadDiscoveryProps) {
  const [icpProfiles, setIcpProfiles] = useState<ICPProfile[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState("");
  
  // Search parameters
  const [industry, setIndustry] = useState("Manufacturing");
  const [country, setCountry] = useState("Germany");
  const [companySize, setCompanySize] = useState("200-500");
  const [revenueRange, setRevenueRange] = useState("> $10M");
  const [keywords, setKeywords] = useState("industrial CNC, automated tools");

  const [loading, setLoading] = useState(false);
  const [agentLogs, setAgentLogs] = useState<Array<{ agent: string; message: string; timestamp: string }>>([]);
  const [results, setResults] = useState<DiscoveredLead[]>([]);
  const [syncedIds, setSyncedIds] = useState<Record<string, boolean>>({});
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    // preload ICP profiles to help configure the quick presets dropdown
    fetch("/api/icp")
      .then((r) => r.json())
      .then((data) => {
        setIcpProfiles(data);
        if (data.length > 0) {
          setSelectedIcpId(data[0].id);
          applyIcpValues(data[0]);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const applyIcpValues = (p: ICPProfile) => {
    setIndustry(p.industry);
    setCountry(p.country);
    setCompanySize(p.companySize);
    setRevenueRange(p.revenueRange);
    setKeywords(p.keywords || "");
  };

  const handleIcpSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedIcpId(id);
    const found = icpProfiles.find((p) => p.id === id);
    if (found) {
      applyIcpValues(found);
    }
  };

  const runDiscoveryPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setAgentLogs([]);
    setActiveStep(1); // step 1: User Request

    try {
      // Step simulation delay sequence to show agent pipeline beautifully
      const steps = [
        { step: 2, msg: "Initializing Discovery Agent. Formulating crawling index query tags...", delay: 800 },
        { step: 3, msg: "Invoking Data Enrichment Agent. Inspecting DNS registers & crawling target subdomains...", delay: 1800 },
        { step: 4, msg: "Initiating Match Qualification Agent. Comparing firmographics against configured ICP directives...", delay: 2800 },
        { step: 5, msg: "CRM Agent scanning database to block duplicate corporate domains...", delay: 3800 },
      ];

      steps.forEach((s) => {
        setTimeout(() => {
          setActiveStep(s.step);
        }, s.delay);
      });

      const res = await fetch("/api/search-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          country,
          companySize,
          revenueRange,
          keywords,
          icpId: selectedIcpId || undefined
        })
      });

      if (!res.ok) throw new Error("Agentic search failed execution");
      const data = await res.json();
      
      // Complete step
      setTimeout(() => {
        setAgentLogs(data.logs || []);
        setResults(data.results || []);
        setActiveStep(null);
        setLoading(false);
      }, 4200);

    } catch (err) {
      console.error(err);
      setLoading(false);
      setActiveStep(null);
    }
  };

  const handleStoreCrm = async (lead: DiscoveredLead) => {
    if (userRole === "Viewer") {
      alert("Viewer accounts cannot import new entities into CRM.");
      return;
    }

    try {
      const res = await fetch("/api/store-crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            name: lead.name,
            industry: lead.industry,
            website: lead.website,
            location: lead.location,
            revenue: lead.revenue,
            employees: lead.employees,
            description: lead.description,
            score: lead.score,
            status: "New"
          },
          contacts: lead.contacts,
          scoreDetail: lead.scoreDetail
        })
      });

      if (!res.ok) throw new Error("Could not sync to storage");
      const data = await res.json();

      setSyncedIds((prev) => ({ ...prev, [lead.id]: true }));
      
      if (onLeadSynced) {
        onLeadSynced();
      }
    } catch (e) {
      console.error(e);
      alert("Sync failed");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 font-sans" id="lead-discovery-root">
      
      {/* Visual Workspace Title */}
      <div className="border-b border-slate-200 dark:border-[#2A3241] pb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-800 dark:text-slate-200" /> Lead Discovery Agent Console
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Provide criteria parameters to configure our autonomous crawlers. Our system initiates detailed searches and scores targets.
        </p>
      </div>

      {/* Main Grid: Parameters on left, real-time feedback on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Parameters Form panel */}
        <div className="lg:col-span-1">
          <form className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241]/80 rounded-2xl shadow-sm p-6 space-y-5" onSubmit={runDiscoveryPipeline} id="form-discovery-search">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Target Settings</h3>
              <Search className="w-4 h-4 text-slate-300" />
            </div>

            {/* ICP Profile selection to pre-populate elements */}
            {icpProfiles.length > 0 && (
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Apply ICP Profile Rule Preset</label>
                <select 
                  value={selectedIcpId} 
                  onChange={handleIcpSelectChange}
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white dark:bg-[#151B2B]"
                >
                  <option value="">-- Customize parameters manually --</option>
                  {icpProfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4 pt-1">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1 font-sans">Corporate Sector / Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Manufacturing, Software, Logistics"
                  required
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white dark:bg-[#151B2B]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Geographic Location / Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Germany, United States"
                  required
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white dark:bg-[#151B2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Size Bracket</label>
                  <input
                    type="text"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    placeholder="e.g. 200-500"
                    required
                    className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white dark:bg-[#151B2B]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Est. Revenue</label>
                  <input
                    type="text"
                    value={revenueRange}
                    onChange={(e) => setRevenueRange(e.target.value)}
                    placeholder="e.g. > $10M"
                    required
                    className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white dark:bg-[#151B2B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-405 uppercase tracking-wider block mb-1 font-sans">Crawler Directives / Keywords</label>
                <textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. industrial automated setups, high torque tools"
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white dark:bg-[#151B2B] resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium text-xs py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mining Target Registers...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Deploy Agent Sequence
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Multi-Agent flow representation during crawling */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl shadow-sm p-6 space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-[#1E293B] pb-3">Agent Orchestration Monitor</h3>
            
            {/* Horizontal flow chart */}
            <div className="grid grid-cols-6 gap-2 text-center relative" id="multi-agent-orchestrator-ui">
              {[
                { step: 1, label: "User Input", desc: "Criteria", Icon: SlidersHorizontal },
                { step: 2, label: "Discovery", desc: "Plan query", Icon: Search },
                { step: 3, label: "Enrichment", desc: "Crawl stack", Icon: Server },
                { step: 4, label: "Scoring", desc: "ICP verify", Icon: Award },
                { step: 5, label: "CRM Sync", desc: "Deduplicate", Icon: Database },
                { step: 6, label: "Outreach", desc: "Templates", Icon: FileText },
              ].map((s) => {
                const isActive = activeStep === s.step;
                const isCompleted = activeStep !== null && activeStep > s.step;
                
                return (
                  <div key={s.step} className="space-y-2 relative">
                    <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border shadow-sm"
                      style={{
                        backgroundColor: isActive ? "#0f172a" : isCompleted ? "#0d9488" : "#f8fafc",
                        color: isActive || isCompleted ? "#ffffff" : "#94a3b8",
                        borderColor: isActive ? "#0f172a" : isCompleted ? "#0d9488" : "#e2e8f0"
                      }}
                    >
                      <s.Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate">{s.label}</p>
                      <p className="text-[8px] text-slate-450 mt-0.5 truncate font-mono">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Log display */}
            {(loading || agentLogs.length > 0) && (
              <div className="bg-slate-950 text-slate-350 font-mono text-[10px] p-4 rounded-xl space-y-1.5 h-48 overflow-y-auto border border-slate-800" id="terminal-discovery">
                <p className="text-slate-400 dark:text-slate-500 font-semibold">--- AUTONOMOUS AGENT STREAM INITIATED ---</p>
                {activeStep! >= 1 && <p className="text-slate-200">&gt; User query formulated correctly: Searching "{industry}" in {country}.</p>}
                {activeStep! >= 2 && <p className="text-teal-400">&gt; [Discovery Agent] Initiated Web index crawling strategies, targeting {country} directories.</p>}
                {activeStep! >= 3 && <p className="text-slate-400 dark:text-slate-500">&gt; [Enrichment Agent] Scanning company domains to collect installed tech stack and key decision-makers.</p>}
                {activeStep! >= 4 && <p className="text-amber-400">&gt; [Grading Agent] Parsing results to deliver custom score grades based on ICP rules...</p>}
                {activeStep! >= 5 && <p className="text-cyan-400">&gt; [CRM Agent] Inspecting existing relational schemas for duplicated records. Clean setup validated.</p>}
                
                {agentLogs.map((log, i) => (
                  <p key={i} className="text-emerald-400 mt-2">&gt; [{log.agent}] {log.timestamp}: {log.message}</p>
                ))}
              </div>
            )}

            {!loading && results.length === 0 && agentLogs.length === 0 && (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-[#2A3241] rounded-xl bg-slate-50 dark:bg-[#1E293B]/50">
                Awaiting search triggers. Fill out target parameters and dispatch agents to gather prospects.
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">DISCOVERED ACTIVE LEADS ({results.length})</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Discovery Completed Successfully
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse" id="discovery-results-table">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-[#2A3241] text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pr-2 font-medium">Company Name</th>
                        <th className="pb-3 pr-2 font-medium">Firmographics</th>
                        <th className="pb-3 pr-2 font-medium">Target Stakeholders</th>
                        <th className="pb-3 pr-2 text-center font-medium">Score</th>
                        <th className="pb-3 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-[#0F172A]/50">
                          <td className="py-3.5 pr-2 max-w-[200px]">
                            <div className="font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                              {lead.name}
                              <a href={lead.website} target="_blank" rel="noopener noreferrer" className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-slate-50">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal truncate mt-0.5">{lead.website}</span>
                          </td>
                          <td className="py-3.5 pr-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                            <div>Location: <strong className="text-slate-800 dark:text-slate-200 font-medium">{lead.location}</strong></div>
                            <div>Employees: <strong className="text-slate-800 dark:text-slate-200 font-medium">{lead.employees}</strong></div>
                            <div>Tech: <strong className="text-teal-600 text-[10px] font-mono bg-teal-50 px-1 py-0.5 rounded">{lead.technologies}</strong></div>
                          </td>
                          <td className="py-3.5 pr-2 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                            {lead.contacts && lead.contacts.map((c, ci) => (
                              <div key={ci} className="border-l-2 border-slate-200 dark:border-[#2A3241] pl-1.5">
                                <strong className="text-slate-700 dark:text-slate-300 block text-[11px] font-medium">{c.name}</strong>
                                <span className="block truncate max-w-[120px]">{c.role}</span>
                              </div>
                            ))}
                          </td>
                          <td className="py-3.5 pr-2 text-center">
                            <span className={`px-2 py-0.5 rounded font-semibold block text-center max-w-[50px] mx-auto text-[10px] ${lead.score >= 90 ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#2A3241]"}`}>
                              {lead.score}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-medium">
                            {syncedIds[lead.id] ? (
                              <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1 text-[11px]">
                                <ShieldCheck className="w-3.5 h-3.5" /> Synced to CRM
                              </span>
                            ) : (
                              <button
                                onClick={() => handleStoreCrm(lead)}
                                className="bg-white dark:bg-[#151B2B] hover:bg-slate-50 dark:hover:bg-[#0F172A] text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-[#2A3241] font-semibold text-[11px] px-3 py-1.5 rounded-md transition shadow-sm cursor-pointer"
                              >
                                Sync Import
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
