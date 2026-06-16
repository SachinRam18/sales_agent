import { useEffect, useState } from "react";
import { Users, Target, Send, ShieldAlert, BadgeCheck, TrendingUp, RefreshCw, Layers, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";

interface DashboardData {
  metrics: {
    totalLeads: number;
    qualifiedLeads: number;
    outreachSent: number;
    activeCampaigns: number;
    conversionRate: number;
    crmRecords: number;
  };
  funnel: {
    new: number;
    qualified: number;
    contacted: number;
    meetingScheduled: number;
    converted: number;
    lost: number;
  };
  topLeads: Array<{
    id: string;
    name: string;
    industry: string;
    website: string;
    location: string;
    revenue: string;
    employees: number;
    score: number;
    status: string;
  }>;
  aiRecommendations: Array<{
    id: string;
    title: string;
    description: string;
    impact: string;
    type: string;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    userEmail: string;
    companyName?: string;
  }>;
}

interface DashboardViewProps {
  onNavigateTo: (page: string) => void;
  onSelectCompany: (companyId: string) => void;
  userRole: "Admin" | "Team Member" | "Viewer";
}

export default function DashboardView({ onNavigateTo, onSelectCompany, userRole }: DashboardViewProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Could not parse metrics");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load dynamic CRM metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500 dark:text-slate-400 font-sans">
        <RefreshCw className="w-6 h-6 text-slate-900 dark:text-slate-50 animate-spin" />
        <p className="text-xs font-medium">Running SalesPilot intelligence analysis...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center font-sans">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm">Dashboard Load Error</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
        <button onClick={fetchDashboard} className="mt-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition">
          Retry Sync Action
        </button>
      </div>
    );
  }

  const { metrics, funnel, topLeads, aiRecommendations, recentActivities } = data;

  // Max value for scaling the funnel bar chart
  const funnelValues = Object.values(funnel) as number[];
  const maxFunnelVal = Math.max(...funnelValues, 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 font-sans" id="dashboard-view-root">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2A3241] pb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            Prospect Intelligence Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time insights from active autonomous SDR search agents and outreach pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-[#2A3241] font-medium">
            Role: <strong className="text-slate-900 dark:text-slate-50 font-semibold">{userRole}</strong>
          </span>
          <button 
            onClick={fetchDashboard}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-[#0F172A] text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-[#2A3241] hover:text-slate-800 dark:text-slate-200 transition shadow-sm"
            title="Refresh Core Telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateTo("discovery")}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            Launch Agent <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Core Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4" id="dashboard-metrics-grid">
        <div className="bg-white dark:bg-[#151B2B] p-4 rounded-xl border border-slate-200 dark:border-[#2A3241] shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 block">Total Pipeline</span>
          <div className="mt-2 flex items-baseline justify-between animate-fade-in">
            <span className="text-xl font-semibold text-slate-900 dark:text-slate-50">{metrics.totalLeads}</span>
            <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">In-Memory Entities</span>
        </div>

        <div className="bg-white dark:bg-[#151B2B] p-4 rounded-xl border border-slate-200 dark:border-[#2A3241] shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 block">ICP Qualified</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-semibold text-slate-900 dark:text-slate-50">{metrics.qualifiedLeads}</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[9px] text-emerald-600 font-medium mt-1 block">Score &ge; 70</span>
        </div>

        <div className="bg-white dark:bg-[#151B2B] p-4 rounded-xl border border-slate-200 dark:border-[#2A3241] shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 block">Outreach Sent</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-semibold text-slate-900 dark:text-slate-50">{metrics.outreachSent}</span>
            <Send className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">Email & LinkedIn</span>
        </div>

        <div className="bg-white dark:bg-[#151B2B] p-4 rounded-xl border border-slate-200 dark:border-[#2A3241] shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 block">Active Campaigns</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-semibold text-slate-900 dark:text-slate-50">{metrics.activeCampaigns}</span>
            <TrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <span className="text-[9px] text-emerald-600 font-medium mt-1 block">Live Sequence Logs</span>
        </div>

        <div className="bg-white dark:bg-[#151B2B] p-4 rounded-xl border border-slate-200 dark:border-[#2A3241] shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 block">Conversion Rate</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-semibold text-slate-900 dark:text-slate-50">{metrics.conversionRate}%</span>
            <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">Meeting Sched %</span>
        </div>

        <div className="bg-white dark:bg-[#151B2B] p-4 rounded-xl border border-slate-200 dark:border-[#2A3241] shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 block">CRM Records</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-semibold text-slate-900 dark:text-slate-50">{metrics.crmRecords}</span>
            <BadgeCheck className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <span className="text-[9px] text-slate-600 dark:text-slate-400 font-medium mt-1 block">No Duplicates</span>
        </div>
      </div>

      {/* Main Grid Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="dashboard-grid-content">
        
        {/* Left: Lead Funnel & Recent Searches */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Custom Lead Funnel Widget */}
          <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-slate-200 dark:border-[#2A3241] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">Lead Funnel Distribution</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Pipeline states mapped from database store files</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#1E293B] px-2.5 py-1 rounded border border-slate-200 dark:border-[#2A3241]">
                Active Stages
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>New Leads Discovery</span>
                  <span>{funnel.new} ({Math.round((funnel.new / maxFunnelVal) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full transition-all duration-350" style={{ width: `${(funnel.new / maxFunnelVal) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Qualified ICP Profile Match</span>
                  <span>{funnel.qualified} ({Math.round((funnel.qualified / maxFunnelVal) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-800 h-full rounded-full transition-all duration-350" style={{ width: `${(funnel.qualified / maxFunnelVal) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Outreach Sequence Started</span>
                  <span>{funnel.contacted} ({Math.round((funnel.contacted / maxFunnelVal) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-600 h-full rounded-full transition-all duration-350" style={{ width: `${(funnel.contacted / maxFunnelVal) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Meeting Scheduled</span>
                  <span>{funnel.meetingScheduled} ({Math.round((funnel.meetingScheduled / maxFunnelVal) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#0284C7] h-full rounded-full transition-all duration-350" style={{ width: `${(funnel.meetingScheduled / maxFunnelVal) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Converted (Closed Won)</span>
                  <span>{funnel.converted} ({Math.round((funnel.converted / maxFunnelVal) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-full rounded-full transition-all duration-350" style={{ width: `${(funnel.converted / maxFunnelVal) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium/Top Leads table list */}
          <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-slate-200 dark:border-[#2A3241] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">Top Rated Qualified Prospects</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Prioritized lead lists derived from custom AI grades</p>
              </div>
              <button 
                onClick={() => onNavigateTo("crm")}
                className="text-xs text-slate-700 dark:text-slate-300 font-semibold hover:text-slate-900 dark:text-slate-50 hover:underline"
              >
                View Pipeline &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#2A3241] text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-2 font-medium">Company Name</th>
                    <th className="pb-3 pr-2 font-medium">Industry</th>
                    <th className="pb-3 pr-2 text-center font-medium">Score</th>
                    <th className="pb-3 pr-2 text-center font-medium">Status</th>
                    <th className="pb-3 pr-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topLeads.map((company) => (
                    <tr 
                      key={company.id} 
                      className="hover:bg-slate-50 dark:hover:bg-[#0F172A]/75 cursor-pointer group"
                      onClick={() => onSelectCompany(company.id)}
                    >
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-50 pr-2 block truncate max-w-[170px]">
                        {company.name}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">{company.location}</span>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 pr-2">{company.industry}</td>
                      <td className="py-3 text-center pr-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${company.score >= 90 ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"}`}>
                          {company.score}
                        </span>
                      </td>
                      <td className="py-3 text-center pr-2">
                        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-[#2A3241]">
                          {company.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-slate-900 dark:text-slate-50 hover:text-slate-700 dark:text-slate-300 font-semibold text-[11px] group-hover:underline">
                          Analyze
                        </button>
                      </td>
                    </tr>
                  ))}
                  {topLeads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400 dark:text-slate-500 text-xs">No CRM entries created yet. Launch Lead Discovery to populate.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right side: AI agent recommendations & System Activities */}
        <div className="space-y-8">
          
          {/* AI Recommendations */}
          <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-slate-800/20 rounded-full blur-xl"></div>
            
            <h3 className="font-semibold text-sm mb-1 text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Agentic Insights
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-4 font-mono">Autonomous suggestions for qualification optimization</p>

            <div className="space-y-4">
              {aiRecommendations.map((rec) => (
                <div key={rec.id} className="bg-white dark:bg-[#151B2B]/5 p-3 rounded-lg border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-teal-400">{rec.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${rec.impact === "High" ? "bg-emerald-500/20 text-emerald-200" : rec.impact === "Medium" ? "bg-amber-500/20 text-amber-200" : "bg-slate-500/20 text-slate-300"}`}>
                      {rec.impact} Priority
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Multi-Agent Activities tracker */}
          <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-slate-200 dark:border-[#2A3241] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">SDR Activity Logs</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Verbatim updates from active agents</p>
              </div>
              <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {recentActivities.map((act) => (
                <div key={act.id} className="text-xs flex gap-2.5 items-start">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-900 flex-shrink-0"></div>
                  <div>
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">
                      {act.type === "lead_discovered" && "🔍 Lead Discovered"}
                      {act.type === "outreach_generated" && "✉️ Sequence Drafted"}
                      {act.type === "crm_stored" && "💾 CRM Sync Transact"}
                      {act.type === "icp_saved" && "⚙️ ICP Config Customization"}
                      {act.type === "lead_enriched" && "⚡ Enrichment Scan Completed"}
                      {!["lead_discovered", "outreach_generated", "crm_stored", "icp_saved", "lead_enriched"].includes(act.type) && "⚡ Dispatch Event"}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">{act.description}</p>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {act.userEmail}
                    </span>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-center text-slate-400 dark:text-slate-500 py-4 font-mono">No recent SDR updates dispatched.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
