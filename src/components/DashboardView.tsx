import { useEffect, useState } from "react";
import {
  Users, Target, Send, BadgeCheck, TrendingUp, RefreshCw, Layers,
  ArrowUpRight, CheckCircle2, AlertCircle, Bot, BrainCircuit, Sparkles,
  ShieldCheck, Zap, BarChart3, Mail, Activity, Search, Clock, ChevronRight
} from "lucide-react";

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
    id: string; name: string; industry: string; website: string;
    location: string; revenue: string; employees: number; score: number; status: string;
  }>;
  aiRecommendations: Array<{
    id: string; title: string; description: string; impact: string; type: string;
  }>;
  recentActivities: Array<{
    id: string; type: string; description: string; timestamp: string;
    userEmail: string; companyName?: string;
  }>;
}

interface DashboardViewProps {
  onNavigateTo: (page: string) => void;
  onSelectCompany: (companyId: string) => void;
  userRole: "Admin" | "Team Member" | "Viewer";
}

// ── Helpers ────────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, icon: Icon, iconColor, accent, onClick }: {
  label: string; value: string | number; sub: string;
  icon: any; iconColor: string; accent: string; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={`bg-white dark:bg-[#151B2B] p-4 rounded-2xl border border-slate-200 dark:border-[#2A3241] shadow-sm flex flex-col gap-3 ${onClick ? "cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-all" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{value}</div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function FunnelBar({ label, value, max, color, pct }: {
  label: string; value: number; max: number; color: string; pct: number;
}) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 shrink-0 text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate">{label}</div>
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${width}%` }} />
      </div>
      <div className="w-16 shrink-0 flex items-center justify-end gap-1.5">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{value}</span>
        <span className="text-[10px] text-slate-400 font-mono">{pct}%</span>
      </div>
    </div>
  );
}

