import { useState, useEffect } from "react";
import { 
  Search, Trash2, RefreshCw, ExternalLink,
  FileText, Sparkles, User, Mail, Phone, ShieldCheck, 
  LayoutGrid, Kanban, ArrowUpDown, BrainCircuit, ChevronRight,
  Building2, MapPin, TrendingUp, Star, Bookmark, Calendar
} from "lucide-react";

interface Company {
  id: string; name: string; industry: string; website: string;
  location: string; revenue: string; employees: number; description: string;
  status: string; score: number; addedAt: string; notes?: string;
}
interface Contact {
  id: string; companyId: string; name: string; role: string;
  linkedin: string; email: string; phone: string;
}
interface LeadScoreDetail {
  companyId: string; score: number; industryMatch: number; sizeMatch: number;
  revenueMatch: number; techMatch: number; locationMatch: number; explanation: string;
}
interface ExecutiveIntelligence {
  seniority: string; department: string; buyingInfluence: "High" | "Medium" | "Low";
  painPoints: string[]; interestAreas: string[]; outreachAngle: string;
  likelihoodToRespond: "High" | "Medium" | "Low";
}
interface CrmModuleProps {
  onCompanySelected?: (id: string) => void;
  selectedCompanyId?: string | null;
  onCloseDetail?: () => void;
  userRole: "Admin" | "Team Member" | "Viewer";
}

const STAGES = ["Discovered", "Qualified", "Contacted", "Meeting", "Opportunity", "Won", "Lost"] as const;
type Stage = typeof STAGES[number];

const STAGE_COLORS: Record<Stage, { bg: string; text: string; dot: string; border: string }> = {
  Discovered:  { bg: "bg-slate-100 dark:bg-slate-800",      text: "text-slate-600 dark:text-slate-300",  dot: "bg-slate-400",   border: "border-slate-300 dark:border-slate-600" },
  Qualified:   { bg: "bg-blue-50 dark:bg-blue-950/40",      text: "text-blue-700 dark:text-blue-300",    dot: "bg-blue-500",    border: "border-blue-200 dark:border-blue-800" },
  Contacted:   { bg: "bg-violet-50 dark:bg-violet-950/40",  text: "text-violet-700 dark:text-violet-300",dot: "bg-violet-500",  border: "border-violet-200 dark:border-violet-800" },
  Meeting:     { bg: "bg-amber-50 dark:bg-amber-950/40",    text: "text-amber-700 dark:text-amber-300",  dot: "bg-amber-500",   border: "border-amber-200 dark:border-amber-800" },
  Opportunity: { bg: "bg-orange-50 dark:bg-orange-950/40",  text: "text-orange-700 dark:text-orange-300",dot: "bg-orange-500",  border: "border-orange-200 dark:border-orange-800" },
  Won:         { bg: "bg-emerald-50 dark:bg-emerald-950/40",text: "text-emerald-700 dark:text-emerald-300",dot:"bg-emerald-500",border: "border-emerald-200 dark:border-emerald-800" },
  Lost:        { bg: "bg-rose-50 dark:bg-rose-950/40",      text: "text-rose-700 dark:text-rose-300",    dot: "bg-rose-500",    border: "border-rose-200 dark:border-rose-800" },
};

function StageBadge({ stage }: { stage: Stage }) {
  const c = STAGE_COLORS[stage];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {stage}
    </span>
  );
}

function ScorePill({ score }: { score: number }) {
  if (score >= 90) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">{score}</span>;
  if (score >= 70) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">{score}</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{score}</span>;
}

function mapStatusToStage(status: string): Stage {
  const s = status?.toLowerCase() || "";
  if (s === "new" || s === "discovered") return "Discovered";
  if (s === "meeting scheduled" || s === "meeting") return "Meeting";
  if (s === "converted" || s === "closed won" || s === "won") return "Won";
  if (s === "opportunity") return "Opportunity";
  if (s === "lost") return "Lost";
  if (s === "qualified") return "Qualified";
  if (s === "contacted") return "Contacted";
  return "Discovered";
}

function mapStageToStatus(stage: Stage): string {
  if (stage === "Discovered") return "New";
  if (stage === "Meeting") return "Meeting Scheduled";
  if (stage === "Won") return "Converted";
  return stage;
}

