import { useState, useEffect } from "react";
import { Search, Trash2, Edit, CheckCircle, RefreshCw, Layers, ExternalLink, Calendar, HelpCircle, FileText, Sparkles, User, Mail, Phone, Bookmark, ShieldCheck, ChevronRight } from "lucide-react";

interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  location: string;
  revenue: string;
  employees: number;
  description: string;
  status: "New" | "Qualified" | "Contacted" | "Meeting Scheduled" | "Converted" | "Lost";
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

interface CrmModuleProps {
  onCompanySelected?: (id: string) => void;
  selectedCompanyId?: string | null;
  onCloseDetail?: () => void;
  userRole: "Admin" | "Team Member" | "Viewer";
}

export default function CrmModule({ onCompanySelected, selectedCompanyId, onCloseDetail, userRole }: CrmModuleProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Detailed view of selected company
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);
  const [detailContacts, setDetailContacts] = useState<Contact[]>([]);
  const [detailScore, setDetailScore] = useState<LeadScoreDetail | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);

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
    // filter logic
    let temp = [...companies];
    if (searchTerm) {
      temp = temp.filter((c) => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "All") {
      temp = temp.filter((c) => c.status === statusFilter);
    }
    setFilteredCompanies(temp);
  }, [searchTerm, statusFilter, companies]);

  // Handle viewing detail
  useEffect(() => {
    if (selectedCompanyId) {
      fetchCompanyDetail(selectedCompanyId);
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
        setDetailCompany((prev) => prev ? { ...prev, status: newStatus as any } : null);
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 font-sans" id="crm-module-root">
      
      {/* Grid Layout depending on if details view is active */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Table View List takes 2 cols, Detail View takes 1 col */}
        <div className={`space-y-6 ${detailCompany ? "lg:col-span-2" : "lg:col-span-3"}`}>
          
          {/* Top filtering suite */}
          <div className="bg-white border border-slate-200/85 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company name, industry, or city..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 font-sans whitespace-nowrap">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-slate-900 w-full md:w-auto"
              >
                <option value="All">Show All Outbound States</option>
                <option value="New">New Discovery</option>
                <option value="Qualified">Qualified Match</option>
                <option value="Contacted">Outreach Contacted</option>
                <option value="Meeting Scheduled">Meeting Arranged</option>
                <option value="Converted">Sales Won</option>
                <option value="Lost">Closed N/A</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Synchronized Outbound Accounts</h3>
                <p className="text-[11px] text-slate-400">Total verified leads stored locally in your active sandbox</p>
              </div>
              <button 
                onClick={fetchCompanies}
                className="text-xs text-slate-800 font-semibold hover:underline flex items-center gap-1"
                title="Sync Accounts List"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-sync
              </button>
            </div>

            {loading ? (
              <p className="p-8 text-center text-xs text-slate-400">Querying DB file tables...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse" id="crm-accounts-table">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/50">
                      <th className="py-3 px-5">Target Company</th>
                      <th className="py-3 px-4">Firmographics Block</th>
                      <th className="py-3 px-4 text-center">AI Grade</th>
                      <th className="py-3 px-4">Sales Cycle State</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {filteredCompanies.map((c) => (
                      <tr 
                        key={c.id} 
                        onClick={() => onCompanySelected?.(c.id)}
                        className={`hover:bg-slate-50/50 cursor-pointer transition ${selectedCompanyId === c.id ? "bg-slate-50 border-l-2 border-slate-900" : ""}`}
                      >
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-900 flex items-center gap-1">
                            {c.name}
                            <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition" />
                          </div>
                          <span className="text-[10px] text-slate-400 block font-normal mt-0.5">{c.website}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-medium">
                          <div>Industry: <span className="text-slate-700">{c.industry}</span></div>
                          <div className="text-[10px] text-slate-400">{c.location} • {c.employees} headcounts</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${c.score >= 90 ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : c.score >= 70 ? "bg-slate-100 text-slate-700 border border-slate-200" : "bg-slate-50 text-slate-500"}`}>
                            {c.score}
                          </span>
                        </td>
                        <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={c.status}
                            onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 font-medium focus:outline-none focus:border-slate-900"
                          >
                            <option value="New">New</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Meeting Scheduled">Meeting Sched</option>
                            <option value="Converted">Closed Won</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </td>
                        <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onCompanySelected?.(c.id)}
                              className="text-slate-800 hover:text-slate-950 font-semibold text-[11px]"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleDeleteCompany(c.id, c.name)}
                              className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-rose-600 transition"
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
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                          No company accounts verified under current search tokens.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Panel taking 1 col */}
        {detailCompany && (
          <div className="lg:col-span-1 bg-white border border-slate-200/90 rounded-2xl shadow-md p-5 space-y-6 animate-fade-in-up" id="crm-detail-sidebar">
            
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 font-bold font-mono">
                  Target Profile
                </span>
                <p className="text-[11px] text-slate-400 mt-1">SDR Intelligence Summary</p>
              </div>
              <button 
                onClick={onCloseDetail}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded hover:bg-slate-50"
              >
                Close ×
              </button>
            </div>

            {/* Brand Title block */}
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-slate-900 leading-tight flex items-center gap-1.5">
                {detailCompany.name}
              </h2>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">{detailCompany.description}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-800 font-semibold pt-1">
                <Bookmark className="w-3 h-3 text-slate-400" /> Website: <a href={detailCompany.website} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-0.5">{detailCompany.website} <ExternalLink className="w-2.5 h-2.5 text-slate-400" /></a>
              </div>
            </div>

            {/* AI Grading Breakdown radar list */}
            {detailScore && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Alignment Score Card
                  </span>
                  <span className="text-[11px] font-semibold text-slate-850 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {detailScore.score}/100 Match
                  </span>
                </div>

                <div className="space-y-2 text-[10px]">
                  <div>
                    <div className="flex justify-between text-slate-605 mb-0.5 font-sans">
                      <span>Industry Alignment</span>
                      <strong className="text-slate-800 font-semibold">{detailScore.industryMatch}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full">
                      <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${detailScore.industryMatch}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-605 mb-0.5 font-sans">
                      <span>Sizing Matching Scale</span>
                      <strong className="text-slate-800 font-semibold">{detailScore.sizeMatch}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full">
                      <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${detailScore.sizeMatch}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-605 mb-0.5 font-sans">
                      <span>Installed Tool Stack Match</span>
                      <strong className="text-slate-800 font-semibold">{detailScore.techMatch}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full">
                      <div className="bg-slate-900 h-1 rounded-full" style={{ width: `${detailScore.techMatch}%` }}></div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 pt-1 leading-relaxed border-t border-slate-200 font-sans">
                  {detailScore.explanation}
                </p>
              </div>
            )}

            {/* Decision Makers list */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-1.5 font-sans">Decision Makers Directory</h3>
              <div className="space-y-3">
                {detailContacts.map((contact) => (
                  <div key={contact.id} className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-semibold text-slate-800 block flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {contact.name}
                      </strong>
                      <span className="text-[9px] bg-slate-100 text-slate-705 font-medium px-2 py-0.5 rounded">
                        {contact.role}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 space-y-1 pl-4 uppercase font-mono">
                      <div className="flex items-center gap-1.5 block lowercase">
                        <Mail className="w-3 h-3 text-slate-350" /> {contact.email}
                      </div>
                      <div className="flex items-center gap-1.5 block">
                        <Phone className="w-3 h-3 text-slate-350" /> {contact.phone || "No direct phone"}
                      </div>
                      <div className="flex items-center gap-1.5 block font-sans capitalize text-[10px]">
                        <span className="text-slate-400">LinkedIn:</span> <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-slate-950 hover:underline">View Profile</a>
                      </div>
                    </div>
                  </div>
                ))}
                {detailContacts.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">No contact records enrichments triggered.</p>
                )}
              </div>
            </div>

            {/* Manual actions block */}
            <div className="space-y-2.5 border-t border-slate-205 pt-4">
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
            <div className="space-y-2 border-t border-slate-205 pt-4">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Lead Activity Annotations</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log internal updates, discussion points or custom notes here..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 resize-none focus:outline-none focus:border-slate-900 focus:bg-white"
              />
              <button
                onClick={handleSaveNotes}
                className="w-full bg-white hover:bg-slate-50 text-slate-950 border border-slate-200 font-semibold text-xs py-2 rounded-lg transition shadow-sm cursor-pointer"
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
