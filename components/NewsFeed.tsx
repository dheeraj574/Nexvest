
import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '../context/ThemeContext';

const NewsFeed: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "feedMode": "all_symbols",
      "isTransparent": true,
      "displayMode": "regular",
      "width": "100%",
      "height": "100%",
      "colorTheme": theme === 'dark' ? "dark" : "light",
      "locale": "en"
    });

    if (container.current) {
      container.current.innerHTML = '';
      container.current.appendChild(script);
    }
  }, [theme]);

  return (
    <div className="h-[500px] w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-4 print:hidden">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <i className="fa-regular fa-newspaper"></i>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Global Market News</h3>
      </div>
      <div className="tradingview-widget-container h-[420px]" ref={container}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
};

export default memo(NewsFeed);