export default function CrmModule({ onCompanySelected, selectedCompanyId, onCloseDetail, userRole }: CrmModuleProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"score-desc" | "score-asc" | "name-az" | "date-newest">("score-desc");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);
  const [detailContacts, setDetailContacts] = useState<Contact[]>([]);
  const [detailScore, setDetailScore] = useState<LeadScoreDetail | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);
  const [selectedContactForIntel, setSelectedContactForIntel] = useState<Contact | null>(null);
  const [execIntelData, setExecIntelData] = useState<ExecutiveIntelligence | null>(null);
  const [loadingIntel, setLoadingIntel] = useState(false);

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/companies");
      if (!res.ok) throw new Error("Failed to load companies");
      const json = await res.json();
      setCompanies(json); setFilteredCompanies(json);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    let temp = [...companies];
    if (searchTerm) temp = temp.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (statusFilter !== "All") temp = temp.filter((c) => mapStatusToStage(c.status) === statusFilter);
    if (sortBy === "score-desc") temp.sort((a, b) => b.score - a.score);
    else if (sortBy === "score-asc") temp.sort((a, b) => a.score - b.score);
    else if (sortBy === "name-az") temp.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "date-newest") temp.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    setFilteredCompanies(temp);
  }, [searchTerm, statusFilter, sortBy, companies]);

  useEffect(() => {
    if (selectedCompanyId) { fetchCompanyDetail(selectedCompanyId); setSelectedContactForIntel(null); setExecIntelData(null); }
    else setDetailCompany(null);
  }, [selectedCompanyId]);

  const fetchCompanyDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/crm/company-detail?id=${id}`);
      if (!res.ok) throw new Error("Could not parse record detail specs");
      const data = await res.json();
      setDetailCompany(data.company); setDetailContacts(data.contacts || []);
      setDetailScore(data.scoreDetail || null); setNoteText(data.company.notes || "");
    } catch (e) { console.error("Error loading detail", e); }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (userRole === "Viewer") { alert("Permission alert: Viewers cannot modify status maps."); return; }
    try {
      const res = await fetch("/api/crm/companies/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: newStatus }) });
      if (!res.ok) throw new Error("Update status failed");
      await fetchCompanies();
      if (detailCompany && detailCompany.id === id) setDetailCompany((prev) => prev ? { ...prev, status: newStatus } : null);
    } catch (e) { console.error(e); }
  };

  const handleSaveNotes = async () => {
    if (!detailCompany) return;
    if (userRole === "Viewer") { alert("Permission denied. Viewers are restricted from updating annotations."); return; }
    try {
      const res = await fetch("/api/crm/companies/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: detailCompany.id, notes: noteText }) });
      if (!res.ok) throw new Error("Error saving notes");
      alert("Notes saved successfully!"); await fetchCompanies();
    } catch (e) { console.error(e); }
  };

  const handleManualEnrich = async () => {
    if (!detailCompany) return;
    if (userRole === "Viewer") { alert("Viewers cannot initiate live enrichment tasks."); return; }
    setIsEnriching(true);
    try {
      const res = await fetch("/api/enrich-company", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId: detailCompany.id }) });
      if (!res.ok) throw new Error("Enrich failed");
      const resData = await res.json();
      alert(`Enrichment complete! Growth summary: ${resData.enrichment.growthPotential}`);
      await fetchCompanyDetail(detailCompany.id); await fetchCompanies();
    } catch (e) { console.error(e); alert("Failed enrichment scan cycle."); } finally { setIsEnriching(false); }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    if (userRole !== "Admin") { alert("Security rule: Only Workspace Admins can purge records."); return; }
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from CRM files?`)) return;
    try {
      const res = await fetch("/api/crm/companies/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error("Delete failed");
      setDetailCompany(null); if (onCloseDetail) onCloseDetail(); await fetchCompanies();
    } catch (e) { console.error(e); }
  };

  const handleFetchExecutiveIntel = async (contact: Contact) => {
    setSelectedContactForIntel(contact); setLoadingIntel(true); setExecIntelData(null);
    try {
      const res = await fetch("/api/generate-outreach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contactId: contact.id, companyId: detailCompany?.id }) });
      if (!res.ok) throw new Error("Failed to generate outreach details");
      const data = await res.json();
      if (data.executiveIntelligence) { setExecIntelData(data.executiveIntelligence); }
      else {
        setExecIntelData({
          seniority: contact.role.includes("VP") || contact.role.includes("Chief") || contact.role.includes("Director") ? "Senior Executive" : "Manager / Specialist",
          department: contact.role.includes("Sales") || contact.role.includes("Marketing") ? "Sales & Growth" : "Engineering / Operations",
          buyingInfluence: contact.role.includes("VP") || contact.role.includes("Chief") ? "High" : "Medium",
          painPoints: ["Manual reporting bottlenecks", "Disjointed workflows"],
          interestAreas: ["Data optimization", "CRM process efficiency"],
          outreachAngle: `Establish value around automating manual ${contact.role} workflows.`,
          likelihoodToRespond: "Medium"
        });
      }
    } catch (e) { console.error(e); } finally { setLoadingIntel(false); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans" id="crm-module-root">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2A3241] pb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-violet-500" /> CRM Lead Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track prospects through every stage — from discovery to closed won.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchCompanies} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-[#2A3241] rounded-lg hover:bg-slate-50 dark:hover:bg-[#0F172A] text-slate-600 dark:text-slate-300 transition">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> Sync
          </button>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button onClick={() => setViewMode("list")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "list" ? "bg-white dark:bg-[#151B2B] text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 dark:text-slate-400"}`}>
              <LayoutGrid className="w-3.5 h-3.5 text-blue-400" /> List
            </button>
            <button onClick={() => setViewMode("kanban")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "kanban" ? "bg-white dark:bg-[#151B2B] text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 dark:text-slate-400"}`}>
              <Kanban className="w-3.5 h-3.5 text-violet-400" /> Board
            </button>
          </div>
        </div>
      </div>

      {/* ── Search + Sort bar ── */}
      <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, industry, city..."
            className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-400 dark:text-slate-200" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg text-xs py-2 px-3 focus:outline-none dark:text-slate-200">
            <option value="score-desc">Score ↓</option>
            <option value="score-asc">Score ↑</option>
            <option value="name-az">Name A–Z</option>
            <option value="date-newest">Newest</option>
          </select>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className={`space-y-4 ${detailCompany ? "lg:col-span-2" : "lg:col-span-3"}`}>

          {/* LIST VIEW */}
          {viewMode === "list" && (
            <div className="bg-white dark:bg-[#151B2B] rounded-2xl border border-slate-200 dark:border-[#2A3241] shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-10 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" /> Loading leads...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-[#1E293B] bg-slate-50 dark:bg-[#1E293B]/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-5">Company</th>
                        <th className="py-3 px-4">Industry · Location</th>
                        <th className="py-3 px-4 text-center">LinkedIn</th>
                        <th className="py-3 px-4 text-center">Score</th>
                        <th className="py-3 px-4">Stage</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                      {filteredCompanies.map((c) => (
                        <tr key={c.id} onClick={() => onCompanySelected?.(c.id)}
                          className={`hover:bg-slate-50 dark:hover:bg-[#0F172A]/50 cursor-pointer transition-colors group ${selectedCompanyId === c.id ? "bg-violet-50/40 dark:bg-violet-950/10 border-l-2 border-violet-500" : ""}`}>
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-slate-900 dark:text-slate-50">{c.name}</div>
                            <a href={c.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5 mt-0.5">{c.website}</a>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                              <Building2 className="w-3 h-3 text-slate-400" />{c.industry}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />{c.location} · {c.employees || "?"} emp
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <a href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(c.name)}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-[#0A66C2] hover:bg-blue-100 dark:hover:bg-blue-950/60 hover:text-blue-700 transition"
                               title="Search Company on LinkedIn">
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                              </svg>
                            </a>
                          </td>
                          <td className="py-3.5 px-4 text-center"><ScorePill score={c.score} /></td>
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <select value={mapStatusToStage(c.status)} onChange={(e) => handleUpdateStatus(c.id, mapStageToStatus(e.target.value as Stage))}
                              className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-indigo-400">
                              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => onCompanySelected?.(c.id)} className="text-indigo-500 hover:text-indigo-700 font-semibold text-[11px] flex items-center gap-0.5">
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteCompany(c.id, c.name)} className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-300 hover:text-rose-500 transition" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCompanies.length === 0 && (
                        <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-xs">No leads match the current filters.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* KANBAN VIEW — horizontal row-per-stage layout */}
          {viewMode === "kanban" && (
            <div className="space-y-2" id="kanban-pipeline-container">
              {STAGES.map((stage) => {
                const stageLeads = filteredCompanies.filter((c) => mapStatusToStage(c.status) === stage);
                const col = STAGE_COLORS[stage];
                return (
                  <div key={stage} className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl overflow-hidden shadow-sm">
                    {/* Row header — always visible, click to collapse */}
                    <div className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[#1E293B]`}>
                      {/* Stage color bar */}
                      <span className={`w-1 h-5 rounded-full ${col.dot} shrink-0`}></span>
                      <span className={`text-xs font-bold ${col.text} min-w-[90px]`}>{stage}</span>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${col.bg} ${col.text} ${col.border}`}>
                        {stageLeads.length} {stageLeads.length === 1 ? "lead" : "leads"}
                      </span>
                      {/* Mini progress bar */}
                      <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ml-1">
                        <div className={`h-full rounded-full ${col.dot} transition-all`}
                          style={{ width: companies.length ? `${(stageLeads.length / companies.length) * 100}%` : "0%" }} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {companies.length ? Math.round((stageLeads.length / companies.length) * 100) : 0}%
                      </span>
                    </div>

                    {/* Cards — responsive wrap grid */}
                    {stageLeads.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 px-4 py-3">
                        {stageLeads.map((c) => (
                          <div key={c.id} onClick={() => onCompanySelected?.(c.id)}
                            className={`border rounded-xl p-3.5 cursor-pointer transition-all group relative
                              ${selectedCompanyId === c.id
                                ? `${col.border} ring-1 ring-current ${col.bg}`
                                : "border-slate-200 dark:border-[#2A3241] hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-md bg-slate-50 dark:bg-[#0F172A]/40"}`}>

                            {/* Top: name + score */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="min-w-0">
                                <div className="font-semibold text-xs text-slate-900 dark:text-slate-50 leading-snug line-clamp-2">{c.name}</div>
                              </div>
                              <ScorePill score={c.score} />
                            </div>

                            {/* Meta */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                                <span className="truncate">{c.industry}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                <span className="truncate">{c.location}</span>
                              </div>
                              {c.employees > 0 && (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                  <TrendingUp className="w-3 h-3 shrink-0 text-slate-400" />
                                  <span>{c.employees.toLocaleString()} employees</span>
                                </div>
                              )}
                            </div>

                            {/* Actions — show on hover */}
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-1">
                                {stage !== "Discovered" && (
                                  <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(c.id, mapStageToStatus(STAGES[STAGES.indexOf(stage) - 1])); }}
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${col.bg} ${col.text} border ${col.border} hover:opacity-80 transition`}>
                                    ← Back
                                  </button>
                                )}
                                {stage !== "Lost" && (
                                  <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(c.id, mapStageToStatus(STAGES[STAGES.indexOf(stage) + 1])); }}
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${col.bg} ${col.text} border ${col.border} hover:opacity-80 transition`}>
                                    Next →
                                  </button>
                                )}
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteCompany(c.id, c.name); }}
                                className="p-1 rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-4 text-[11px] text-slate-400 dark:text-slate-500 italic">
                        No leads in this stage yet.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Detail Panel ── */}
        {detailCompany && (
          <div className="lg:col-span-1 space-y-4 animate-fade-in-up">
            {/* Company header card */}
            <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white leading-tight">{detailCompany.name}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <StageBadge stage={mapStatusToStage(detailCompany.status)} />
                    </div>
                  </div>
                  <button onClick={onCloseDetail} className="text-white/60 hover:text-white text-lg leading-none font-light transition">×</button>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{detailCompany.score}</div>
                    <div className="text-[9px] text-white/60 uppercase tracking-wider">ICP Score</div>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div>
                    <div className="text-[11px] text-white/80 flex items-center gap-1"><Building2 className="w-3 h-3" />{detailCompany.industry}</div>
                    <div className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{detailCompany.location}</div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 space-y-2 border-t border-slate-100 dark:border-[#1E293B]">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{detailCompany.description}</p>
                <a href={detailCompany.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:underline font-medium">
                  <ExternalLink className="w-3 h-3" />{detailCompany.website}
                </a>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Calendar className="w-3 h-3" /> Added {new Date(detailCompany.addedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Score breakdown */}
            {detailScore && (
              <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> ICP Alignment
                  </span>
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{detailScore.score}/100</span>
                </div>
                {[
                  { label: "Industry", value: detailScore.industryMatch, color: "bg-emerald-500" },
                  { label: "Company Size", value: detailScore.sizeMatch, color: "bg-blue-500" },
                  { label: "Tech Stack", value: detailScore.techMatch, color: "bg-violet-500" },
                  { label: "Location", value: detailScore.locationMatch, color: "bg-amber-500" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                      <span>{label}</span><span className="font-semibold text-slate-700 dark:text-slate-300">{value}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${value}%` }}></div>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 leading-relaxed border-t border-slate-100 dark:border-[#1E293B]">{detailScore.explanation}</p>
              </div>
            )}

            {/* Contacts & Outreach */}
            <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Contacts & Outreach
              </h3>
              <div className="space-y-2.5">
                {detailContacts.map((contact) => (
                  <div key={contact.id} className="border border-slate-100 dark:border-[#2A3241] rounded-xl p-3 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{contact.name}</div>
                          <div className="text-[10px] text-slate-400">{contact.role}</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 pl-9 text-[10px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-sky-400" />{contact.email}</div>
                      <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-400" />{contact.phone || "No direct phone"}</div>
                    </div>
                    {contact.linkedin && contact.linkedin !== "#" && (
                      <a href={contact.linkedin} target="_blank" rel="noopener noreferrer"
                        className="w-full mt-1.5 py-1.5 rounded-lg text-[10px] font-semibold bg-[#0A66C2] hover:bg-[#004182] text-white transition flex items-center justify-center gap-1 shadow-sm">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                        View LinkedIn Profile
                      </a>
                    )}
                    <button onClick={() => handleFetchExecutiveIntel(contact)}
                      className="w-full mt-1 py-1.5 rounded-lg text-[10px] font-semibold bg-slate-50 dark:bg-[#1E293B] hover:bg-violet-50 dark:hover:bg-violet-950/20 text-slate-600 dark:text-slate-300 hover:text-violet-700 border border-slate-200 dark:border-[#2A3241] transition flex items-center justify-center gap-1">
                      <BrainCircuit className="w-3 h-3 text-teal-500" /> Executive Intel
                    </button>
                  </div>
                ))}
                {detailContacts.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No contacts on record.</p>}
              </div>
            </div>

            {/* Executive Intel Card */}
            {selectedContactForIntel && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-bold text-teal-400 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5" /> {selectedContactForIntel.name}
                  </span>
                  <button onClick={() => setSelectedContactForIntel(null)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
                </div>
                {loadingIntel ? (
                  <div className="py-6 text-center text-[10px] font-mono text-slate-400 flex flex-col items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-teal-400" /> Analyzing profile...
                  </div>
                ) : execIntelData ? (
                  <div className="space-y-2.5 text-[10px]">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Seniority", value: execIntelData.seniority },
                        { label: "Department", value: execIntelData.department },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-900 rounded-lg p-2">
                          <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</div>
                          <div className="text-slate-200 font-semibold">{value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Buying Influence", value: execIntelData.buyingInfluence,
                          cls: execIntelData.buyingInfluence === "High" ? "text-rose-300 bg-rose-950 border-rose-900" : execIntelData.buyingInfluence === "Medium" ? "text-amber-300 bg-amber-950 border-amber-900" : "text-slate-300 bg-slate-800" },
                        { label: "Respond Likelihood", value: execIntelData.likelihoodToRespond,
                          cls: execIntelData.likelihoodToRespond === "High" ? "text-emerald-300 bg-emerald-950 border-emerald-900" : execIntelData.likelihoodToRespond === "Medium" ? "text-amber-300 bg-amber-950 border-amber-900" : "text-rose-300 bg-rose-950 border-rose-900" },
                      ].map(({ label, value, cls }) => (
                        <div key={label} className="bg-slate-900 rounded-lg p-2">
                          <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${cls}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2.5 space-y-1">
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">Pain Points</div>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-1">
                        {execIntelData.painPoints.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2.5 space-y-1">
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">Outreach Angle</div>
                      <p className="text-slate-300 italic leading-relaxed">"{execIntelData.outreachAngle}"</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-rose-400 text-center">Could not generate executive card.</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-4 shadow-sm space-y-2.5">
              <button onClick={handleManualEnrich} disabled={isEnriching}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition">
                {isEnriching ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Enriching...</> : <><Sparkles className="w-3.5 h-3.5 text-amber-300" /> Crawl Tech Stack & Signals</>}
              </button>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Notes</label>
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Log updates, discussion points, or custom notes..."
                  rows={3} className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:border-indigo-400" />
                <button onClick={handleSaveNotes}
                  className="w-full border border-slate-200 dark:border-[#2A3241] hover:bg-slate-50 dark:hover:bg-[#0F172A] text-slate-700 dark:text-slate-300 font-semibold text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Save Notes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
