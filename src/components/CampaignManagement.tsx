import React, { useState, useEffect } from "react";
import {
  Plus, BarChart2, Loader2, RefreshCw, Send, Mail,
  Calendar, Users, Target, TrendingUp, CheckCircle2,
  Pause, Play, Clock, Zap, X, ChevronRight, AlertCircle
} from "lucide-react";

interface Campaign {
  id: string; name: string; audience: string; template: string;
  schedule: string; sentCount: number; openRate: number;
  replyRate: number; conversionRate: number;
  status: "Active" | "Paused" | "Completed"; createdAt: string;
}
interface CampaignManagementProps { userRole: "Admin" | "Team Member" | "Viewer"; }

const STATUS_STYLES = {
  Active:    { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500", bar: "from-emerald-500 to-teal-500" },
  Paused:    { bg: "bg-amber-50 dark:bg-amber-950/40",     text: "text-amber-700 dark:text-amber-400",     border: "border-amber-200 dark:border-amber-800",     dot: "bg-amber-500",  bar: "from-amber-400 to-orange-400" },
  Completed: { bg: "bg-slate-100 dark:bg-slate-800",       text: "text-slate-600 dark:text-slate-400",     border: "border-slate-200 dark:border-slate-700",     dot: "bg-slate-400",  bar: "from-slate-400 to-slate-500" },
};

function MetricBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
        <span className="font-bold text-slate-700 dark:text-slate-300">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CampaignManagement({ userRole }: CampaignManagementProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [icpProfiles, setIcpProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [audience, setAudience] = useState("");
  const [template, setTemplate] = useState("");
  const [schedule, setSchedule] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/campaigns");
      if (!res.ok) throw new Error();
      setCampaigns(await res.json());
    } catch { console.error("Failed to load campaigns"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchCampaigns();
    fetch("/api/icp").then(r => r.json()).then(setIcpProfiles).catch(console.error);
  }, []);

  const resetForm = () => { setName(""); setAudience(""); setTemplate(""); setSchedule(""); setError(""); };

  const injectPreset = () => {
    setName("EU Automation Outpost");
    setAudience("German Manufacturing Leader");
    setTemplate("Industrial Efficiency Deep Pitch");
    setSchedule("Mon–Wed 8 AM CET");
    setShowForm(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === "Viewer") { setError("Viewers cannot create campaigns."); return; }
    if (!name || !audience) { setError("Campaign name and audience are required."); return; }
    setIsCreating(true); setError("");
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, audience, template, schedule })
      });
      if (!res.ok) throw new Error();
      setCampaigns(await res.json());
      resetForm(); setShowForm(false);
    } catch { setError("Failed to create campaign."); }
    finally { setIsCreating(false); }
  };

  const active    = campaigns.filter(c => c.status === "Active").length;
  const paused    = campaigns.filter(c => c.status === "Paused").length;
  const completed = campaigns.filter(c => c.status === "Completed").length;
  const totalSent = campaigns.reduce((s, c) => s + (c.sentCount || 0), 0);
  const avgOpen   = campaigns.length ? Math.round(campaigns.reduce((s, c) => s + (c.openRate || 0), 0) / campaigns.length) : 0;
  const avgReply  = campaigns.length ? Math.round(campaigns.reduce((s, c) => s + (c.replyRate || 0), 0) / campaigns.length) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans" id="campaigns-root">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2A3241] pb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-violet-500" /> Outbound Campaigns
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage outreach sequences, track engagement, and monitor campaign performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={injectPreset}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0F172A] transition shadow-sm flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Preset
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </div>

      {/* ── Summary KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Active",     value: active,    icon: Play,        color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
          { label: "Paused",     value: paused,    icon: Pause,       color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/40" },
          { label: "Completed",  value: completed, icon: CheckCircle2,color: "text-slate-500",   bg: "bg-slate-100 dark:bg-slate-800" },
          { label: "Total Sent", value: totalSent, icon: Send,        color: "text-sky-500",     bg: "bg-sky-50 dark:bg-sky-950/40" },
          { label: "Avg Open",   value: `${avgOpen}%`,  icon: Mail,   color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-950/40" },
          { label: "Avg Reply",  value: `${avgReply}%`, icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-3 h-3 ${color}`} />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-50">{value}</div>
          </div>
        ))}
      </div>

      {/* ── Main grid: form + list ── */}
      <div className={`grid grid-cols-1 gap-6 ${showForm ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}>

        {/* ── Create form (slide in) ── */}
        {showForm && (
          <div className="lg:col-span-1">
            <form onSubmit={handleCreate} className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl overflow-hidden shadow-sm">
              {/* Form header */}
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">New Campaign</div>
                  <div className="text-[11px] text-white/70 mt-0.5">Set up your outbound sequence</div>
                </div>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="text-white/60 hover:text-white text-xl leading-none transition">×</button>
              </div>

              <div className="p-5 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl p-3 text-xs font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                  </div>
                )}

                {/* Campaign name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <BarChart2 className="w-3 h-3 text-violet-400" /> Campaign Name
                  </label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required
                    placeholder="e.g. EU Manufacturing Outbound Q1"
                    className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 transition" />
                </div>

                {/* Audience */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3 text-indigo-400" /> Target Audience
                  </label>
                  <select value={audience} onChange={e => setAudience(e.target.value)} required
                    className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl py-2.5 px-3.5 text-xs dark:text-slate-200 focus:outline-none focus:border-violet-400 transition">
                    <option value="">— Select ICP profile —</option>
                    {icpProfiles.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    {icpProfiles.length === 0 && <>
                      <option value="German Manufacturing Leader">German Manufacturing Leader</option>
                      <option value="US SaaS Series A/B">US SaaS Series A/B</option>
                    </>}
                  </select>
                </div>

                {/* Template */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3 h-3 text-sky-400" /> Copy Template
                  </label>
                  <input type="text" value={template} onChange={e => setTemplate(e.target.value)}
                    placeholder="e.g. Automation Solutions Pitch"
                    className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-violet-400 transition" />
                </div>

                {/* Schedule */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" /> Send Schedule
                  </label>
                  <input type="text" value={schedule} onChange={e => setSchedule(e.target.value)}
                    placeholder="e.g. Tue & Thu, 9 AM CET"
                    className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-violet-400 transition" />
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-[#2A3241] rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0F172A] transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={isCreating}
                    className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition">
                    {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Play className="w-3.5 h-3.5" /> Launch</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── Campaigns list ── */}
        <div className={showForm ? "lg:col-span-2" : "lg:col-span-1"}>
          {loading ? (
            <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-12 flex flex-col items-center gap-3 shadow-sm">
              <RefreshCw className="w-6 h-6 animate-spin text-violet-400" />
              <p className="text-xs text-slate-400">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white dark:bg-[#151B2B] border-2 border-dashed border-slate-200 dark:border-[#2A3241] rounded-2xl p-16 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-violet-500" />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No campaigns yet</p>
              <p className="text-xs text-slate-400 max-w-xs">Create your first outbound campaign to start tracking engagement and conversion metrics.</p>
              <button onClick={() => { resetForm(); setShowForm(true); }}
                className="mt-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
                Create First Campaign
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((camp) => {
                const s = STATUS_STYLES[camp.status];
                return (
                  <div key={camp.id} className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Card header */}
                    <div className="px-5 py-4 flex items-start justify-between gap-3 border-b border-slate-100 dark:border-[#1E293B]">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${s.bar} shadow-sm`}>
                          {camp.status === "Active" ? <Play className="w-4 h-4 text-white" /> :
                           camp.status === "Paused" ? <Pause className="w-4 h-4 text-white" /> :
                           <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-50 text-sm truncate">{camp.name}</div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Users className="w-2.5 h-2.5" /> {camp.audience}
                            </span>
                            {camp.schedule && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> {camp.schedule}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" /> {new Date(camp.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${camp.status === "Active" ? "animate-pulse" : ""}`}></span>
                        {camp.status}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="px-5 py-4">
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        {[
                          { label: "Sent",        value: camp.sentCount,     unit: "msgs",  color: "text-sky-600 dark:text-sky-400",    bg: "bg-sky-50 dark:bg-sky-950/30" },
                          { label: "Open Rate",   value: `${camp.openRate ?? 0}%`,  unit: "",  color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/30" },
                          { label: "Reply Rate",  value: `${camp.replyRate ?? 0}%`, unit: "",  color: "text-violet-600 dark:text-violet-400",bg: "bg-violet-50 dark:bg-violet-950/30" },
                          { label: "Converted",   value: `${camp.conversionRate ?? 0}%`, unit: "", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                        ].map(({ label, value, color, bg }) => (
                          <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                            <div className={`text-base font-bold ${color}`}>{value}</div>
                            <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Performance bars */}
                      <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-[#1E293B]">
                        <MetricBar label="Open Rate"   value={camp.openRate ?? 0}       max={100} color="from-blue-400 to-sky-500" />
                        <MetricBar label="Reply Rate"  value={camp.replyRate ?? 0}      max={100} color="from-violet-400 to-indigo-500" />
                        <MetricBar label="Conversion"  value={camp.conversionRate ?? 0} max={100} color="from-emerald-400 to-teal-500" />
                      </div>

                      {camp.template && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center gap-1.5 text-[10px] text-slate-400">
                          <Mail className="w-3 h-3 text-slate-300" />
                          Template: <span className="text-slate-600 dark:text-slate-300 font-medium">{camp.template}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
