import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdvisorResult } from '../types';
import { getHistory } from '../services/advisorService';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<AdvisorResult[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getHistory(user.id)
        .then(setHistory)
        .catch(console.error);
    }
  }, [user]);

  const handleView = (result: AdvisorResult) => {
    // Navigate to the persistent URL for this plan
    navigate(`/plan/${result.id}`, { state: { result } });
  };

  const handleExport = () => {
    if (history.length === 0) return;

    // Convert history to CSV
    const headers = ["Date", "Goal", "Investor Type", "Risk Score", "Equity %", "Debt %", "Gold %", "Monthly Investment", "Horizon (Years)", "Projected Wealth"];
    const rows = history.map(item => [
      new Date(item.date).toLocaleDateString(),
      item.profile.financialGoal || "General",
      item.investorType,
      item.riskScore,
      item.allocation.equity,
      item.allocation.debt,
      item.allocation.gold,
      `${item.profile.currency || '$'}${item.profile.monthlySavingsTarget}`,
      item.profile.investmentHorizonYears,
      item.projectedCorpus
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `investment_history_${user?.username}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">Your Plan History</h1>
        {history.length > 0 && (
          <button 
            onClick={handleExport}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-black dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-download"></i> Export CSV
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed transition-colors duration-300">
          <i className="fa-regular fa-folder-open text-4xl text-slate-300 dark:text-slate-600 mb-4"></i>
          <p className="text-black dark:text-slate-300 text-lg font-medium transition-colors">No history found yet.</p>
          <button 
            onClick={() => navigate('/advisor')}
            className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            Create your first plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.id} 
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 duration-300"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                    item.investorType === 'Aggressive' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 
                    item.investorType === 'Moderate' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  }`}>
                    {item.investorType}
                  </span>
                  <span className="text-black dark:text-slate-300 font-medium text-xs transition-colors">{new Date(item.date).toLocaleDateString()}</span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-black dark:text-slate-300 font-bold text-xs transition-colors">{item.profile.financialGoal || 'Wealth Creation'}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg transition-colors">
                  {item.profile.currency || '$'}{item.projectedCorpus.toLocaleString()} Target
                </h3>
                <p className="text-black dark:text-slate-300 text-sm transition-colors">
                  {item.profile.currency || '$'}{item.profile.monthlySavingsTarget}/mo for {item.profile.investmentHorizonYears} years
                </p>
              </div>
              <button 
                onClick={() => handleView(item)}
                className="bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-indigo-200 transition-all"
              >
                View Plan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;