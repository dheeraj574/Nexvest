import React, { useState } from 'react';

interface Props {
  text: string;
}

const InfoTooltip: React.FC<Props> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1.5 align-middle group">
      <button
        type="button"
        className="text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => { e.preventDefault(); setIsVisible(!isVisible); }}
        aria-label="Info"
      >
        <i className="fa-solid fa-circle-info text-sm"></i>
      </button>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-medium rounded-xl shadow-xl z-50 text-center animate-fade-in border border-slate-700 dark:border-slate-200">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800 dark:border-t-white"></div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;