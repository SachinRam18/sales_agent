import { useState, useEffect } from "react";
import { Mail, MessageSquare, RefreshCw, Copy, Check, Sparkles, Loader2, Send, Info, Users } from "lucide-react";

interface Company {
  id: string;
  name: string;
  website: string;
  location: string;
  description: string;
}

interface Contact {
  id: string;
  companyId: string;
  name: string;
  role: string;
  email: string;
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 font-sans" id="outreach-agent-root">
      
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
          <Send className="w-4 h-4 text-slate-800" /> Outreach & Sequencer Agent
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select verified decision-makers from CRM and task our Outreach Agent to write context-aware outbound schedules.
        </p>
      </div>

      {/* Grid: selectors on left, generated text blocks on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Parameters selection */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">Outbound Targets</h3>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Select CRM Corporate Entity</label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900"
              >
                <option value="">-- Choose Account --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Target Decision Maker Contact</label>
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                disabled={contacts.length === 0}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900 disabled:opacity-50"
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

            <button
              onClick={handleGenerateOutreach}
              disabled={loading || !selectedContactId}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Drafting Sequence...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500" /> Construct Copy Package
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
            <h4 className="font-semibold text-slate-805 flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-700" /> Multi-Agent Integration</h4>
            <p className="text-[11px] text-slate-500">
              The outreach copy dynamically ingests company descriptions, ICP criteria rules, and target executive job titles to produce high-context emails.
            </p>
          </div>
        </div>

        {/* Right Generated Content Blocks */}
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3 shadow-sm">
              <RefreshCw className="w-8 h-8 text-slate-900 animate-spin" />
              <p className="font-semibold text-slate-700">Writing personalized follow-up blocks...</p>
              <p className="text-slate-400 max-w-xs text-[11px]">Deploying Gemini-3.5-flash content guidelines to map corporate values.</p>
            </div>
          )}

          {!loading && !generatedCopy && (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Awaiting payload configuration. Select a company and target executive contact to write templates.
            </div>
          )}

          {generatedCopy && (
            <div className="grid grid-cols-1 gap-6 animate-fade-in" id="outreach-output-workspace">
              
              {/* Email Outbound Sequence */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-700" /> Automated Sequence Email (Step 1)
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(`Subject: ${generatedCopy.emailObj.subject}\n\n${generatedCopy.emailObj.body}`, "email")}
                    className="text-[11px] text-slate-900 font-medium hover:bg-slate-50 flex items-center gap-1 border border-slate-200 bg-white px-2.5 py-1 rounded shadow-sm transition cursor-pointer"
                  >
                    {copiedStatus["email"] ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Message</>}
                  </button>
                </div>

                <div className="space-y-2 text-xs font-mono bg-slate-50 p-4 rounded-xl text-slate-700 border border-slate-100">
                  <div><span className="text-slate-400 font-semibold block mb-1 text-[10px]">SUBJECT LINE:</span> <strong className="text-slate-950">{generatedCopy.emailObj.subject}</strong></div>
                  <hr className="border-slate-200 my-2" />
                  <div className="whitespace-pre-wrap leading-relaxed">{generatedCopy.emailObj.body}</div>
                </div>
              </div>

              {/* LinkedIn Sequence messaging */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-slate-700" /> LinkedIn Connection Request & Pitch (Step 2)
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(`Connection Req: ${generatedCopy.linkedinMessageObj.connectionRequest}\n\nPitch: ${generatedCopy.linkedinMessageObj.followUpPitch}`, "linkedin")}
                    className="text-[11px] text-slate-900 font-medium hover:bg-slate-50 flex items-center gap-1 border border-slate-200 bg-white px-2.5 py-1 rounded shadow-sm transition cursor-pointer"
                  >
                    {copiedStatus["linkedin"] ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Block</>}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                    <span className="text-slate-400 font-semibold block text-[10px]">HI-LIMIT CONNECTION MESSAGE (300 CHARS):</span>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{generatedCopy.linkedinMessageObj.connectionRequest}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                    <span className="text-slate-400 font-semibold block text-[10px]">DM DIRECT INTRO PITCH:</span>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-semibold">{generatedCopy.linkedinmessageobj?.followupPitch || generatedCopy.linkedinMessageObj.followUpPitch}</p>
                  </div>
                </div>
              </div>

              {/* Follow up brief pitch */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-700" /> Email Follow-Up Touch (Step 3 - Days Later)
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(generatedCopy.followUpObj.body, "followup")}
                    className="text-[11px] text-slate-900 font-medium hover:bg-slate-50 flex items-center gap-1 border border-slate-200 bg-white px-2.5 py-1 rounded shadow-sm transition cursor-pointer"
                  >
                    {copiedStatus["followup"] ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5 block" /> Copy Body</>}
                  </button>
                </div>

                <div className="text-xs font-mono bg-slate-50 p-4 rounded-xl text-slate-700 border border-slate-100 whitespace-pre-wrap leading-relaxed">
                  {generatedCopy.followUpObj.body}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
