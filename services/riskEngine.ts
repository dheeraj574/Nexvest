
import { InvestmentProfile, PortfolioAllocation, GrowthDataPoint, RiskTolerance, StockRecommendation, EquityBreakdown, PlatformRecommendation } from '../types';

export const calculateRiskScore = (profile: InvestmentProfile): number => {
  let score = 50; // Base score

  // 1. Age Factor: Younger = Higher Risk Capacity, but less weight than before
  // Age 25 -> +10, Age 65 -> -10
  score += (45 - profile.age) * 0.5;

  // 2. Investment Horizon: Longer = Higher Risk Capacity
  // 1yr -> 0, 20yr -> +15
  score += Math.min(profile.investmentHorizonYears, 20) * 0.75;

  // 3. Financial Stability (Savings Ratio)
  const savingsRatio = (profile.monthlySavingsTarget / profile.monthlyIncome);
  if (savingsRatio > 0.4) score += 10;
  else if (savingsRatio > 0.2) score += 5;

  // 4. User Preference (The Veto Factor)
  // This is the most important factor. If they say Low, we drag the score down heavily.
  switch (profile.riskTolerance) {
    case RiskTolerance.Low:
      score -= 30; 
      break;
    case RiskTolerance.High:
      score += 25;
      break;
    default:
      // Moderate implies a balanced approach
      break;
  }

  // HARD CAPS based on Tolerance
  // If user explicitly requests Low risk, score cannot exceed 45 (Moderate boundary)
  if (profile.riskTolerance === RiskTolerance.Low) {
    score = Math.min(score, 40);
  }
  
  // Clamp between 10 and 95
  return Math.max(10, Math.min(95, Math.round(score)));
};

export const determineInvestorType = (score: number): 'Conservative' | 'Moderate' | 'Aggressive' => {
  // Adjusted thresholds for better distribution
  if (score <= 40) return 'Conservative';
  if (score <= 70) return 'Moderate';
  return 'Aggressive';
};

export const getRecommendedAllocation = (score: number): PortfolioAllocation => {
  // DYNAMIC ALLOCATION:
  // Instead of 3 buckets, we calculate exact percentages based on the score (10-95).
  // This makes every plan unique.
  
  // Equity: Roughly tracks the score.
  // Min Equity 15% (at score 10), Max Equity 90% (at score 95)
  let equity = Math.round(score * 0.9);
  
  // Clamp Equity limits
  if (equity < 15) equity = 15;
  if (equity > 90) equity = 90;

  // Gold: Fixed small allocation for hedging (5-10%)
  // Lower risk profiles get slightly more gold for stability
  // Inverse relationship: High score = Low Gold (5%), Low score = High Gold (15%)
  // Map score 10 -> 15% gold, score 95 -> 5% gold
  // Linear interpolation: Gold = 15 - ((score - 10) / 85) * 10
  let gold = Math.round(15 - ((score - 10) / 85) * 10);
  if (gold < 5) gold = 5;
  if (gold > 15) gold = 15;

  // Debt: The remainder
  let debt = 100 - (equity + gold);

  return { equity, debt, gold };
};

