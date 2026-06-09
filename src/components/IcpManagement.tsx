import React, { useState, useEffect } from "react";
import { Plus, Target, CheckCircle, Trash2, Edit2, Lightbulb, Save, Info, RefreshCw } from "lucide-react";

interface ICPProfile {
  id: string;
  name: string;
  industry: string;
  country: string;
  companySize: string;
  revenueRange: string;
  technologiesUsed: string;
  keywords: string;
  departments: string;
  jobTitles: string;
}

interface IcpManagementProps {
  onIcpChanged?: () => void;
  userRole: "Admin" | "Team Member" | "Viewer";
}

export default function IcpManagement({ onIcpChanged, userRole }: IcpManagementProps) {
  const [profiles, setProfiles] = useState<ICPProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form values
  const [editingId, setEditingId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [companySize, setCompanySize] = useState("200-500");
  const [revenueRange, setRevenueRange] = useState("> $10M");
  const [technologiesUsed, setTechnologiesUsed] = useState("");
  const [keywords, setKeywords] = useState("");
  const [departments, setDepartments] = useState("");
  const [jobTitles, setJobTitles] = useState("");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/icp");
      if (!res.ok) throw new Error("Could not parse ICP specifications");
      const json = await res.json();
      setProfiles(json);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreateNew = () => {
    setEditingId(null);
    setProfileName("German Technical Manufacturers");
    setIndustry("Manufacturing");
    setCountry("Germany");
    setCompanySize("200-500");
    setRevenueRange("> $10M");
    setTechnologiesUsed("SAP ERP, Siemens CNC");
    setKeywords("machinery, industrial tools, automation");
    setDepartments("Engineering, Plant Management, Sourcing");
    setJobTitles("VPS of Operations, Chief Procurement Officer, Factory Director");
  };

  const handleEdit = (profile: ICPProfile) => {
    setEditingId(profile.id);
    setProfileName(profile.name);
    setIndustry(profile.industry);
    setCountry(profile.country);
    setCompanySize(profile.companySize);
    setRevenueRange(profile.revenueRange);
    setTechnologiesUsed(profile.technologiesUsed);
    setKeywords(profile.keywords);
    setDepartments(profile.departments);
    setJobTitles(profile.jobTitles);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === "Viewer") {
      setMessage({ type: "error", text: "Security policy: Viewers cannot save configurations" });
      return;
    }

    const payload = {
      id: editingId || undefined,
      name: profileName,
      industry,
      country,
      companySize,
      revenueRange,
      technologiesUsed,
      keywords,
      departments,
      jobTitles
    };

    try {
      const res = await fetch("/api/icp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Could not execute ICP save transaction");
      const updatedList = await res.json();
      setProfiles(updatedList);
      
      setMessage({ type: "success", text: editingId ? "ICP Profile successfully updated!" : "New ICP Profile compiled and created!" });
      setEditingId(null);
      
      if (onIcpChanged) onIcpChanged();
      
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.getErrorMessage?.() || "Failed to commit ICP changes" });
    }
  };

  const handleDelete = async (id: string) => {
    if (userRole === "Viewer") {
      setMessage({ type: "error", text: "Security policy: Viewers are unauthorized from deleting profiles" });
      return;
    }
    if (!window.confirm("Are you sure you want to delete this profile?")) return;

    try {
      const res = await fetch("/api/icp/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (!res.ok) throw new Error("Failed to delete record");
      const list = await res.json();
      setProfiles(list);
      setMessage({ type: "success", text: "ICP Profile completely removed from disk storage." });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: "Could not drop specified ICP profile" });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 font-sans" id="icp-view-root">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-800" /> Ideal Customer Profiles (ICP)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rules configured here drive automated lead scoring and help discover relevant company domains.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Assemble New ICP
        </button>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-100 animate-fade-in" : "bg-rose-50 text-rose-800 border border-rose-100"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="icp-grid">
        
        {/* Left Side: Existing Saved Profiles List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deployable Profiles</h3>
          
          {loading ? (
            <p className="text-xs text-slate-400">Loading configurations...</p>
          ) : (
            <div className="space-y-4" id="icp-list">
              {profiles.map((p) => (
                <div 
                  key={p.id} 
                  className={`border rounded-xl p-4 transition-all duration-200 bg-white ${editingId === p.id ? "border-slate-900 ring-1 ring-slate-900 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                        {p.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 mt-1 inline-block">
                        {p.country} • {p.industry}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button 
                        onClick={() => handleEdit(p)}
                        className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-900 transition"
                        title="Edit ICP Profile Properties"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-rose-600 transition"
                        title="Remove ICP Profile from Database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Size Range:</span>
                      <strong className="text-slate-700 font-medium">{p.companySize} employees</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Revenue Cap:</span>
                      <strong className="text-slate-700 font-medium">{p.revenueRange}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Special Stakeholders:</span>
                      <span className="text-slate-700 block truncate max-w-[120px]" title={p.jobTitles}>{p.jobTitles}</span>
                    </div>
                  </div>
                </div>
              ))}
              {profiles.length === 0 && (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-xs">
                  No specialized customer targets formulated. Click 'Assemble New ICP' to start.
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-55 bg-slate-100/10 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5"><Lightbulb className="w-4 h-4 text-amber-500" /> Scoring Mechanics Hint</h4>
            <p className="leading-relaxed text-[11px] text-slate-500">
              When our Lead Qualification Agent receives a company's firmographic details, it compares location and employee scope against these exact metrics to deliver custom weighted grade tags.
            </p>
          </div>
        </div>

        {/* Right Side: Form details either editor or new generator */}
        <div className="lg:col-span-2">
          <form className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5" onSubmit={handleSave} id="form-icp-rules">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 block">
              {editingId ? `Edit Profile Specifications` : "Define Industrial Alignment Rules"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">ICP Profile Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. German Industrial Operators"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Manufacturing"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Country focus</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Germany"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Employee bracket</label>
                  <input
                    type="text"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    placeholder="e.g. 200-500"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Revenue target</label>
                  <input
                    type="text"
                    value={revenueRange}
                    onChange={(e) => setRevenueRange(e.target.value)}
                    placeholder="e.g. > $10M"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Installed Technologies</label>
                <input
                  type="text"
                  value={technologiesUsed}
                  onChange={(e) => setTechnologiesUsed(e.target.value)}
                  placeholder="e.g. SAP ERP, Salesforce"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Core Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. machinery, automation"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Target Department</label>
                  <input
                    type="text"
                    value={departments}
                    onChange={(e) => setDepartments(e.target.value)}
                    placeholder="e.g. Procurement"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Strategic Stakeholders</label>
                  <input
                    type="text"
                    value={jobTitles}
                    onChange={(e) => setJobTitles(e.target.value)}
                    placeholder="e.g. VP Operations"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 text-xs font-semibold hover:bg-slate-50"
              >
                Clear Fields
              </button>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
              >
                <Save className="w-4 h-4" /> Save Specifications
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
