import { useState, useEffect } from "react";
import { 
  Mail, MessageSquare, RefreshCw, Copy, Check, Sparkles, Loader2, Send, 
  Users, PhoneCall, Sparkle, LayoutGrid, FileText, ArrowRight, ShieldCheck
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  website: string;
  location: string;
  description: string;
  industry: string;
  technologies?: string;
}

interface Contact {
  id: string;
  companyId: string;
  name: string;
  role: string;
  email: string;
}

interface ObjectionHandler {
  objection: string;
  response: string;
}

interface OutreachOutput {
  linkedinMessageObj: {
    connectionRequest: string;
    followUpPitch: string;
  };
  emailObj: {
    subject: string;
    body: string;
  };
  followUpObj: {
    body: string;
  };
  day1Email?: string;
  day3Email?: string;
  day7Email?: string;
  day14Email?: string;
  callScript?: string;
  personalOpeningLine?: string;
  meetingRequest?: string;
  valueProposition?: string;
  subjectVariants?: string[];
  ctaVariants?: string[];
  objectionHandling?: ObjectionHandler[];
}

interface OutreachAgentProps {
  userRole: "Admin" | "Team Member" | "Viewer";
}

export default function OutreachAgent({ userRole }: OutreachAgentProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState("");

  const [loading, setLoading] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<OutreachOutput | null>(null);
  const [copiedStatus, setCopiedStatus] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"sequences" | "copywriter" | "script">("sequences");

  useEffect(() => {
    // load CRM accounts
    fetch("/api/crm/companies")
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data);
        if (data.length > 0) {
          setSelectedCompanyId(data[0].id);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      // load contacts for selected company
      fetch(`/api/crm/contacts?companyId=${selectedCompanyId}`)
        .then((r) => r.json())
        .then((data) => {
          setContacts(data);
          if (data.length > 0) {
            setSelectedContactId(data[0].id);
          } else {
            setSelectedContactId("");
          }
        })
        .catch((e) => console.error(e));
    } else {
      setContacts([]);
      setSelectedContactId("");
    }
  }, [selectedCompanyId]);

  const handleGenerateOutreach = async () => {
    if (!selectedContactId) {
      alert("Please select a target stakeholder contact first.");
      return;
    }

    setLoading(true);
    setGeneratedCopy(null);

    try {
      const res = await fetch("/api/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: selectedContactId,
          companyId: selectedCompanyId
        })
      });

      if (!res.ok) throw new Error("Could not construct custom outreach templates");
      const json = await res.json();
      setGeneratedCopy(json);
    } catch (e) {
      console.error(e);
      alert("Error invoking Outreach agent generation systems.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus((prev) => ({ ...prev, [identifier]: true }));
    setTimeout(() => {
      setCopiedStatus((prev) => ({ ...prev, [identifier]: false }));
    }, 2000);
  };

  const currentCompany = companies.find(c => c.id === selectedCompanyId);
  const currentContact = contacts.find(con => con.id === selectedContactId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 font-sans" id="outreach-agent-root">
      
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-[#2A3241] pb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
          <Send className="w-4 h-4 text-slate-800 dark:text-slate-200" /> Outreach & AI Copywriter Agent
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Select target stakeholders, write personalized sales sequences, call scripts, and get copywriting templates.
        </p>
      </div>

      {/* Grid: selectors on left, generated text blocks on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Parameters selection */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-5 space-y-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-[#1E293B] pb-3">Outbound Targets</h3>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Select CRM Corporate Entity</label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white dark:bg-[#151B2B]"
              >
                <option value="">-- Choose Account --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Target Decision Maker Contact</label>
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                disabled={contacts.length === 0}
                className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900 disabled:opacity-50 focus:bg-white dark:bg-[#151B2B]"
              >
                <option value="">-- Choose Contact Stakeholder --</option>
                {contacts.map((con) => (
                  <option key={con.id} value={con.id}>{con.name} ({con.role})</option>
                ))}
              </select>
              {contacts.length === 0 && selectedCompanyId && (
                <span className="text-[10px] text-rose-500 font-medium mt-1 inline-block">No contacts on record. Enrich company details to find executives.</span>
              )}
            </div>

            {currentContact && (
              <div className="bg-slate-50 dark:bg-[#1E293B]/70 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Context Ingested:</span>
                <div>Name: <strong>{currentContact.name}</strong></div>
                <div>Role: <strong>{currentContact.role}</strong></div>
                {currentCompany && (
                  <>
                    <div>Company: <strong>{currentCompany.name}</strong></div>
                    <div>Sector: <strong>{currentCompany.industry}</strong></div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={handleGenerateOutreach}
              disabled={loading || !selectedContactId}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Drafting Copy Suite...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500" /> Construct Copy Package
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-[#1E293B] rounded-xl p-4 border border-slate-200 dark:border-[#2A3241] text-xs text-slate-650 dark:text-slate-400 leading-relaxed space-y-2">
            <h4 className="font-semibold text-slate-850 dark:text-slate-350 flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-700 dark:text-slate-300" /> Multi-Source Copywriter</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Generates customized cold emails, a complete 4-step sequence (Day 1 to Day 14), phone scripts, and objection handlers from stakeholder intelligence.
            </p>
          </div>
        </div>

        {/* Right Generated Content Blocks */}
        <div className="lg:col-span-2 space-y-6">
          {generatedCopy && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab("sequences")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all ${activeTab === "sequences" ? "bg-white dark:bg-[#151B2B] text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"}`}
              >
                <Mail className="w-3.5 h-3.5" /> Outbound Sequences
              </button>
              <button
                onClick={() => setActiveTab("copywriter")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all ${activeTab === "copywriter" ? "bg-white dark:bg-[#151B2B] text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"}`}
              >
                <Sparkle className="w-3.5 h-3.5 text-amber-500" /> AI Copywriter Suite
              </button>
              <button
                onClick={() => setActiveTab("script")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all ${activeTab === "script" ? "bg-white dark:bg-[#151B2B] text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"}`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-teal-500" /> SDR Phone Script
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center gap-3 shadow-sm">
              <RefreshCw className="w-8 h-8 text-slate-900 dark:text-slate-50 animate-spin" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">Formulating personalized copy elements...</p>
              <p className="text-slate-400 max-w-xs text-[11px]">Deploying Gemini-3.5-flash content model to map pain points & value props.</p>
            </div>
          )}

          {!loading && !generatedCopy && (
            <div className="bg-white dark:bg-[#151B2B] border border-dashed border-slate-200 dark:border-[#2A3241] rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              Awaiting selection targets. Choose a corporate lead and stakeholder, then trigger copy generation.
            </div>
          )}

          {generatedCopy && (
            <div className="space-y-6">
              {/* TAB 1: OUTBOUND SEQUENCES */}
              {activeTab === "sequences" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Subject Line & Opener */}
                  <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-5 space-y-4 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block border-b border-slate-50 dark:border-slate-800 pb-2">Opener & Primary Email Pitch</h4>
                    {generatedCopy.personalOpeningLine && (
                      <div className="text-xs p-3 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed">
                        <span className="text-[9px] font-bold text-teal-500 block mb-0.5 uppercase">Personalized Opener Line:</span>
                        "{generatedCopy.personalOpeningLine}"
                      </div>
                    )}
                    
                    {/* Primary Cold Email */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">Subject: {generatedCopy.emailObj.subject}</span>
                        <button
                          onClick={() => handleCopyToClipboard(`Subject: ${generatedCopy.emailObj.subject}\n\n${generatedCopy.emailObj.body}`, "cold-email")}
                          className="text-[10px] bg-slate-50 dark:bg-[#1E293B] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 px-2 py-1 rounded transition"
                        >
                          {copiedStatus["cold-email"] ? "Copied!" : "Copy Email"}
                        </button>
                      </div>
                      <div className="text-xs font-mono bg-slate-50 dark:bg-[#1E293B] p-4 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                        {generatedCopy.emailObj.body}
                      </div>
                    </div>
                  </div>

                  {/* LinkedIn Connect & Follow-up */}
                  <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-5 space-y-4 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block border-b border-slate-50 dark:border-slate-800 pb-2">LinkedIn Sequence (Step 2)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="bg-slate-50 dark:bg-[#1E293B] p-3 rounded-lg border border-slate-150 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-1">
                          <span className="text-slate-405 font-bold text-[9px] uppercase tracking-wider">Connection Request:</span>
                          <button 
                            onClick={() => handleCopyToClipboard(generatedCopy.linkedinMessageObj.connectionRequest, "li-con")}
                            className="text-[9px] text-blue-500 hover:underline"
                          >
                            {copiedStatus["li-con"] ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <p className="text-slate-750 dark:text-slate-350 whitespace-pre-wrap leading-relaxed">{generatedCopy.linkedinMessageObj.connectionRequest}</p>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#1E293B] p-3 rounded-lg border border-slate-155 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-1">
                          <span className="text-slate-405 font-bold text-[9px] uppercase tracking-wider">Follow-Up Pitch Message:</span>
                          <button 
                            onClick={() => handleCopyToClipboard(generatedCopy.linkedinMessageObj.followUpPitch, "li-pitch")}
                            className="text-[9px] text-blue-500 hover:underline"
                          >
                            {copiedStatus["li-pitch"] ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <p className="text-slate-750 dark:text-slate-350 whitespace-pre-wrap leading-relaxed font-medium">{generatedCopy.linkedinMessageObj.followUpPitch}</p>
                      </div>
                    </div>
                  </div>

                  {/* Follow-up Sequence Blocks */}
                  <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-5 space-y-5 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block border-b border-slate-50 dark:border-slate-800 pb-2">Multi-Day Follow-Up Sequence</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Day 1 Follow up */}
                      {generatedCopy.day1Email && (
                        <div className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 relative">
                          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-1.5">
                            <span className="text-[10px] font-bold text-slate-805 dark:text-slate-200 font-mono">Day 1 Sequence Touch</span>
                            <button
                              onClick={() => handleCopyToClipboard(generatedCopy.day1Email || "", "day1")}
                              className="text-[9px] text-blue-500 hover:underline font-mono"
                            >
                              {copiedStatus["day1"] ? "Copied!" : "Copy"}
                            </button>
                          </div>
                          <div className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed text-slate-650 dark:text-slate-400">
                            {generatedCopy.day1Email}
                          </div>
                        </div>
                      )}

                      {/* Day 3 Follow up */}
                      {generatedCopy.day3Email && (
                        <div className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 relative">
                          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-1.5">
                            <span className="text-[10px] font-bold text-slate-805 dark:text-slate-200 font-mono">Day 3 Sequence Touch</span>
                            <button
                              onClick={() => handleCopyToClipboard(generatedCopy.day3Email || "", "day3")}
                              className="text-[9px] text-blue-500 hover:underline font-mono"
                            >
                              {copiedStatus["day3"] ? "Copied!" : "Copy"}
                            </button>
                          </div>
                          <div className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed text-slate-650 dark:text-slate-400">
                            {generatedCopy.day3Email}
                          </div>
                        </div>
                      )}

                      {/* Day 7 Follow up */}
                      {generatedCopy.day7Email && (
                        <div className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 relative">
                          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-1.5">
                            <span className="text-[10px] font-bold text-slate-805 dark:text-slate-200 font-mono">Day 7 Breakup Sequence</span>
                            <button
                              onClick={() => handleCopyToClipboard(generatedCopy.day7Email || "", "day7")}
                              className="text-[9px] text-blue-500 hover:underline font-mono"
                            >
                              {copiedStatus["day7"] ? "Copied!" : "Copy"}
                            </button>
                          </div>
                          <div className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed text-slate-650 dark:text-slate-400">
                            {generatedCopy.day7Email}
                          </div>
                        </div>
                      )}

                      {/* Day 14 Follow up */}
                      {generatedCopy.day14Email && (
                        <div className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 relative">
                          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-1.5">
                            <span className="text-[10px] font-bold text-slate-805 dark:text-slate-200 font-mono">Day 14 Final Reachout</span>
                            <button
                              onClick={() => handleCopyToClipboard(generatedCopy.day14Email || "", "day14")}
                              className="text-[9px] text-blue-500 hover:underline font-mono"
                            >
                              {copiedStatus["day14"] ? "Copied!" : "Copy"}
                            </button>
                          </div>
                          <div className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed text-slate-650 dark:text-slate-400">
                            {generatedCopy.day14Email}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: AI COPYWRITER SUITE */}
              {activeTab === "copywriter" && (
                <div className="space-y-6 animate-fade-in" id="copywriter-suite-panel">
                  <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-5 space-y-5 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block border-b border-slate-50 dark:border-slate-800 pb-2 flex items-center gap-1">
                      <Sparkle className="w-3.5 h-3.5 text-amber-500" /> Executive Copywriter Snippets
                    </h4>

                    {/* Value Proposition */}
                    {generatedCopy.valueProposition && (
                      <div className="bg-slate-50 dark:bg-[#1E293B] p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Target Value Proposition Angle</span>
                        <p className="text-xs text-slate-800 dark:text-slate-200 italic font-medium">"{generatedCopy.valueProposition}"</p>
                      </div>
                    )}

                    {/* Subject Line Variants */}
                    {generatedCopy.subjectVariants && (
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Subject Line Variants (A/B Testing)</span>
                        <div className="space-y-2">
                          {generatedCopy.subjectVariants.map((subject, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-[#1E293B] px-3.5 py-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                              <span className="font-mono truncate mr-4"><strong>V{idx + 1}:</strong> {subject}</span>
                              <button
                                onClick={() => handleCopyToClipboard(subject, `subj-var-${idx}`)}
                                className="text-[9px] text-blue-500 hover:underline flex-shrink-0"
                              >
                                {copiedStatus[`subj-var-${idx}`] ? "Copied" : "Copy"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Variants */}
                    {generatedCopy.ctaVariants && (
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">CTA (Call to Action) Variants</span>
                        <div className="space-y-2">
                          {generatedCopy.ctaVariants.map((cta, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-[#1E293B] px-3.5 py-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                              <span className="italic mr-4">"{cta}"</span>
                              <button
                                onClick={() => handleCopyToClipboard(cta, `cta-var-${idx}`)}
                                className="text-[9px] text-blue-500 hover:underline flex-shrink-0"
                              >
                                {copiedStatus[`cta-var-${idx}`] ? "Copied" : "Copy"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Objection Handling */}
                    {generatedCopy.objectionHandling && (
                      <div className="space-y-3 pt-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Objection Handling Playbook</span>
                        <div className="space-y-3">
                          {generatedCopy.objectionHandling.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-[#1E293B] rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                              <div><span className="text-[9px] font-bold text-rose-500 uppercase">Objection:</span> <strong className="text-slate-900 dark:text-slate-50 block mt-0.5">"{item.objection}"</strong></div>
                              <hr className="border-slate-200 dark:border-slate-800" />
                              <div><span className="text-[9px] font-bold text-emerald-500 uppercase">Response Script:</span> <p className="text-slate-700 dark:text-slate-350 mt-1 leading-relaxed">{item.response}</p></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* TAB 3: SDR CALL SCRIPT */}
              {activeTab === "script" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block flex items-center gap-1.5">
                        <PhoneCall className="w-4 h-4 text-teal-500" /> SDR Phone Pitch Guide
                      </h4>
                      <button
                        onClick={() => handleCopyToClipboard(generatedCopy.callScript || "", "callscript")}
                        className="text-[10px] bg-slate-50 dark:bg-[#1E293B] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 px-2 py-1 rounded transition"
                      >
                        {copiedStatus["callscript"] ? "Copied Script!" : "Copy Call Script"}
                      </button>
                    </div>

                    <div className="bg-slate-950 text-emerald-400 p-5 rounded-xl border border-slate-850 font-mono text-xs leading-relaxed space-y-3" style={{ minHeight: "200px" }}>
                      <span className="text-[9px] font-bold text-slate-500 block border-b border-slate-850 pb-1.5 uppercase font-sans">Sales Representative Interactive Script:</span>
                      <p className="whitespace-pre-wrap text-slate-100 font-medium">
                        {generatedCopy.callScript}
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-400 dark:text-slate-505 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-lg p-3 leading-relaxed">
                      <span className="font-bold text-slate-800 dark:text-slate-300 block mb-0.5">Calling Tip:</span>
                      Start the conversation warm, highlight their specific industry background, and pitch directly on the primary value proposition matching their role.
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
