import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ReportPage from './pages/ReportPage';
import { TrendingDown, HelpCircle, ShieldCheck } from 'lucide-react';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    navigate('/');
  };

  const handleNewAuditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.location.reload();
    } else {
      navigate('/');
      window.scrollTo(0, 0);
    }
  };

  const handlePricingRulesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('how-it-works');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f19] text-slate-100">
      
      {/* Main Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="flex items-center gap-2 font-black text-xl tracking-tight text-white cursor-pointer select-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 transition-all duration-300 group-hover:bg-indigo-500 group-hover:shadow-indigo-500/30">
              <TrendingDown className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </div>
            <span className="transition-colors duration-300 group-hover:text-slate-200">
              AI Spend <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">Audit</span>
            </span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              to="/"
              onClick={handlePricingRulesClick}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors hidden sm:inline cursor-pointer"
            >
              Pricing Sync Rules
            </Link>
            <Link 
              to="/" 
              onClick={handleNewAuditClick}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all duration-300 hover:scale-[1.04] active:scale-[0.96] cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/20"
            >
              New Audit
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/report/:slug" element={<ReportPage />} />
          <Route path="*" element={
            <div className="text-center py-20 px-4">
              <h2 className="text-3xl font-black mb-2">404 - Page Not Found</h2>
              <p className="text-slate-400 mb-6">The route you requested could not be resolved.</p>
              <Link to="/" onClick={handleLogoClick} className="px-4 py-2 bg-indigo-600 rounded-lg text-xs font-bold text-white">
                Back to Calculator
              </Link>
            </div>
          } />
        </Routes>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/40 py-10 mt-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Credex 
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Designed for a production-grade full-stack AI Spend Audit solution.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Rules Traceable
            </span>
            <span>•</span>
            <span>Abuse Shielded</span>
            <span>•</span>
            <span> TypeScript based</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

