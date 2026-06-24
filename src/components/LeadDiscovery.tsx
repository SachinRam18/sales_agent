import React, { useState, useEffect, useRef } from "react";
import {
  Loader2, ShieldCheck, CheckCircle2, ExternalLink,
  User, Bot, AlertCircle, Building2, MapPin, Users,
  Cpu, TrendingUp, Target, Zap, Search, ChevronRight,
  Globe, BadgeCheck
} from "lucide-react";

interface ICPProfile {
  id: string; name: string; industry: string; country: string;
  companySize: string; revenueRange: string; technologiesUsed: string; keywords: string;
}
interface DiscoveredLead {
  id: string; name: string; industry: string; website: string; location: string;
  revenue: string; employees: number; description: string; technologies: string;
  score: number;
  scoreDetail: { score: number; industryMatch: number; sizeMatch: number; revenueMatch: number; techMatch: number; locationMatch: number; explanation: string; };
  contacts: Array<{ name: string; role: string; linkedin: string; email: string; phone: string; }>;
  companySize?: string; employeeConfidence?: string; employeeSource?: string;
  discoveryConfidence?: number; discoveryConfidenceLevel?: string;
}
interface LeadDiscoveryProps {
  onLeadSynced?: () => void;
  userRole: "Admin" | "Team Member" | "Viewer";
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}
type ChatMessage = {
  id: string; role: "system" | "user" | "assistant";
  type: "text" | "parsing" | "searching" | "results" | "error";
  content?: string; parsedData?: any; results?: DiscoveredLead[];
  syncedIds?: Record<string, boolean>;
  logs?: Array<{ agent: string; message: string; timestamp: string }>;
};

function ScoreBadge({ score }: { score: number }) {
  if (score >= 90) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">{score}</span>;
  if (score >= 70) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">{score}</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{score}</span>;
}

