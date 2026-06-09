import React, { useState } from "react";
import { Mail, Lock, User, Key, Check, Shield, ArrowRight } from "lucide-react";
import BackgroundMotionGraphics from "./BackgroundMotionGraphics";

interface AuthScreensProps {
  onSuccess: (user: { email: string; name: string; role: "Admin" | "Team Member" | "Viewer" }) => void;
  onBack: () => void;
}

export default function AuthScreens({ onSuccess, onBack }: AuthScreensProps) {
  const [view, setView] = useState<"login" | "register" | "forgot" | "verify">("login");
  const [email, setEmail] = useState("sachinram6363@gmail.com");
  const [password, setPassword] = useState("••••••••");
  const [name, setName] = useState("Sachin Ram");
  const [role, setRole] = useState<"Admin" | "Team Member" | "Viewer">("Admin");
  
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAlert({ type: "error", text: "Please provide your email address" });
      return;
    }
    // Success flow
    setAlert({ type: "success", text: "Authenticating successfully..." });
    setTimeout(() => {
      onSuccess({ email, name: name || "User", role });
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setAlert({ type: "error", text: "Please populate all fields" });
      return;
    }
    setView("verify");
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ type: "success", text: "Email verified successfully!" });
    setTimeout(() => {
      onSuccess({ email, name, role });
    }, 800);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAlert({ type: "error", text: "Please enter your email" });
      return;
    }
    setAlert({ type: "success", text: "Password reset instructions transmitted." });
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden" id="auth-root">
      <BackgroundMotionGraphics />
      
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-md relative z-10" id="auth-box">
        {/* Logo and Headings */}
        <div className="text-center">
          <img 
            src="/logo.png" 
            alt="SalesPilot AI Logo" 
            className="mx-auto w-10 h-10 rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition duration-200" 
            onClick={onBack} 
          />
          <h2 className="mt-4 text-xl font-semibold text-slate-900 tracking-tight">
            {view === "login" && "Welcome to SalesPilot AI"}
            {view === "register" && "Create your SDK Workspace"}
            {view === "forgot" && "Recover Security Credentials"}
            {view === "verify" && "Verify Security Access Key"}
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            {view === "login" && "Access your AI-powered SDR prospecting portal"}
            {view === "register" && "Start discovering high-growth manufacturing accounts"}
            {view === "forgot" && "Enter your email to receive a secure recovery code"}
            {view === "verify" && `We sent a confirmation token to ${email}`}
          </p>
        </div>

        {alert && (
          <div className={`p-3 rounded-lg text-xs font-semibold ${alert.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-rose-50 text-rose-800 border border-rose-100"}`}>
            {alert.text}
          </div>
        )}

        {/* View Switcher Controls */}
        {view === "login" && (
          <form className="mt-6 space-y-4" onSubmit={handleLogin} id="form-login">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Login Role Preview (For Testing)</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(["Admin", "Team Member", "Viewer"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      if (r === "Admin") {
                        setName("Sachin Ram");
                        setEmail("sachinram6363@gmail.com");
                      } else if (r === "Team Member") {
                        setName("Alex Mercer");
                        setEmail("team@company.com");
                      } else {
                        setName("Sarah Connor");
                        setEmail("viewer@company.com");
                      }
                    }}
                    className={`text-center py-2 px-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${role === r ? "bg-slate-900 border-slate-900 text-white" : "border-slate-200 hover:bg-slate-50 text-slate-500"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Corporate Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Account Password</label>
                  <button 
                    type="button" 
                    onClick={() => setView("forgot")} 
                    className="text-[10px] font-semibold text-amber-500 hover:text-amber-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
              id="btn-submit-login"
            >
              Sign In to Workbench <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">New to SalesPilot AI? </span>
              <button 
                type="button" 
                onClick={() => setView("register")} 
                className="text-xs font-semibold text-amber-500 hover:text-amber-600 hover:underline"
              >
                Register Workspace
              </button>
            </div>
          </form>
        )}

        {view === "register" && (
          <form className="mt-6 space-y-4" onSubmit={handleRegister} id="form-register">
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Professional Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                    placeholder="Sachin Ram"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Corporate Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Default Workspace Role</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Team Member">Team Member (Editor)</option>
                  <option value="Viewer">Viewer (Read-only)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
              id="btn-submit-register"
            >
              Verify Active Domain <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">Have an account already? </span>
              <button 
                type="button" 
                onClick={() => setView("login")} 
                className="text-xs font-semibold text-amber-500 hover:text-amber-600 hover:underline animate-none"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {view === "forgot" && (
          <form className="mt-6 space-y-4" onSubmit={handleForgot} id="form-forgot">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Account Recovery Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Transmit Recovery Code
            </button>

            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => setView("login")} 
                className="text-xs font-semibold text-amber-500 hover:text-amber-600 hover:underline"
              >
                Return to Login
              </button>
            </div>
          </form>
        )}

        {view === "verify" && (
          <form className="mt-6 space-y-4" onSubmit={handleVerify} id="form-verify">
            <div className="text-center mb-4">
              <p className="text-xs text-slate-400 leading-relaxed">We simulate a security token. Click the button below to complete verification.</p>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Enter 6-Digit Code</label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  required
                  className="w-full tracking-[1.5em] text-center font-mono bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Activate Sandbox
            </button>

            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => setView("login")} 
                className="text-xs font-semibold text-amber-500 hover:text-amber-600 hover:underline"
              >
                Start Over
              </button>
            </div>
          </form>
        )}

        {/* Back link */}
        <div className="text-center mt-4 border-t border-slate-100 pt-4">
          <button 
            type="button" 
            onClick={onBack} 
            className="text-xs text-slate-400 hover:text-slate-900 font-semibold transition cursor-pointer"
          >
            ← Back to Landing Information
          </button>
        </div>
      </div>
    </div>
  );
}
