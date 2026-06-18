import { useState, useEffect } from "react";
import { 
  Search, Trash2, CheckCircle, RefreshCw, ExternalLink, Calendar, 
  FileText, Sparkles, User, Mail, Phone, Bookmark, ShieldCheck, 
  ChevronRight, LayoutGrid, Kanban, ArrowUpDown, BrainCircuit, ShieldAlert
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  location: string;
  revenue: string;
  employees: number;
  description: string;
  status: string;
  score: number;
  addedAt: string;
  notes?: string;
}

interface Contact {
  id: string;
  companyId: string;
  name: string;
  role: string;
  linkedin: string;
  email: string;
  phone: string;
}

interface LeadScoreDetail {
  companyId: string;
  score: number;
  industryMatch: number;
  sizeMatch: number;
  revenueMatch: number;
  techMatch: number;
  locationMatch: number;
  explanation: string;
}

interface ExecutiveIntelligence {
  seniority: string;
  department: string;
  buyingInfluence: "High" | "Medium" | "Low";
  painPoints: string[];
  interestAreas: string[];
  outreachAngle: string;
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

  // Detailed view of selected company
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);
  const [detailContacts, setDetailContacts] = useState<Contact[]>([]);
  const [detailScore, setDetailScore] = useState<LeadScoreDetail | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);

  // Executive Intelligence state
  const [selectedContactForIntel, setSelectedContactForIntel] = useState<Contact | null>(null);
  const [execIntelData, setExecIntelData] = useState<ExecutiveIntelligence | null>(null);
  const [loadingIntel, setLoadingIntel] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/companies");
      if (!res.ok) throw new Error("Failed to load companies");
      const json = await res.json();
      setCompanies(json);
      setFilteredCompanies(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // filter & sort logic
    let temp = [...companies];
    if (searchTerm) {
      temp = temp.filter((c) => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "All") {
      temp = temp.filter((c) => mapStatusToStage(c.status) === statusFilter);
    }

    // Sort
    if (sortBy === "score-desc") {
      temp.sort((a, b) => b.score - a.score);
    } else if (sortBy === "score-asc") {
      temp.sort((a, b) => a.score - b.score);
    } else if (sortBy === "name-az") {
      temp.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "date-newest") {
      temp.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    }

    setFilteredCompanies(temp);
  }, [searchTerm, statusFilter, sortBy, companies]);

  // Handle viewing detail
  useEffect(() => {
    if (selectedCompanyId) {
      fetchCompanyDetail(selectedCompanyId);
      setSelectedContactForIntel(null);
      setExecIntelData(null);
    } else {
      setDetailCompany(null);
    }
  }, [selectedCompanyId]);

  const fetchCompanyDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/crm/company-detail?id=${id}`);
      if (!res.ok) throw new Error("Could not parse record detail specs");
      const data = await res.json();
      setDetailCompany(data.company);
      setDetailContacts(data.contacts || []);
      setDetailScore(data.scoreDetail || null);
      setNoteText(data.company.notes || "");
    } catch (e) {
      console.error("Error loading detail", e);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (userRole === "Viewer") {
      alert("Permission alert: Viewers cannot modify status maps.");
      return;
    }

    try {
      const res = await fetch("/api/crm/companies/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (!res.ok) throw new Error("Update status failed");
      
      // refresh lists
      await fetchCompanies();
      if (detailCompany && detailCompany.id === id) {
        setDetailCompany((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNotes = async () => {
    if (!detailCompany) return;
    if (userRole === "Viewer") {
      alert("Permission denied. Viewers are restricted from updating annotations.");
      return;
    }

    try {
      const res = await fetch("/api/crm/companies/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: detailCompany.id, notes: noteText })
      });
      if (!res.ok) throw new Error("Error saving notes");
      
      alert("Notes saved successfully!");
      await fetchCompanies();
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualEnrich = async () => {
    if (!detailCompany) return;
    if (userRole === "Viewer") {
      alert("Viewers cannot initiate live enrichment tasks.");
      return;
    }

    setIsEnriching(true);
    try {
      const res = await fetch("/api/enrich-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: detailCompany.id })
      });
      if (!res.ok) throw new Error("Enrich failed");
      const resData = await res.json();
      
      alert(`Enrichment complete! Growth summary: ${resData.enrichment.growthPotential}`);
      await fetchCompanyDetail(detailCompany.id);
      await fetchCompanies();
    } catch (e) {
      console.error(e);
      alert("Failed enrichment scan cycle.");
    } finally {
      setIsEnriching(false);
    }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    if (userRole !== "Admin") {
      alert("Security rule: Only Workspace Admins can purge records.");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from CRM files?`)) return;

    try {
      const res = await fetch("/api/crm/companies/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error("Delete failed");
      
      setDetailCompany(null);
      if (onCloseDetail) onCloseDetail();
      await fetchCompanies();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFetchExecutiveIntel = async (contact: Contact) => {
    setSelectedContactForIntel(contact);
    setLoadingIntel(true);
    setExecIntelData(null);

    try {
      const res = await fetch("/api/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          companyId: detailCompany?.id
        })
      });

      if (!res.ok) throw new Error("Failed to generate outreach details");
      const data = await res.json();

      if (data.executiveIntelligence) {
        setExecIntelData(data.executiveIntelligence);
      } else {
        // Fallback to local intelligence calculation if AI fails
        setExecIntelData({
          seniority: contact.role.includes("VP") || contact.role.includes("Chief") || contact.role.includes("Director") ? "Senior Executive" : "Manager / Specialist",
          department: contact.role.includes("Sales") || contact.role.includes("Marketing") || contact.role.includes("Business") ? "Sales & Growth" : "Engineering / Operations",
          buyingInfluence: contact.role.includes("VP") || contact.role.includes("Chief") ? "High" : "Medium",
          painPoints: ["Manual reporting bottlenecks", "Disjointed workflows"],
          interestAreas: ["Data optimization", "CRM process efficiency"],
          outreachAngle: `Establish value around automating manual ${contact.role} workflows.`,
          likelihoodToRespond: "Medium"
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIntel(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 font-sans" id="crm-module-root">
      
      {/* Visual Workspace Title */}
      <div className="border-b border-slate-200 dark:border-[#2A3241] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-slate-800 dark:text-slate-200" /> CRM Outbound Pipeline
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Manage your synchronized sales leads, track progress through CRM stages, and build stakeholder profile cards.
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "list" ? "bg-white dark:bg-[#151B2B] text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> List View
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "kanban" ? "bg-white dark:bg-[#151B2B] text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"}`}
          >
            <Kanban className="w-3.5 h-3.5" /> Pipeline Board
          </button>
        </div>
      </div>

      {/* Grid Layout depending on if details view is active */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Table View List / Kanban Board takes 2 cols, Detail View takes 1 col */}
        <div className={`space-y-6 ${detailCompany ? "lg:col-span-2" : "lg:col-span-3"}`}>
          
          {/* Top filtering suite */}
          <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241]/85 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company name, industry, or city..."
                className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-slate-900 focus:bg-white dark:bg-[#151B2B]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">Filter Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-slate-900"
                >
                  <option value="All">All Stages</option>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-slate-900"
                >
                  <option value="score-desc">Score (Highest)</option>
                  <option value="score-asc">Score (Lowest)</option>
                  <option value="name-az">Name (A-Z)</option>
                  <option value="date-newest">Date Added (Newest)</option>
                </select>
              </div>
            </div>
          </div>

          {viewMode === "list" ? (
            /* LIST VIEW */
            <div className="bg-white dark:bg-[#151B2B] rounded-2xl border border-slate-200 dark:border-[#2A3241]/60 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-[#1E293B] flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">Lead Database</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Total verified leads stored locally in your active sandbox</p>
                </div>
                <button 
                  onClick={fetchCompanies}
                  className="text-xs text-slate-800 dark:text-slate-200 font-semibold hover:underline flex items-center gap-1"
                  title="Sync Accounts List"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-sync
                </button>
              </div>

              {loading ? (
                <p className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">Querying DB file tables...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse" id="crm-accounts-table">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-[#1E293B] text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-50 dark:bg-[#1E293B]/50">
                        <th className="py-3 px-5">Target Company</th>
                        <th className="py-3 px-4">Firmographics</th>
                        <th className="py-3 px-4 text-center">Score</th>
                        <th className="py-3 px-4">Sales Stage</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60">
                      {filteredCompanies.map((c) => (
                        <tr 
                          key={c.id} 
                          onClick={() => onCompanySelected?.(c.id)}
                          className={`hover:bg-slate-50 dark:hover:bg-[#0F172A]/50 cursor-pointer transition ${selectedCompanyId === c.id ? "bg-slate-50 dark:bg-[#1E293B] border-l-2 border-slate-900" : ""}`}
                        >
                          <td className="py-4 px-5">
                            <div className="font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-1">
                              {c.name}
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal mt-0.5">{c.website}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                            <div>Industry: <span className="text-slate-700 dark:text-slate-300">{c.industry}</span></div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500">{c.location} • {c.employees || "Unknown"} employees</div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${c.score >= 90 ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" : c.score >= 70 ? "bg-slate-100 dark:bg-slate-800 text-slate-707 dark:text-slate-300 border border-slate-200 dark:border-[#2A3241]" : "bg-slate-50 dark:bg-[#1E293B] text-slate-500 dark:text-slate-400"}`}>
                              {c.score}
                            </span>
                          </td>
                          <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={mapStatusToStage(c.status)}
                              onChange={(e) => handleUpdateStatus(c.id, mapStageToStatus(e.target.value as Stage))}
                              className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-slate-900"
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => onCompanySelected?.(c.id)}
                                className="text-slate-850 dark:text-slate-200 hover:text-slate-950 font-semibold text-[11px] hover:underline"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handleDeleteCompany(c.id, c.name)}
                                className="p-1 hover:bg-slate-50 dark:hover:bg-[#0F172A] rounded text-slate-400 dark:text-slate-500 hover:text-rose-600 transition"
                                title="Delete Account permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCompanies.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                            No company accounts verified under current search tokens.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* PIPELINE KANBAN BOARD VIEW */
            <div className="flex gap-4 overflow-x-auto pb-4 items-start" id="kanban-pipeline-container" style={{ minHeight: "500px" }}>
              {STAGES.map((stage) => {
                const stageLeads = filteredCompanies.filter((c) => mapStatusToStage(c.status) === stage);
                
                return (
                  <div 
                    key={stage} 
                    className="flex-shrink-0 w-72 bg-slate-100/70 dark:bg-[#151B2B] rounded-2xl border border-slate-200/80 dark:border-[#2A3241] p-3 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A3241]/60 pb-2">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {stage}
                        <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-450 text-[10px] px-1.5 py-0.5 rounded font-mono">
                          {stageLeads.length}
                        </span>
                      </span>
                    </div>

                    {/* Card Container */}
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                      {stageLeads.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => onCompanySelected?.(c.id)}
                          className={`bg-white dark:bg-[#1E293B] border border-slate-200/70 dark:border-[#2A3241] rounded-xl p-3 shadow-sm hover:shadow-md cursor-pointer transition relative group ${selectedCompanyId === c.id ? "ring-2 ring-slate-800 dark:ring-slate-300" : ""}`}
                        >
                          <div className="font-semibold text-xs text-slate-900 dark:text-slate-50 pr-5 truncate">
                            {c.name}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{c.website}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium truncate">{c.location}</p>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 dark:border-slate-800">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.score >= 90 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                              Score: {c.score}
                            </span>

                            {/* State transitions quick action */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150">
                              {stage !== "Discovered" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const prevIdx = STAGES.indexOf(stage) - 1;
                                    handleUpdateStatus(c.id, mapStageToStatus(STAGES[prevIdx]));
                                  }}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500"
                                  title="Move Left"
                                >
                                  ←
                                </button>
                              )}
                              {stage !== "Lost" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextIdx = STAGES.indexOf(stage) + 1;
                                    handleUpdateStatus(c.id, mapStageToStatus(STAGES[nextIdx]));
                                  }}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500"
                                  title="Move Right"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {stageLeads.length === 0 && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                          No leads in stage
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Detail Panel taking 1 col */}
        {detailCompany && (
          <div className="lg:col-span-1 bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241]/90 rounded-2xl shadow-md p-5 space-y-6 animate-fade-in-up" id="crm-detail-sidebar">
            
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded px-1.5 py-0.5 font-bold font-mono">
                  Lead Details
                </span>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">SDR Pipeline Intelligence</p>
              </div>
              <button 
                onClick={onCloseDetail}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:text-slate-400 text-xs font-bold p-1 rounded hover:bg-slate-50 dark:hover:bg-[#0F172A]"
              >
                Close ×
              </button>
            </div>

            {/* Brand Title block */}
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 leading-tight">
                {detailCompany.name}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-normal leading-relaxed">{detailCompany.description}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-850 dark:text-slate-200 font-semibold pt-1">
                <Bookmark className="w-3 h-3 text-slate-400" /> Website: <a href={detailCompany.website} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-0.5 text-blue-600 dark:text-blue-400">{detailCompany.website} <ExternalLink className="w-2.5 h-2.5" /></a>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                Added: {new Date(detailCompany.addedAt).toLocaleDateString()}
              </div>
            </div>

            {/* AI Grading Breakdown radar list */}
            {detailScore && (
              <div className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-950 dark:text-slate-50 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Alignment Score Card
                  </span>
                  <span className="text-[11px] font-semibold text-slate-850 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-[#2A3241]">
                    {detailScore.score}/100 Match
                  </span>
                </div>

                <div className="space-y-2 text-[10px]">
                  <div>
                    <div className="flex justify-between text-slate-605 dark:text-slate-400 mb-0.5 font-sans">
                      <span>Industry Alignment</span>
                      <strong className="text-slate-805 dark:text-slate-200 font-semibold">{detailScore.industryMatch}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full">
                      <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${detailScore.industryMatch}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-605 dark:text-slate-400 mb-0.5 font-sans">
                      <span>Sizing Matching Scale</span>
                      <strong className="text-slate-805 dark:text-slate-200 font-semibold">{detailScore.sizeMatch}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full">
                      <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${detailScore.sizeMatch}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-605 dark:text-slate-400 mb-0.5 font-sans">
                      <span>Installed Tool Stack Match</span>
                      <strong className="text-slate-805 dark:text-slate-200 font-semibold">{detailScore.techMatch}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full">
                      <div className="bg-slate-900 dark:bg-slate-400 h-1 rounded-full" style={{ width: `${detailScore.techMatch}%` }}></div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 leading-relaxed border-t border-slate-200 dark:border-[#2A3241] font-sans">
                  {detailScore.explanation}
                </p>
              </div>
            )}

            {/* Decision Makers list */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block border-b border-slate-100 dark:border-[#1E293B] pb-1.5 font-sans">Decision Makers Directory</h3>
              <div className="space-y-3">
                {detailContacts.map((contact) => (
                  <div key={contact.id} className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-semibold text-slate-805 dark:text-slate-200 block flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {contact.name}
                      </strong>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-400 font-medium px-2 py-0.5 rounded">
                        {contact.role}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-505 dark:text-slate-450 space-y-1 pl-4 uppercase font-mono">
                      <div className="flex items-center gap-1.5 block lowercase">
                        <Mail className="w-3 h-3 text-slate-350" /> {contact.email}
                      </div>
                      <div className="flex items-center gap-1.5 block">
                        <Phone className="w-3 h-3 text-slate-350" /> {contact.phone || "No direct phone"}
                      </div>
                      <div className="flex items-center gap-1.5 block font-sans capitalize text-[10px]">
                        <span className="text-slate-400 dark:text-slate-500">LinkedIn:</span> <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-800 dark:text-slate-200 hover:text-slate-950 hover:underline">View Profile</a>
                      </div>
                    </div>

                    {/* Executive Intelligence Button */}
                    <button
                      onClick={() => handleFetchExecutiveIntel(contact)}
                      className="w-full mt-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-805 dark:text-slate-200 font-semibold text-[10px] py-1 rounded transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <BrainCircuit className="w-3 h-3 text-teal-500" /> Executive Profile Card
                    </button>
                  </div>
                ))}
                {detailContacts.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">No contact records enrichments triggered.</p>
                )}
              </div>
            </div>

            {/* Executive Intelligence Modal/Card Render */}
            {selectedContactForIntel && (
              <div className="bg-slate-950 text-white border border-slate-800 rounded-xl p-4 space-y-3 mt-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-bold text-teal-400 flex items-center gap-1 font-mono uppercase">
                    <BrainCircuit className="w-3.5 h-3.5" /> Stakeholder Intel Card
                  </span>
                  <button 
                    onClick={() => setSelectedContactForIntel(null)}
                    className="text-slate-500 hover:text-slate-300 text-[10px]"
                  >
                    Close
                  </button>
                </div>

                {loadingIntel ? (
                  <div className="text-center py-6 text-[10px] font-mono text-slate-400 flex flex-col items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                    <span>Extracting Buying Influence...</span>
                  </div>
                ) : execIntelData ? (
                  <div className="space-y-3 text-[11px]">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-slate-900 p-2 rounded">
                        <span className="text-slate-500 block text-[9px]">SENIORITY:</span>
                        <strong className="text-slate-200">{execIntelData.seniority}</strong>
                      </div>
                      <div className="bg-slate-900 p-2 rounded">
                        <span className="text-slate-500 block text-[9px]">DEPARTMENT:</span>
                        <strong className="text-slate-200">{execIntelData.department}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-slate-900 p-2 rounded">
                        <span className="text-slate-500 block text-[9px]">BUYING INFLUENCE:</span>
                        <span className={`font-semibold px-1 py-0.5 rounded text-[9px] ${
                          execIntelData.buyingInfluence === "High" 
                            ? "bg-rose-950 text-rose-300 border border-rose-900" 
                            : execIntelData.buyingInfluence === "Medium"
                            ? "bg-amber-950 text-amber-300 border border-amber-900"
                            : "bg-slate-800 text-slate-300"
                        }`}>
                          {execIntelData.buyingInfluence}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded">
                        <span className="text-slate-500 block text-[9px]">RESPOND LIKELIHOOD:</span>
                        <span className={`font-semibold px-1 py-0.5 rounded text-[9px] ${
                          execIntelData.likelihoodToRespond === "High" 
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-900" 
                            : execIntelData.likelihoodToRespond === "Medium"
                            ? "bg-amber-950 text-amber-300 border border-amber-900"
                            : "bg-rose-950 text-rose-300 border border-rose-900"
                        }`}>
                          {execIntelData.likelihoodToRespond}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded space-y-1">
                      <span className="text-slate-500 block text-[9px] font-mono uppercase">Target Pain Points:</span>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-1">
                        {execIntelData.painPoints.map((p, pi) => (
                          <li key={pi}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded space-y-1">
                      <span className="text-slate-500 block text-[9px] font-mono uppercase">Outreach Messaging Angle:</span>
                      <p className="text-slate-300 leading-relaxed italic">"{execIntelData.outreachAngle}"</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-rose-400 font-mono text-center">Could not generate executive card.</p>
                )}
              </div>
            )}

            {/* Manual actions block */}
            <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-4">
              <button
                onClick={handleManualEnrich}
                disabled={isEnriching}
                className="w-full bg-slate-900 text-white font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 shadow hover:bg-slate-800 transition cursor-pointer"
              >
                {isEnriching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deep Crawling Stacks...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Crawl Tech Stack & Signals
                  </>
                )}
              </button>
            </div>

            {/* Note taking annotations persistent */}
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Lead Activity Annotations</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log internal updates, discussion points or custom notes here..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:border-slate-900 focus:bg-white dark:bg-[#151B2B]"
              />
              <button
                onClick={handleSaveNotes}
                className="w-full bg-white dark:bg-[#151B2B] hover:bg-slate-50 dark:hover:bg-[#0F172A] text-slate-950 border border-slate-200 dark:border-[#2A3241] font-semibold text-xs py-2 rounded-lg transition shadow-sm cursor-pointer"
              >
                Sync Annotations Notes
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
