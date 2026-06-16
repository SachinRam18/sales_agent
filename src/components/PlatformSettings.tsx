import { useState } from "react";
import { Shield, ToggleLeft, ToggleRight, Puzzle, Sparkles, Check, Database, RefreshCw, AlertCircle } from "lucide-react";

interface PlatformSettingsProps {
  userRole: "Admin" | "Team Member" | "Viewer";
  onChangeRole: (newRole: "Admin" | "Team Member" | "Viewer") => void;
  userEmail: string;
}

export default function PlatformSettings({ userRole, onChangeRole, userEmail }: PlatformSettingsProps) {
  const [integrations, setIntegrations] = useState<Record<string, { enabled: boolean; apiKey: string; verified: boolean }>>({
    linkedin: { enabled: true, apiKey: "salesnav-oauth2-bearer-xyz123", verified: true },
    hubspot: { enabled: false, apiKey: "", verified: false },
    salesforce: { enabled: false, apiKey: "", verified: false },
    zoho: { enabled: false, apiKey: "", verified: false },
    outlook: { enabled: true, apiKey: "exchange-mailbox-sync-verified-token", verified: true },
    slack: { enabled: true, apiKey: "hooks.slack.com/services/T000/B000/XXXX", verified: true }
  });

  const [testLog, setTestLog] = useState<string | null>(null);

  const toggleIntegration = (key: string) => {
    if (userRole === "Viewer") {
      alert("Permission denied. Viewers are unauthorized from modifying API configurations.");
      return;
    }

    setIntegrations((prev) => {
      const current = prev[key];
      const nextEnabled = !current.enabled;
      
      return {
        ...prev,
        [key]: {
          ...current,
          enabled: nextEnabled,
          apiKey: nextEnabled && !current.apiKey ? `mock-secure-api-token-${Date.now()}` : current.apiKey,
          verified: nextEnabled
        }
      };
    });
  };

  const handleTestTrigger = (key: string) => {
    setTestLog(`[Multi-Agent Router] Dispatching diagnostic handshake packet to secure API gateway ${key.toUpperCase()}. Handshake status: 200 OK. Standard integrations variables ready.`);
    setTimeout(() => {
      setTestLog(null);
    }, 5000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 font-sans" id="settings-root">
      
      {/* Page Title */}
      <div className="border-b border-slate-100 dark:border-[#1E293B] pb-5">
        <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-indigo-600" /> Platform Settings & CRM Sync Ports
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Simulate connection targets for standard outreach APIs, and change Sandbox security permission roles.
        </p>
      </div>

      {testLog && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-xl text-xs font-mono font-bold animate-fade-in flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {testLog}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="settings-grid-wrapper">
        
        {/* Left Col: Security Profile Switcher & Workspace details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241]/80 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-50 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-500" /> Security Session Role
            </h3>

            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Seamlessly toggle between platform authorization scopes below to verify UI permission actions.
              </p>

              <div className="space-y-2">
                {(["Admin", "Team Member", "Viewer"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => onChangeRole(r)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition duration-150 flex items-center justify-between ${userRole === r ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-600 text-indigo-900 font-bold" : "border-slate-100 dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#0F172A] text-slate-600 dark:text-slate-400"}`}
                  >
                    <div>
                      <span className="block font-bold">{r} Role</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5 block">
                        {r === "Admin" && "Full controls: Add, Edit, Delete campaigns & leads"}
                        {r === "Team Member" && "Author actions: Import profiles and save ICP settings"}
                        {r === "Viewer" && "Read-only: Visual and performance metrics check only"}
                      </span>
                    </div>
                    {userRole === r && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-350 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-md">
            <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-400" /> Local Sandbox Telemetry
            </h4>
            <div className="space-y-1 text-[11px] font-mono">
              <div>Workspace Active: <strong className="text-indigo-300">SalesPilot AI Dev</strong></div>
              <div>Current Operator: <strong className="text-slate-200">{userEmail}</strong></div>
              <div>Database Link: <strong className="text-indigo-300">db_store.json (JSON simulated SQL)</strong></div>
              <div className="pt-2 text-[10px] text-slate-500 dark:text-slate-400 font-sans italic">Ready to link to actual PostgreSQL setups via migrations port triggers.</div>
            </div>
          </div>
        </div>

        {/* Right Col: Integrations List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241]/60 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Synchronized Outbound Integrations</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Maintain API tokens for target prospecting systems securely.</p>
            </div>

            <div className="divide-y divide-slate-100" id="integrations-checklist">
              {Object.keys(integrations).map((key) => {
                const item = integrations[key];
                return (
                  <div key={key} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                    <div className="space-y-1 font-sans">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-slate-800 dark:text-slate-200 uppercase font-bold tracking-wider">{key} Connector</strong>
                        {item.enabled ? (
                          <span className="text-[9px] bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                            OAuth Connection Connected
                          </span>
                        ) : (
                          <span className="text-[9px] bg-slate-50 dark:bg-[#1E293B] text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-[#1E293B] font-bold px-1.5 py-0.5 rounded-full">
                            Inactive Link
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {key === "linkedin" && "Sync Sales Navigator catalogs, lead tables, and outreach sequences"}
                        {key === "hubspot" && "Map CRM states, coordinate email threads, and block duplication records"}
                        {key === "salesforce" && "Publish verified companies as native accounts list records"}
                        {key === "zoho" && "Sync active sales cycles and update team logs"}
                        {key === "outlook" && "Dispatch outbound mail touch sequences using custom routing parameters"}
                        {key === "slack" && "Post immediate alerts when high-compatibility leads import into CRM tables"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 self-start sm:self-center">
                      {item.enabled && (
                        <button
                          onClick={() => handleTestTrigger(key)}
                          className="px-2.5 py-1 text-[11px] font-sans font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A3241] rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          Send Ping
                        </button>
                      )}
                      <button
                        onClick={() => toggleIntegration(key)}
                        className={`p-1 rounded text-slate-400 dark:text-slate-500 transition ${item.enabled ? "text-indigo-600" : "text-slate-350"}`}
                        title={item.enabled ? "Disconnect Integration Port" : "Connect OAuth Port"}
                      >
                        {item.enabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
