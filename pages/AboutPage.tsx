import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 transition-colors">About Nexvest</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none text-black dark:text-slate-300 font-medium transition-colors">
        <p>
          Nexvest is a hackathon MVP designed to demonstrate the power of Generative AI in personal finance. 
          By combining traditional financial modeling (Risk Assessment, Asset Allocation) with Google Gemini's reasoning capabilities, 
          we provide users with not just numbers, but understanding.
        </p>
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-2 transition-colors">How it works</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Risk Scoring:</strong> We calculate a composite score (0-100) based on age, savings rate, and time horizon.</li>
          <li><strong>Asset Allocation:</strong> Based on your risk profile (Conservative, Moderate, Aggressive), we suggest a split between Equity, Debt, and Gold.</li>
          <li><strong>Projection:</strong> We simulate compound growth over your specified timeline and compare it against standard savings.</li>
          <li><strong>AI Explanation:</strong> We send your anonymous profile data to Google Gemini to generate a human-readable explanation of why this plan fits you.</li>
        </ul>

        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-amber-900 dark:text-amber-200 text-sm font-semibold transition-colors">
          <strong>Disclaimer:</strong> This application is a prototype for educational and demonstration purposes only. 
          It does not constitute professional financial advice. The projections are based on assumed rates of return 
          (Equity 12%, Debt 7%, Gold 9%) and may not reflect actual market performance. 
          Please consult a SEBI registered investment advisor before making real investments.
        </div>
      </div>
    </div>
  );
};

export default AboutPage;