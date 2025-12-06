
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { InvestmentProfile, PortfolioAllocation, StockRecommendation, EquityBreakdown } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIExplanation = async (
  profile: InvestmentProfile,
  allocation: PortfolioAllocation,
  investorType: string,
  projectedCorpus: number
): Promise<string> => {
  
  const prompt = `
    You are an expert financial advisor. Analyze this investor profile and return a structured response.

    **User Profile:**
    - Age: ${profile.age}
    - Income: ${profile.currency} ${profile.monthlyIncome}
    - Risk Preference: ${profile.riskTolerance}
    - Goal: ${profile.financialGoal} (${profile.investmentHorizonYears} years)
    - Monthly Investment: ${profile.currency} ${profile.monthlySavingsTarget}

    **Generated Plan:**
    - Type: ${investorType}
    - Allocation: Equity ${allocation.equity}%, Debt ${allocation.debt}%, Gold ${allocation.gold}%
    - Projected Wealth: ${profile.currency} ${projectedCorpus.toLocaleString()}

    **Instructions:**
    Provide a response in exactly 3 sections using markdown bullet points. Do not use generic introductory filler text.
    
    ### 1. Strategy Analysis
    - Explain why this specific allocation (${allocation.equity}/${allocation.debt}) fits their ${profile.riskTolerance} preference and age.
    - Mention how it helps achieve the goal of "${profile.financialGoal}".

    ### 2. Risk & Reality Check
    - Highlight one specific risk they face (e.g., inflation, market volatility, or too conservative).
    - Give a "Real talk" tip on sticking to the plan.

    ### 3. Actionable Advice
    - Provide 2 short, bulleted tips for a ${profile.age}-year-old investor.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "AI analysis unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI analysis is currently unavailable. However, your asset allocation is based on sound financial principles.";
  }
};

export const generateStockSuggestions = async (
  profile: InvestmentProfile,
  investorType: string
): Promise<{ etf: Omit<StockRecommendation, 'amount'>[], stocks: Omit<StockRecommendation, 'amount'>[] }> => {

  const prompt = `
    Generate realistic investment recommendations for a ${profile.age}-year-old ${investorType} investor 
    whose currency is ${profile.currency}.
    
    Provide two lists:
    1. 'etf': A basket of 3-4 ETFs or Index Funds (Passive Strategy).
    2. 'stocks': A basket of 4-5 Individual Stocks (Active Strategy).

    For the currency '${profile.currency}', use appropriate stock tickers (e.g., if '₹' use NSE/BSE tickers, if '$' use NYSE/NASDAQ).
    The 'allocationPercent' in each list must sum up to 100.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      etf: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING, description: "Stock Ticker e.g. AAPL or HDFCBANK" },
            name: { type: Type.STRING, description: "Full Name" },
            sector: { type: Type.STRING },
            allocationPercent: { type: Type.NUMBER, description: "Percentage of equity portion, e.g. 25" }
          },
          required: ["symbol", "name", "sector", "allocationPercent"]
        }
      },
      stocks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING },
            name: { type: Type.STRING },
            sector: { type: Type.STRING },
            allocationPercent: { type: Type.NUMBER }
          },
          required: ["symbol", "name", "sector", "allocationPercent"]
        }
      }
    },
    required: ["etf", "stocks"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Gemini Stock Suggestion Error", error);
    throw error;
  }
};


// NEW: Chat Session Factory
export const createChatSession = (
  profile: InvestmentProfile,
  allocation: PortfolioAllocation,
  riskScore: number
): Chat => {
  const systemInstruction = `
    You are a friendly and encouraging financial advisor assistant.
    You are chatting with a user about their specifically generated investment plan.
    
    **Context:**
    - Goal: ${profile.financialGoal}
    - Monthly Investment: ${profile.currency}${profile.monthlySavingsTarget}
    - Horizon: ${profile.investmentHorizonYears} years
    - Risk Profile: ${profile.riskTolerance} (Score: ${riskScore}/100)
    - Asset Allocation: Equity ${allocation.equity}%, Debt ${allocation.debt}%, Gold ${allocation.gold}%
    
    **Rules:**
    - Answer questions specifically about *this* plan.
    - If they ask why Equity is high/low, refer to their risk score and age (${profile.age}).
    - Keep answers concise (max 2-3 sentences) unless asked for details.
    - Be professional but conversational.
    - Do NOT give specific stock tips (e.g. "Buy Tesla"). Stick to asset classes (Index Funds, Bonds).
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
  });
};
