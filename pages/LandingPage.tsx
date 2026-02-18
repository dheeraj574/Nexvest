
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  
  // Quick Calculator State
  const [calcAmount, setCalcAmount] = useState(500);
  const [calcYears, setCalcYears] = useState(10);
  const [calcRate, setCalcRate] = useState(12);

  const calculateQuickReturn = () => {
    const months = calcYears * 12;
    const monthlyRate = calcRate / 100 / 12;
    const futureValue = calcAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    return Math.round(futureValue).toLocaleString();
  };

  const totalInvested = (calcAmount * calcYears * 12).toLocaleString();

  return (
    <div className="flex flex-col w-full transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950"></div>
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 shadow-sm mb-8 animate-fade-in-up">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
              New: Gemini 2.5 Flash Integration Live
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 transition-colors leading-tight">
            Wealth Management <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Reimagined by Jack
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 font-medium max-w-3xl mx-auto mb-12 leading-relaxed transition-colors">
            Stop guessing with your money. Get a personalized, institution-grade investment strategy built by AI in seconds—completely free.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
            {user ? (
               <Link 
               to="/advisor" 
               className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-indigo-200 dark:hover:shadow-none hover:-translate-y-1"
             >
               Go to Dashboard <i className="fa-solid fa-arrow-right ml-2"></i>
             </Link>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-indigo-200 dark:hover:shadow-none hover:-translate-y-1"
                >
                  Start Your Plan <i className="fa-solid fa-rocket ml-2"></i>
                </Link>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-lg px-8 py-4 rounded-xl font-bold transition-all hover:-translate-y-1"
                >
                  Existing Member
                </Link>
              </>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-lg">
                <i className="fa-brands fa-google text-2xl"></i> Gemini Powered
             </div>
             <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-lg">
                <i className="fa-solid fa-shield-halved text-2xl"></i> Bank-Grade Logic
             </div>
             <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-lg">
                <i className="fa-solid fa-users text-2xl"></i> 10k+ Plans Generated
             </div>
          </div>
        </div>
      </section>

      {/* Quick Calculator Section */}
      <section className="py-20 bg-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">See The Power of Compounding</h2>
              <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
                Even small monthly investments can grow into a fortune over time. 
                Use our quick estimator to see what's possible before you sign up for a full AI plan.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold"><i className="fa-solid fa-check"></i></div>
                  <span className="font-medium text-lg">Instant estimation</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold"><i className="fa-solid fa-check"></i></div>
                  <span className="font-medium text-lg">Adjustable time horizons</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold"><i className="fa-solid fa-check"></i></div>
                  <span className="font-medium text-lg">Real market return benchmarks</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-8 rounded-2xl shadow-2xl transition-colors">
              <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">Quick Estimator</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Monthly Investment</label>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">${calcAmount}</span>
                  </div>
                  <input 
                    type="range" min="100" max="5000" step="100"
                    value={calcAmount} onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Time Period</label>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{calcYears} Years</span>
                  </div>
                  <input 
                    type="range" min="1" max="40" step="1"
                    value={calcYears} onChange={(e) => setCalcYears(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Total Invested</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">${totalInvested}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Potential Value</p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${calculateQuickReturn()}</p>
                    </div>
                  </div>
                </div>

                <Link to="/register" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-bold py-3 rounded-xl transition-colors mt-4">
                  Get Detailed AI Plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to grow wealth</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Comprehensive tools that combine traditional financial theory with modern AI capabilities.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="fa-brain"
              color="text-purple-600"
              bg="bg-purple-100 dark:bg-purple-900/30"
              title="AI-Powered Strategy"
              desc="Our Gemini-powered engine analyzes your specific situation to provide tailored advice, not generic templates."
            />
            <FeatureCard 
              icon="fa-chart-pie"
              color="text-blue-600"
              bg="bg-blue-100 dark:bg-blue-900/30"
              title="Smart Asset Allocation"
              desc="Get the perfect mix of Equity, Debt, and Gold based on your risk profile and investment horizon."
            />
            <FeatureCard 
              icon="fa-layer-group"
              color="text-indigo-600"
              bg="bg-indigo-100 dark:bg-indigo-900/30"
              title="Risk Profiling"
              desc="We don't just ask your age. We analyze your income, savings, and goals to determine your true risk capacity."
            />
             <FeatureCard 
              icon="fa-bullseye"
              color="text-red-600"
              bg="bg-red-100 dark:bg-red-900/30"
              title="Goal-Based Planning"
              desc="Whether it's a home, retirement, or travel, align your investments specifically to your life goals."
            />
             <FeatureCard 
              icon="fa-coins"
              color="text-amber-600"
              bg="bg-amber-100 dark:bg-amber-900/30"
              title="Inflation Adjusted"
              desc="Our projections consider inflation and realistic market returns so you know the real value of your future money."
            />
             <FeatureCard 
              icon="fa-mobile-screen"
              color="text-emerald-600"
              bg="bg-emerald-100 dark:bg-emerald-900/30"
              title="Responsive Design"
              desc="Track your portfolio and adjust your plan from any device. Your financial advisor is always in your pocket."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white dark:bg-slate-800 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
             <p className="text-lg text-slate-600 dark:text-slate-400">Three simple steps to financial clarity.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-indigo-100 dark:bg-slate-700 -z-0"></div>
            
            <StepCard 
              num="1" 
              title="Create Profile" 
              desc="Enter your age, income, and financial goals. It takes less than 2 minutes." 
            />
            <StepCard 
              num="2" 
              title="AI Analysis" 
              desc="Our algorithms calculate your risk score while Gemini generates your strategy." 
            />
            <StepCard 
              num="3" 
              title="Execute Plan" 
              desc="Get your allocation mix and start investing with confidence." 
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            <FAQItem 
              question="Is this financial advice?"
              answer="No. Jack provides educational insights based on standard financial models. Always consult a certified financial planner for personal advice."
            />
            <FAQItem 
              question="Is my data safe?"
              answer="Yes. We use local storage for this demo version, meaning your financial data stays on your device and isn't sent to a central database."
            />
            <FAQItem 
              question="Does it cost money?"
              answer="This MVP version is completely free to use. Future versions may have premium features."
            />
            <FAQItem 
              question="How accurate are the projections?"
              answer="We use historical averages (Equity ~12%, Debt ~7%). However, past performance is not indicative of future returns."
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-indigo-600 text-white text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to take control?</h2>
        <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of others who are using AI to optimize their financial future.
        </p>
        <Link 
          to="/register" 
          className="bg-white text-indigo-600 hover:bg-indigo-50 px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-block"
        >
          Build My Plan Now
        </Link>
      </section>

    </div>
  );
};

// Helper Components

const FeatureCard = ({ icon, color, bg, title, desc }: any) => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300 group">
    <div className={`w-14 h-14 ${bg} ${color} rounded-xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform`}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
      {desc}
    </p>
  </div>
);

const StepCard = ({ num, title, desc }: any) => (
  <div className="relative z-10 text-center px-4">
    <div className="w-16 h-16 bg-white dark:bg-slate-800 border-4 border-indigo-100 dark:border-slate-700 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 mx-auto mb-6 shadow-sm">
      {num}
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 font-medium">{desc}</p>
  </div>
);

const FAQItem = ({ question, answer }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
      >
        <span className="text-lg font-bold text-slate-900 dark:text-white">{question}</span>
        <i className={`fa-solid fa-chevron-down text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-700 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
