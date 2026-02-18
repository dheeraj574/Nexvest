
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Navigate, Link, useParams, useNavigate } from 'react-router-dom';
import { AdvisorResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { getPlanById } from '../services/storageService';
import { calculateGrowth, getRecommendedPlatforms } from '../services/riskEngine';
import AdvisorChat from '../components/AdvisorChat';
import { useAuth } from '../context/AuthContext';
import StockTicker from '../components/StockTicker';
import NewsFeed from '../components/NewsFeed';
import InfoTooltip from '../components/InfoTooltip';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b']; // Indigo, Emerald, Amber

const DashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [result, setResult] = useState<AdvisorResult | null>(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [portfolioOption, setPortfolioOption] = useState<'etf' | 'stocks'>('etf');
  const [activeIndex, setActiveIndex] = useState(0);
  const [simMonthly, setSimMonthly] = useState(0);
  const [simYears, setSimYears] = useState(0);

  useEffect(() => {
    if (!result && id) {
      const storedPlan = getPlanById(id);
      if (storedPlan) {
        setResult(storedPlan);
        setSimMonthly(storedPlan.profile.monthlySavingsTarget);
        setSimYears(storedPlan.profile.investmentHorizonYears);
      } else {
        navigate('/advisor');
      }
      setLoading(false);
    } else if (!result && !id) {
        navigate('/advisor');
    } else if (result) {
        setSimMonthly(result.profile.monthlySavingsTarget);
        setSimYears(result.profile.investmentHorizonYears);
    }
  }, [id, result, navigate]);

  const simulatedData = useMemo(() => {
    if (!result) return null;
    const tempProfile = {
      ...result.profile,
      monthlySavingsTarget: simMonthly,
      investmentHorizonYears: simYears
    };
    return calculateGrowth(tempProfile, result.allocation);
  }, [result, simMonthly, simYears]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!result) return <Navigate to="/advisor" />;

  const currency = result.profile?.currency || '$';
  const financialGoal = result.profile?.financialGoal || 'Wealth Creation';
  const inflationAdjusted = simulatedData?.inflationAdjustedCorpus || result.inflationAdjustedCorpus;
  const projectedCorpus = simulatedData?.projected || result.projectedCorpus;
  const totalInvested = simulatedData?.totalInvested || result.totalInvested;
  const platforms = getRecommendedPlatforms(currency);

  const pieData = [
    { name: 'Equity', value: result.allocation.equity },
    { name: 'Debt', value: result.allocation.debt },
    { name: 'Gold', value: result.allocation.gold },
  ];

  const handleDownloadText = () => {
    const currentList = result.equityBreakdown ? result.equityBreakdown[portfolioOption] : [];
    let text = `INVESTMENT PLAN SUMMARY\n=======================\n`;
    text += `Goal: ${financialGoal}\nInvestor Type: ${result.investorType}\nTarget Wealth: ${currency}${projectedCorpus.toLocaleString()}\n\nAI INSIGHTS:\n${result.aiExplanation}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Plan_${financialGoal}.txt`;
    link.click();
  };

  const renderAIContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•')) {
        const content = trimmed.substring(1);
        const parts = content.split('**');
        return (
          <li key={index} className="flex gap-2 mb-2 text-indigo-50">
            <span className="mt-2 w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0"></span>
            <span className="leading-relaxed">
              {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part)}
            </span>
          </li>
        );
      }
      return <p key={index} className="mb-2 text-indigo-100">{trimmed}</p>;
    });
  };

  const chartTextColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto relative animate-fade-in">
      <AdvisorChat context={result} />
      <StockTicker />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Your Financial Blueprint</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2">
            <span>Goal: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{financialGoal}</span></span>
            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
            <span>{new Date(result.date).toLocaleDateString()}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleDownloadText} className="bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"><i className="fa-solid fa-file-lines"></i> Summary</button>
          <Link to="/advisor" state={{ profile: result.profile, isEdit: true }} className="bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-medium shadow-sm"><i className="fa-solid fa-pen-to-square mr-2"></i> Edit</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print-break-inside-avoid">
        <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 print-clean">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300"><i className="fa-solid fa-user-tag"></i></div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profile</p>
          </div>
          <h3 className={`text-2xl font-bold mt-2 ${result.investorType === 'Aggressive' ? 'text-rose-600 dark:text-rose-400' : result.investorType === 'Moderate' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{result.investorType}</h3>
          <div className="mt-6">
             <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-2 font-semibold"><span>Risk Score</span><span>{result.riskScore}/100</span></div>
             <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-100 dark:border-slate-600">
                <div className={`h-full rounded-full transition-all duration-1000 ${result.investorType === 'Aggressive' ? 'bg-rose-500' : result.investorType === 'Moderate' ? 'bg-indigo-500' : 'bg-emerald-500'}`} style={{ width: `${result.riskScore}%` }}></div>
             </div>
          </div>
        </div>
        
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/60 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 print-clean">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Invested</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{currency}{totalInvested.toLocaleString()}</h3>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-2xl shadow-xl text-white print-clean">
            <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">Projected Value</p>
            <h3 className="text-3xl font-bold text-white">{currency}{projectedCorpus.toLocaleString()}</h3>
          </div>
          <div className="bg-white/60 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 print-clean">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Real Value (Inflation Adj)</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{currency}{inflationAdjusted.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl print-clean print-break-inside-avoid">
        <div className="absolute top-4 right-6 flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Grounded in 35-yr Market History</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 border-r border-white/10 pr-6 flex flex-col justify-center">
                 <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20"><i className="fa-solid fa-wand-magic-sparkles text-yellow-300"></i></div>
                     <h2 className="text-xl font-bold">AI Stress-Test Analysis</h2>
                 </div>
                 <p className="text-indigo-200 text-sm">Our Gemini model has cross-referenced your profile with historical cycles to ensure strategy durability.</p>
            </div>
            <div className="md:w-2/3">
                 <ul className="space-y-1">
                    {result.aiExplanation ? renderAIContent(result.aiExplanation) : <p className="text-indigo-200">Analysis pending...</p>}
                 </ul>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px] flex flex-col print-clean overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Wealth Projection</h3>
            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">{simYears} Year View</span>
          </div>
          <div className="flex-grow w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulatedData?.chart || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} tickFormatter={(value) => `${currency}${value/1000}k`} />
                <RechartsTooltip formatter={(value: number) => [`${currency}${value.toLocaleString()}`, '']} contentStyle={{ borderRadius: '12px', border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg }} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="estimated" name="Projected Strategy" stroke="#4f46e5" strokeWidth={3} fillOpacity={0.1} fill="#4f46e5" />
                <Area type="monotone" dataKey="savings" name="Bank Savings (3.5%)" stroke="#10b981" strokeWidth={2} fill="transparent" strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 rounded-xl p-6 no-print">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Monthly Investment: <span className="text-indigo-600">{currency}{simMonthly.toLocaleString()}</span></label>
                <input type="range" min="100" max={100000} step="100" value={simMonthly} onChange={(e) => setSimMonthly(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Time Horizon: <span className="text-indigo-600">{simYears} Years</span></label>
                <input type="range" min="0.5" max="50" step="0.5" value={simYears} onChange={(e) => setSimYears(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[400px] flex flex-col print-clean">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Asset Allocation</h3>
                <div className="flex-grow w-full h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none" onMouseEnter={(_, index) => setActiveIndex(index)}>
                                {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block text-4xl font-bold text-slate-900 dark:text-white">{pieData[activeIndex].value}%</span>
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{pieData[activeIndex].name}</span>
                        </div>
                    </div>
                </div>
            </div>
            <NewsFeed />
        </div>
      </div>
      
       {result.equityBreakdown && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col print-clean relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recommended Portfolio</h3>
                        <p className="text-xs text-slate-500">Historical resilient assets</p>
                    </div>
                </div>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-6 no-print max-w-md">
                  <button onClick={() => setPortfolioOption('etf')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${portfolioOption === 'etf' ? 'bg-white dark:bg-slate-600 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Option 1: ETFs</button>
                  <button onClick={() => setPortfolioOption('stocks')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${portfolioOption === 'stocks' ? 'bg-white dark:bg-slate-600 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Option 2: Stocks</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    {(result.equityBreakdown[portfolioOption] || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.symbol}</span>
                                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full">{item.sector}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-indigo-600 dark:text-indigo-400">{currency}{item.amount.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">{item.allocationPercent}% weight</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print-break-inside-avoid relative z-20">
        <div className="md:col-span-3 mb-2"><h3 className="text-xl font-bold text-slate-900 dark:text-white">Execution Platforms</h3></div>
        {platforms.map((platform, idx) => (
           <a key={idx} href={platform.url} target="_blank" rel="noreferrer" className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow-lg transition-all group flex flex-col justify-between print-clean">
             <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl ${platform.color} text-white flex items-center justify-center text-xl shadow-md`}><i className={`fa-solid ${platform.icon}`}></i></div>
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 rounded-md">{platform.badge}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{platform.name}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">{platform.description}</p>
             </div>
             <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50"><span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Visit Platform</span></div>
           </a>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
