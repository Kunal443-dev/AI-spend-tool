import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToolInput, PrimaryUsage } from '../types';
import { PRICING_CATALOG } from '../config/pricing';
import { submitAudit } from '../services/api';
import { Plus, Trash2, Calculator, ShieldAlert, Sparkles, Building, Users, Briefcase } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Tech/Software');
  const [teamSize, setTeamSize] = useState<number>(5);
  const [useCase, setUseCase] = useState('General');
  const [tools, setTools] = useState<ToolInput[]>([]);
  
  const [hpName, setHpName] = useState('');


  const [selectedToolId, setSelectedToolId] = useState('chatgpt');
  const [selectedPlanId, setSelectedPlanId] = useState('plus');
  const [inputSeats, setInputSeats] = useState<number>(5);
  const [inputUsageRate, setInputUsageRate] = useState<number>(100);
  const [inputUsage, setInputUsage] = useState<PrimaryUsage>('mixed');

 
  const currentToolPricing = PRICING_CATALOG[selectedToolId];
  const plansForSelectedTool = currentToolPricing?.plans || [];

  const handleToolChange = (toolId: string) => {
    setSelectedToolId(toolId);
    const firstPlan = PRICING_CATALOG[toolId]?.plans[0]?.planId || 'free';
    setSelectedPlanId(firstPlan);
  };

  const addToolToStack = () => {

    if (tools.some(t => t.toolId === selectedToolId)) {
      setError(`Tool "${PRICING_CATALOG[selectedToolId]?.toolName}" is already in your stack. Please edit or delete it below.`);
      return;
    }
    setError(null);

    const planObj = plansForSelectedTool.find(p => p.planId === selectedPlanId);
    const costPerSeat = planObj?.monthlyPricePerSeat ?? 0;
    
    let seatsForBilling = inputSeats;
    if (planObj?.minSeats && inputSeats < planObj.minSeats) {
      seatsForBilling = planObj.minSeats;
    }
    const estimatedSpend = costPerSeat * seatsForBilling;

    const newTool: ToolInput = {
      toolId: selectedToolId,
      planId: selectedPlanId,
      seats: inputSeats,
      monthlySpend: estimatedSpend,
      primaryUsage: inputUsage,
      activeUsageRate: inputUsageRate
    };

    setTools([...tools, newTool]);
  };

  const removeTool = (toolId: string) => {
    setTools(tools.filter(t => t.toolId !== toolId));
  };

  const updateToolSpend = (toolId: string, value: number) => {
    setTools(tools.map(t => {
      if (t.toolId === toolId) {
        return { ...t, monthlySpend: value };
      }
      return t;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tools.length === 0) {
      setError('Please add at least one AI tool to analyze.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await submitAudit({
        companyName,
        industry,
        teamSize,
        useCase,
        tools,
        hp_name: hpName 
      });
      navigate(`/report/${response.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit audit. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 bg-gradient-radial min-h-screen">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-4 tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Product Hunt Launch Candidate
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
          AI Spend <span className="text-gradient">Audit</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Instantly audit your team's AI tooling stack. Discover seat leaks, redundant duplicate subscriptions, and benchmark your budget against industry standard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
       
        <form onSubmit={handleSubmit} className="lg:col-span-7 glass-panel p-8 rounded-2xl space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            Audit Parameters
          </h2>

         
          <div className="hidden" aria-hidden="true">
            <label htmlFor="hp_name">Full Name</label>
            <input
              type="text"
              id="hp_name"
              value={hpName}
              onChange={(e) => setHpName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-400" />
                Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

           
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Tech/Software">Tech / Software Development</option>
                <option value="Marketing/Media">Marketing / Digital Agency</option>
                <option value="Finance/Banking">Finance / Accounting</option>
                <option value="Consulting">Consulting</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Other">Other Sector</option>
              </select>
            </div>

            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                Team Size (AI Users)
              </label>
              <input
                type="number"
                required
                min="1"
                value={teamSize}
                onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

        
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Primary Use Case
              </label>
              <select
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="General">General/Mixed Assistant Work</option>
                <option value="Engineering">Engineering / Software Dev</option>
                <option value="Content Creation">Writing / Marketing Content</option>
                <option value="Research">Research & Analysis</option>
              </select>
            </div>
          </div>

          <hr className="border-slate-800" />

         
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Your Tool Stack ({tools.length})</h3>
            
            {tools.length === 0 ? (
              <div className="text-center py-8 rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-slate-500 text-sm">
                No tools added yet. Configure and add tools using the builder on the right.
              </div>
            ) : (
              <div className="space-y-3">
                {tools.map(tool => {
                  const pricing = PRICING_CATALOG[tool.toolId];
                  const plan = pricing?.plans.find(p => p.planId === tool.planId);
                  
                  return (
                    <div key={tool.toolId} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800 gap-4">
                      <div>
                        <h4 className="font-bold text-white">{pricing?.toolName}</h4>
                        <p className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">
                          {plan?.planName} Plan • {tool.seats} Seat{tool.seats > 1 ? 's' : ''} • {tool.primaryUsage}
                        </p>
                        {tool.activeUsageRate !== undefined && (
                          <p className="text-xs text-slate-400 mt-1">Active Usage: {tool.activeUsageRate}%</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                            Monthly Cost ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={tool.monthlySpend}
                            onChange={(e) => updateToolSpend(tool.toolId, parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-sm text-right text-emerald-400 font-bold focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTool(tool.toolId)}
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors self-end md:self-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || tools.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                Run AI Spend Audit
              </>
            )}
          </button>
        </form>

        {/* Builder Panel Column */}
        <div className="lg:col-span-5 glass-panel p-8 rounded-2xl space-y-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Add Tool to Stack
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Configure each tool subscription and usage context. Added tools appear in the list on the left for audit submission.
          </p>

          <div className="space-y-4">
           
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Select Tool</label>
              <select
                value={selectedToolId}
                onChange={(e) => handleToolChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              >
                {Object.keys(PRICING_CATALOG).map(key => (
                  <option key={key} value={key}>{PRICING_CATALOG[key].toolName}</option>
                ))}
              </select>
            </div>

           
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Select Plan</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              >
                {plansForSelectedTool.map(plan => (
                  <option key={plan.planId} value={plan.planId}>
                    {plan.planName} (${plan.monthlyPricePerSeat}/seat/mo {plan.minSeats ? `• Min ${plan.minSeats} seats` : ''})
                  </option>
                ))}
              </select>
            </div>

            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Seats / Licenses</label>
              <input
                type="number"
                min="1"
                value={inputSeats}
                onChange={(e) => setInputSeats(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

           
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Primary Usage Classification</label>
              <select
                value={inputUsage}
                onChange={(e) => setInputUsage(e.target.value as PrimaryUsage)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="coding">Coding & Software Development</option>
                <option value="writing">Content Writing & Copywriting</option>
                <option value="research">Research & Business Analysis</option>
                <option value="analytics">Data Science & Analytics</option>
                <option value="mixed">Mixed/General Purpose</option>
              </select>
            </div>

           
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-300 mb-2">
                <span>Active Usage Rate</span>
                <span className="text-indigo-400 font-bold">{inputUsageRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={inputUsageRate}
                onChange={(e) => setInputUsageRate(parseInt(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 mt-1 block leading-relaxed">
                Estimate the percentage of purchased seats that actively run queries every week.
              </span>
            </div>

            <button
              type="button"
              onClick={addToolToStack}
              className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold py-3 rounded-xl border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" />
              Add Tool to Stack
            </button>
          </div>
        </div>
      </div>

   
      <div id="how-it-works" className="mt-20 border-t border-slate-900 pt-16 space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white">Pricing Sync Rules</h2>
          <p className="text-sm text-slate-400 mt-2">
            Our optimization rules are supported by live subscription catalogs compiled from official AI vendor plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Assistant Overprovisioning</span>
            <h3 className="font-bold text-white text-lg">ChatGPT & Claude</h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>• <strong>ChatGPT Team:</strong> $30/mo (Requires min 2 seats)</li>
              <li>• <strong>Claude Team:</strong> $30/mo (Requires min 5 seats)</li>
              <li className="pt-2 text-indigo-400/90 font-medium">
                → Rule: Recommends individual Pro accounts ($20/mo) for smaller team configurations.
              </li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Developer Overlaps</span>
            <h3 className="font-bold text-white text-lg">Cursor & Copilot</h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>• <strong>Cursor Pro:</strong> $20/seat/mo</li>
              <li>• <strong>GitHub Copilot:</strong> $10/seat/mo</li>
              <li className="pt-2 text-indigo-400/90 font-medium">
                → Rule: If developers run Cursor Pro, a separate active Copilot license is flagged for removal.
              </li>
            </ul>
          </div>
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Abuse & Usage</span>
            <h3 className="font-bold text-white text-lg">Low Usage & API</h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>• <strong>Active Usage Slider:</strong> 0% - 100%</li>
              <li>• <strong>API Keys:</strong> Pay-as-you-go</li>
              <li className="pt-2 text-indigo-400/90 font-medium">
                → Rule: Teams with less than 20% active tool engagement are advised to switch to keys.
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
