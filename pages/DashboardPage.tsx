import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Navigate, Link, useParams, useNavigate } from 'react-router-dom';
import { AdvisorResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, XAxis, YAxis, CartesianGrid, AreaChart, Area, Sector } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { generateAIExplanation } from '../services/geminiService';
import { getPlanById, saveHistory } from '../services/storageService';
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

  // New State for Portfolio Option
  const [portfolioOption, setPortfolioOption] = useState<'etf' | 'stocks'>('etf');

  // Interactive Chart State
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
    const calculation = calculateGrowth(tempProfile, result.allocation);
    return calculation;
  }, [result, simMonthly, simYears]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!result) {
    return <Navigate to="/advisor" />;
  }

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

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleDownloadText = () => {
    const currentList = result.equityBreakdown ? result.equityBreakdown[portfolioOption] : [];
    
    if (!result) return; // safety check

    let text = `INVESTMENT PLAN SUMMARY\n`;
    text += `=======================\n\n`;
    text += `Date: ${new Date(result.date).toLocaleDateString()}\n`;
    text += `Goal: ${financialGoal}\n`;
    text += `Investor Type: ${result.investorType} (Score: ${result.riskScore})\n`;
    text += `Target Wealth: ${currency}${projectedCorpus.toLocaleString()} (${result.profile.investmentHorizonYears} Years)\n\n`;
    
    text += `ASSET ALLOCATION\n`;
    text += `----------------\n`;
    text += `Equity: ${result.allocation.equity}%\n`;
    text += `Debt:   ${result.allocation.debt}%\n`;
    text += `Gold:   ${result.allocation.gold}%\n\n`;
    
    text += `RECOMMENDED PORTFOLIO (${portfolioOption === 'etf' ? 'Option 1: ETF/Passive' : 'Option 2: Direct Stocks'})\n`;
    text += `--------------------------------------------------------\n`;
    text += `Symbol       | Allocation | Amount\n`;
    text += `--------------------------------------------------------\n`;
    if (currentList && currentList.length > 0) {
      currentList.forEach(item => {
        text += `${item.symbol.padEnd(12)} | ${item.allocationPercent}%        | ${currency}${item.amount.toLocaleString()}\n`;
        text += `(${item.name} - ${item.sector})\n`;
        text += `--------------------------------------------------------\n`;
      });
    } else {
        text += "No specific stock data available in this plan.\n";
    }

    text += `\nRECOMMENDED PLATFORMS\n`;
    text += `--------------------\n`;
    platforms.forEach(p => {
      text += `• ${p.name}: ${p.description}\n`;
    });
    
    text += `\nAI INSIGHTS\n`;
    text += `-----------\n`;
    text += result.aiExplanation || "No insights available.";

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Plan_Summary_${financialGoal.replace(/\s/g,'_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      if (trimmed === '') return <div key={index} className="h-2"></div>;
      return <p key={index} className="mb-2 text-indigo-100">{trimmed}</p>;
    });
  };

  const chartTextColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';

  const currentEquityList = result.equityBreakdown ? result.equityBreakdown[portfolioOption] : [];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto relative animate-fade-in">
      <AdvisorChat context={result} />

      {/* REAL-TIME TICKER */}
      <StockTicker />

      {/* SCREEN HEADER */}
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
          <button 
            onClick={handleDownloadText}
            className="bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-file-lines text-slate-500 dark:text-slate-400"></i> Summary
          </button>
          
          <Link 
            to="/advisor" 
            state={{ profile: result.profile, isEdit: true }}
            className="bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm"
          >
            <i className="fa-solid fa-pen-to-square mr-2"></i> Edit
          </Link>
          <Link 
            to="/advisor" 
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-plus mr-2"></i> New
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print-break-inside-avoid">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-colors print-clean hover:border-indigo-200 dark:hover:border-indigo-800/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <i className="fa-solid fa-user-tag"></i>
              </div>
              <div className="flex items-center">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profile</p>
                <InfoTooltip text="Your calculated financial personality based on age, income, and goals." />
              </div>
            </div>
            <h3 className={`text-2xl font-bold mt-2 ${
              result.investorType === 'Aggressive' ? 'text-rose-600 dark:text-rose-400' : 
              result.investorType === 'Moderate' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {result.investorType}
            </h3>
          </div>
          <div className="mt-6">
             <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-2 font-semibold">
               <span>Risk Score</span>
               <span>{result.riskScore}/100</span>
             </div>
             <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-100 dark:border-slate-600">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${result.investorType === 'Aggressive' ? 'bg-rose-500' : result.investorType === 'Moderate' ? 'bg-indigo-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${result.riskScore}%` }}
                ></div>
             </div>
          </div>
        </div>
        
        {/* Data Cards */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/60 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors print-clean hover:shadow-md">
            <div className="flex items-center mb-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Invested</p>
              <InfoTooltip text="The total principal amount you will have contributed over the years." />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{currency}{totalInvested.toLocaleString()}</h3>
            <p className="text-sm text-slate-500 mt-1">Principal</p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none text-white print-clean">
            <div className="flex items-center mb-2">
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Projected Value</p>
              <InfoTooltip text="The estimated total value of your portfolio after compound interest." />
            </div>
            <h3 className="text-3xl font-bold text-white">{currency}{projectedCorpus.toLocaleString()}</h3>
            <p className="text-sm text-indigo-100 mt-1 flex items-center gap-1">
              <i className="fa-solid fa-arrow-trend-up"></i>
              ~{Math.round(((projectedCorpus - totalInvested)/totalInvested)*100)}% Growth
            </p>
          </div>

          <div className="bg-white/60 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors print-clean hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Real Value</p>
              <InfoTooltip text="The value of your projected wealth adjusted for inflation (purchasing power in today's money)." />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{currency}{inflationAdjusted.toLocaleString()}</h3>
            <p className="text-sm text-slate-500 mt-1">Purchasing Power</p>
          </div>
        </div>
      </div>

      {/* AI ANALYSIS (Short Report) */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-3xl p-8 md:p-8 text-white relative overflow-hidden shadow-2xl transition-all print-clean print-break-inside-avoid">
        <div className="relative z-10 flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 border-r border-white/10 pr-6 flex flex-col justify-center">
                 <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                        <i className="fa-solid fa-wand-magic-sparkles text-yellow-300"></i>
                     </div>
                     <h2 className="text-xl font-bold">Gemini Micro-Report</h2>
                 </div>
                 <p className="text-indigo-200 text-sm">A condensed 3-point summary of your strategy.</p>
            </div>
            <div className="md:w-2/3">
                 <ul className="space-y-1">
                    {result.aiExplanation ? renderAIContent(result.aiExplanation) : <p className="text-indigo-200">Analysis pending...</p>}
                 </ul>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: CHART */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px] flex flex-col transition-colors print-clean print-break-inside-avoid overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <i className="fa-solid fa-chart-area"></i>
              </div>
              <div className="flex items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Wealth Projection</h3>
                <InfoTooltip text="A visual representation of how your money could grow over time compared to a standard savings account." />
              </div>
            </div>
            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
              {simYears} Year View
            </span>
          </div>

          <div className="flex-grow w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulatedData?.chart || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEstimated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: chartTextColor, fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: chartTextColor, fontSize: 12, fontWeight: 500 }}
                   tickFormatter={(value) => `${currency}${value/1000}k`}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [`${currency}${value.toLocaleString()}`, '']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: `1px solid ${tooltipBorder}`, 
                    backgroundColor: tooltipBg,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                    color: chartTextColor, 
                    fontWeight: 'bold' 
                  }}
                  itemStyle={{ color: chartTextColor }}
                />
                <Legend iconType="circle" wrapperStyle={{ color: chartTextColor, fontWeight: 500, paddingTop: '20px' }} />
                
                <Area 
                  type="monotone" 
                  dataKey="estimated" 
                  name="Projected Strategy" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorEstimated)" 
                  animationDuration={800}
                />
                <Area 
                  type="monotone" 
                  dataKey="savings" 
                  name="Bank Savings (3.5%)" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fill="transparent" 
                  strokeDasharray="3 3" 
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* CONTROL PANEL */}
          <div className="mt-8 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 rounded-xl p-6 no-print">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <i className="fa-solid fa-sliders"></i> Interactive Simulation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between mb-3">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Monthly Investment</label>
                   <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-sm">{currency}{simMonthly.toLocaleString()}</span>
                </div>
                <input 
                  type="range" min="100" max={100000} step="100"
                  value={simMonthly} onChange={(e) => setSimMonthly(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                   <span>{currency}100</span>
                   <span>{currency}100k</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-3">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Time Horizon</label>
                   <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-sm">{simYears} Years</span>
                </div>
                <input 
                  type="range" min="0.5" max="50" step="0.5"
                  value={simYears} onChange={(e) => setSimYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                   <span>6 Months</span>
                   <span>50 Years</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COL: ALLOCATION & NEWS */}
        <div className="flex flex-col gap-8">
            {/* ALLOCATION CHART */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[400px] flex flex-col transition-colors print-clean print-break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <i className="fa-solid fa-chart-pie"></i>
                </div>
                <div className="flex items-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Asset Allocation</h3>
                  <InfoTooltip text="How your money is divided among different types of investments to balance risk and reward." />
                </div>
            </div>
            <div className="flex-grow w-full h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    onMouseEnter={onPieEnter}
                    >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <RechartsTooltip 
                    contentStyle={{ 
                        borderRadius: '8px', 
                        border: `1px solid ${tooltipBorder}`, 
                        backgroundColor: tooltipBg,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                        color: chartTextColor, 
                        fontWeight: 'bold' 
                    }}
                    />
                </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <span className="block text-4xl font-bold text-slate-900 dark:text-white transition-all duration-300">
                      {pieData[activeIndex].value}%
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider transition-all duration-300">
                      {pieData[activeIndex].name}
                    </span>
                </div>
                </div>
            </div>
            
            <div className="space-y-3 mt-6">
                <div 
                  className={`flex justify-between items-center p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 transition-all cursor-default ${activeIndex === 0 ? 'ring-2 ring-indigo-500 border-transparent' : ''}`}
                  onMouseEnter={() => setActiveIndex(0)}
                >
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Equity (Stocks)</span>
                </div>
                <span className="font-bold text-indigo-700 dark:text-indigo-400">{result.allocation.equity}%</span>
                </div>
                <div 
                  className={`flex justify-between items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 transition-all cursor-default ${activeIndex === 1 ? 'ring-2 ring-emerald-500 border-transparent' : ''}`}
                  onMouseEnter={() => setActiveIndex(1)}
                >
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Debt (Bonds/FDs)</span>
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{result.allocation.debt}%</span>
                </div>
                <div 
                  className={`flex justify-between items-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 transition-all cursor-default ${activeIndex === 2 ? 'ring-2 ring-amber-500 border-transparent' : ''}`}
                  onMouseEnter={() => setActiveIndex(2)}
                >
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Gold</span>
                </div>
                <span className="font-bold text-amber-700 dark:text-amber-400">{result.allocation.gold}%</span>
                </div>
            </div>
            </div>

            {/* LIVE NEWS FEED (Replaces/Below Chart) */}
            <NewsFeed />
        </div>
      </div>
      
       {/* EQUITY BREAKDOWN CARD (Full Width below) */}
       {result.equityBreakdown && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col transition-colors print-clean print-break-inside-avoid relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <i className="fa-solid fa-list-check"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recommended Portfolio</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Select an option</p>
                        </div>
                    </div>
                </div>
                
                {/* TABS - Hidden in Print (only show selected) */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-6 no-print max-w-md">
                  <button 
                    type="button"
                    onClick={() => setPortfolioOption('etf')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${portfolioOption === 'etf' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    Option 1: ETFs (Stable)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPortfolioOption('stocks')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${portfolioOption === 'stocks' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    Option 2: Stocks (Active)
                  </button>
                </div>

                {/* Visible in print to show which option is selected */}
                <div className="only-print mb-4">
                    <h4 className="font-bold text-black border-b border-black pb-2">
                      Selected Portfolio: {portfolioOption === 'etf' ? 'Option 1 (ETF/Index)' : 'Option 2 (Direct Stocks)'}
                    </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    {currentEquityList.length > 0 ? currentEquityList.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.symbol}</span>
                                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">{item.sector}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-indigo-600 dark:text-indigo-400">{currency}{item.amount.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">{item.allocationPercent}% of Equity</p>
                            </div>
                        </div>
                    )) : (
                      <p className="text-sm text-slate-500 italic">No recommendations available for this category.</p>
                    )}
                </div>
            </div>
        )}

       {/* PLATFORM RECOMMENDATIONS - Z-Index boosted to ensure clickability */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print-break-inside-avoid relative z-20">
        <div className="md:col-span-3 mb-2">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <i className="fa-solid fa-mobile-screen-button text-indigo-600 dark:text-indigo-400"></i>
             Where to Invest ({new Date().getFullYear()})
           </h3>
           <p className="text-slate-500 dark:text-slate-400 text-sm">Top rated platforms tailored for {currency === '₹' ? 'Indian' : currency === '$' ? 'US' : 'Global'} investors</p>
        </div>
        
        {platforms.map((platform, idx) => (
           <a 
             key={idx} 
             href={platform.url} 
             target="_blank" 
             rel="noreferrer" 
             className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow-lg transition-all group flex flex-col justify-between print-clean no-print-link-decoration"
           >
             <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl ${platform.color} text-white flex items-center justify-center text-xl shadow-md`}>
                    <i className={`fa-solid ${platform.icon}`}></i>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                    {platform.badge}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {platform.name} <i className="fa-solid fa-arrow-up-right-from-square text-xs ml-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
                  {platform.description}
                </p>
             </div>
             <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
               <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Visit Platform</span>
             </div>
           </a>
        ))}
      </div>
      
      {/* PRINT DISCLAIMER FOOTER */}
      <div className="only-print mt-8 pt-8 border-t border-gray-300 text-center">
        <p className="text-xs text-gray-500">
          DISCLAIMER: Nexvest is an AI-powered educational tool. Projections are based on historical averages (Equity ~12%, Debt ~7%). 
          This report does not constitute professional financial advice. Please consult a SEBI registered investment advisor before making real investments.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;