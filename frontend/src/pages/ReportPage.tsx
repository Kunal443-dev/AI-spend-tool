import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicAuditReport } from '../types';
import { fetchAuditReport, submitLead } from '../services/api';
import { PRICING_CATALOG } from '../config/pricing';
import { 
  TrendingDown, Check, Copy, Printer, 
  ArrowLeft, Mail, Building, User, Lock, FileText, 
  ChevronRight, BadgeInfo, Camera
} from 'lucide-react';

export default function ReportPage() {
  const { slug } = useParams<{ slug: string }>();
  const [report, setReport] = useState<PublicAuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadConsent, setLeadConsent] = useState(true);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadHp, setLeadHp] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [screenshotMode, setScreenshotMode] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    setLoading(true);
    fetchAuditReport(slug)
      .then(res => {
        setReport(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to retrieve audit report.');
        setLoading(false);
      });
  }, [slug]);

  const copyShareLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!leadEmail.trim() || !emailRegex.test(leadEmail)) {
      setLeadError('Please enter a valid email address.');
      return;
    }
    if (!leadName.trim() || !leadCompany.trim()) {
      setLeadError('Please fill in all required fields.');
      return;
    }

    setLeadLoading(true);
    setLeadError(null);

    try {
      const res = await submitLead({
        auditSlug: slug,
        email: leadEmail,
        name: leadName,
        company: leadCompany,
        consentToContact: leadConsent,
        hp_name: leadHp 
      });
      if (res.previewUrl) {
        setEmailPreviewUrl(res.previewUrl);
      }
      setLeadSubmitted(true);
      setLeadLoading(false);
    } catch (err: any) {
      const errMessage = err.response?.data?.error;
      const displayMsg = typeof errMessage === 'object'
        ? errMessage.message || JSON.stringify(errMessage)
        : errMessage || err.message || 'Failed to send report. Please check inputs.';
      setLeadError(displayMsg);
      setLeadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <span className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></span>
        <p className="text-slate-400 text-sm">Analyzing subscription models and compiling audit...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-block mb-4">
          <BadgeInfo className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
        <p className="text-slate-400 mb-6">{error || 'This audit report may have been deleted or never existed.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Go back to calculator
        </Link>
      </div>
    );
  }

  const savingsPercent = report.results.totalCurrentMonthlySpend > 0
    ? Math.round((report.results.totalMonthlySavings / report.results.totalCurrentMonthlySpend) * 100)
    : 0;

  return (
    <div className={`max-w-5xl mx-auto px-4 py-8 space-y-8 ${screenshotMode ? 'screenshot-view' : ''}`}>
      {!screenshotMode && (
        <div className="flex justify-between items-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Editor
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScreenshotMode(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
              title="Hide all interactive forms and headers for clean screenshots"
            >
              <Camera className="w-4 h-4 text-indigo-400" />
              Screenshot Mode
            </button>
            <button
              onClick={copyShareLink}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Copied URL!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-indigo-400" />
                  Copy Share Link
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {screenshotMode && (
        <div className="p-3 bg-indigo-600 rounded-xl text-white text-xs flex justify-between items-center shadow-lg">
          <span><strong>Screenshot Mode Active:</strong> All inputs, headers, and lead captures are hidden. Take your screenshot now.</span>
          <button
            onClick={() => setScreenshotMode(false)}
            className="px-2.5 py-1 bg-white text-indigo-600 rounded font-bold hover:bg-slate-100 text-[10px]"
          >
            Exit
          </button>
        </div>
      )}

      <div className="text-center py-6">
        <span className="text-[10px] tracking-widest text-indigo-400 font-bold uppercase">
          AI Spend Audit report
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">
          Optimization Strategy Report
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Run date: {new Date(report.createdAt).toLocaleDateString()} • Report ID: {report.slug}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-indigo-500 flex flex-col justify-between">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Current Spend</span>
          <div>
            <h2 className="text-3xl font-extrabold text-white mt-2">${report.results.totalCurrentMonthlySpend}<span className="text-xs text-slate-400">/mo</span></h2>
            <p className="text-xs text-slate-400 mt-1">Across all subscriptions</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-emerald-500 flex flex-col justify-between">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Optimized Spend</span>
          <div>
            <h2 className="text-3xl font-extrabold text-emerald-400 mt-2">${report.results.totalOptimizedMonthlySpend}<span className="text-xs text-slate-400">/mo</span></h2>
            <p className="text-xs text-slate-400 mt-1">Target subscription rate</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900/60 to-indigo-950/60 p-6 rounded-2xl border border-indigo-500/20 border-l-4 border-indigo-400 flex flex-col justify-between shadow-lg shadow-indigo-500/5">
          <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            Estimated Savings
          </span>
          <div>
            <h2 className="text-3xl font-extrabold text-white mt-2">${report.results.totalMonthlySavings}<span className="text-xs text-indigo-300">/mo</span></h2>
            <p className="text-sm text-indigo-300/80 font-bold mt-1">
              Save ${report.results.totalYearlySavings}/year ({savingsPercent}% cut)
            </p>
          </div>
        </div>
      </div>

      
      <div className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
          AI CFO Narrative Summary
        </h3>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed italic">
          "{report.results.aiSummary}"
        </p>
      </div>
\
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-4">Spend Benchmarking</h3>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {report.results.benchmark.comparisonMessage}
        </p>

       
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
              <span>Your Team's Spend per User</span>
              <span className="text-indigo-400 font-bold">${report.results.benchmark.spendPerDev}/dev/mo</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3.5 border border-slate-800">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (report.results.benchmark.spendPerDev / Math.max(1, report.results.benchmark.spendPerDev, report.results.benchmark.industryAveragePerDev)) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
              <span>Typical Industry Average</span>
              <span className="text-slate-400 font-bold">${report.results.benchmark.industryAveragePerDev}/dev/mo</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3.5 border border-slate-800">
              <div 
                className="bg-slate-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (report.results.benchmark.industryAveragePerDev / Math.max(1, report.results.benchmark.spendPerDev, report.results.benchmark.industryAveragePerDev)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          Recommended Optimizations ({report.results.recommendations.length})
        </h3>
        
        {report.results.recommendations.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400 text-sm rounded-2xl">
            No overspending detected. Your stack is fully optimized! Good job.
          </div>
        ) : (
          <div className="space-y-4">
            {report.results.recommendations.map((rec, idx) => {
              const tool = PRICING_CATALOG[rec.toolId];
              
              
              let severityColor = 'bg-slate-800 text-slate-400';
              if (rec.severity === 'high') severityColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
              if (rec.severity === 'medium') severityColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
              if (rec.severity === 'low') severityColor = 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25';

              
              const typeLabels: Record<string, string> = {
                downgrade_plan: 'Plan Downgrade',
                consolidate_tools: 'Tool Consolidation',
                optimize_seats: 'Seat Optimization',
                api_switch: 'API Key Switch',
                inactive_seats: 'Remove Inactive Seats'
              };

            
              const displayTitle = rec.confidence < 0.8 
                ? `Potential Opportunity: ${rec.title}`
                : rec.title;

              return (
                <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-6 transition-all duration-200 border-l-4 hover:border-l-indigo-400">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                        {tool?.toolName || rec.toolId.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                        {typeLabels[rec.type] || rec.type}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${severityColor}`}>
                        {rec.severity.toUpperCase()} Priority
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Confidence: {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white">{displayTitle}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{rec.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>Current: <strong className="text-slate-200">${rec.currentCost}/mo</strong></span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      <span>Optimized: <strong className="text-slate-200">${rec.optimizedCost}/mo</strong></span>
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-between items-end bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 md:w-44 text-right">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wide">Monthly Savings</span>
                    <div className="mt-1">
                      <div className="text-xl font-extrabold text-emerald-400">+${rec.savings}<span className="text-[10px] text-slate-400">/mo</span></div>
                      <div className="text-xs text-emerald-400/80 font-semibold mt-0.5">+${rec.savings * 12}/yr</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

     
      {!screenshotMode && (
        <div id="export-section" className="glass-panel p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#101726]/80 to-[#0e121d]/80 border border-slate-800">
          {!leadSubmitted ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-1 text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-md">
                  <Lock className="w-3.5 h-3.5" />
                  Unlocked Export Actions
                </div>
                <h3 className="text-2xl font-bold text-white">Export Audit Report</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Enter your email to download a clean spreadsheet audit sheet, shareable custom slide decks, and receive automated pricing update alerts whenever tools adjust their rates.
                </p>
              </div>

              <form onSubmit={handleLeadSubmit} className="lg:col-span-5 space-y-3 bg-slate-950/40 p-5 rounded-xl border border-slate-900">
                
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="lead_hp">Phone Number</label>
                  <input
                    type="text"
                    id="lead_hp"
                    disabled={leadLoading}
                    value={leadHp}
                    onChange={(e) => setLeadHp(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    disabled={leadLoading}
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    disabled={leadLoading}
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>

                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    disabled={leadLoading}
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    placeholder="Company Name"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    disabled={leadLoading}
                    checked={leadConsent}
                    onChange={(e) => setLeadConsent(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 accent-indigo-500 mt-0.5 disabled:opacity-50"
                  />
                  <label htmlFor="consent" className="text-[10px] text-slate-500 leading-tight">
                    I agree to receive AI spend optimization alerts and promotional content.
                  </label>
                </div>

                {leadError && (
                  <p className="text-xs text-rose-400 font-semibold">{leadError}</p>
                )}

                <button
                  type="submit"
                  disabled={leadLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold py-3 rounded-lg mt-2 flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors duration-200 cursor-pointer"
                >
                  {leadLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Sending Report...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Send Report
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto animate-bounce">
                <Check className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-emerald-400">Report sent successfully.</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                  We have compiled and dispatched your AI Spend Audit Report to <strong>{leadEmail}</strong>.
                </p>
              </div>

              {emailPreviewUrl && (
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl max-w-md mx-auto text-center space-y-2">
                  <p className="text-xs text-slate-300">
                    <strong>Development Mode:</strong> Since you are running in development/test environment, the email was caught by Ethereal SMTP. Click the link below to preview the HTML email!
                  </p>
                  <a
                    href={emailPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors duration-200"
                  >
                    <Mail className="w-4 h-4" />
                    Preview Sent Email
                  </a>
                </div>
              )}

              <div className="flex justify-center gap-3 pt-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold hover:text-white text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-indigo-400" />
                  Print PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
