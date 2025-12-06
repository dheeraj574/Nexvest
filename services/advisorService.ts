
import { v4 as uuidv4 } from 'uuid';
import { InvestmentProfile, AdvisorResult, EquityBreakdown, PortfolioAllocation } from '../types';
import * as riskEngine from './riskEngine';
import * as geminiService from './geminiService';
import * as storageService from './storageService';

export const generatePlan = async (userId: string, profile: InvestmentProfile): Promise<AdvisorResult> => {
  // 1. Calculate Risk and Type
  const riskScore = riskEngine.calculateRiskScore(profile);
  const investorType = riskEngine.determineInvestorType(riskScore);
  
  // 2. Initialize Allocation (Default to engine fallback first)
  let allocation: PortfolioAllocation = riskEngine.getRecommendedAllocation(riskScore);
  let equityBreakdown: EquityBreakdown;

  // 3. Generate Specific Equity Suggestions & Allocation (AI First)
  try {
    // Attempt to get real, AI-generated suggestions AND dynamic allocation
    const aiData = await geminiService.generateStockSuggestions(profile, investorType);
    
    // OVERRIDE engine allocation with AI allocation if valid
    if (aiData.allocation && 
       (aiData.allocation.equity + aiData.allocation.debt + aiData.allocation.gold) === 100) {
       allocation = aiData.allocation;
    }

    // Helper to calculate amounts based on the (possibly new) equity allocation
    const monthlyEquityInvestment = profile.monthlySavingsTarget * (allocation.equity / 100);
    
    const addAmounts = (list: any[]) => list.map(item => ({
      ...item,
      amount: Math.round(monthlyEquityInvestment * (item.allocationPercent / 100))
    }));

    equityBreakdown = {
      etf: addAmounts(aiData.etf),
      stocks: addAmounts(aiData.stocks)
    };

  } catch (error) {
    console.warn("AI Stock suggestion failed, using fallback engine.", error);
    
    // Fallback logic
    const monthlyEquityInvestment = profile.monthlySavingsTarget * (allocation.equity / 100);
    
    equityBreakdown = riskEngine.getEquitySuggestions(
      investorType, 
      monthlyEquityInvestment, 
      profile.currency
    );
  }
  
  // 4. Project Growth (Using the final allocation, whether AI or Engine)
  const { projected, inflationAdjustedCorpus, totalInvested, chart } = riskEngine.calculateGrowth(profile, allocation);

  // 5. Get AI Explanation
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
    equityBreakdown, 
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
