import { useState, useEffect } from "react";
import { 
  Users, Target, Send, ShieldAlert, BadgeCheck, SlidersHorizontal, BarChart2, 
  Puzzle, LogOut, Layout, Bell, Check, Menu, X, Sparkles, FolderLock, Moon, Sun, Bot, BrainCircuit
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
  >(() => {
    // Restore last page from session so a refresh doesn't reset to landing
    const saved = sessionStorage.getItem("sp_page");
    if (saved && saved !== "auth") return saved as any;
    return "landing";
  });

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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

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

  // Persist current page across refreshes
  useEffect(() => {
    sessionStorage.setItem("sp_page", currentPage);
  }, [currentPage]);

  // If user is already set (pre-seeded or restored) skip landing/auth
  useEffect(() => {
    if (user && (currentPage === "landing" || currentPage === "auth")) {
      setCurrentPage("dashboard");
    }
  }, [user, currentPage]);

  // State to preserve LeadDiscovery chat history across page navigations
  const [discoveryMessages, setDiscoveryMessages] = useState<any[]>([
    {
      id: "welcome",
      role: "assistant",
      type: "text",
      content: "Hello! I am your Lead Discovery Agent. Tell me what kind of companies you are looking for. For example: 'Find me software companies in the USA with 200-500 employees.'"
    }
  ]);

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
    { id: "discovery", label: "Lead Discovery Agent", Icon: Bot },
    { id: "crm", label: "CRM Lead Pipeline", Icon: BrainCircuit },
    { id: "outreach", label: "Outreach & Copywriter", Icon: Send },
    { id: "campaigns", label: "Outbound Campaigns", Icon: BarChart2 },
    { id: "settings", label: "Integrations & API Settings", Icon: Puzzle },
  ] as const;

  if (currentPage === "landing") {
    return (
      <LandingPage 
        onStart={() => setCurrentPage("auth")} 
        onLogin={() => setCurrentPage("auth")} 
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  if (currentPage === "auth") {
    return <AuthScreens onSuccess={handleLoginSuccess} onBack={() => setCurrentPage("landing")} />;
  }

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-screen flex flex-col text-slate-900 dark:text-slate-50 font-sans" id="application-root">

      {/* ── Top navbar ── */}
      <header className="sticky top-0 z-40 bg-[#0D1117] h-16 flex items-center px-6 sm:px-8 gap-5 font-sans">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img src="/logo-icon.svg" alt="SalesPilot AI" className="w-7 h-7" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-semibold text-white text-sm tracking-tight">SalesPilot</span>
            {/* AI animated badge */}
            <span className="relative flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 overflow-hidden">
              {/* Shimmer sweep */}
              <span className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
              {/* Pulsing dot */}
              <span className="relative w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="relative">AI</span>
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 shrink-0" />

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            const iconColors: Record<string, string> = {
              dashboard: "text-indigo-400",
              icp:       "text-emerald-400",
              discovery: "text-blue-400",
              crm:       "text-violet-400",
              outreach:  "text-sky-400",
              campaigns: "text-amber-400",
              settings:  "text-slate-400",
            };
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  if (item.id !== "crm") setSelectedCompanyId(null);
                }}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                  ${isActive
                    ? "bg-emerald-500/10 text-white"
                    : "text-slate-500 hover:text-slate-200 hover:bg-white/5"}`}
              >
                <item.Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? iconColors[item.id] : "text-slate-600"}`} />
                {item.label}
                {isActive && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-500 rounded-full" />}
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Live badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>

          {/* Theme toggle */}
          <button onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle theme"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition">
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} title="Notifications"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition relative">
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-[#2A3241] rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#1E293B] bg-slate-50 dark:bg-[#1E293B]/60">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Notifications</span>
                  </div>
                  <button onClick={clearNotifications} className="text-[10px] text-indigo-500 font-semibold hover:underline">Clear all</button>
                </div>
                <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100 dark:divide-[#1E293B]">
                  {notifications.map((n) => (
                    <div key={n.id} className={`px-4 py-3 ${!n.read ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""}`}>
                      <p className={`text-[11px] leading-relaxed ${!n.read ? "font-semibold text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}>{n.message}</p>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>}
                </div>
              </div>
            )}
          </div>

          {/* User */}
          {user && (
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10 ml-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-[10px]">
                {user.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white leading-none">{user.name.split(" ")[0]}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{user.role}</div>
              </div>
              <button onClick={handleLogout} title="Sign out"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-rose-400 hover:bg-white/5 transition">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 flex flex-col" id="workspace-main">
        <section className="flex-1 bg-[#F8FAFC] dark:bg-[#0B1120]">
          {currentPage === "dashboard" && (
            <DashboardView onNavigateTo={handleNavigate} onSelectCompany={handleSelectCompany} userRole={user ? user.role : "Viewer"} />
          )}
          {currentPage === "icp" && (
            <IcpManagement onIcpChanged={fetchNotifications} userRole={user ? user.role : "Viewer"} />
          )}
          {currentPage === "discovery" && (
            <LeadDiscovery onLeadSynced={fetchNotifications} userRole={user ? user.role : "Viewer"} messages={discoveryMessages} setMessages={setDiscoveryMessages} />
          )}
          {currentPage === "crm" && (
            <CrmModule onCompanySelected={setSelectedCompanyId} selectedCompanyId={selectedCompanyId} onCloseDetail={() => setSelectedCompanyId(null)} userRole={user ? user.role : "Viewer"} />
          )}
          {currentPage === "outreach" && (
            <OutreachAgent userRole={user ? user.role : "Viewer"} />
          )}
          {currentPage === "campaigns" && (
            <CampaignManagement userRole={user ? user.role : "Viewer"} />
          )}
          {currentPage === "settings" && (
            <PlatformSettings userRole={user ? user.role : "Viewer"} onChangeRole={handleRoleChange} userEmail={user ? user.email : "guest@salespilot.ai"} />
          )}
        </section>
      </main>

    </div>
  );
}
