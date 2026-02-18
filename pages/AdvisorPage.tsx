
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiskTolerance, InvestmentProfile } from '../types';
import { generatePlan } from '../services/advisorService';
import InfoTooltip from '../components/InfoTooltip';

// Helper type to handle form inputs where numbers can be empty strings temporarily while typing
type InvestmentProfileForm = {
  [K in keyof InvestmentProfile]: InvestmentProfile[K] extends number ? number | string : InvestmentProfile[K];
};

const AdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Initializing...');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Check if we are editing an existing profile
  const existingProfile = location.state?.profile as InvestmentProfile | undefined;
  const isEdit = location.state?.isEdit;

  // Constants for Validation
  const MAX_MONETARY_VALUE = 1000000000; 
  const MAX_AGE = 100;
  const MAX_HORIZON = 50;

  const [formData, setFormData] = useState<InvestmentProfileForm>(() => {
    // Defaults are now empty strings for numbers to ensure no placeholder values
    const defaults = {
      age: '',
      monthlyIncome: '',
      currentSavings: '',
      monthlySavingsTarget: '',
      riskTolerance: RiskTolerance.Moderate,
      investmentHorizonYears: '',
      financialGoal: 'Wealth Creation',
      currency: '$'
    };

    if (existingProfile) {
      return {
        ...defaults,
        ...existingProfile,
        financialGoal: existingProfile.financialGoal || defaults.financialGoal,
        currency: existingProfile.currency || defaults.currency
      };
    }

    return defaults;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Determine if the field is strictly a string field
    const isStringField = name === 'riskTolerance' || name === 'financialGoal' || name === 'currency';

    setFormData(prev => ({
      ...prev,
      [name]: isStringField 
        ? value 
        : (value === '' ? '' : Number(value)) 
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const values = {
        age: Number(formData.age),
        monthlyIncome: Number(formData.monthlyIncome),
        currentSavings: Number(formData.currentSavings),
        monthlySavingsTarget: Number(formData.monthlySavingsTarget),
        investmentHorizonYears: Number(formData.investmentHorizonYears)
    };

    if (values.age < 18 || values.age > MAX_AGE) newErrors.age = `Age must be between 18 and ${MAX_AGE}.`;
    if (values.monthlyIncome <= 0) newErrors.monthlyIncome = "Income must be > 0.";
    else if (values.monthlyIncome > MAX_MONETARY_VALUE) newErrors.monthlyIncome = "Max limit reached.";
    if (values.currentSavings < 0) newErrors.currentSavings = "Savings cannot be negative.";
    else if (values.currentSavings > MAX_MONETARY_VALUE) newErrors.currentSavings = "Max limit reached.";
    if (values.monthlySavingsTarget <= 0) newErrors.monthlySavingsTarget = "Investment must be > 0.";
    else if (values.monthlySavingsTarget > MAX_MONETARY_VALUE) newErrors.monthlySavingsTarget = "Max limit reached.";
    if (values.monthlySavingsTarget > values.monthlyIncome) newErrors.monthlySavingsTarget = "Cannot exceed income.";
    if (values.investmentHorizonYears < 1 || values.investmentHorizonYears > MAX_HORIZON) newErrors.investmentHorizonYears = `Horizon must be 1-${MAX_HORIZON} years.`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    let interval: any;
    if (loading) {
      const messages = [
        "Analyzing financial profile...",
        "Calculating risk score...",
        "Consulting Jack's AI...",
        "Optimizing asset allocation...",
        "Projecting future wealth...",
        "Finalizing the map..."
      ];
      let i = 0;
      setLoadingMsg(messages[0]);
      interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingMsg(messages[i]);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validateForm()) return;

    setLoading(true);
    try {
      const cleanProfile: InvestmentProfile = {
        ...formData,
        age: Number(formData.age),
        monthlyIncome: Number(formData.monthlyIncome),
        currentSavings: Number(formData.currentSavings),
        monthlySavingsTarget: Number(formData.monthlySavingsTarget),
        investmentHorizonYears: Number(formData.investmentHorizonYears),
        riskTolerance: String(formData.riskTolerance),
        financialGoal: String(formData.financialGoal),
        currency: String(formData.currency)
      } as InvestmentProfile;

      const result = await generatePlan(user.id, cleanProfile);
      navigate(`/plan/${result.id}`, { state: { result } });
    } catch (error) {
      console.error("Error generating plan", error);
      alert("Something went wrong. Please check your inputs.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative px-4 sm:px-0 pb-12">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center transition-all animate-fade-in">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-indigo-100 dark:border-indigo-900/50 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900 rounded-full flex items-center justify-center animate-pulse">
                <i className="fa-solid fa-fish-hook text-indigo-600 dark:text-indigo-400 text-xl"></i>
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{loadingMsg}</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Please wait while we chart your course</p>
        </div>
      )}

      <div className="mb-10 text-center animate-slide-up">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isEdit ? 'Refine Your Strategy' : 'Build Your Wealth Plan'}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
          {isEdit ? 'Adjust your parameters below to see how they impact your portfolio.' : 'Let our AI analyze your profile and design the perfect portfolio tailored to your goals.'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10">
          
          {/* Section 1: Personal & Goals */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile & Goals</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Financial Goal
                  <InfoTooltip text="The main objective for your investment, like buying a home or retiring comfortably." />
                </label>
                <div className="relative">
                  <i className="fa-solid fa-bullseye absolute left-4 top-3.5 text-slate-400"></i>
                  <select
                    name="financialGoal"
                    value={formData.financialGoal}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none appearance-none text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="Wealth Creation">Wealth Creation</option>
                    <option value="Retirement">Retirement Planning</option>
                    <option value="Buying a Home">Buying a Home</option>
                    <option value="Education">Education Fund</option>
                    <option value="Travel">Travel & Lifestyle</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-4 text-slate-400 text-xs pointer-events-none"></i>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Current Age</label>
                <div className="relative">
                  <i className="fa-solid fa-user absolute left-4 top-3.5 text-slate-400"></i>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 25"
                    min="18"
                    max={MAX_AGE}
                    required
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border ${errors.age ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500'} rounded-xl focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-slate-900 dark:text-white font-medium`}
                  />
                </div>
                {errors.age && <p className="text-red-500 text-xs mt-1 ml-1 font-medium"><i className="fa-solid fa-circle-exclamation mr-1"></i>{errors.age}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Finances */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Currency</label>
                <div className="relative">
                  <i className="fa-solid fa-coins absolute left-4 top-3.5 text-slate-400"></i>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none appearance-none text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="$">USD ($)</option>
                    <option value="₹">INR (₹)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                    <option value="¥">JPY (¥)</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-4 text-slate-400 text-xs pointer-events-none"></i>
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Monthly Income</label>
                <div className="relative">
                  <i className="fa-solid fa-briefcase absolute left-4 top-3.5 text-slate-400"></i>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                    placeholder="e.g. 5000"
                    min="0"
                    max={MAX_MONETARY_VALUE}
                    required
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border ${errors.monthlyIncome ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500'} rounded-xl focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-slate-900 dark:text-white font-medium`}
                  />
                </div>
                {errors.monthlyIncome && <p className="text-red-500 text-xs mt-1 ml-1 font-medium"><i className="fa-solid fa-circle-exclamation mr-1"></i>{errors.monthlyIncome}</p>}
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Current Savings</label>
                <div className="relative">
                   <i className="fa-solid fa-piggy-bank absolute left-4 top-3.5 text-slate-400"></i>
                  <input
                    type="number"
                    name="currentSavings"
                    value={formData.currentSavings}
                    onChange={handleChange}
                    placeholder="e.g. 10000"
                    min="0"
                    max={MAX_MONETARY_VALUE}
                    required
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border ${errors.currentSavings ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500'} rounded-xl focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-slate-900 dark:text-white font-medium`}
                  />
                </div>
                {errors.currentSavings && <p className="text-red-500 text-xs mt-1 ml-1 font-medium"><i className="fa-solid fa-circle-exclamation mr-1"></i>{errors.currentSavings}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Strategy */}
          <div className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Strategy Parameters</h3>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Monthly Investment (SIP)
                    <InfoTooltip text="Systematic Investment Plan (SIP): The fixed amount you commit to saving and investing every single month." />
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-money-bill-wave absolute left-4 top-3.5 text-slate-400"></i>
                    <input
                      type="number"
                      name="monthlySavingsTarget"
                      value={formData.monthlySavingsTarget}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                      min="10"
                      max={MAX_MONETARY_VALUE}
                      required
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border ${errors.monthlySavingsTarget ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500'} rounded-xl focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-slate-900 dark:text-white font-medium`}
                    />
                  </div>
                  {errors.monthlySavingsTarget && <p className="text-red-500 text-xs mt-1 ml-1 font-medium"><i className="fa-solid fa-circle-exclamation mr-1"></i>{errors.monthlySavingsTarget}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Risk Tolerance
                    <InfoTooltip text="How comfortable are you with market ups and downs? High risk can mean higher returns but more volatility." />
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-shield-halved absolute left-4 top-3.5 text-slate-400"></i>
                    <select
                      name="riskTolerance"
                      value={formData.riskTolerance}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none appearance-none text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      <option value={RiskTolerance.Low}>Low (Preserve Capital)</option>
                      <option value={RiskTolerance.Moderate}>Moderate (Balanced Growth)</option>
                      <option value={RiskTolerance.High}>High (Maximize Returns)</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-4 top-4 text-slate-400 text-xs pointer-events-none"></i>
                  </div>
                </div>
                
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-end mb-4">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Investment Horizon
                      <InfoTooltip text="How long you plan to keep your money invested. Longer horizons generally allow for more aggressive growth strategies." />
                    </label>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {formData.investmentHorizonYears === '' ? '-' : `${formData.investmentHorizonYears} Years`}
                    </span>
                  </div>
                  <input
                    type="range"
                    name="investmentHorizonYears"
                    value={formData.investmentHorizonYears === '' ? 1 : formData.investmentHorizonYears}
                    onChange={handleChange}
                    min="1"
                    max={MAX_HORIZON}
                    className="w-full h-3 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mt-2">
                    <span>1 Year</span>
                    <span>{MAX_HORIZON} Years</span>
                  </div>
                  {errors.investmentHorizonYears && <p className="text-red-500 text-xs mt-1 font-medium">{errors.investmentHorizonYears}</p>}
                </div>
             </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-xl shadow-indigo-200 dark:shadow-none hover:-translate-y-1 ${loading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isEdit ? 'Recalculate Strategy' : 'Generate Investment Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvisorPage;
