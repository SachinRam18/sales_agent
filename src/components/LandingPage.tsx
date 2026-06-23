import { useState } from "react";
import { 
  ArrowRight, CheckCircle2, ShieldCheck, Zap, Users, Search, Target, 
  Mail, ArrowUpRight, Check, Play, Globe, Shield, RefreshCw, BarChart3, Database, Moon, Sun
} from "lucide-react";
import BackgroundMotionGraphics from "./BackgroundMotionGraphics";

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function LandingPage({ onStart, onLogin, isDarkMode, toggleDarkMode }: LandingPageProps) {
  // Simulated interactive preview states for the centerpiece
  const [selectedIcp, setSelectedIcp] = useState<"germany" | "us">("germany");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Synchronized");

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncStatus("Syncing...");
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus("HubSpot & Salesforce Updated");
    }, 1500);
  };

  const germanyLeads = [
    { name: "Schulz Maschinenbau GmbH", industry: "Manufacturing", employees: 340, score: 92, status: "CRM Synced", stack: "SAP ERP, AWS", revenue: "€42M" },
    { name: "Steinbach Automation", industry: "Manufacturing", employees: 210, score: 88, status: "CRM Synced", stack: "Salesforce, Azure", revenue: "€18M" },
    { name: "Bavaria Logistics Group", industry: "Transportation", employees: 480, score: 79, status: "Qualified", stack: "SAP, AWS", revenue: "€95M" },
    { name: "KBR Mechanical AG", industry: "Manufacturing", employees: 290, score: 95, status: "CRM Synced", stack: "SAP ERP, AWS", revenue: "€31M" }
  ];

  const usLeads = [
    { name: "Apex Global Robotics", industry: "Industrial Automation", employees: 410, score: 94, status: "CRM Synced", stack: "HubSpot, AWS", revenue: "$68M" },
    { name: "Vanguard Tooling Inc.", industry: "Manufacturing", employees: 300, score: 91, status: "CRM Synced", stack: "SAP, Azure", revenue: "$39M" },
    { name: "Midwest Casting Corp", industry: "Metal Fabrication", employees: 240, score: 85, status: "Qualified", stack: "Salesforce, AWS", revenue: "$22M" },
    { name: "Pacific Precision Parts", industry: "Manufacturing", employees: 490, score: 76, status: "CRM Synced", stack: "HubSpot, AWS", revenue: "$85M" }
  ];

  const currentLeads = selectedIcp === "germany" ? germanyLeads : usLeads;

  const features = [
    {
      icon: <Search className="w-5 h-5 text-blue-600 dark:text-emerald-500" />,
      title: "Lead Discovery Agent",
      description: "Automatically crawl localized registries, job postings, and company websites to find target accounts."
    },
    {
      icon: <Target className="w-5 h-5 text-blue-600 dark:text-emerald-500" />,
      title: "ICP Builder & Scoring",
      description: "Define firmographics, location ranges, and required software stacks. Discovered companies are instantly graded (0-100)."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-emerald-500" />,
      title: "Automated Data Enrichment",
      description: "Gather deep enterprise metadata, verified emails, decision-maker profiles, and active technology triggers."
    },
    {
      icon: <Mail className="w-5 h-5 text-blue-600 dark:text-emerald-500" />,
      title: "Outreach Copywriter",
      description: "Create highly personalized email templates and LinkedIn messages tailored to each prospect's background."
    },
    {
      icon: <Database className="w-5 h-5 text-blue-600 dark:text-emerald-500" />,
      title: "Auto-Pilot CRM Integration",
      description: "Native synchronization with Salesforce, HubSpot, and Attio. Detects and blocks duplicates automatically."
    },
    {
      icon: <Users className="w-5 h-5 text-blue-600 dark:text-emerald-500" />,
      title: "Multi-Agent Coordination",
      description: "Collaborative agents execute discovery, scoring, and writing in parallel, mimicking an entire SDR team."
    }
  ];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-screen font-sans text-[#0F172A] dark:text-white relative overflow-hidden" id="landing-page-root">
      <BackgroundMotionGraphics />

      {/* Navigation Header */}
      <header className="sticky top-0 bg-white dark:bg-[#151B2B]/80 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#2A3241] z-50 transition" id="landing-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-icon.svg" alt="SalesPilot AI Logo" className="w-8 h-8" id="landing-logo" />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-base tracking-tight text-[#0F172A] dark:text-white">SalesPilot</span>
              <span className="text-[#334155] dark:text-slate-200 font-bold text-[10px] bg-slate-100 dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#2A3241] px-1.5 py-0.5 rounded-md">AI</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#64748B] dark:text-slate-400">
            <a href="#product" className="hover:text-[#0F172A] dark:hover:text-white transition">Product</a>
            <a href="#features" className="hover:text-[#0F172A] dark:hover:text-white transition">Agents</a>
            <a href="#pricing" className="hover:text-[#0F172A] dark:hover:text-white transition">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg transition"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={onLogin} 
              className="text-xs font-semibold text-[#334155] dark:text-slate-200 hover:text-[#0F172A] dark:hover:text-white transition px-3 py-2"
              id="btn-login-header"
            >
              Sign In
            </button>
            <button 
              onClick={onStart}
              className="bg-[#2563EB] dark:bg-emerald-600 hover:bg-[#1D4ED8] dark:hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              id="btn-trial-header"
            >
              Free Workspace <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="relative pt-16 pb-12 md:pt-24 md:pb-16" id="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 bg-white dark:bg-[#151B2B] border border-[#E2E8F0] dark:border-[#2A3241] px-3.5 py-1 rounded-full text-[#334155] dark:text-slate-200 text-xs font-medium mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Agentic Outbound Platform for Enterprise B2B SaaS
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#0F172A] dark:text-white tracking-tight leading-tight mb-6 max-w-4xl mx-auto" id="hero-heading">
            This platform helps sales teams discover, qualify, and engage prospects.
          </h1>
          
          <p className="text-sm md:text-base text-[#64748B] dark:text-slate-400 leading-relaxed mb-8 max-w-2xl mx-auto" id="hero-subtext">
            SalesPilot AI deploys autonomous SDR agents that search company networks, qualify leads based on your ICP rules, update your CRM, and generate highly targeted outreach copy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto" id="hero-ctas">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto bg-[#0F172A] dark:bg-[#050A15] hover:bg-[#1e293b] dark:hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition flex items-center justify-center gap-2 text-xs cursor-pointer"
              id="btn-hero-trial"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={onStart}
              className="w-full sm:w-auto bg-white dark:bg-[#151B2B] border border-[#E2E8F0] dark:border-[#2A3241] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[#334155] dark:text-slate-200 font-semibold px-6 py-3 rounded-lg shadow-sm transition text-xs cursor-pointer"
              id="btn-hero-demo"
            >
              Request Custom Demo
            </button>
          </div>
        </div>
      </section>

      {/* Main Centerpiece Dashboard Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10" id="product">
        <div className="border border-[#E2E8F0] dark:border-[#2A3241] rounded-xl bg-white dark:bg-[#151B2B] shadow-xl overflow-hidden" id="hero-mockup">
          
          {/* Header Console Bar */}
          <div className="bg-[#0F172A] dark:bg-[#050A15] text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-slate-700 rounded-full"></span>
              <span className="w-2.5 h-2.5 bg-slate-700 rounded-full"></span>
              <span className="w-2.5 h-2.5 bg-slate-700 rounded-full"></span>
              <span className="ml-3 text-xs font-semibold text-slate-300 font-sans tracking-wide">
                SalesPilot AI SDR Console &bull; <span className="text-[#2563EB] dark:text-emerald-500">Live Workspace</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connected</span>
              <span>•</span>
              <span>CRM: Salesforce Connected</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 border-b border-[#E2E8F0] dark:border-[#2A3241] bg-slate-50 dark:bg-[#1E293B] divide-x divide-[#E2E8F0] dark:divide-[#2A3241]">
            <div className="p-4">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 tracking-wider block">Total Leads</span>
              <span className="text-lg font-semibold text-[#0F172A] dark:text-white mt-1 block">1,420</span>
            </div>
            <div className="p-4">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 tracking-wider block">ICP Qualified</span>
              <span className="text-lg font-semibold text-emerald-600 mt-1 block">865</span>
            </div>
            <div className="p-4">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 tracking-wider block">Outreach Sent</span>
              <span className="text-lg font-semibold text-[#0F172A] dark:text-white mt-1 block">4,210</span>
            </div>
            <div className="p-4">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 tracking-wider block">Active Campaigns</span>
              <span className="text-lg font-semibold text-[#2563EB] dark:text-emerald-500 mt-1 block">8</span>
            </div>
            <div className="p-4">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 tracking-wider block">Conv. Rate</span>
              <span className="text-lg font-semibold text-[#0F172A] dark:text-white mt-1 block">18.2%</span>
            </div>
            <div className="p-4">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 tracking-wider block">CRM Sync Rate</span>
              <span className="text-lg font-semibold text-emerald-600 mt-1 block">100%</span>
            </div>
          </div>

          {/* Interactive Workspace Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[500px]">
            
            {/* Left sidebar: ICP Builder Configuration */}
            <div className="border-r border-[#E2E8F0] dark:border-[#2A3241] p-5 bg-slate-50 dark:bg-[#1E293B]/50 space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 tracking-wider block mb-2">Ideal Customer Profile</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedIcp("germany")}
                    className={`flex-1 text-[11px] py-1.5 font-semibold rounded-md border transition text-center ${selectedIcp === "germany" ? "bg-white dark:bg-[#151B2B] border-[#E2E8F0] dark:border-[#2A3241] text-[#0F172A] dark:text-white shadow-sm font-bold" : "border-transparent text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"}`}
                  >
                    Germany ICP
                  </button>
                  <button 
                    onClick={() => setSelectedIcp("us")}
                    className={`flex-1 text-[11px] py-1.5 font-semibold rounded-md border transition text-center ${selectedIcp === "us" ? "bg-white dark:bg-[#151B2B] border-[#E2E8F0] dark:border-[#2A3241] text-[#0F172A] dark:text-white shadow-sm font-bold" : "border-transparent text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"}`}
                  >
                    US Mid-Market ICP
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 tracking-wider block">Targeting Rules</span>
                
                <div className="bg-white dark:bg-[#151B2B] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#2A3241] space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-[#64748B] dark:text-slate-400 block">Industries</label>
                    <span className="font-medium text-[#0F172A] dark:text-white block mt-0.5">Manufacturing, Heavy Industrial</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-[#1E293B] pt-2">
                    <label className="text-[10px] text-[#64748B] dark:text-slate-400 block">Location Scope</label>
                    <span className="font-medium text-[#0F172A] dark:text-white block mt-0.5">{selectedIcp === "germany" ? "Germany (DACH)" : "United States"}</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-[#1E293B] pt-2">
                    <label className="text-[10px] text-[#64748B] dark:text-slate-400 block">Employee Range</label>
                    <span className="font-medium text-[#0F172A] dark:text-white block mt-0.5">200 - 500 Employees</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-[#1E293B] pt-2">
                    <label className="text-[10px] text-[#64748B] dark:text-slate-400 block">Revenue Threshold</label>
                    <span className="font-medium text-[#0F172A] dark:text-white block mt-0.5">&gt; $10M ARR</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-[#1E293B] pt-2">
                    <label className="text-[10px] text-[#64748B] dark:text-slate-400 block">Tech Stack Filter</label>
                    <span className="font-medium text-[#0F172A] dark:text-white block mt-0.5">AWS, SAP ERP / Salesforce</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-lg border border-[#E2E8F0] dark:border-[#2A3241] text-center">
                <div className="text-xs font-semibold text-[#0F172A] dark:text-white mb-1">CRM Auto-Sync</div>
                <p className="text-[10px] text-[#64748B] dark:text-slate-400 leading-relaxed mb-3">Qualified contacts are saved directly into pipelines.</p>
                <button 
                  onClick={handleTriggerSync}
                  className={`w-full py-1.5 rounded-md text-[10px] font-semibold border bg-white dark:bg-[#151B2B] border-[#E2E8F0] dark:border-[#2A3241] transition flex items-center justify-center gap-1.5 ${isSyncing ? "text-blue-600 dark:text-emerald-500 bg-blue-50 dark:bg-emerald-900/40 dark:bg-blue-900/40" : "text-[#334155] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0F172A]"}`}
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                  {syncStatus}
                </button>
              </div>
            </div>

            {/* Middle: Discovered Qualified Lead spreadsheet list */}
            <div className="lg:col-span-2 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-sm text-[#0F172A] dark:text-white">Discovered Prospects</h3>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400">Autonomous agents continuously scan, enrich, and qualify leads.</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Auto-Enriched
                  </span>
                </div>

                <div className="overflow-x-auto border border-[#E2E8F0] dark:border-[#2A3241] rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white dark:bg-[#151B2B] border-b border-[#E2E8F0] dark:border-[#2A3241] text-[9px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                        <th className="p-3">Company Details</th>
                        <th className="p-3">Firmographics</th>
                        <th className="p-3 text-center">Score</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#2A3241]">
                      {currentLeads.map((lead, idx) => (
                        <tr key={idx} className="hover:bg-white dark:hover:bg-[#1E293B] transition-all">
                          <td className="p-3">
                            <span className="font-semibold text-[#0F172A] dark:text-white block">{lead.name}</span>
                            <span className="text-[10px] text-[#64748B] dark:text-slate-400 block font-mono">{lead.stack}</span>
                          </td>
                          <td className="p-3 text-[#334155] dark:text-slate-200">
                            <span className="block">{lead.employees} employees</span>
                            <span className="text-[10px] text-[#64748B] dark:text-slate-400 block">{lead.revenue} revenue</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 dark:bg-emerald-900/40 dark:bg-blue-900/40 border border-blue-100 dark:border-emerald-800 text-blue-700 dark:text-emerald-400 font-bold text-[10px]">
                              {lead.score}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                              {lead.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom: Simulated workflow outcomes showcase */}
              <div className="mt-5 border-t border-[#E2E8F0] dark:border-[#2A3241] pt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-2.5 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#2A3241]">
                  <div className="text-xs font-semibold text-[#0F172A] dark:text-white">CRM Duplication Lock</div>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Active</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#2A3241]">
                  <div className="text-xs font-semibold text-[#0F172A] dark:text-white">Tech-Stack Verification</div>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Verified</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#2A3241]">
                  <div className="text-xs font-semibold text-[#0F172A] dark:text-white">Outreach Ready</div>
                  <span className="text-[10px] text-[#2563EB] dark:text-emerald-500 font-semibold block mt-0.5">Generated</span>
                </div>
              </div>
            </div>

            {/* Right sidebar: Live multi-agent coordinator logger */}
            <div className="border-l border-[#E2E8F0] dark:border-[#2A3241] p-5 bg-slate-50 dark:bg-[#1E293B]/50 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 tracking-wider block mb-3">Agent Coordinator Logs</span>
                
                <div className="space-y-3 font-mono text-[9px] text-[#334155] dark:text-slate-200 leading-relaxed">
                  <div className="flex gap-2">
                    <span className="text-[#64748B] dark:text-slate-400">[14:02:10]</span>
                    <p><strong className="text-blue-700 dark:text-emerald-400 font-semibold">crawler:</strong> Scanned 43 candidate domains in Germany</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[#64748B] dark:text-slate-400">[14:02:15]</span>
                    <p><strong className="text-blue-700 dark:text-emerald-400 font-semibold">crawler:</strong> Extracted Schulz Maschinenbau GmbH</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[#64748B] dark:text-slate-400">[14:02:18]</span>
                    <p><strong className="text-blue-700 dark:text-emerald-400 font-semibold">enricher:</strong> Found tech-stack matching criteria (SAP ERP, AWS)</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[#64748B] dark:text-slate-400">[14:02:22]</span>
                    <p><strong className="text-blue-700 dark:text-emerald-400 font-semibold">score-eng:</strong> Match verified at 92% (excellent match)</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[#64748B] dark:text-slate-400">[14:02:25]</span>
                    <p><strong className="text-purple-700 font-semibold">writer:</strong> Generated cold email templates & outreach sequences</p>
                  </div>
                  <div className="flex gap-2 border-t border-slate-200 dark:border-[#2A3241]/80 pt-2">
                    <span className="text-[#64748B] dark:text-slate-400">[14:02:27]</span>
                    <p><strong className="text-emerald-700 font-semibold">crm-sync:</strong> Exported Schulz, Steinbach to HubSpot pipeline</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 text-white p-3.5 rounded-lg mt-5 space-y-1.5">
                <div className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  Active Outreach Sequence
                </div>
                <div className="text-[9px] text-slate-300 font-mono italic leading-relaxed line-clamp-4">
                  "Hi Dieter, I noticed Schulz Maschinenbau is scaling production in Saxony while managing tool integrations. Our team helps manufacturers automate data syncs..."
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Value & Outcomes Section */}
      <section className="py-16 bg-white dark:bg-[#151B2B] border-t border-[#E2E8F0] dark:border-[#2A3241]" id="value">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-2">Designed for B2B Revenue Teams</h2>
            <p className="text-2xl sm:text-3xl font-semibold text-[#0F172A] dark:text-white tracking-tight">Focus on Closed Deals, Not Data Entry</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#2A3241] bg-[#F8FAFC] dark:bg-[#0B1120]">
              <h3 className="font-semibold text-sm text-[#0F172A] dark:text-white mb-2">Workflow Automation</h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Skip searching databases manually. Simply define your Ideal Customer Profile rules, and let our agents run automated background workflows to gather details.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#2A3241] bg-[#F8FAFC] dark:bg-[#0B1120]">
              <h3 className="font-semibold text-sm text-[#0F172A] dark:text-white mb-2">Precision Qualification</h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Avoid wasting time on unqualified accounts. Our Lead Qualification Engine ranks every candidate from 0 to 100 based on your strict employee, geography, and stack requirements.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#2A3241] bg-[#F8FAFC] dark:bg-[#0B1120]">
              <h3 className="font-semibold text-sm text-[#0F172A] dark:text-white mb-2">Personalized Engagement</h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Generate tailored message sequences automatically. SalesPilot AI reviews prospect background information and technology signals to craft relevant outreach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Feature Grid */}
      <section className="py-20 bg-[#F8FAFC] dark:bg-[#0B1120] border-t border-[#E2E8F0] dark:border-[#2A3241]" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-2">Modular AI Agent Infrastructure</h2>
            <p className="text-2xl sm:text-3xl font-semibold text-[#0F172A] dark:text-white tracking-tight">
              An Autonomous SDR Stack
            </p>
            <p className="text-[#64748B] dark:text-slate-400 text-xs mt-3 leading-relaxed max-w-xl mx-auto">
              SalesPilot AI replaces fragile scripts and manual searches with specialized SDR agents cooperating to construct qualified outbound pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="features-grid">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-[#151B2B] rounded-xl p-6 border border-[#E2E8F0] dark:border-[#2A3241] shadow-sm hover:border-slate-350 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#2A3241] flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-sm text-[#0F172A] dark:text-white mb-2">{feature.title}</h3>
                <p className="text-[#64748B] dark:text-slate-400 text-xs leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CRM Trust Section */}
      <section className="py-16 bg-white dark:bg-[#151B2B] border-t border-b border-[#E2E8F0] dark:border-[#2A3241]" id="integrations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-6">Integrate with Your Existing Stack</h3>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition">
            <span className="text-[#0F172A] dark:text-white font-bold text-sm font-sans tracking-wide">SALESFORCE NATIVE</span>
            <span className="text-[#0F172A] dark:text-white font-bold text-sm font-sans tracking-wide">HUBSPOT CRM</span>
            <span className="text-[#0F172A] dark:text-white font-bold text-sm font-sans tracking-wide">ATTIO CRM</span>
            <span className="text-[#0F172A] dark:text-white font-bold text-sm font-sans tracking-wide">ZOHO ENTERPRISE</span>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-[#F8FAFC] dark:bg-[#0B1120]" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-2">Transparent Subscriptions</h2>
            <p className="text-2xl sm:text-3xl font-semibold text-[#0F172A] dark:text-white tracking-tight">Flexible Plans for B2B Teams</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch" id="pricing-wrapper">
            {/* Starter Plan */}
            <div className="bg-white dark:bg-[#151B2B] rounded-xl p-8 border border-[#E2E8F0] dark:border-[#2A3241] flex flex-col justify-between">
              <div>
                <h3 className="text-[#0F172A] dark:text-white text-base font-semibold mb-2">Starter Workspace</h3>
                <p className="text-[#64748B] dark:text-slate-400 text-xs leading-relaxed mb-6">For single founders and sales representatives wanting to automate research tasks.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-2xl font-semibold text-[#0F172A] dark:text-white">$49</span>
                  <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">/user/month</span>
                </div>
                <div className="border-t border-[#E2E8F0] dark:border-[#2A3241] pt-6 mb-8">
                  <ul className="space-y-3 text-xs text-[#334155] dark:text-slate-200">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-500 flex-shrink-0" /> Up to 250 enrichment queries/mo</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-500 flex-shrink-0" /> 1 Saved Ideal Customer Profile</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-500 flex-shrink-0" /> Outreach copywriter module</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-500 flex-shrink-0" /> Manual CSV data exports</li>
                  </ul>
                </div>
              </div>
              <button onClick={onStart} className="w-full font-semibold text-xs text-center py-2.5 px-4 rounded-lg bg-slate-50 dark:bg-[#1E293B] text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-[#2A3241] transition">
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Growth Pro Plan */}
            <div className="bg-white dark:bg-[#151B2B] rounded-xl p-8 border border-[#0F172A] dark:border-emerald-500 shadow-md flex flex-col justify-between relative ring-1 ring-[#0F172A] dark:ring-emerald-500">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#0F172A] dark:bg-[#050A15] text-white text-[9px] uppercase tracking-wider font-semibold rounded-full shadow-sm">
                Most Popular
              </span>
              <div>
                <h3 className="text-[#0F172A] dark:text-white text-base font-semibold mb-2">Growth Teams</h3>
                <p className="text-[#64748B] dark:text-slate-400 text-xs leading-relaxed mb-6">For expanding teams seeking automated CRM integrations and constant enrichment schedules.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-2xl font-semibold text-[#0F172A] dark:text-white">$149</span>
                  <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">/user/month</span>
                </div>
                <div className="border-t border-[#E2E8F0] dark:border-[#2A3241] pt-6 mb-8">
                  <ul className="space-y-3 text-xs text-[#334155] dark:text-slate-200">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-500 flex-shrink-0" /> Up to 2,500 enrichment queries/mo</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-500 flex-shrink-0" /> Unlimited saved ICP rules</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-500 flex-shrink-0" /> HubSpot & Salesforce native sync</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-500 flex-shrink-0" /> Automated sequence drafting</li>
                  </ul>
                </div>
              </div>
              <button onClick={onStart} className="w-full font-semibold text-xs text-center py-2.5 px-4 rounded-lg bg-[#2563EB] dark:bg-emerald-600 text-white hover:bg-[#1D4ED8] dark:hover:bg-emerald-700 shadow-sm transition">
                Start Growth Workspace
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-[#151B2B] rounded-xl p-8 border border-[#E2E8F0] dark:border-[#2A3241] flex flex-col justify-between">
              <div>
                <h3 className="text-[#0F172A] dark:text-white text-base font-semibold mb-2">Enterprise Plan</h3>
                <p className="text-[#64748B] dark:text-slate-400 text-xs leading-relaxed mb-6">For global sales organizations demanding custom APIs, security audits, and dedicated servers.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-2xl font-semibold text-[#0F172A] dark:text-white">Custom</span>
                  <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">/tailored billing</span>
                </div>
                <div className="border-t border-[#E2E8F0] dark:border-[#2A3241] pt-6 mb-8">
                  <ul className="space-y-3 text-xs text-[#334155] dark:text-slate-200">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-500 flex-shrink-0" /> Unlimited enrichments & crawler scans</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-500 flex-shrink-0" /> Dedicated database & hosting options</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-500 flex-shrink-0" /> SLAs & custom API integrations</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-500 flex-shrink-0" /> Dedicated SDR account coordinator</li>
                  </ul>
                </div>
              </div>
              <button onClick={onStart} className="w-full font-semibold text-xs text-center py-2.5 px-4 rounded-lg bg-slate-50 dark:bg-[#1E293B] text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-[#2A3241] transition">
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] dark:bg-[#050A15] text-slate-400 dark:text-slate-500 py-12 border-t border-slate-900" id="landing-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo-icon.svg" alt="SalesPilot AI Logo" className="w-7 h-7" />
              <span className="font-semibold text-sm text-white tracking-tight">SalesPilot AI</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500 font-sans">
              Automating corporate SDR pipelines to bypass research hurdles and deliver premium pre-qualified enterprise leads directly into CRM databases.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#product" className="hover:text-white transition">Product Console</a></li>
              <li><a href="#features" className="hover:text-white transition">Autonomous Agents</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing Plans</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Integrations</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="opacity-50">Salesforce native CRM</span></li>
              <li><span className="opacity-50">HubSpot database sync</span></li>
              <li><span className="opacity-50">Attio API setup</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="opacity-50">Privacy & data security</span></li>
              <li><span className="opacity-50">Terms of platform service</span></li>
              <li><span className="opacity-50">GDPR compliance records</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-500 dark:text-slate-400">
          © 2026 SalesPilot AI. All rights reserved. Built with B2B SaaS best practices.
        </div>
      </footer>
    </div>
  );
}
