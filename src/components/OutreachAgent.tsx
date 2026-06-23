import { useState, useEffect } from "react";
import {
  Mail, Copy, Check, Sparkles, Loader2, Send,
  Users, PhoneCall, Sparkle, FileText, Building2,
  User, Linkedin, MessageSquare, Calendar, ChevronRight,
  RefreshCw, AlertCircle, Zap
} from "lucide-react";

interface Company {
  id: string; name: string; website: string; location: string;
  description: string; industry: string; technologies?: string;
}
interface Contact {
  id: string; companyId: string; name: string; role: string; email: string;
}
interface ObjectionHandler { objection: string; response: string; }
interface OutreachOutput {
  linkedinMessageObj: { connectionRequest: string; followUpPitch: string; };
  emailObj: { subject: string; body: string; };
  followUpObj: { body: string; };
  day1Email?: string; day3Email?: string; day7Email?: string; day14Email?: string;
  callScript?: string; personalOpeningLine?: string; meetingRequest?: string;
  valueProposition?: string; subjectVariants?: string[]; ctaVariants?: string[];
  objectionHandling?: ObjectionHandler[];
}
interface OutreachAgentProps { userRole: "Admin" | "Team Member" | "Viewer"; }

type TabId = "sequences" | "linkedin" | "followups" | "copywriter" | "script";

const TABS: { id: TabId; label: string; icon: any; color: string }[] = [
  { id: "sequences",  label: "Cold Email",    icon: Mail,        color: "text-sky-500" },
  { id: "linkedin",   label: "LinkedIn",      icon: Linkedin,    color: "text-blue-500" },
  { id: "followups",  label: "Follow-ups",    icon: Calendar,    color: "text-violet-500" },
  { id: "copywriter", label: "AI Copy Suite", icon: Sparkle,     color: "text-amber-500" },
  { id: "script",     label: "Call Script",   icon: PhoneCall,   color: "text-teal-500" },
];

function CopyButton({ text, id, copied, onCopy }: { text: string; id: string; copied: boolean; onCopy: (text: string, id: string) => void }) {
  return (
    <button onClick={() => onCopy(text, id)}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
        copied ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800"
               : "bg-slate-50 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"}`}>
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ContentBlock({ title, content, copyId, copied, onCopy, accent }: {
  title: string; content: string; copyId: string; copied: boolean;
  onCopy: (t: string, id: string) => void; accent?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${accent || "text-slate-400 dark:text-slate-500"}`}>{title}</span>
        <CopyButton text={content} id={copyId} copied={copied} onCopy={onCopy} />
      </div>
      <div className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl p-4 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  );
}

