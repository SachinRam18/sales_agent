import React, { useState, useEffect } from "react";
import { Plus, Check, RefreshCw, Play, Pause, BarChart2, Calendar, Target, Award, PlayCircle, Loader2 } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  audience: string;
  template: string;
  schedule: string;
  sentCount: number;
  openRate: number;
  replyRate: number;
  conversionRate: number;
  status: "Active" | "Paused" | "Completed";
  createdAt: string;
}

interface CampaignManagementProps {
  userRole: "Admin" | "Team Member" | "Viewer";
}

export default function CampaignManagement({ userRole }: CampaignManagementProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [icpProfiles, setIcpProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form properties
  const [name, setName] = useState("");
  const [audience, setAudience] = useState("");
  const [template, setTemplate] = useState("");
  const [schedule, setSchedule] = useState("");
  
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/campaigns");
      if (!res.ok) throw new Error("Could not parse campaigns logs");
      const data = await res.json();
      setCampaigns(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    // Fetch Saved ICPs to populate audience selection dropdown dynamically
    fetch("/api/icp")
      .then((r) => r.json())
      .then((data) => setIcpProfiles(data))
      .catch((e) => console.error("Error fetching ICP profiles for campaigns:", e));
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === "Viewer") {
      setErrorMessage("Unauthorized security role: Viewers cannot spawn campaigns.");
      return;
    }

    if (!name || !audience) {
      setErrorMessage("Please define campaign name and target audience parameters.");
      return;
    }

    setIsCreating(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, audience, template, schedule })
      });

      if (!res.ok) throw new Error("Could not transaction campaign create log");
      const list = await res.json();
      setCampaigns(list);

      // Reset
      setName("");
      setAudience("");
      setTemplate("");
      setSchedule("");
    } catch (err: any) {
      setErrorMessage("Error recording campaign.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 font-sans" id="campaigns-root">
      
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A3241] pb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-slate-850" /> Outbound Campaigns Suite
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Group discovered prospects under specific outbound templates and plan scheduling routines.
          </p>
        </div>
        <button
          onClick={() => {
            setName("EU Automation Outpost");
            setAudience("German Manufacturing Leader");
            setTemplate("Industrial Efficiency Middleware Deep Pitch");
            setSchedule("Mon-Wed 8 AM CET");
          }}
          className="text-xs text-slate-800 dark:text-slate-200 hover:text-slate-950 font-semibold bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-[#0F172A] transition cursor-pointer"
        >
          Inject Template Preset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form: Create Campaign */}
        <div className="lg:col-span-1">
          <form className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-6 space-y-4 shadow-sm" onSubmit={handleCreateCampaign} id="form-create-campaign">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-[#1E293B] pb-3 block">Launch Outbound Sequence</h3>

            {errorMessage && (
              <p className="text-[10px] text-rose-600 font-semibold bg-rose-50 dark:bg-rose-900/40 border border-rose-100 dark:border-rose-800 rounded-lg p-2.5">{errorMessage}</p>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Campaign Identifier Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. EU Manufacturing Auto Pilot"
                  required
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white dark:bg-[#151B2B]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Target Persona Audience Preset</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900"
                >
                  <option value="">-- Select Target Profile --</option>
                  {icpProfiles.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                  {icpProfiles.length === 0 && (
                    <>
                      <option value="German Manufacturing Leader">German Manufacturing Leader (Medium/Large Enterprise)</option>
                      <option value="US SaaS Series A/B">US SaaS Series A/B (High Tech Growth)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Pitch Copy Template Preset</label>
                <input
                  type="text"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  placeholder="e.g. Automation Solutions & Efficiency"
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white dark:bg-[#151B2B]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Dispatch Core Scheduling</label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="e.g. Tuesday & Thursday, 9:00 AM CET"
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white dark:bg-[#151B2B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold text-xs py-2.5 rounded-lg shadow transition flex items-center justify-center gap-1 cursor-pointer"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deploy Autonomous Sequence"}
            </button>
          </form>
        </div>

        {/* Right Active Campaigns list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Sequence Performance telemetry</h3>

            {loading ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">Syncing active monitors...</p>
            ) : (
              <div className="space-y-4">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="border border-slate-200 dark:border-[#2A3241] rounded-xl p-4 bg-white dark:bg-[#151B2B] space-y-4 hover:border-slate-350 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">{camp.name}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Audience: <strong>{camp.audience}</strong> • Created: {new Date(camp.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded ${camp.status === "Active" ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                        {camp.status}
                      </span>
                    </div>

                    {/* Progress indicators */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono uppercase bg-slate-50 dark:bg-[#1E293B] p-2.5 rounded-lg border border-slate-100 dark:border-[#1E293B]">
                      <div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block uppercase font-sans">Sent Count</span>
                        <strong className="text-slate-850 font-mono text-sm">{camp.sentCount !== undefined ? camp.sentCount : 0}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block uppercase font-sans">Open Rate</span>
                        <strong className="text-slate-900 dark:text-slate-50 font-mono text-sm">{camp.openRate !== undefined ? `${camp.openRate}%` : "0%"}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block uppercase font-sans">Reply Rate</span>
                        <strong className="text-slate-900 dark:text-slate-50 font-mono text-sm">{camp.replyRate !== undefined ? `${camp.replyRate}%` : "0%"}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block uppercase font-sans">Conversions</span>
                        <strong className="text-emerald-700 font-mono text-sm">{camp.conversionRate !== undefined ? `${camp.conversionRate}%` : "0%"}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
