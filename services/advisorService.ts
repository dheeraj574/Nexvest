
import { v4 as uuidv4 } from 'uuid';
import { InvestmentProfile, AdvisorResult, EquityBreakdown } from '../types';
import * as riskEngine from './riskEngine';
import * as geminiService from './geminiService';
import * as storageService from './storageService';

export const generatePlan = async (userId: string, profile: InvestmentProfile): Promise<AdvisorResult> => {
  // 1. Calculate Risk and Type
  const riskScore = riskEngine.calculateRiskScore(profile);
  const investorType = riskEngine.determineInvestorType(riskScore);
  
  // 2. Get Allocation (Now based on precise score for realism)
  const allocation = riskEngine.getRecommendedAllocation(riskScore);
  
  // 3. Generate Specific Equity Suggestions (AI First, Fallback to Engine)
  const monthlyEquityInvestment = profile.monthlySavingsTarget * (allocation.equity / 100);
  let equityBreakdown: EquityBreakdown;

  try {
    // Attempt to get real, AI-generated suggestions (now returns {etf: [], stocks: []})
    const aiSuggestions = await geminiService.generateStockSuggestions(profile, investorType);
    
    // Helper to calculate amounts
    const addAmounts = (list: any[]) => list.map(item => ({
      ...item,
      amount: Math.round(monthlyEquityInvestment * (item.allocationPercent / 100))
    }));

    equityBreakdown = {
      etf: addAmounts(aiSuggestions.etf),
      stocks: addAmounts(aiSuggestions.stocks)
    };
  } catch (error) {
    console.warn("AI Stock suggestion failed, using fallback engine.", error);
    // Fallback to static engine
    equityBreakdown = riskEngine.getEquitySuggestions(
      investorType, 
      monthlyEquityInvestment, 
      profile.currency
    );
  }
  
  // 4. Project Growth
  const { projected, inflationAdjustedCorpus, totalInvested, chart } = riskEngine.calculateGrowth(profile, allocation);

  // 5. Get AI Explanation
  // We await this to ensure the dashboard has the full report
  const aiExplanation = await geminiService.generateAIExplanation(
    profile, 
    allocation, 
    investorType, 
    projected
  );

  const result: AdvisorResult = {
    id: uuidv4(),
    date: new Date().toISOString(),
    profile,
    riskScore,
    investorType,
    allocation,
    equityBreakdown, // Now contains both options
    projectedCorpus: projected,
    inflationAdjustedCorpus,
    totalInvested,
    growthChart: chart,
    aiExplanation
  };

  // 6. Save to History
  storageService.saveHistory(userId, result);

  return result;
};

export const getHistory = async (userId: string): Promise<AdvisorResult[]> => {
  // Simulate API delay for realism
  await new Promise(resolve => setTimeout(resolve, 300));
  return storageService.getHistory(userId);
};