export default function OutreachAgent({ userRole }: OutreachAgentProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<OutreachOutput | null>(null);
  const [copiedStatus, setCopiedStatus] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabId>("sequences");

  useEffect(() => {
    fetch("/api/crm/companies").then(r => r.json()).then(data => {
      setCompanies(data);
      if (data.length > 0) setSelectedCompanyId(data[0].id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) { setContacts([]); setSelectedContactId(""); return; }
    fetch(`/api/crm/contacts?companyId=${selectedCompanyId}`).then(r => r.json()).then(data => {
      setContacts(data);
      setSelectedContactId(data.length > 0 ? data[0].id : "");
    }).catch(console.error);
  }, [selectedCompanyId]);

  const handleGenerate = async () => {
    if (!selectedContactId) { alert("Select a contact first."); return; }
    setLoading(true); setGeneratedCopy(null);
    try {
      const res = await fetch("/api/generate-outreach", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: selectedContactId, companyId: selectedCompanyId })
      });
      if (!res.ok) throw new Error("Generation failed");
      setGeneratedCopy(await res.json());
      setActiveTab("sequences");
    } catch (e) { console.error(e); alert("Error generating outreach copy."); }
    finally { setLoading(false); }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(p => ({ ...p, [id]: true }));
    setTimeout(() => setCopiedStatus(p => ({ ...p, [id]: false })), 2000);
  };

  const currentCompany = companies.find(c => c.id === selectedCompanyId);
  const currentContact = contacts.find(c => c.id === selectedContactId);
  const isCopied = (id: string) => !!copiedStatus[id];

  return (
    <div className="flex flex-col h-full font-sans bg-[#F8FAFC] dark:bg-[#0B1120]" id="outreach-agent-root">

      {/* ── Top header bar ── */}
      <div className="bg-white dark:bg-[#151B2B] border-b border-slate-200 dark:border-[#2A3241] px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <Send className="w-5 h-5 text-sky-500" /> Outreach & AI Copywriter
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            AI-generated cold emails, LinkedIn sequences, follow-ups, call scripts and objection handlers.
          </p>
        </div>
        {/* capability chips */}
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {[
            { icon: Mail,        label: "Cold Email",  color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800" },
            { icon: Linkedin,    label: "LinkedIn",    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" },
            { icon: PhoneCall,   label: "Call Script", color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800" },
            { icon: Sparkle,     label: "AI Copy",     color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
          ].map(({ icon: Icon, label, color }) => (
            <span key={label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${color}`}>
              <Icon className="w-2.5 h-2.5" />{label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── LEFT: Target selector panel ── */}
          <div className="space-y-4">
            {/* Company + Contact selectors */}
            <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-400" /> Select Target
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Pick a company and decision maker</div>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" /> Company
                  </label>
                  <select value={selectedCompanyId} onChange={e => setSelectedCompanyId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl py-2.5 px-3 text-xs dark:text-slate-200 focus:outline-none focus:border-sky-400 transition">
                    <option value="">— Choose account —</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" /> Stakeholder
                  </label>
                  <select value={selectedContactId} onChange={e => setSelectedContactId(e.target.value)}
                    disabled={!selectedCompanyId || contacts.length === 0}
                    className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl py-2.5 px-3 text-xs dark:text-slate-200 focus:outline-none focus:border-sky-400 disabled:opacity-50 transition">
                    <option value="">— Choose contact —</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name} · {c.role}</option>)}
                  </select>
                  {selectedCompanyId && contacts.length === 0 && (
                    <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> No contacts — enrich the company first.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Context card — shows when a contact is selected */}
            {currentContact && currentCompany && (
              <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-4 shadow-sm space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Context</div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-50">{currentContact.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{currentContact.role}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Building2 className="w-2.5 h-2.5" /> {currentCompany.name} · {currentCompany.industry}
                    </div>
                  </div>
                </div>
                {currentCompany.technologies && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100 dark:border-[#1E293B]">
                    {currentCompany.technologies.split(",").slice(0, 4).map(t => (
                      <span key={t} className="px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 text-[9px] font-medium rounded border border-sky-100 dark:border-sky-900">{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Generate button */}
            <button onClick={handleGenerate} disabled={loading || !selectedContactId}
              className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all
                bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700
                disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700
                disabled:text-slate-500 text-white disabled:cursor-not-allowed">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating copy...</>
                : <><Sparkles className="w-4 h-4 text-amber-300" /> Generate Full Package</>}
            </button>

            {/* What gets generated */}
            <div className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-4 space-y-2.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" /> What's Generated
              </div>
              {[
                { icon: Mail,      color: "text-sky-500",    label: "Cold email with subject line" },
                { icon: Linkedin,  color: "text-blue-500",   label: "LinkedIn connect + follow-up" },
                { icon: Calendar,  color: "text-violet-500", label: "4-step follow-up sequence" },
                { icon: Sparkle,   color: "text-amber-500",  label: "A/B subject lines + CTAs" },
                { icon: FileText,  color: "text-rose-500",   label: "Objection handling playbook" },
                { icon: PhoneCall, color: "text-teal-500",   label: "SDR phone call script" },
              ].map(({ icon: Icon, color, label }) => (
                <div key={label} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <Icon className={`w-3 h-3 shrink-0 ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Output panel ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Loading */}
            {loading && (
              <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-16 flex flex-col items-center gap-4 shadow-sm">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-7 h-7 text-white animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Crafting your copy package...</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">Analysing stakeholder context, pain points & value propositions</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {["Personalising", "Sequencing", "Scripting"].map((s, i) => (
                    <span key={s} className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !generatedCopy && (
              <div className="bg-white dark:bg-[#151B2B] border-2 border-dashed border-slate-200 dark:border-[#2A3241] rounded-2xl p-16 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center">
                  <Send className="w-6 h-6 text-sky-500" />
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No copy generated yet</p>
                <p className="text-xs text-slate-400 max-w-xs">Select a company and contact on the left, then click Generate to build the full outreach package.</p>
              </div>
            )}

            {/* Generated output */}
            {!loading && generatedCopy && (
              <div className="space-y-4">
                {/* Tab bar */}
                <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-sm">
                  {TABS.map(({ id, label, icon: Icon, color }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === id
                          ? "bg-slate-900 dark:bg-slate-700 text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                      <Icon className={`w-3.5 h-3.5 ${activeTab === id ? "text-white" : color}`} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* ── TAB: Cold Email ── */}
                {activeTab === "sequences" && (
                  <div className="space-y-4">
                    {generatedCopy.personalOpeningLine && (
                      <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl p-4">
                        <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Sparkle className="w-3 h-3" /> Personalised Opener
                        </div>
                        <p className="text-xs text-teal-800 dark:text-teal-300 italic leading-relaxed">"{generatedCopy.personalOpeningLine}"</p>
                      </div>
                    )}
                    <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E293B]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center">
                            <Mail className="w-3.5 h-3.5 text-sky-500" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Primary Cold Email</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[260px]">Subject: {generatedCopy.emailObj.subject}</div>
                          </div>
                        </div>
                        <CopyButton text={`Subject: ${generatedCopy.emailObj.subject}\n\n${generatedCopy.emailObj.body}`} id="cold-email" copied={isCopied("cold-email")} onCopy={handleCopy} />
                      </div>
                      <div className="bg-slate-50 dark:bg-[#1E293B] rounded-xl p-4 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {generatedCopy.emailObj.body}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB: LinkedIn ── */}
                {activeTab === "linkedin" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Connection Request", content: generatedCopy.linkedinMessageObj.connectionRequest, id: "li-con", color: "text-blue-500" },
                      { title: "Follow-up Pitch",    content: generatedCopy.linkedinMessageObj.followUpPitch,    id: "li-pitch", color: "text-blue-500" },
                    ].map(({ title, content, id, color }) => (
                      <div key={id} className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                              <Linkedin className="w-3 h-3 text-blue-500" />
                            </div>
                            <span className={`text-xs font-semibold ${color}`}>{title}</span>
                          </div>
                          <CopyButton text={content} id={id} copied={isCopied(id)} onCopy={handleCopy} />
                        </div>
                        <div className="bg-slate-50 dark:bg-[#1E293B] rounded-xl p-3.5 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── TAB: Follow-ups ── */}
                {activeTab === "followups" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <div className="flex-1 h-px bg-slate-200 dark:bg-[#2A3241]" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">4-Step Nurture Sequence</span>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-[#2A3241]" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { day: "Day 1",  content: generatedCopy.day1Email,  id: "day1",  color: "bg-sky-500",    label: "Initial Touch" },
                        { day: "Day 3",  content: generatedCopy.day3Email,  id: "day3",  color: "bg-violet-500", label: "Value Add" },
                        { day: "Day 7",  content: generatedCopy.day7Email,  id: "day7",  color: "bg-amber-500",  label: "Breakup" },
                        { day: "Day 14", content: generatedCopy.day14Email, id: "day14", color: "bg-rose-500",   label: "Final Reach" },
                      ].filter(d => d.content).map(({ day, content, id, color, label }) => (
                        <div key={id} className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl overflow-hidden shadow-sm">
                          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-[#1E293B]">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-md ${color} flex items-center justify-center text-[9px] font-bold text-white`}>{day.split(" ")[1]}</span>
                              <div>
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{day}</span>
                                <span className="text-[10px] text-slate-400 ml-1.5">{label}</span>
                              </div>
                            </div>
                            <CopyButton text={content!} id={id} copied={isCopied(id)} onCopy={handleCopy} />
                          </div>
                          <div className="p-4 text-[11px] font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                            {content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB: AI Copywriter Suite ── */}
                {activeTab === "copywriter" && (
                  <div className="space-y-4">
                    {generatedCopy.valueProposition && (
                      <div className="bg-white dark:bg-[#151B2B] border border-amber-200 dark:border-amber-800 rounded-2xl p-4 shadow-sm space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          <Sparkle className="w-3 h-3" /> Value Proposition
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed">"{generatedCopy.valueProposition}"</p>
                      </div>
                    )}
                    {generatedCopy.subjectVariants && generatedCopy.subjectVariants.length > 0 && (
                      <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject Line A/B Variants</div>
                        <div className="space-y-2">
                          {generatedCopy.subjectVariants.map((s, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl px-3.5 py-2.5">
                              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate mr-3"><span className="text-slate-400 mr-1.5">V{i+1}</span>{s}</span>
                              <CopyButton text={s} id={`subj-${i}`} copied={isCopied(`subj-${i}`)} onCopy={handleCopy} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {generatedCopy.ctaVariants && generatedCopy.ctaVariants.length > 0 && (
                      <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CTA Variants</div>
                        <div className="space-y-2">
                          {generatedCopy.ctaVariants.map((c, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl px-3.5 py-2.5">
                              <span className="text-xs text-slate-700 dark:text-slate-300 italic truncate mr-3">"{c}"</span>
                              <CopyButton text={c} id={`cta-${i}`} copied={isCopied(`cta-${i}`)} onCopy={handleCopy} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {generatedCopy.objectionHandling && generatedCopy.objectionHandling.length > 0 && (
                      <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Objection Handling Playbook</div>
                        <div className="space-y-3">
                          {generatedCopy.objectionHandling.map((item, i) => (
                            <div key={i} className="rounded-xl border border-slate-200 dark:border-[#2A3241] overflow-hidden">
                              <div className="bg-rose-50 dark:bg-rose-950/30 px-4 py-2.5 border-b border-rose-100 dark:border-rose-900">
                                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block mb-0.5">Objection</span>
                                <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">"{item.objection}"</span>
                              </div>
                              <div className="bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2.5">
                                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">Response</span>
                                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">{item.response}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB: Call Script ── */}
                {activeTab === "script" && generatedCopy.callScript && (
                  <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-[#1E293B]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
                          <PhoneCall className="w-3.5 h-3.5 text-teal-500" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">SDR Phone Script</div>
                          <div className="text-[10px] text-slate-400">AI-personalised call guide</div>
                        </div>
                      </div>
                      <CopyButton text={generatedCopy.callScript} id="callscript" copied={isCopied("callscript")} onCopy={handleCopy} />
                    </div>
                    <div className="bg-slate-950 p-5 font-mono text-xs leading-relaxed" style={{ minHeight: "240px" }}>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-800">
                        Interactive Sales Script
                      </div>
                      <p className="text-slate-200 whitespace-pre-wrap">{generatedCopy.callScript}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