const ACTIVITY_META: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  lead_discovered: { icon: Search,   color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/40",   label: "Lead Discovered"       },
  outreach_generated: { icon: Mail,  color: "text-sky-500",    bg: "bg-sky-50 dark:bg-sky-950/40",     label: "Outreach Drafted"      },
  crm_stored:      { icon: BadgeCheck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40", label: "CRM Synced"       },
  icp_saved:       { icon: Target,   color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40", label: "ICP Updated"         },
  lead_enriched:   { icon: Zap,      color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/40", label: "Enrichment Complete"   },
};

export default function DashboardView({ onNavigateTo, onSelectCompany, userRole }: DashboardViewProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Could not parse metrics");
      setData(await res.json());
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500 dark:text-slate-400 font-sans">
      <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
      <p className="text-xs font-medium">Loading SalesPilot intelligence...</p>
    </div>
  );

  if (error || !data) return (
    <div className="p-8 max-w-xl mx-auto text-center font-sans">
      <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
      <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm">Dashboard Load Error</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
      <button onClick={fetchDashboard} className="mt-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition">Retry</button>
    </div>
  );

  const { metrics, funnel, topLeads, aiRecommendations, recentActivities } = data;

  const totalFunnel = funnel.new + funnel.qualified + funnel.contacted + funnel.meetingScheduled + funnel.converted + funnel.lost;
  const pct = (v: number) => totalFunnel > 0 ? Math.round((v / totalFunnel) * 100) : 0;
  const qualifyRate = metrics.totalLeads > 0 ? Math.round((metrics.qualifiedLeads / metrics.totalLeads) * 100) : 0;
  const replyRate = metrics.outreachSent > 0 ? Math.round((funnel.meetingScheduled / Math.max(metrics.outreachSent, 1)) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans" id="dashboard-view-root">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2A3241] pb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">Prospect Intelligence Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">End-to-end pipeline visibility across all 9 SDR automation modules.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-[#2A3241]">
            Role: <strong className="text-slate-900 dark:text-slate-50">{userRole}</strong>
          </span>
          <button onClick={fetchDashboard} className="p-1.5 rounded-lg border border-slate-200 dark:border-[#2A3241] hover:bg-slate-50 dark:hover:bg-[#0F172A] transition shadow-sm">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          </button>
          <button onClick={() => onNavigateTo("discovery")} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5">
            Launch Agent <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Row 1: 6 KPI cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Pipeline"    value={metrics.totalLeads}      sub="Discovered leads"       icon={Users}       iconColor="text-indigo-500"  accent="bg-indigo-50 dark:bg-indigo-950/40"  onClick={() => onNavigateTo("crm")} />
        <MetricCard label="ICP Qualified"     value={metrics.qualifiedLeads}  sub={`${qualifyRate}% qualify rate`} icon={Target} iconColor="text-emerald-500" accent="bg-emerald-50 dark:bg-emerald-950/40" onClick={() => onNavigateTo("crm")} />
        <MetricCard label="Outreach Sent"     value={metrics.outreachSent}    sub="Email + LinkedIn"       icon={Send}        iconColor="text-sky-500"     accent="bg-sky-50 dark:bg-sky-950/40"        onClick={() => onNavigateTo("outreach")} />
        <MetricCard label="Active Campaigns"  value={metrics.activeCampaigns} sub="Live sequences"         icon={BarChart3}   iconColor="text-violet-500"  accent="bg-violet-50 dark:bg-violet-950/40"  onClick={() => onNavigateTo("campaigns")} />
        <MetricCard label="Meeting Rate"      value={`${replyRate}%`}         sub="Outreach → Meeting"     icon={TrendingUp}  iconColor="text-amber-500"   accent="bg-amber-50 dark:bg-amber-950/40" />
        <MetricCard label="CRM Records"       value={metrics.crmRecords}      sub="Deduped & synced"       icon={BadgeCheck}  iconColor="text-emerald-500" accent="bg-emerald-50 dark:bg-emerald-950/40" onClick={() => onNavigateTo("crm")} />
      </div>

      {/* ── Row 2: Pipeline health ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Qualify ratio */}
        <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Qualification Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{qualifyRate}%</span>
            <span className="text-xs text-slate-400 pb-1">of discovered leads</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${qualifyRate}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{metrics.qualifiedLeads} qualified out of {metrics.totalLeads} total</p>
        </div>

        {/* Duplicate guard */}
        <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Duplicate Guard</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</span>
            <span className="text-xs text-slate-400 pb-1">clean records</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full w-full" />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Deduplication agent active · {metrics.crmRecords} verified</p>
        </div>

        {/* Conversion rate */}
        <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pipeline Conversion</span>
            <Layers className="w-4 h-4 text-violet-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-violet-600 dark:text-violet-400">{metrics.conversionRate}%</span>
            <span className="text-xs text-slate-400 pb-1">closed won rate</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-violet-500 h-full rounded-full" style={{ width: `${metrics.conversionRate}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{funnel.converted} won · {funnel.lost} lost</p>
        </div>
      </div>

      {/* ── Row 3: Funnel + Outreach performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Lead Funnel */}
        <div className="bg-white dark:bg-[#151B2B] p-5 rounded-2xl border border-slate-200 dark:border-[#2A3241] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">CRM Pipeline Funnel</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Lead progression across all 7 stages</p>
            </div>
            <button onClick={() => onNavigateTo("crm")} className="text-[11px] text-indigo-500 font-semibold hover:underline flex items-center gap-0.5">
              View CRM <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            <FunnelBar label="Discovered"    value={funnel.new}             max={totalFunnel} color="bg-slate-400"    pct={pct(funnel.new)} />
            <FunnelBar label="Qualified"     value={funnel.qualified}       max={totalFunnel} color="bg-blue-500"     pct={pct(funnel.qualified)} />
            <FunnelBar label="Contacted"     value={funnel.contacted}       max={totalFunnel} color="bg-violet-500"   pct={pct(funnel.contacted)} />
            <FunnelBar label="Meeting"       value={funnel.meetingScheduled}max={totalFunnel} color="bg-amber-500"    pct={pct(funnel.meetingScheduled)} />
            <FunnelBar label="Closed Won"    value={funnel.converted}       max={totalFunnel} color="bg-emerald-500"  pct={pct(funnel.converted)} />
            <FunnelBar label="Closed Lost"   value={funnel.lost}            max={totalFunnel} color="bg-rose-400"     pct={pct(funnel.lost)} />
          </div>
        </div>

        {/* Outreach performance */}
        <div className="bg-white dark:bg-[#151B2B] p-5 rounded-2xl border border-slate-200 dark:border-[#2A3241] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">Outreach Performance</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Copywriter agent & campaign tracking metrics</p>
            </div>
            <button onClick={() => onNavigateTo("campaigns")} className="text-[11px] text-indigo-500 font-semibold hover:underline flex items-center gap-0.5">
              Campaigns <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Sent",       value: metrics.outreachSent,      unit: "messages",   color: "text-sky-600 dark:text-sky-400",     bg: "bg-sky-50 dark:bg-sky-950/40",     icon: Send },
              { label: "Meetings Booked",  value: funnel.meetingScheduled,   unit: "scheduled",  color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", icon: CheckCircle2 },
              { label: "Active Campaigns", value: metrics.activeCampaigns,   unit: "running",    color: "text-violet-600 dark:text-violet-400",bg: "bg-violet-50 dark:bg-violet-950/40",icon: BarChart3 },
              { label: "Reply Rate",       value: `${replyRate}%`,           unit: "response",   color: "text-emerald-600 dark:text-emerald-400",bg:"bg-emerald-50 dark:bg-emerald-950/40",icon: Activity },
            ].map(({ label, value, unit, color, bg, icon: Icon }) => (
              <div key={label} className={`${bg} rounded-xl p-3.5 border border-slate-100 dark:border-slate-800`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{unit}</div>
              </div>
            ))}
          </div>

          {/* Sequence type breakdown */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#1E293B] space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sequence Coverage</p>
            {[
              { label: "Cold Email", pct: 45, color: "bg-sky-500" },
              { label: "LinkedIn",   pct: 30, color: "bg-blue-500" },
              { label: "Follow-up",  pct: 25, color: "bg-violet-500" },
            ].map(({ label, pct: p, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-20 shrink-0">{label}</span>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`${color} h-full rounded-full`} style={{ width: `${p}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 font-mono w-8 text-right">{p}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Module status + Top leads ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Module pipeline status */}
        <div className="bg-white dark:bg-[#151B2B] p-5 rounded-2xl border border-slate-200 dark:border-[#2A3241] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-4 h-4 text-violet-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">Agent Pipeline Status</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { name: "ICP Definition",        status: "Active",   color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",   dot: "bg-emerald-500", nav: "icp" },
              { name: "Lead Discovery",         status: "Active",   color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",   dot: "bg-emerald-500", nav: "discovery" },
              { name: "Prospect Enrichment",    status: "Active",   color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",   dot: "bg-emerald-500", nav: "discovery" },
              { name: "AI Qualification",       status: "Active",   color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",   dot: "bg-emerald-500", nav: "crm" },
              { name: "Duplicate Detection",    status: "Active",   color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",   dot: "bg-emerald-500", nav: "crm" },
              { name: "CRM Onboarding",         status: "Active",   color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",   dot: "bg-emerald-500", nav: "crm" },
              { name: "Outreach Generation",    status: "Active",   color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",   dot: "bg-emerald-500", nav: "outreach" },
              { name: "Campaign Tracking",      status: "Active",   color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",   dot: "bg-emerald-500", nav: "campaigns" },
              { name: "Dashboard Analytics",    status: "Live",     color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",            dot: "bg-blue-500",    nav: "" },
            ].map(({ name, status, color, dot, nav }) => (
              <div key={name} onClick={() => nav && onNavigateTo(nav)}
                className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${nav ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0F172A] transition" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot} animate-pulse`}></span>
                  <span className="text-xs text-slate-700 dark:text-slate-300">{name}</span>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${color}`}>{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top leads table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#151B2B] p-5 rounded-2xl border border-slate-200 dark:border-[#2A3241] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">Top Qualified Prospects</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Highest ICP-scored leads ready for outreach</p>
            </div>
            <button onClick={() => onNavigateTo("crm")} className="text-[11px] text-indigo-500 font-semibold hover:underline flex items-center gap-0.5">
              Full Pipeline <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#1E293B] text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 text-left">Company</th>
                  <th className="pb-2.5 text-left">Industry</th>
                  <th className="pb-2.5 text-center">Score</th>
                  <th className="pb-2.5 text-center">Stage</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                {topLeads.map((company) => (
                  <tr key={company.id} onClick={() => onSelectCompany(company.id)}
                    className="hover:bg-slate-50 dark:hover:bg-[#0F172A]/60 cursor-pointer group transition-colors">
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-50 truncate max-w-[140px]">{company.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{company.location}</div>
                    </td>
                    <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400 truncate max-w-[100px]">{company.industry}</td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        company.score >= 90 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : company.score >= 70 ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                        {company.score}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{company.status}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-[11px] text-indigo-500 font-semibold group-hover:underline">View →</span>
                    </td>
                  </tr>
                ))}
                {topLeads.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400 text-xs">No leads yet. Launch the Discovery Agent to populate the pipeline.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Row 5: AI Insights + Activity feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* AI Recommendations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">AI Agent Insights</h3>
              <p className="text-[10px] text-slate-500 font-mono">Qualification & pipeline optimisation</p>
            </div>
          </div>
          <div className="space-y-3">
            {aiRecommendations.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">No recommendations yet.</p>
            )}
            {aiRecommendations.map((rec) => (
              <div key={rec.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-teal-400 truncate">{rec.title}</span>
                  <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    rec.impact === "High"   ? "bg-rose-500/20 text-rose-300"
                    : rec.impact === "Medium" ? "bg-amber-500/20 text-amber-300"
                    : "bg-slate-600/40 text-slate-400"}`}>
                    {rec.impact}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white dark:bg-[#151B2B] p-5 rounded-2xl border border-slate-200 dark:border-[#2A3241] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">Agent Activity Feed</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
            </span>
          </div>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {recentActivities.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6 font-mono">No agent activity yet.</p>
            )}
            {recentActivities.map((act) => {
              const meta = ACTIVITY_META[act.type] ?? { icon: Zap, color: "text-slate-400", bg: "bg-slate-100 dark:bg-slate-800", label: "Event" };
              const Icon = meta.icon;
              return (
                <div key={act.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{meta.label}</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed truncate">{act.description}</p>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {act.userEmail}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 6: Quick nav shortcuts ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "ICP Manager",      icon: Target,      color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", nav: "icp" },
          { label: "Discover Leads",   icon: Bot,         color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-950/30",  nav: "discovery" },
          { label: "CRM Pipeline",     icon: BrainCircuit,color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/30",  nav: "crm" },
          { label: "Outreach Agent",   icon: Send,        color: "text-sky-500",     bg: "bg-sky-50 dark:bg-sky-950/30",        nav: "outreach" },
          { label: "Campaigns",        icon: BarChart3,   color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/30",    nav: "campaigns" },
          { label: "Integrations",     icon: Layers,      color: "text-slate-500",   bg: "bg-slate-100 dark:bg-slate-800/50",   nav: "settings" },
        ].map(({ label, icon: Icon, color, bg, nav }) => (
          <button key={label} onClick={() => onNavigateTo(nav)}
            className={`${bg} border border-slate-200 dark:border-[#2A3241] rounded-xl p-3.5 flex flex-col items-center gap-2 hover:shadow-md hover:scale-[1.02] transition-all`}>
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
