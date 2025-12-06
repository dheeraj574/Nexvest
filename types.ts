
export interface User {
  id: string;
  username: string;
  email: string;
}

export enum RiskTolerance {
  Low = 'Low',
  Moderate = 'Moderate',
  High = 'High',
}

export interface InvestmentProfile {
  age: number;
  monthlyIncome: number;
  currentSavings: number;
  monthlySavingsTarget: number; // SIP Amount
  riskTolerance: RiskTolerance | string;
  investmentHorizonYears: number;
  financialGoal: string; // NEW: Specific goal
  currency: string; // NEW: Preferred currency symbol
}

export interface PortfolioAllocation {
  equity: number;
  debt: number;
  gold: number;
}

export interface GrowthDataPoint {
  year: number;
  invested: number;
  estimated: number;
  savings: number; // NEW: Benchmark comparison
}

export interface StockRecommendation {
  symbol: string;
  name: string;
  sector: string;
  allocationPercent: number; // % of the equity portion
  amount: number; // Currency value
}

export interface EquityBreakdown {
  etf: StockRecommendation[];
  stocks: StockRecommendation[];
}

export interface PlatformRecommendation {
  name: string;
  description: string;
  url: string;
  badge: string;
  icon: string;
  color: string;
}

export interface AdvisorResult {
  id: string;
  date: string;
  profile: InvestmentProfile;
  riskScore: number;
  investorType: 'Conservative' | 'Moderate' | 'Aggressive';
  allocation: PortfolioAllocation;
  equityBreakdown: EquityBreakdown; // CHANGED: Object with two arrays
  projectedCorpus: number;
  inflationAdjustedCorpus: number; // NEW: Real purchasing power
  totalInvested: number;
  growthChart: GrowthDataPoint[];
  aiExplanation?: string;
}