function ConfBadge({ level }: { level?: string }) {
  if (!level) return null;
  const s = level === "High" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
          : level === "Medium" ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800";
  return <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${s}`}>{level}</span>;
}

function LeadCard({ lead, synced, onSync }: { lead: DiscoveredLead; synced: boolean; onSync: () => void }) {
  const companyLinkedin = lead.contacts?.find(c => c.linkedin?.includes("/company/"))?.linkedin || "https://www.linkedin.com/search/results/all/?keywords=" + encodeURIComponent(lead.name);
  return (
    <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Card top */}
      <div className="px-4 py-3 flex items-start justify-between gap-2 border-b border-slate-100 dark:border-[#1E293B]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-50 truncate">{lead.name}</div>
            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-500 transition shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a href={companyLinkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition shrink-0 flex items-center" title="Company LinkedIn">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Building2 className="w-2.5 h-2.5" />{lead.industry}</span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{lead.location}</span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Globe className="w-2.5 h-2.5" />{lead.website}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ScoreBadge score={lead.score} />
          {lead.discoveryConfidence !== undefined && <ConfBadge level={lead.discoveryConfidenceLevel} />}
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 py-3 space-y-2.5">
        {lead.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{lead.description}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {lead.employees > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-900">
              <Users className="w-2.5 h-2.5" /> {lead.employees.toLocaleString()} emp
            </span>
          )}
          {lead.revenue && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
              <TrendingUp className="w-2.5 h-2.5" /> {lead.revenue}
            </span>
          )}
          {lead.technologies && lead.technologies.split(",").slice(0, 3).map(t => (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900">
              <Cpu className="w-2.5 h-2.5" /> {t.trim()}
            </span>
          ))}
        </div>

        {/* Score breakdown mini bars */}
        {lead.scoreDetail && (
          <div className="grid grid-cols-5 gap-1 pt-1">
            {[
              { label: "Ind", value: lead.scoreDetail.industryMatch, color: "bg-blue-500" },
              { label: "Size", value: lead.scoreDetail.sizeMatch, color: "bg-violet-500" },
              { label: "Rev", value: lead.scoreDetail.revenueMatch, color: "bg-amber-500" },
              { label: "Tech", value: lead.scoreDetail.techMatch, color: "bg-sky-500" },
              { label: "Loc", value: lead.scoreDetail.locationMatch, color: "bg-emerald-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mb-0.5">
                  <div className={`${color} h-full rounded-full`} style={{ width: `${value}%` }} />
                </div>
                <div className="text-[8px] text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contacts + action */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-[#1E293B] flex flex-col gap-2">
        {lead.contacts && lead.contacts.length > 0 && (
          <div className="space-y-1.5 mb-1 border-b border-slate-100 dark:border-[#1E293B]/40 pb-2">
            {lead.contacts.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800 dark:text-slate-300 truncate">{c.name}</span>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">({c.role})</span>
                </div>
                {c.linkedin && c.linkedin !== "#" && (
                  <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:text-blue-700 transition flex items-center gap-0.5 ml-2 shrink-0">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            {lead.contacts.length > 0
              ? <><User className="w-3 h-3" /> {lead.contacts.length} contact{lead.contacts.length > 1 ? "s" : ""} found</>
              : <span className="italic">No contacts</span>}
          </div>
          {synced ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
              <BadgeCheck className="w-3.5 h-3.5" /> Synced to CRM
            </span>
          ) : (
            <button onClick={onSync}
              className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold px-3 py-1.5 rounded-xl transition shadow-sm">
              <ChevronRight className="w-3 h-3" /> Import to CRM
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeadDiscovery({ onLeadSynced, userRole, messages, setMessages }: LeadDiscoveryProps) {
  const [icpProfiles, setIcpProfiles] = useState<ICPProfile[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState("");
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/icp").then(r => r.json()).then(setIcpProfiles).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleIcpSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedIcpId(id);
    const p = icpProfiles.find(p => p.id === id);
    if (p) setPromptText(`Find me ${p.industry} companies in ${p.country} with ${p.companySize} employees and revenue ${p.revenueRange}. Keywords: ${p.keywords || ""}`);
  };

  const runDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    const msgId = Date.now().toString();
    const prompt = promptText;
    setMessages(prev => [
      ...prev,
      { id: msgId + "-user", role: "user", type: "text", content: prompt },
      { id: msgId + "-agent", role: "assistant", type: "parsing", content: "Parsing your request..." }
    ]);
    setPromptText(""); setLoading(true);
    try {
      const parseRes = await fetch("/api/parse-discovery-prompt", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt })
      });
      if (!parseRes.ok) throw new Error("Failed to parse prompt. Ensure the backend server is running.");
      const parsedData = await parseRes.json();
      setMessages(prev => prev.map(m => m.id === msgId + "-agent"
        ? { ...m, type: "searching", content: "Crawling company indexes...", parsedData } : m));
      const searchRes = await fetch("/api/search-leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: parsedData.industry, country: parsedData.country, companySize: parsedData.companySize, revenueRange: parsedData.revenueRange, keywords: parsedData.keywords, icpId: selectedIcpId || undefined })
      });
      if (!searchRes.ok) throw new Error("Search failed.");
      const data = await searchRes.json();
      setMessages(prev => prev.map(m => m.id === msgId + "-agent"
        ? { ...m, type: "results", content: "Discovery complete.", results: data.results || [], logs: data.logs || [], syncedIds: {} } : m));
    } catch (err: any) {
      setMessages(prev => prev.map(m => m.id === msgId + "-agent"
        ? { ...m, type: "error", content: err.message || "An error occurred." } : m));
    } finally { setLoading(false); }
  };

  const handleSync = async (msgId: string, lead: DiscoveredLead) => {
    if (userRole === "Viewer") { alert("Viewers cannot import leads."); return; }
    try {
      const res = await fetch("/api/store-crm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: { name: lead.name, industry: lead.industry, website: lead.website, location: lead.location, revenue: lead.revenue, employees: lead.employees, description: lead.description, score: lead.score, status: "New" }, contacts: lead.contacts, scoreDetail: lead.scoreDetail })
      });
      if (!res.ok) throw new Error("Sync failed");
      setMessages(prev => prev.map(m => m.id === msgId && m.syncedIds ? { ...m, syncedIds: { ...m.syncedIds, [lead.id]: true } } : m));
      if (onLeadSynced) onLeadSynced();
    } catch { alert("CRM sync failed."); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] font-sans" id="lead-discovery-root">

      {/* ── Header ── */}
      <div className="flex-none bg-white dark:bg-[#151B2B] border-b border-slate-200 dark:border-[#2A3241]">
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-500" /> Lead Discovery Agent
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Autonomous crawler — discovers, enriches, and scores prospects against your ICP.
            </p>
          </div>
          {icpProfiles.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ICP Preset</span>
              <select value={selectedIcpId} onChange={handleIcpSelect}
                className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-400 dark:text-slate-200 transition">
                <option value="">— Custom —</option>
                {icpProfiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Pipeline steps banner */}
        <div className="px-4 sm:px-6 pb-3 flex items-center gap-1.5 overflow-x-auto">
          {[
            { icon: Search,       label: "Crawl",    color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-950/40" },
            { icon: Zap,          label: "Enrich",   color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/40" },
            { icon: Target,       label: "Score",    color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
            { icon: ShieldCheck,  label: "Dedupe",   color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/40" },
            { icon: CheckCircle2, label: "CRM Sync", color: "text-teal-500",    bg: "bg-teal-50 dark:bg-teal-950/40" },
          ].map(({ icon: Icon, label, color, bg }, i, arr) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bg} shrink-0`}>
                <Icon className={`w-3 h-3 ${color}`} />
                <span className={`text-[10px] font-semibold ${color}`}>{label}</span>
              </div>
              {i < arr.length - 1 && <span className="text-slate-300 dark:text-slate-700 text-xs shrink-0">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Chat messages ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50 dark:bg-[#0B1120]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

            {/* Avatar */}
            <div className="flex-none w-8 h-8 rounded-full shrink-0 shadow-sm overflow-hidden border border-slate-200 dark:border-[#2A3241]">
              {msg.role === "user"
                ? <div className="bg-slate-900 dark:bg-slate-100 w-full h-full flex items-center justify-center"><User className="w-4 h-4 text-white dark:text-slate-900" /></div>
                : <div className="bg-indigo-600 w-full h-full flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>}
            </div>

            {/* Content */}
            <div className={`flex flex-col gap-2 max-w-[88%] ${msg.role === "user" ? "items-end" : "items-start"}`}>

              {/* Bubble */}
              {msg.content && (
                <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm max-w-lg ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : msg.type === "error"
                    ? "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-tl-none"
                    : "bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] text-slate-800 dark:text-slate-200 rounded-tl-none"}`}>
                  {(msg.type === "parsing" || msg.type === "searching") ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500 shrink-0" />
                      {msg.content}
                    </span>
                  ) : msg.type === "error" ? (
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {msg.content}
                    </span>
                  ) : msg.content}
                </div>
              )}

              {/* Parsed parameters chips */}
              {msg.parsedData && (
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-3 border border-slate-200 dark:border-[#2A3241] shadow-sm w-full max-w-lg">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Parameters Detected</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Industry", value: msg.parsedData.industry, color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900" },
                      { label: "Country",  value: msg.parsedData.country,  color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900" },
                      { label: "Size",     value: msg.parsedData.companySize, color: "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-900" },
                      { label: "Revenue",  value: msg.parsedData.revenueRange, color: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900" },
                    ].filter(c => c.value).map(({ label, value, color }) => (
                      <span key={label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${color}`}>
                        <span className="opacity-60">{label}:</span> {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent telemetry log */}
              {msg.logs && msg.logs.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 w-full max-w-2xl font-mono text-[10px] space-y-1.5 max-h-[150px] overflow-y-auto shadow-inner">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Agent Telemetry</p>
                  {msg.logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                      <span className="text-indigo-400 font-bold shrink-0">[{log.agent}]</span>
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Results grid */}
              {msg.type === "results" && msg.results && (
                <div className="w-full max-w-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {msg.results.length} Lead{msg.results.length !== 1 ? "s" : ""} Discovered
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">ICP scored · enriched</span>
                  </div>

                  {msg.results.length === 0 ? (
                    <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-8 text-center">
                      <p className="text-sm text-slate-500">No leads matched these criteria. Try broadening your search.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {msg.results.map(lead => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          synced={!!(msg.syncedIds && msg.syncedIds[lead.id])}
                          onSync={() => handleSync(msg.id, lead)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ── */}
      <div className="flex-none bg-white dark:bg-[#151B2B] border-t border-slate-200 dark:border-[#2A3241] px-4 sm:px-6 py-4">
        <form onSubmit={runDiscovery} className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={promptText}
              onChange={e => setPromptText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runDiscovery(e as any); } }}
              placeholder='e.g. "Find SaaS companies in Germany with 200–500 employees and SAP ERP"'
              rows={2}
              className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-2xl py-3 px-4 text-sm dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition"
            />
          </div>
          <button type="submit" disabled={loading || !promptText.trim()}
            className="flex-none w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg transition-all shrink-0">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2">
          Agent pipeline: <span className="text-indigo-400">Parse</span> → <span className="text-amber-400">Crawl</span> → <span className="text-emerald-400">Enrich</span> → <span className="text-violet-400">Score</span> → <span className="text-teal-400">CRM Sync</span>
        </p>
      </div>
    </div>
  );
}
