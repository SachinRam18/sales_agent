import { useState } from "react";
import {
  Puzzle, Shield, Check, Database, RefreshCw, Zap,
  CheckCircle2, XCircle, Wifi, WifiOff, Users, Eye,
  Settings, Server, Lock, Globe, Bell, Mail, MessageSquare
} from "lucide-react";

interface PlatformSettingsProps {
  userRole: "Admin" | "Team Member" | "Viewer";
  onChangeRole: (newRole: "Admin" | "Team Member" | "Viewer") => void;
  userEmail: string;
}

const INTEGRATIONS: Record<string, {
  label: string; category: string; description: string;
  icon: string; color: string; bg: string; border: string;
}> = {
  linkedin: {
    label: "LinkedIn Sales Nav", category: "Lead Discovery",
    description: "Sync Sales Navigator catalogs, lead lists, and outreach sequences.",
    icon: "in", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-800"
  },
  hubspot: {
    label: "HubSpot CRM", category: "CRM",
    description: "Map pipeline states, coordinate email threads, and block duplicate records.",
    icon: "hs", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-200 dark:border-orange-800"
  },
  salesforce: {
    label: "Salesforce", category: "CRM",
    description: "Publish qualified companies as native account records in Salesforce.",
    icon: "sf", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/40", border: "border-sky-200 dark:border-sky-800"
  },
  zoho: {
    label: "Zoho CRM", category: "CRM",
    description: "Sync active sales cycles, update team activity logs, and track deals.",
    icon: "zo", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-800"
  },
  outlook: {
    label: "Outlook / Exchange", category: "Email",
    description: "Dispatch outbound email sequences using custom routing parameters.",
    icon: "ou", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-200 dark:border-indigo-800"
  },
  slack: {
    label: "Slack", category: "Notifications",
    description: "Post instant alerts when high-match leads are imported into CRM.",
    icon: "sl", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-200 dark:border-violet-800"
  },
};

