
import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '../context/ThemeContext';

const StockTicker: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        { "proName": "FOREXCOM:SPXUSD", "title": "S&P 500" },
        { "proName": "FOREXCOM:NSXUSD", "title": "Nasdaq 100" },
        { "proName": "FX_IDC:INRUSD", "title": "INR/USD" },
        { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" },
        { "proName": "BITSTAMP:ETHUSD", "title": "Ethereum" },
        { "description": "Gold", "proName": "TVC:GOLD" },
        { "description": "Nifty 50", "proName": "NSE:NIFTY" },
        { "description": "Sensex", "proName": "BSE:SENSEX" }
      ],
      "showSymbolLogo": true,
      "colorTheme": theme === 'dark' ? "dark" : "light",
      "isTransparent": true,
      "displayMode": "adaptive",
      "locale": "en"
    });

    if (container.current) {
      container.current.innerHTML = ''; // Clear previous widget
      container.current.appendChild(script);
    }
  }, [theme]); // Re-render when theme changes

  return (
    <div className="ticker-container w-full mb-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm print:hidden">
      <div className="tradingview-widget-container" ref={container}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
};

export default memo(StockTicker);
