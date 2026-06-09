import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Users, Search, Target, Mail, ArrowUpRight, Award, HelpCircle } from "lucide-react";
import BackgroundMotionGraphics from "./BackgroundMotionGraphics";

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
  const features = [
    {
      icon: <Search className="w-5 h-5 text-slate-800" id="feat-icon-1" />,
      title: "Agentic Lead Discovery",
      description: "Automated search crawlers parse company structures, identify direct URLs, and find decision-makers matching your specifications."
    },
    {
      icon: <Target className="w-5 h-5 text-slate-800" id="feat-icon-2" />,
      title: "ICP Scoring Engine",
      description: "Instant grading (0-100) based on industry, geographic scope, estimated tool stack compatibility, and team size rules."
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-500" id="feat-icon-3" />,
      title: "Data Enrichment Agent",
      description: "Extract high-accuracy corporate metadata, tech stack trackers, dynamic growth signals, and active buying triggers."
    },
    {
      icon: <Mail className="w-5 h-5 text-slate-800" id="feat-icon-4" />,
      title: "Outreach Sequence Builder",
      description: "Generate highly personalized outbound emails, LinkedIn invitations, and cross-channel follow-ups optimized for conversion."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-slate-800" id="feat-icon-5" />,
      title: "Auto-Pilot CRM Sync",
      description: "Prevent duplicates, synchronize lead statuses, keep logs of all sequences, and feed campaigns natively."
    },
    {
      icon: <Users className="w-5 h-5 text-slate-800" id="feat-icon-6" />,
      title: "Multi-Agent Coordinator",
      description: "SDR automation orchestrated by collaborative agents (Discovery, Enrichment, Qualification, CRM, Outreach, and Analytics)."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$49",
      period: "user/month",
      description: "Ideal for solo founders and small agency teams looking to automate initial reachouts.",
      features: [
        "Up to 250 verified lead discovery scans/mo",
        "1 Saved Ideal Customer Profile",
        "Basic Data Enrichment pipeline",
        "Email template generation",
        "Manual CRM sync",
        "Standard Chat Support"
      ],
      popular: false,
      cta: "Get Started Free"
    },
    {
      name: "Scale Pro",
      price: "$149",
      period: "user/month",
      description: "Perfect for scaling business development teams seeking AI-driven outreach triggers.",
      features: [
        "Unlimited Lead Discovery scans",
        "Up to 2,500 full enrichments /mo",
        "Unlimited ICP Profiles & rules",
        "Multi-Agent pipeline visualization",
        "LinkedIn + Email automated variations",
        "Advanced CRM auto-deduplication",
        "Dedicated SDR Account Manager"
      ],
      popular: true,
      cta: "Start Scale Trial"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "tailored billing",
      description: "For commercial organizations requiring deep CRM integrations and high velocity.",
      features: [
        "Unlimited verified leads & enrichments",
        "Custom API & webhook triggers",
        "Salesforce, Hubspot, and Zoho CRM native sync",
        "Private dedicated LLM server keys",
        "SLA security protocols & audits",
        "Quarterly pipeline optimization consultations"
      ],
      popular: false,
      cta: "Contact Enterprise Sales"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 relative overflow-hidden" id="landing-page-root">
      <BackgroundMotionGraphics />
      {/* Dynamic Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 z-50 transition" id="landing-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between font-sans">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-semibold text-base shadow-sm" id="landing-logo">
              S⚡P
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-slate-900">SalesPilot</span>
              <span className="text-slate-800 font-semibold ml-1 text-[10px] bg-slate-100 border border-slate-205 px-1.5 py-0.5 rounded">AI</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition">Features</a>
            <a href="#workflow" className="hover:text-slate-900 transition">How It Works</a>
            <a href="#pricing" className="hover:text-slate-900 transition">Pricing</a>
            <a href="#faq" className="hover:text-slate-900 transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin} 
              className="text-xs font-medium text-slate-600 hover:text-slate-950 transition px-3 py-2"
              id="btn-login-header"
            >
              Sign In
            </button>
            <button 
              onClick={onStart}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              id="btn-trial-header"
            >
              Free Workspace <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-100 bg-gradient-to-b from-white via-slate-50 to-white" id="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-700 text-xs font-medium mb-6 animate-fade-in" id="hero-badge">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Autonomous B2B Prospecting Is Here
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-slate-900 tracking-tight leading-tight mb-6" id="hero-heading">
              AI-Powered Lead Discovery, <span className="text-slate-900 underline decoration-slate-200 decoration-wavy underline-offset-8">Qualification & Outreach</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-8 max-w-2xl mx-auto" id="hero-subtext">
              Find, qualify, and engage your ideal customer profiles automatically. Deploy autonomous SDR agents to search the web, crawl contacts, and design outreach campaigns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto" id="hero-ctas">
              <button 
                onClick={onStart}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3.5 rounded-xl shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 text-xs cursor-pointer"
                id="btn-hero-trial"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={onStart}
                className="w-full sm:w-auto bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 font-semibold px-8 py-3.5 rounded-xl shadow-sm transition text-xs cursor-pointer"
                id="btn-hero-demo"
              >
                Book Demo
              </button>
            </div>

            <div className="mt-6 text-xs text-slate-400 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No Credit Card Required</span>
              <span>•</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Instant Setup</span>
              <span>•</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 14-day Free Trial</span>
            </div>
          </div>

          {/* Interactive UI Mockup */}
          <div className="mt-16 border border-slate-205 rounded-2xl bg-white shadow-sm p-4 md:p-6 max-w-5xl mx-auto overflow-hidden animate-fade-in-up" id="hero-mockup">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-400 rounded-full"></span>
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
                <span className="ml-2 text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">Agent System Console</span>
              </div>
              <div className="bg-slate-100 text-[10px] uppercase tracking-wider font-semibold text-slate-500 px-2 py-0.5 rounded">
                Active Session
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Step 1: Define Rules</span>
                <p className="text-xs font-semibold text-slate-800">Ideal Customer Profile</p>
                <div className="mt-3 space-y-1.5 text-xs text-slate-500 font-mono">
                  <div>Industry: <strong className="text-slate-705 font-medium">Manufacturing</strong></div>
                  <div>Country: <strong className="text-slate-705 font-medium">Germany</strong></div>
                  <div>Employees: <strong className="text-slate-705 font-medium">200-500</strong></div>
                  <div>Tech: <strong className="text-slate-705 font-medium">SAP ERP</strong></div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block mb-1">Step 2: Autonomous crawling</span>
                <p className="text-xs font-semibold text-slate-800">Agent Pipelines</p>
                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span>🔍 Crawler Agent</span>
                    <span className="text-emerald-600 font-semibold">100% Ok</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span>⚡ Enrichment Agent</span>
                    <span className="text-emerald-600 font-semibold">100% Ok</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span>🧠 Scoring Engine</span>
                    <span className="text-slate-800 font-semibold bg-white border border-slate-200 px-1 py-0.5 rounded">Score: 95</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Step 3: Multi-channel reachout</span>
                <p className="text-xs font-semibold text-slate-800">Personalized Copilot</p>
                <div className="mt-3 bg-white p-2.5 rounded border border-slate-250 text-[11px] font-mono text-slate-505 line-clamp-3">
                  Subject: Optimizing ERP Sync at Schulz Maschinenbau... Hi Dieter, noticed you are driving automated tool improvements...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features bento grid */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Core Features</h2>
            <p className="text-3xl font-semibold text-slate-900 tracking-tight">
              An SDR System That Never Sleeps
            </p>
            <p className="text-slate-400 text-xs mt-3 leading-relaxed">
              SalesPilot AI merges multiple domain-specific agents to build a high-performance outbound mechanism, freeing up human representatives to focus purely on active consultations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="features-bento">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-205 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-300 mb-5">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-amber-500 transition mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Diagram Section */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-100" id="workflow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Integrated Multi-Agent Operations</h2>
            <p className="text-3xl font-semibold text-slate-900 leading-tight">The SalesPilot AI Assembly Pipeline</p>
            <p className="text-xs text-slate-400 mt-2">Watch your lead discovery workflow run seamlessly across 6 discrete artificial intelligences.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 relative" id="workflow-flow">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-semibold text-xs">1</div>
              <div className="font-semibold text-slate-800 text-xs mt-2">1. User Query</div>
              <p className="text-[10px] text-slate-400 mt-1">Specify parameters e.g., German Automation</p>
            </div>
            {/* Step 2 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-semibold text-xs">2</div>
              <div className="font-semibold text-slate-800 text-xs mt-2">2. Discovery Agent</div>
              <p className="text-[10px] text-slate-400 mt-1">Searches company catalogs & crawls indexes</p>
            </div>
            {/* Step 3 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-semibold text-xs">3</div>
              <div className="font-semibold text-slate-800 text-xs mt-2">3. Enrichment Agent</div>
              <p className="text-[10px] text-slate-400 mt-1">Gathers stacks, websites & stakeholders</p>
            </div>
            {/* Step 4 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-semibold text-xs">4</div>
              <div className="font-semibold text-slate-800 text-xs mt-2">4. Grading Agent</div>
              <p className="text-[10px] text-slate-400 mt-1">Grades company against defined ICP rules</p>
            </div>
            {/* Step 5 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-semibold text-xs">5</div>
              <div className="font-semibold text-slate-800 text-xs mt-2">5. CRM Sync Agent</div>
              <p className="text-[10px] text-slate-400 mt-1">Saves records & blocks duplications</p>
            </div>
            {/* Step 6 */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center font-semibold text-xs">6</div>
              <div className="font-semibold text-slate-800 text-xs mt-2">6. Outreach Agent</div>
              <p className="text-[10px] text-slate-400 mt-1">Drafts personalized follow-ups</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white" id="pricing font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pricing</h2>
            <p className="text-3xl font-semibold text-slate-900 tracking-tight">Accelerate Growth With Flexible Options</p>
            <p className="text-slate-400 mt-3 text-xs leading-relaxed">Every tier includes our basic AI capabilities. Upgrade as your prospect pipelines expand.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch font-sans" id="pricing-wrapper">
            {pricingPlans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`bg-white rounded-2xl p-8 border hover:shadow-md transition-all duration-200 flex flex-col justify-between relative ${plan.popular ? "border-slate-900 shadow-sm ring-1 ring-slate-900" : "border-slate-200"}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 text-white text-[9px] uppercase tracking-wider font-semibold rounded shadow-sm">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-slate-900 text-lg font-semibold mb-2">{plan.name}</h3>
                  <p className="text-slate-405 text-xs leading-relaxed mb-6 font-sans">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-3xl font-semibold text-slate-900">{plan.price}</span>
                    <span className="text-xs font-semibold text-slate-400 font-mono">/{plan.period}</span>
                  </div>

                  <div className="border-t border-slate-100 pt-6 mb-8 font-sans">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-4 font-sans">Included capabilities:</p>
                    <ul className="space-y-3.5 text-xs text-slate-600 font-sans">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button 
                  onClick={onStart}
                  className={`w-full font-semibold text-xs text-center py-2.5 px-4 rounded-lg transition cursor-pointer ${plan.popular ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm mb-1" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-100" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">High Praise</h2>
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">What Sales Leaders Say</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 text-amber-500 text-xs mb-3">★★★★★</div>
              <p className="text-xs text-slate-500 leading-relaxed italic mb-4 font-sans">
                "SalesPilot AI has completely cut down our manual prospecting overheads. We found 4 new manufacturing accounts in Saxony in our first week using their automated enrichment, yielding $85k in pipeline."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center font-semibold text-xs text-slate-800">
                  MR
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">Matthias Reitner</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Head of Growth, AeroSpace Partsmill</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 text-amber-500 text-xs mb-3">★★★★★</div>
              <p className="text-xs text-slate-500 leading-relaxed italic mb-4 font-sans">
                "The email copy and LinkedIn connect statements generated by the Multi-Agent outreach engine are insanely natural. Our cold reply rate spiked from 4.2% to 18.5% almost instantly!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center font-semibold text-xs text-slate-800">
                  LC
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">Laura Chen</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Founder, Saasify Studio Inc</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 text-amber-500 text-xs mb-3">★★★★★</div>
              <p className="text-xs text-slate-500 leading-relaxed italic mb-4 font-sans">
                "Integrating CRM without duplicates simplifies everything. The agent checks if the target domain website exists before saving, protecting our databases from trash data."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center font-semibold text-xs text-slate-800">
                  DK
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">Darrel K.</h4>
                  <p className="text-[10px] text-slate-400 font-mono">VP Marketing, Summit Supply Chain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-4 font-sans">
          <div className="text-center mb-16">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">FAQ</h2>
            <p className="text-3xl font-semibold text-slate-900 tracking-tight">Have Questions? We Have Answers.</p>
          </div>

          <div className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-800 text-xs flex items-center gap-2"><HelpCircle className="w-4 h-4 text-slate-400" /> How does the Agentic lead model find candidates?</h3>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-sans">
                Our Discovery Agent reads your criteria (like employee limits, location, and key sectors) and employs sophisticated Google Gemini heuristics to simulate database crawlers, extracting high-fidelity metadata.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-800 text-xs flex items-center gap-2"><HelpCircle className="w-4 h-4 text-slate-400" /> Can I connect my native CRM?</h3>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-sans">
                Yes! We maintain clean architecture layouts pre-configured for HubSpot, Salesforce, Zoho CRM, Slack, and Outreach, allowing simple integrations.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-800 text-xs flex items-center gap-2"><HelpCircle className="w-4 h-4 text-slate-400" /> What counts as a qualified lead?</h3>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-sans">
                Our Lead Qualification Agent analyzes discovered leads against parameters like matching technology stack, firm revenue thresholds, and geographic availability, outputting scores from 0 to 100.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 font-sans" id="landing-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-900 font-semibold text-xs">
                S⚡P
              </div>
              <span className="font-semibold text-sm text-white tracking-tight">SalesPilot AI</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 font-sans">
              Automating corporate SDR pipelines to bypass research hurdles and deliver premium pre-qualified enterprise leads directly into CRM databases.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#pricing font-sans" className="hover:text-white transition">Pricing Plans</a></li>
              <li><span className="opacity-50">API Reference (Coming)</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Integrations</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="opacity-50">HubSpot ERP</span></li>
              <li><span className="opacity-50">Salesforce Suite</span></li>
              <li><span className="opacity-50">Outlook Mail Sync</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="opacity-50">Privacy Policy</span></li>
              <li><span className="opacity-50">Terms of Service</span></li>
              <li><span className="opacity-50">GDPR Compliance</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-500 font-sans">
          © 2026 SalesPilot AI. All rights reserved. Crafted with premium design layouts & powered by Google Gemini models.
        </div>
      </footer>
    </div>
  );
}
