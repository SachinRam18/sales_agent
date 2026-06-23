import React, { useState, useEffect } from "react";
import {
  Plus, Target, Trash2, Edit2, Lightbulb, Save,
  Building2, MapPin, Users, DollarSign, Cpu, Tag, Briefcase, UserCheck,
  CheckCircle2, RefreshCw, ChevronRight, Sparkles, X
} from "lucide-react";

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

const FIELD_META = [
  { icon: Building2, color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-950/40",    key: "industry",         label: "Industry" },
  { icon: MapPin,    color: "text-emerald-500",  bg: "bg-emerald-50 dark:bg-emerald-950/40", key: "country",       label: "Location" },
  { icon: Users,     color: "text-violet-500",   bg: "bg-violet-50 dark:bg-violet-950/40",key: "companySize",      label: "Headcount" },
  { icon: DollarSign,color: "text-amber-500",    bg: "bg-amber-50 dark:bg-amber-950/40",  key: "revenueRange",     label: "Revenue" },
  { icon: Cpu,       color: "text-sky-500",      bg: "bg-sky-50 dark:bg-sky-950/40",      key: "technologiesUsed", label: "Tech Stack" },
  { icon: Tag,       color: "text-rose-500",     bg: "bg-rose-50 dark:bg-rose-950/40",    key: "keywords",         label: "Keywords" },
  { icon: Briefcase, color: "text-indigo-500",   bg: "bg-indigo-50 dark:bg-indigo-950/40",key: "departments",      label: "Departments" },
  { icon: UserCheck, color: "text-teal-500",     bg: "bg-teal-50 dark:bg-teal-950/40",    key: "jobTitles",        label: "Stakeholders" },
] as const;

const EMPTY: ICPProfile = {
  id: "", name: "", industry: "", country: "", companySize: "200-500",
  revenueRange: "> $10M", technologiesUsed: "", keywords: "", departments: "", jobTitles: ""
};

function FieldInput({ icon: Icon, color, bg, label, value, onChange, placeholder, required }: {
  icon: any; color: string; bg: string; label: string;
  value: string; onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <span className={`w-4 h-4 rounded flex items-center justify-center ${bg}`}>
          <Icon className={`w-2.5 h-2.5 ${color}`} />
        </span>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-lg py-2 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 transition"
      />
    </div>
  );
}

function ProfileCard({ profile, isActive, onEdit, onDelete }: {
  profile: ICPProfile; isActive: boolean;
  onEdit: () => void; onDelete: () => void;
}) {
  const attrs = FIELD_META.filter(f => (profile as any)[f.key]);
  return (
    <div onClick={onEdit} className={`group rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden
      ${isActive
        ? "border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-400/20 shadow-md"
        : "border-slate-200 dark:border-[#2A3241] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md bg-white dark:bg-[#151B2B]"}`}>

      {/* Card header */}
      <div className={`px-4 py-3 flex items-start justify-between gap-2 ${isActive ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-white dark:bg-[#151B2B]"}`}>
        <div className="min-w-0">
          <div className={`font-semibold text-sm leading-snug truncate ${isActive ? "text-white" : "text-slate-900 dark:text-slate-50"}`}>
            {profile.name}
          </div>
          <div className={`flex items-center gap-1 mt-0.5 text-[10px] ${isActive ? "text-white/70" : "text-slate-400"}`}>
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{profile.country || "—"}</span>
            <span className="mx-0.5">·</span>
            <Building2 className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{profile.industry || "—"}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className={`p-1 rounded-lg transition ${isActive ? "hover:bg-white/20 text-white/70 hover:text-white" : "hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-400 hover:text-blue-500"}`}>
            <Edit2 className="w-3 h-3" />
          </button>
          <button onClick={onDelete} className={`p-1 rounded-lg transition ${isActive ? "hover:bg-white/20 text-white/70 hover:text-white" : "hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500"}`}>
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Attribute chips */}
      <div className="px-4 py-3 flex flex-wrap gap-1.5 bg-white dark:bg-[#151B2B]">
        {attrs.slice(0, 6).map(({ icon: Icon, color, bg, key, label }) => {
          const val = (profile as any)[key] as string;
          return (
            <span key={key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-transparent ${bg}`}>
              <Icon className={`w-2.5 h-2.5 shrink-0 ${color}`} />
              <span className={`truncate max-w-[80px] ${color.replace("text-", "text-").replace("-500", "-700").replace("dark:", "")}`}>{val}</span>
            </span>
          );
        })}
        {isActive && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-2.5 h-2.5" /> Editing
          </span>
        )}
      </div>
    </div>
  );
}

export default function IcpManagement({ onIcpChanged, userRole }: IcpManagementProps) {
  const [profiles, setProfiles] = useState<ICPProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ICPProfile, "id">>(EMPTY);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const set = (key: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/icp");
      if (!res.ok) throw new Error("Could not parse ICP specifications");
      setProfiles(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const handleCreateNew = () => {
    setEditingId(null);
    setForm({
      name: "", industry: "Manufacturing", country: "Germany",
      companySize: "200-500", revenueRange: "> $10M",
      technologiesUsed: "SAP ERP, Siemens CNC",
      keywords: "machinery, industrial tools, automation",
      departments: "Engineering, Plant Management, Sourcing",
      jobTitles: "VP Operations, Chief Procurement Officer"
    });
    setShowForm(true);
  };

  const handleEdit = (p: ICPProfile) => {
    setEditingId(p.id);
    setForm({ name: p.name, industry: p.industry, country: p.country, companySize: p.companySize,
      revenueRange: p.revenueRange, technologiesUsed: p.technologiesUsed, keywords: p.keywords,
      departments: p.departments, jobTitles: p.jobTitles });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === "Viewer") { setMessage({ type: "error", text: "Viewers cannot save configurations." }); return; }
    try {
      const res = await fetch("/api/icp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId || undefined, ...form })
      });
      if (!res.ok) throw new Error("Could not save ICP");
      setProfiles(await res.json());
      setMessage({ type: "success", text: editingId ? "Profile updated!" : "New profile created!" });
      setEditingId(null); setShowForm(false);
      if (onIcpChanged) onIcpChanged();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to save profile." });
    }
  };

  const handleDelete = async (id: string) => {
    if (userRole === "Viewer") { setMessage({ type: "error", text: "Viewers cannot delete profiles." }); return; }
    if (!window.confirm("Delete this ICP profile?")) return;
    try {
      const res = await fetch("/api/icp/delete", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error("Delete failed");
      setProfiles(await res.json());
      if (editingId === id) { setEditingId(null); setShowForm(false); }
      setMessage({ type: "success", text: "Profile deleted." });
      setTimeout(() => setMessage(null), 2500);
    } catch { setMessage({ type: "error", text: "Could not delete profile." }); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans" id="icp-view-root">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2A3241] pb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" /> Ideal Customer Profiles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Define targeting criteria that drive automated lead scoring across all discovery agents.
          </p>
        </div>
        <button onClick={handleCreateNew}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition">
          <Plus className="w-4 h-4" /> New ICP Profile
        </button>
      </div>

      {/* ── Toast ── */}
      {message && (
        <div className={`flex items-center justify-between p-3.5 rounded-xl text-xs font-semibold border ${
          message.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
            : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-800"}`}>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> {message.text}
          </span>
          <button onClick={() => setMessage(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* ── How scoring works banner ── */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-white">How ICP Scoring Works</div>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Each profile generates a weighted scoring model. When the AI Qualification Agent evaluates a discovered company, it matches industry, location, headcount, revenue, and tech stack against your profiles and outputs a 0–100 score.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {["Industry", "Size", "Revenue", "Tech", "Location"].map((c, i) => (
            <div key={c} className="text-center">
              <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300">{20 * (i + 1 > 3 ? 1 : i + 1)}%</div>
              <div className="text-[8px] text-slate-500 mt-0.5">{c}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className={`grid grid-cols-1 gap-6 ${showForm ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>

        {/* ── Profile cards grid ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {profiles.length} Saved Profile{profiles.length !== 1 ? "s" : ""}
            </h2>
            {showForm && (
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 transition">
                <X className="w-3 h-3" /> Close editor
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" /> Loading profiles...
            </div>
          ) : profiles.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 dark:border-[#2A3241] rounded-2xl p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No profiles yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Create your first ICP to start qualifying leads automatically.</p>
              <button onClick={handleCreateNew} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
                Create First Profile
              </button>
            </div>
          ) : (
            <div className={`grid gap-3 ${showForm ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"}`}>
              {profiles.map((p) => (
                <ProfileCard
                  key={p.id}
                  profile={p}
                  isActive={editingId === p.id}
                  onEdit={() => handleEdit(p)}
                  onDelete={() => handleDelete(p.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Editor form ── */}
        {showForm && (
          <form onSubmit={handleSave} className="bg-white dark:bg-[#151B2B] rounded-2xl border border-slate-200 dark:border-[#2A3241] shadow-sm overflow-hidden" id="form-icp-rules">

            {/* Form header */}
            <div className={`px-5 py-4 border-b border-slate-100 dark:border-[#1E293B] flex items-center justify-between ${editingId ? "bg-gradient-to-r from-indigo-600 to-violet-600" : "bg-gradient-to-r from-emerald-600 to-teal-600"}`}>
              <div>
                <div className="text-sm font-semibold text-white">{editingId ? "Edit Profile" : "New ICP Profile"}</div>
                <div className="text-[11px] text-white/70 mt-0.5">Fill in targeting criteria below</div>
              </div>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                className="text-white/60 hover:text-white transition text-lg leading-none">×</button>
            </div>

            <div className="p-5 space-y-5">

              {/* Profile name */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Profile Name</label>
                <input type="text" value={form.name} onChange={(e) => set("name")(e.target.value)}
                  placeholder="e.g. German Manufacturing Mid-Market"
                  required
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl py-2.5 px-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 transition" />
              </div>

              {/* Firmographic section */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" /> Firmographics
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldInput icon={Building2} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-950/40" label="Industry" value={form.industry} onChange={set("industry")} placeholder="e.g. Manufacturing" required />
                  <FieldInput icon={MapPin}    color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-950/40" label="Country" value={form.country} onChange={set("country")} placeholder="e.g. Germany" required />
                  <FieldInput icon={Users}     color="text-violet-500" bg="bg-violet-50 dark:bg-violet-950/40" label="Headcount" value={form.companySize} onChange={set("companySize")} placeholder="e.g. 200-500" required />
                  <FieldInput icon={DollarSign} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-950/40" label="Revenue" value={form.revenueRange} onChange={set("revenueRange")} placeholder="e.g. > $10M" required />
                </div>
              </div>

              {/* Intelligence section */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" /> Intelligence Signals
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <FieldInput icon={Cpu}       color="text-sky-500"    bg="bg-sky-50 dark:bg-sky-950/40"    label="Tech Stack"    value={form.technologiesUsed} onChange={set("technologiesUsed")} placeholder="e.g. SAP ERP, Salesforce" />
                  <FieldInput icon={Tag}       color="text-rose-500"   bg="bg-rose-50 dark:bg-rose-950/40"  label="Keywords"      value={form.keywords} onChange={set("keywords")} placeholder="e.g. automation, machinery" />
                </div>
              </div>

              {/* Stakeholder section */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3" /> Target Stakeholders
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <FieldInput icon={Briefcase} color="text-indigo-500" bg="bg-indigo-50 dark:bg-indigo-950/40" label="Departments"   value={form.departments} onChange={set("departments")} placeholder="e.g. Engineering, Procurement" />
                  <FieldInput icon={UserCheck} color="text-teal-500"   bg="bg-teal-50 dark:bg-teal-950/40"   label="Job Titles"    value={form.jobTitles} onChange={set("jobTitles")} placeholder="e.g. VP Operations, CPO" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-[#2A3241] rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0F172A] transition">
                  Cancel
                </button>
                <button type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-sm transition ${editingId ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                  <Save className="w-3.5 h-3.5" /> {editingId ? "Update Profile" : "Create Profile"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