const ROLE_CONFIG = {
  Admin:       { color: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-500 dark:border-indigo-600", icon: Shield,  perms: ["Create & delete leads", "Manage campaigns", "Edit ICP profiles", "Modify integrations"] },
  "Team Member":{ color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-500 dark:border-emerald-600", icon: Users,  perms: ["Import leads to CRM", "Save ICP profiles", "Generate outreach copy", "View all data"] },
  Viewer:      { color: "text-slate-700 dark:text-slate-300",   bg: "bg-slate-100 dark:bg-slate-800",   border: "border-slate-400 dark:border-slate-600",   icon: Eye,    perms: ["View dashboard metrics", "Browse CRM records", "Read campaigns", "Export reports"] },
} as const;

export default function PlatformSettings({ userRole, onChangeRole, userEmail }: PlatformSettingsProps) {
  const [integrations, setIntegrations] = useState<Record<string, { enabled: boolean; apiKey: string; verified: boolean }>>({
    linkedin:   { enabled: true,  apiKey: "salesnav-oauth2-bearer-xyz123",         verified: true  },
    hubspot:    { enabled: false, apiKey: "",                                       verified: false },
    salesforce: { enabled: false, apiKey: "",                                       verified: false },
    zoho:       { enabled: false, apiKey: "",                                       verified: false },
    outlook:    { enabled: true,  apiKey: "exchange-mailbox-sync-verified-token",   verified: true  },
    slack:      { enabled: true,  apiKey: "hooks.slack.com/services/T000/B000/XXX", verified: true  },
  });
  const [pingLog, setPingLog] = useState<string | null>(null);
  const [pingKey, setPingKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"integrations" | "roles" | "system">("integrations");

  const toggle = (key: string) => {
    if (userRole === "Viewer") { alert("Viewers cannot modify integrations."); return; }
    setIntegrations(prev => {
      const cur = prev[key];
      const next = !cur.enabled;
      return { ...prev, [key]: { ...cur, enabled: next, apiKey: next && !cur.apiKey ? `mock-token-${Date.now()}` : cur.apiKey, verified: next } };
    });
  };

  const ping = (key: string) => {
    setPingKey(key);
    setPingLog(`✓ Handshake OK — ${INTEGRATIONS[key].label} gateway responded 200. Token valid.`);
    setTimeout(() => { setPingLog(null); setPingKey(null); }, 4000);
  };

  const connected = Object.values(integrations).filter(i => i.enabled).length;
  const categories = [...new Set(Object.values(INTEGRATIONS).map(i => i.category))];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans" id="settings-root">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2A3241] pb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-indigo-500" /> Integrations & Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect CRM, email, and outreach tools. Manage access roles and view system status.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> {connected} Connected
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold">
            <XCircle className="w-3.5 h-3.5 text-slate-400" /> {Object.keys(integrations).length - connected} Inactive
          </span>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1 w-fit border border-slate-200 dark:border-slate-700">
        {([
          { id: "integrations", label: "Integrations", icon: Globe },
          { id: "roles",        label: "Access Roles",  icon: Shield },
          { id: "system",       label: "System Status", icon: Server },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === id ? "bg-white dark:bg-[#151B2B] text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
            <Icon className={`w-3.5 h-3.5 ${activeTab === id ? "text-indigo-500" : ""}`} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Ping toast ── */}
      {pingLog && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-mono font-semibold">
          <Zap className="w-4 h-4 text-emerald-500 shrink-0" /> {pingLog}
        </div>
      )}

      {/* ── INTEGRATIONS TAB ── */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                {cat === "Lead Discovery" && <Globe className="w-3 h-3" />}
                {cat === "CRM"           && <Database className="w-3 h-3" />}
                {cat === "Email"         && <Mail className="w-3 h-3" />}
                {cat === "Notifications" && <Bell className="w-3 h-3" />}
                {cat}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(INTEGRATIONS)
                  .filter(([, meta]) => meta.category === cat)
                  .map(([key, meta]) => {
                    const item = integrations[key];
                    return (
                      <div key={key} className={`bg-white dark:bg-[#151B2B] border rounded-2xl overflow-hidden shadow-sm transition-all ${item.enabled ? `${meta.border} ring-1 ring-current/10` : "border-slate-200 dark:border-[#2A3241]"}`}>
                        {/* Card header */}
                        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B]">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${item.enabled ? meta.bg : "bg-slate-100 dark:bg-slate-800"} ${item.enabled ? meta.color : "text-slate-400"}`}>
                              {meta.icon.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{meta.label}</div>
                              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 border ${item.enabled
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-50 dark:bg-[#1E293B] text-slate-400 border-slate-200 dark:border-[#2A3241]"}`}>
                                {item.enabled ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Connected</> : <><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactive</>}
                              </span>
                            </div>
                          </div>
                          {/* Toggle */}
                          <button onClick={() => toggle(key)} title={item.enabled ? "Disconnect" : "Connect"}
                            className={`w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0 ${item.enabled ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"}`}>
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${item.enabled ? "translate-x-5" : "translate-x-0"}`} />
                          </button>
                        </div>

                        {/* Card body */}
                        <div className="px-4 py-3 space-y-3">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{meta.description}</p>

                          {/* API key display */}
                          {item.enabled && item.apiKey && (
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded-xl px-3 py-2">
                              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate flex-1">
                                {item.apiKey.slice(0, 8)}••••••••{item.apiKey.slice(-4)}
                              </span>
                              {item.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {item.enabled && (
                              <button onClick={() => ping(key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold border transition-all ${pingKey === key
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800"
                                  : "bg-slate-50 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#2A3241] hover:border-indigo-300 hover:text-indigo-600"}`}>
                                {pingKey === key
                                  ? <><CheckCircle2 className="w-3 h-3" /> OK</>
                                  : <><Wifi className="w-3 h-3" /> Ping</>}
                              </button>
                            )}
                            {!item.enabled && (
                              <button onClick={() => toggle(key)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition">
                                <Wifi className="w-3 h-3" /> Connect
                              </button>
                            )}
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color} border ${meta.border}`}>
                              {meta.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ROLES TAB ── */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role switcher */}
          <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Access Role</h3>
              <span className="text-[10px] text-slate-400 ml-1">— sandbox testing</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Switch between roles to test permission boundaries across the platform.
            </p>
            <div className="space-y-2.5">
              {(["Admin", "Team Member", "Viewer"] as const).map((r) => {
                const cfg = ROLE_CONFIG[r];
                const Icon = cfg.icon;
                const isActive = userRole === r;
                return (
                  <button key={r} onClick={() => onChangeRole(r)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 ${isActive ? `${cfg.bg} ${cfg.border} ring-1 ring-current/20` : "border-slate-200 dark:border-[#2A3241] hover:bg-slate-50 dark:hover:bg-[#0F172A]"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? cfg.bg : "bg-slate-100 dark:bg-slate-800"}`}>
                          <Icon className={`w-4 h-4 ${isActive ? cfg.color : "text-slate-400"}`} />
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${isActive ? cfg.color : "text-slate-700 dark:text-slate-300"}`}>{r}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {r === "Admin" && "Full platform access"}
                            {r === "Team Member" && "Create & edit, no delete"}
                            {r === "Viewer" && "Read-only access"}
                          </div>
                        </div>
                      </div>
                      {isActive && <Check className={`w-4 h-4 ${cfg.color}`} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current role permissions */}
          <div className="space-y-4">
            <div className={`rounded-2xl p-5 border ${ROLE_CONFIG[userRole].bg} ${ROLE_CONFIG[userRole].border} shadow-sm`}>
              <div className={`flex items-center gap-2 mb-3 ${ROLE_CONFIG[userRole].color}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">Current: {userRole}</span>
              </div>
              <div className="space-y-2">
                {ROLE_CONFIG[userRole].perms.map(p => (
                  <div key={p} className="flex items-center gap-2 text-[11px]">
                    <Check className={`w-3 h-3 shrink-0 ${ROLE_CONFIG[userRole].color}`} />
                    <span className="text-slate-700 dark:text-slate-300">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User info card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">Session Info</span>
              </div>
              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between"><span className="text-slate-500">Operator</span><span className="text-slate-200">{userEmail}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Role</span><span className={ROLE_CONFIG[userRole].color}>{userRole}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Workspace</span><span className="text-indigo-300">SalesPilot AI Dev</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Database</span><span className="text-indigo-300">db_store.json</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Integrations</span><span className="text-emerald-400">{connected}/{Object.keys(integrations).length} active</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SYSTEM STATUS TAB ── */}
      {activeTab === "system" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Module health */}
          <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Agent Module Health</h3>
            </div>
            <div className="space-y-2">
              {[
                { name: "ICP Definition Engine",       status: "Operational", color: "text-emerald-500", dot: "bg-emerald-500" },
                { name: "Lead Discovery Crawler",       status: "Operational", color: "text-emerald-500", dot: "bg-emerald-500" },
                { name: "Prospect Enrichment Agent",    status: "Operational", color: "text-emerald-500", dot: "bg-emerald-500" },
                { name: "AI Qualification Agent",       status: "Operational", color: "text-emerald-500", dot: "bg-emerald-500" },
                { name: "Duplicate Detection Agent",    status: "Operational", color: "text-emerald-500", dot: "bg-emerald-500" },
                { name: "CRM Onboarding Agent",         status: "Operational", color: "text-emerald-500", dot: "bg-emerald-500" },
                { name: "Outreach Generation Agent",    status: "Operational", color: "text-emerald-500", dot: "bg-emerald-500" },
                { name: "Campaign Tracking Agent",      status: "Operational", color: "text-emerald-500", dot: "bg-emerald-500" },
              ].map(({ name, status, color, dot }) => (
                <div key={name} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0F172A] transition">
                  <span className="text-xs text-slate-700 dark:text-slate-300">{name}</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-semibold ${color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`}></span>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stack info + integration summary */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Tech Stack</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Frontend",   value: "React + TypeScript", color: "text-sky-500 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900" },
                  { label: "AI Layer",   value: "OpenRouter / Gemini", color: "text-violet-500 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900" },
                  { label: "Backend",    value: "Node.js / Express",  color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900" },
                  { label: "Database",   value: "JSON Store → PgSQL", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900" },
                  { label: "Automation", value: "n8n Workflows",      color: "text-pink-500 bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900" },
                  { label: "Discovery",  value: "Apify + LinkedIn",   color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900" },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`p-3 rounded-xl border text-[10px] font-semibold ${color}`}>
                    <div className="opacity-70 uppercase tracking-wider mb-0.5">{label}</div>
                    <div className="text-slate-800 dark:text-slate-200 font-bold text-[11px]">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active integrations summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Active Connections</span>
                <span className="ml-auto text-[10px] text-emerald-400 font-mono">{connected}/{Object.keys(integrations).length}</span>
              </div>
              <div className="space-y-2">
                {Object.entries(integrations).filter(([, i]) => i.enabled).map(([key]) => (
                  <div key={key} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{INTEGRATIONS[key]?.label}</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                    </span>
                  </div>
                ))}
                {connected === 0 && <p className="text-xs text-slate-500 italic">No active connections.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