export const getEquitySuggestions = (
  investorType: 'Conservative' | 'Moderate' | 'Aggressive',
  monthlyEquityInvestment: number,
  currency: string
): EquityBreakdown => {
  
  // Define simulator data based on currency region (Simple Logic: INR vs USD/Global)
  const isINR = currency === '₹';
  
  let etf: Omit<StockRecommendation, 'amount'>[] = [];
  let stocks: Omit<StockRecommendation, 'amount'>[] = [];

  if (investorType === 'Conservative') {
    if (isINR) {
      etf = [
        { symbol: 'NIFTYBEES', name: 'Nifty 50 ETF', sector: 'Broad Market', allocationPercent: 70 },
        { symbol: 'BANKBEES', name: 'Bank Nifty ETF', sector: 'Financials', allocationPercent: 30 },
      ];
      stocks = [
        { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Large Cap', allocationPercent: 40 },
        { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG', allocationPercent: 30 },
        { symbol: 'TCS', name: 'TCS', sector: 'Tech', allocationPercent: 30 },
      ];
    } else {
      etf = [
        { symbol: 'VOO', name: 'Vanguard S&P 500', sector: 'Broad Market', allocationPercent: 60 },
        { symbol: 'VIG', name: 'Vanguard Div Appreciation', sector: 'Dividend', allocationPercent: 40 },
      ];
      stocks = [
        { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', allocationPercent: 40 },
        { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Staples', allocationPercent: 30 },
        { symbol: 'KO', name: 'Coca-Cola', sector: 'Consumer Staples', allocationPercent: 30 },
      ];
    }
  } else if (investorType === 'Moderate') {
    if (isINR) {
      etf = [
        { symbol: 'NIFTYBEES', name: 'Nifty 50 ETF', sector: 'Broad Market', allocationPercent: 50 },
        { symbol: 'JUNIORBEES', name: 'Nifty Next 50', sector: 'Mid Cap', allocationPercent: 30 },
        { symbol: 'GOLDBEES', name: 'Gold ETF', sector: 'Commodity', allocationPercent: 20 },
      ];
      stocks = [
        { symbol: 'RELIANCE', name: 'Reliance Ind', sector: 'Conglomerate', allocationPercent: 30 },
        { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Financials', allocationPercent: 30 },
        { symbol: 'INFY', name: 'Infosys', sector: 'Technology', allocationPercent: 20 },
        { symbol: 'LT', name: 'L&T', sector: 'Infrastructure', allocationPercent: 20 },
      ];
    } else {
      etf = [
        { symbol: 'VTI', name: 'Total Stock Market', sector: 'Broad Market', allocationPercent: 50 },
        { symbol: 'QQQ', name: 'Invesco QQQ', sector: 'Tech Growth', allocationPercent: 30 },
        { symbol: 'SCHD', name: 'Schwab Dividend', sector: 'Dividend', allocationPercent: 20 },
      ];
      stocks = [
        { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology', allocationPercent: 30 },
        { symbol: 'GOOGL', name: 'Alphabet', sector: 'Technology', allocationPercent: 25 },
        { symbol: 'V', name: 'Visa', sector: 'Financials', allocationPercent: 25 },
        { symbol: 'COST', name: 'Costco', sector: 'Retail', allocationPercent: 20 },
      ];
    }
  } else { // Aggressive
    if (isINR) {
      etf = [
        { symbol: 'NIFTYBEES', name: 'Nifty 50 ETF', sector: 'Broad Market', allocationPercent: 30 },
        { symbol: 'MID150BEES', name: 'Midcap 150', sector: 'Mid Cap', allocationPercent: 40 },
        { symbol: 'SMALLCAP', name: 'Smallcap 250', sector: 'Small Cap', allocationPercent: 30 },
      ];
      stocks = [
        { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Auto', allocationPercent: 25 },
        { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'Financials', allocationPercent: 25 },
        { symbol: 'ADANIENT', name: 'Adani Ent', sector: 'Infra', allocationPercent: 25 },
        { symbol: 'ZOMATO', name: 'Zomato', sector: 'New Age', allocationPercent: 25 },
      ];
    } else {
      etf = [
        { symbol: 'QQQ', name: 'Invesco QQQ', sector: 'Tech Growth', allocationPercent: 40 },
        { symbol: 'ARKK', name: 'ARK Innovation', sector: 'Disruptive', allocationPercent: 20 },
        { symbol: 'SOXX', name: 'Semiconductor ETF', sector: 'Tech', allocationPercent: 20 },
        { symbol: 'IBIT', name: 'Bitcoin ETF', sector: 'Crypto', allocationPercent: 20 },
      ];
      stocks = [
        { symbol: 'NVDA', name: 'NVIDIA', sector: 'Semi', allocationPercent: 30 },
        { symbol: 'TSLA', name: 'Tesla', sector: 'Auto/Tech', allocationPercent: 25 },
        { symbol: 'AMD', name: 'AMD', sector: 'Semi', allocationPercent: 25 },
        { symbol: 'PLTR', name: 'Palantir', sector: 'Software', allocationPercent: 20 },
      ];
    }
  }

  // Calculate exact amounts
  const mapWithAmounts = (list: any[]) => list.map(item => ({
    ...item,
    amount: Math.round(monthlyEquityInvestment * (item.allocationPercent / 100))
  }));

  return {
    etf: mapWithAmounts(etf),
    stocks: mapWithAmounts(stocks)
  };
};

export const getRecommendedPlatforms = (currency: string): PlatformRecommendation[] => {
  if (currency === '₹') {
    return [
      { name: 'Zerodha', description: 'Lowest brokerage fees & intuitive Kite app.', url: 'https://zerodha.com', badge: 'Best Overall', icon: 'fa-arrow-trend-up', color: 'bg-blue-500' },
      { name: 'Groww', description: 'Beginner-friendly UI for Mutual Funds & Stocks.', url: 'https://groww.in', badge: 'Best for Beginners', icon: 'fa-leaf', color: 'bg-emerald-500' },
      { name: 'INDmoney', description: 'Best for investing in US Stocks from India.', url: 'https://indmoney.com', badge: 'US Stocks', icon: 'fa-earth-americas', color: 'bg-indigo-500' },
    ];
  } else if (currency === '$') {
    return [
      { name: 'Fidelity', description: 'Top-tier research & zero expense ratio funds.', url: 'https://fidelity.com', badge: 'Top Rated', icon: 'fa-building-columns', color: 'bg-emerald-600' },
      { name: 'Robinhood', description: 'Commission-free, mobile-first experience.', url: 'https://robinhood.com', badge: 'Mobile App', icon: 'fa-feather', color: 'bg-green-500' },
      { name: 'Vanguard', description: 'The leader in low-cost index funds.', url: 'https://vanguard.com', badge: 'Long Term', icon: 'fa-shield-halved', color: 'bg-red-700' },
    ];
  } else if (currency === '€' || currency === '£') {
    return [
      { name: 'eToro', description: 'Social trading & multi-asset platform.', url: 'https://etoro.com', badge: 'Social Trading', icon: 'fa-users-viewfinder', color: 'bg-green-500' },
      { name: 'DEGIRO', description: 'Low fees for European investors.', url: 'https://degiro.co.uk', badge: 'Low Fees', icon: 'fa-coins', color: 'bg-blue-600' },
      { name: 'Interactive Brokers', description: 'Professional grade tools for global access.', url: 'https://interactivebrokers.com', badge: 'Pro Tools', icon: 'fa-globe', color: 'bg-red-600' },
    ];
  } else {
    // Global / Default
    return [
      { name: 'Interactive Brokers', description: 'Global access to 150+ markets.', url: 'https://interactivebrokers.com', badge: 'Global Access', icon: 'fa-globe', color: 'bg-red-600' },
      { name: 'eToro', description: 'Easy access to global markets.', url: 'https://etoro.com', badge: 'User Friendly', icon: 'fa-users', color: 'bg-green-500' },
      { name: 'Saxo Bank', description: 'Premium banking & trading services.', url: 'https://www.home.saxo', badge: 'Premium', icon: 'fa-building', color: 'bg-slate-800' },
    ];
  }
};

export const calculateGrowth = (
  profile: InvestmentProfile, 
  allocation: PortfolioAllocation
): { projected: number, inflationAdjustedCorpus: number, totalInvested: number, chart: GrowthDataPoint[] } => {
  const years = profile.investmentHorizonYears;
  const totalMonths = Math.round(years * 12);
  const monthlySIP = profile.monthlySavingsTarget;
  const initialCorpus = profile.currentSavings;

  // Realistic Expected Returns (Annual)
  // Equity: 12% (Long term avg)
  // Debt: 7% (Fixed income avg)
  // Gold: 8% (Inflation hedge)
  const rate = (
    (allocation.equity * 0.12) + 
    (allocation.debt * 0.07) + 
    (allocation.gold * 0.08)
  ) / 100;

  const inflationRate = 0.06; // 6% average inflation
  const savingsRate = 0.035; // 3.5% Savings Account

  const monthlyRate = rate / 12;
  const monthlySavingsRate = savingsRate / 12;

  const chart: GrowthDataPoint[] = [];
  
  let currentEstimated = initialCorpus;
  let currentSavings = initialCorpus; 
  let totalInvested = initialCorpus;

  // Initial Point (Year 0)
  chart.push({
    year: 0,
    invested: Math.round(totalInvested),
    estimated: Math.round(currentEstimated),
    savings: Math.round(currentSavings)
  });

  // Iterate by months to support fractional years (e.g. 0.5 years)
  for (let m = 1; m <= totalMonths; m++) {
    currentEstimated = (currentEstimated + monthlySIP) * (1 + monthlyRate);
    currentSavings = (currentSavings + monthlySIP) * (1 + monthlySavingsRate);
    totalInvested += monthlySIP;

    // Push to chart if it's a full year OR if it's the very last month (e.g. month 6 for 0.5 years)
    if (m % 12 === 0 || m === totalMonths) {
       // Avoid duplicate push if totalMonths is multiple of 12 (handled by m%12)
       const yearValue = parseFloat((m / 12).toFixed(1));
       
       const lastPoint = chart[chart.length - 1];
       if (lastPoint.year !== yearValue) {
          chart.push({
            year: yearValue,
            invested: Math.round(totalInvested),
            estimated: Math.round(currentEstimated),
            savings: Math.round(currentSavings)
          });
       }
    }
  }

  // Calculate Purchasing Power (Real Value)
  // Formula: FutureValue / (1 + inflation)^years
  const inflationFactor = Math.pow(1 + inflationRate, years);
  const inflationAdjustedCorpus = Math.round(currentEstimated / inflationFactor);

  return {
    projected: Math.round(currentEstimated),
    inflationAdjustedCorpus,
    totalInvested: Math.round(totalInvested),
    chart
  };
};
