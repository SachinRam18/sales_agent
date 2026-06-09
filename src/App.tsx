import { useState, useEffect } from "react";
import { 
  Users, Target, Send, ShieldAlert, BadgeCheck, SlidersHorizontal, BarChart2, 
  Puzzle, LogOut, Layout, Bell, Check, Menu, X, Sparkles, FolderLock 
} from "lucide-react";

// Modular Views
import LandingPage from "./components/LandingPage";
import AuthScreens from "./components/AuthScreens";
import DashboardView from "./components/DashboardView";
import IcpManagement from "./components/IcpManagement";
import LeadDiscovery from "./components/LeadDiscovery";
import CrmModule from "./components/CrmModule";
import OutreachAgent from "./components/OutreachAgent";
import CampaignManagement from "./components/CampaignManagement";
import PlatformSettings from "./components/PlatformSettings";

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    "landing" | "auth" | "dashboard" | "icp" | "discovery" | "crm" | "outreach" | "campaigns" | "settings"
  >("landing");

  // User session state
  const [user, setUser] = useState<{
    email: string;
    name: string;
    role: "Admin" | "Team Member" | "Viewer";
  } | null>({
    email: "sachinram6363@gmail.com",
    name: "Sachin Ram",
    role: "Admin"
  }); // Seeded Admin login out of the box for immediate rich preview exploration

  // Selected crm lead detail
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // System notifications panel
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; read: boolean; timestamp: string }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load telemetry notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const list = await res.json();
        setNotifications(list);
      }
    } catch (e) {
      console.warn("Notifications sync transient error", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 20 seconds
      const int = setInterval(fetchNotifications, 20000);
      return () => clearInterval(int);
    }
  }, [user]);

  const clearNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/clear", { method: "POST" });
      if (res.ok) {
        const cleared = await res.json();
        setNotifications(cleared);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSuccess = (usr: typeof user) => {
    setUser(usr);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("landing");
  };

  // Switch role locally from settings pane
  const handleRoleChange = (newRole: "Admin" | "Team Member" | "Viewer") => {
    if (user) {
      setUser((prev) => prev ? { ...prev, role: newRole } : null);
    }
  };

  // Nav helper for components to route sidebar pages
  const handleNavigate = (page: string) => {
    setCurrentPage(page as any);
  };

  // Triggering visual detail drawer in CRM
  const handleSelectCompany = (id: string) => {
    setSelectedCompanyId(id);
    setCurrentPage("crm");
  };

  // Sidebar components metadata
  const menuItems = [
    { id: "dashboard", label: "Dashboard", Icon: Layout },
    { id: "icp", label: "Ideal Customer Profile", Icon: Target },
    { id: "discovery", label: "Lead Discovery Agent", Icon: SlidersHorizontal },
    { id: "crm", label: "CRM Lead Pipeline", Icon: BadgeCheck },
    { id: "outreach", label: "Outreach & Copywriter", Icon: Send },
    { id: "campaigns", label: "Outbound Campaigns", Icon: BarChart2 },
    { id: "settings", label: "Integrations & API Settings", Icon: Puzzle },
  ] as const;

  if (currentPage === "landing") {
    return <LandingPage onStart={() => setCurrentPage("auth")} onLogin={() => setCurrentPage("auth")} />;
  }

  if (currentPage === "auth") {
    return <AuthScreens onSuccess={handleLoginSuccess} onBack={() => setCurrentPage("landing")} />;
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex text-slate-900 font-sans" id="application-root">
      
      {/* Mobile Sidebar overlay toggler */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-sm border border-slate-200"
        >
          {isSidebarOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      {/* Main Persistent Desktop Sidebar */}
      <aside 
        className={`bg-white border-r border-slate-200 w-64 flex flex-col justify-between fixed h-full z-40 transition-transform duration-200
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        id="side-nav-aside"
      >
        <div className="space-y-6 pt-6">
          {/* Logo brand and name */}
          <div className="px-6 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
              SP
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-base text-slate-900 tracking-tight">SalesPilot</span>
              <span className="text-slate-800 font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">AI</span>
            </div>
          </div>

          {/* Nav menu links */}
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    // Close list detail when going away from CRM to prevent awkward side view
                    if (item.id !== "crm") setSelectedCompanyId(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium tracking-wide rounded-lg transition-all duration-150
                    ${isActive ? "bg-slate-950 text-white font-semibold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
                >
                  <item.Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User login overview & actions bottom sidebar block */}
        {user && (
          <div className="p-4 border-t border-slate-150 space-y-3 bg-slate-50/55">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs border border-slate-300">
                {user.name.split(" ").map(w => w[0]).join("")}
              </div>
              <div className="truncate text-xs">
                <span className="font-semibold text-slate-800 block truncate">{user.name}</span>
                <span className="text-[10px] text-slate-400 block truncate font-mono">{user.email}</span>
                <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-600 font-medium px-1.5 py-0.5 rounded-md inline-block mt-1 uppercase">
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-semibold text-slate-500 hover:text-rose-600 border border-slate-200 bg-white rounded-md hover:bg-slate-50 transition shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        )}
      </aside>

      {/* Main workspace container */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen relative" id="workspace-main">
        
        {/* Top telemetry bar */}
        <header className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 z-30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-medium text-slate-600 tracking-tight">
              SDR Pipeline Connected
            </span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Notifications panel Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-200 relative transition shadow-sm"
                title="Notifications feed"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-4 space-y-3 z-50 animate-fade-in-up">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                    <span className="text-xs font-semibold text-slate-800">Orchestrator Logs</span>
                    <button 
                      onClick={clearNotifications}
                      className="text-[10px] text-blue-650 font-semibold hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="text-[11px] leading-relaxed">
                        <p className={`text-slate-600 ${!n.read ? "font-semibold text-slate-900" : ""}`}>{n.message}</p>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">{new Date(n.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-2">No alerts on record.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Platform indicator badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Live Sandbox
            </div>
          </div>
        </header>

        {/* View content injection */}
        <section className="flex-1 bg-[#F8FAFC]">
          {currentPage === "dashboard" && (
            <DashboardView 
              onNavigateTo={handleNavigate} 
              onSelectCompany={handleSelectCompany}
              userRole={user ? user.role : "Viewer"} 
            />
          )}

          {currentPage === "icp" && (
            <IcpManagement 
              onIcpChanged={fetchNotifications}
              userRole={user ? user.role : "Viewer"} 
            />
          )}

          {currentPage === "discovery" && (
            <LeadDiscovery 
              onLeadSynced={fetchNotifications}
              userRole={user ? user.role : "Viewer"} 
            />
          )}

          {currentPage === "crm" && (
            <CrmModule 
              onCompanySelected={setSelectedCompanyId}
              selectedCompanyId={selectedCompanyId}
              onCloseDetail={() => setSelectedCompanyId(null)}
              userRole={user ? user.role : "Viewer"} 
            />
          )}

          {currentPage === "outreach" && (
            <OutreachAgent 
              userRole={user ? user.role : "Viewer"} 
            />
          )}

          {currentPage === "campaigns" && (
            <CampaignManagement 
              userRole={user ? user.role : "Viewer"} 
            />
          )}

          {currentPage === "settings" && (
            <PlatformSettings 
              userRole={user ? user.role : "Viewer"} 
              onChangeRole={handleRoleChange}
              userEmail={user ? user.email : "guest@salespilot.ai"}
            />
          )}
        </section>

      </main>

    </div>
  );
}
