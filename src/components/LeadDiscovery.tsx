import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, ShieldCheck, CheckCircle2, ExternalLink, SlidersHorizontal, User, Bot, AlertCircle } from "lucide-react";

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
  companySize?: string;
  employeeConfidence?: string;
  employeeSource?: string;
  discoveryConfidence?: number;
  discoveryConfidenceLevel?: string;
}

interface LeadDiscoveryProps {
  onLeadSynced?: () => void;
  userRole: "Admin" | "Team Member" | "Viewer";
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  type: "text" | "parsing" | "searching" | "results" | "error";
  content?: string;
  parsedData?: any;
  results?: DiscoveredLead[];
  syncedIds?: Record<string, boolean>;
  logs?: Array<{ agent: string; message: string; timestamp: string }>;
};

export default function LeadDiscovery({ onLeadSynced, userRole, messages, setMessages }: LeadDiscoveryProps) {
  const [icpProfiles, setIcpProfiles] = useState<ICPProfile[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState("");
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/icp")
      .then((r) => r.json())
      .then((data) => {
        setIcpProfiles(data);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleIcpSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedIcpId(id);
    const p = icpProfiles.find((p) => p.id === id);
    if (p) {
      setPromptText(`Find me ${p.industry} companies in ${p.country} with ${p.companySize} employees and revenue ${p.revenueRange}. Keywords: ${p.keywords || ""}`);
    }
  };

  const runDiscoveryPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    const newMsgId = Date.now().toString();
    const userPrompt = promptText;
    
    setMessages(prev => [
      ...prev,
      { id: newMsgId + "-user", role: "user", type: "text", content: userPrompt },
      { id: newMsgId + "-agent", role: "assistant", type: "parsing", content: "Parsing natural language prompt..." }
    ]);
    
    setPromptText("");
    setLoading(true);

    try {
      // 1. Parse Prompt
      const parseRes = await fetch("/api/parse-discovery-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt })
      });
      
      if (!parseRes.ok) {
        throw new Error("Failed to parse prompt. Please ensure the backend server is running and updated.");
      }
      
      const parsedData = await parseRes.json();

      // Update to Searching state
      setMessages(prev => prev.map(m => 
        m.id === newMsgId + "-agent" 
          ? { ...m, type: "searching", content: "Initiating discovery agents...", parsedData } 
          : m
      ));

      // 2. Search Leads
      const searchRes = await fetch("/api/search-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: parsedData.industry,
          country: parsedData.country,
          companySize: parsedData.companySize,
          revenueRange: parsedData.revenueRange,
          keywords: parsedData.keywords,
          icpId: selectedIcpId || undefined
        })
      });

      if (!searchRes.ok) throw new Error("Agentic search failed execution");
      const searchData = await searchRes.json();

      // 3. Display Results
      setMessages(prev => prev.map(m => 
        m.id === newMsgId + "-agent" 
          ? { ...m, type: "results", content: "Discovery completed.", results: searchData.results || [], logs: searchData.logs || [], syncedIds: {} } 
          : m
      ));

    } catch (err: any) {
      console.error(err);
      setMessages(prev => prev.map(m => 
        m.id === newMsgId + "-agent" 
          ? { ...m, type: "error", content: err.message || "An unexpected error occurred." } 
          : m
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleStoreCrm = async (msgId: string, lead: DiscoveredLead) => {
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
      
      setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.syncedIds) {
          return { ...m, syncedIds: { ...m.syncedIds, [lead.id]: true } };
        }
        return m;
      }));
      
      if (onLeadSynced) {
        onLeadSynced();
      }
    } catch (e) {
      console.error(e);
      alert("Sync failed");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0F172A] font-sans" id="lead-discovery-root">
      
      {/* Header */}
      <div className="flex-none bg-white dark:bg-[#151B2B] border-b border-slate-200 dark:border-[#2A3241] p-4 sm:px-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Lead Discovery Agent
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chat with the autonomous crawler to discover and qualify new prospects.
          </p>
        </div>
        
        {/* ICP Preset Selector */}
        {icpProfiles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline-block">Preset:</span>
            <select 
              value={selectedIcpId} 
              onChange={handleIcpSelectChange}
              className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-slate-900 dark:text-slate-200"
            >
              <option value="">-- Custom --</option>
              {icpProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className="flex-none w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-slate-200 dark:border-[#2A3241]">
                {msg.role === 'user' ? (
                  <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-full h-full rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="bg-indigo-600 dark:bg-indigo-500 text-white w-full h-full rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.content && (
                  <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 rounded-tr-sm' 
                      : msg.type === 'error'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-tl-sm'
                        : 'bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] text-slate-800 dark:text-slate-200 rounded-tl-sm'
                  }`}>
                    {msg.type === 'parsing' || msg.type === 'searching' ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                        {msg.content}
                      </span>
                    ) : msg.type === 'error' ? (
                      <span className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {msg.content}
                      </span>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                )}

                {/* Parsed Data Hints */}
                {msg.parsedData && (
                  <div className="bg-slate-50 dark:bg-[#151B2B] rounded-xl p-3 border border-slate-200 dark:border-[#2A3241]/50 w-full">
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Target Settings Detected</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-medium border border-indigo-100 dark:border-indigo-500/20">
                        <span className="opacity-70 mr-1 text-[9px] uppercase tracking-wider">Industry:</span> {msg.parsedData.industry || "Any"}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-medium border border-blue-100 dark:border-blue-500/20">
                        <span className="opacity-70 mr-1 text-[9px] uppercase tracking-wider">Country:</span> {msg.parsedData.country || "Any"}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium border border-emerald-100 dark:border-emerald-500/20">
                        <span className="opacity-70 mr-1 text-[9px] uppercase tracking-wider">Size:</span> {msg.parsedData.companySize || "Any"}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-medium border border-amber-100 dark:border-amber-500/20">
                        <span className="opacity-70 mr-1 text-[9px] uppercase tracking-wider">Revenue:</span> {msg.parsedData.revenueRange || "Any"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Agent Logs Console */}
                {msg.logs && msg.logs.length > 0 && (
                  <div className="bg-[#0F172A] text-slate-200 rounded-xl p-3.5 border border-slate-800 w-full max-w-[800px] font-mono text-[10px] space-y-1.5 max-h-[160px] overflow-y-auto mt-2 shadow-inner">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Agent Telemetry Logs</p>
                    {msg.logs.map((log, idx) => (
                      <div key={idx} className="flex gap-2 leading-relaxed">
                        <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                        <span className="text-indigo-400 font-semibold shrink-0">[{log.agent}]:</span>
                        <span className="text-slate-300">{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Results Table inside Agent Bubble */}
                {msg.type === 'results' && msg.results && (
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl shadow-sm overflow-hidden w-full max-w-[800px] mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#151B2B] px-4 py-3 border-b border-slate-200 dark:border-[#2A3241]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">DISCOVERED LEADS ({msg.results.length})</span>
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Scoring Complete
                      </span>
                    </div>
                    
                    {msg.results.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">No leads found matching these criteria.</div>
                    ) : (
                      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="sticky top-0 bg-white dark:bg-[#1E293B] shadow-sm">
                            <tr className="border-b border-slate-200 dark:border-[#2A3241] text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              <th className="py-3 px-4 font-medium">Company</th>
                              <th className="py-3 px-4 font-medium">Details</th>
                              <th className="py-3 px-4 text-center font-medium">Score</th>
                              <th className="py-3 px-4 text-right font-medium">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-[#2A3241]/50">
                            {msg.results.map((lead) => (
                              <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-[#0F172A]/30 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                                    {lead.name}
                                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                  <span className="text-[10px] text-slate-500 block font-normal truncate mt-0.5">{lead.website}</span>
                                  {lead.discoveryConfidence !== undefined && (
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
                                      <span>Conf: <strong>{lead.discoveryConfidence}%</strong></span>
                                      <span className={`px-1 py-0.5 rounded text-[9px] font-semibold border ${
                                        lead.discoveryConfidenceLevel === "High" 
                                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900" 
                                          : lead.discoveryConfidenceLevel === "Medium"
                                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-100 dark:border-amber-900"
                                          : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border-rose-100 dark:border-rose-900"
                                      }`}>
                                        {lead.discoveryConfidenceLevel}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                                  <div>Location: <strong className="text-slate-800 dark:text-slate-200 font-medium">{lead.location}</strong></div>
                                  {lead.employeeSource === "EMPLOYEE_EVIDENCE" || lead.employeeConfidence === "HIGH" || lead.employeeConfidence === "High" ? (
                                    <div>Employees: <strong className="text-slate-800 dark:text-slate-200 font-medium">{lead.employees}</strong> <span className="text-slate-400 dark:text-slate-500">| Confidence: High</span></div>
                                  ) : lead.employeeSource === "CUSTOMER_HEURISTIC" || lead.employeeConfidence === "MEDIUM" || lead.employeeConfidence === "Medium" ? (
                                    <div>Estimated Company Size: <strong className="text-slate-800 dark:text-slate-200 font-medium">{lead.companySize}</strong> <span className="text-slate-400 dark:text-slate-500">| Confidence: Medium</span></div>
                                  ) : lead.employeeSource === "SIZE_HEURISTIC" || lead.employeeConfidence === "LOW" || lead.employeeConfidence === "Low" ? (
                                    <div>Estimated Company Size: <strong className="text-slate-800 dark:text-slate-200 font-medium">{lead.companySize}</strong> <span className="text-slate-400 dark:text-slate-500">| Confidence: Low</span></div>
                                  ) : (
                                    <div>Employees: <strong className="text-slate-800 dark:text-slate-200 font-medium">{lead.employees || "Unknown"}</strong></div>
                                  )}
                                  <div>Tech: <strong className="text-teal-600 text-[10px] font-mono bg-teal-50 px-1 py-0.5 rounded">{lead.technologies}</strong></div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-2 py-0.5 rounded font-semibold inline-block text-[10px] ${lead.score >= 90 ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#2A3241]"}`}>
                                    {lead.score}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right font-medium">
                                  {msg.syncedIds && msg.syncedIds[lead.id] ? (
                                    <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1 text-[11px]">
                                      <ShieldCheck className="w-3.5 h-3.5" /> Synced
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleStoreCrm(msg.id, lead)}
                                      className="bg-white dark:bg-[#151B2B] hover:bg-slate-50 dark:hover:bg-[#0F172A] text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-[#2A3241] font-semibold text-[10px] px-2.5 py-1.5 rounded transition shadow-sm"
                                    >
                                      Import
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 sm:p-6 bg-white dark:bg-[#151B2B] border-t border-slate-200 dark:border-[#2A3241]">
        <form onSubmit={runDiscoveryPipeline} className="max-w-4xl mx-auto relative flex items-end gap-3">
          <div className="relative flex-1">
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  runDiscoveryPipeline(e as any);
                }
              }}
              placeholder="Ask the agent to find leads... (Press Enter to send)"
              rows={2}
              className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-2xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-slate-100 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !promptText.trim()}
            className="flex-none bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white h-[46px] w-[46px] rounded-full flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          The autonomous agent will parse your request, crawl indexes, enrich data, and grade leads against your ICP.
        </p>
      </div>
    </div>
  );
}
