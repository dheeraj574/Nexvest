
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { InvestmentProfile, PortfolioAllocation, StockRecommendation, EquityBreakdown } from '../types';

const ai = new GoogleGenAI({ apiKey: 'AIzaSyBT94ZS6t85fvOcGa27CbBLO1qlvhoaPTU' });

export const generateAIExplanation = async (
  profile: InvestmentProfile,
  allocation: PortfolioAllocation,
  investorType: string,
  projectedCorpus: number
): Promise<string> => {
  
  const prompt = `
    You are a friendly financial guide explaining an investment plan to a beginner (Explain Like I'm 5).
    Do NOT use big financial words. Keep it extremely simple.
    Start directly with the first header.
    
    **User:** Age ${profile.age}, Goal: ${profile.financialGoal}
    **Plan:** Equity ${allocation.equity}%, Debt ${allocation.debt}%, Gold ${allocation.gold}%

    Return exactly these 3 brief sections formatted with Markdown headers:

    ### The Simple Plan
    [One simple sentence. Example: "We are buying pieces of big companies so your money grows fast."]

    ### Why this fits you
    [One simple sentence. Example: "Since you are young, you can wait for the money to grow big."]

    ### Your First Step
    * [One specific action. Example: "Set up your automatic transfer of ${profile.currency}${profile.monthlySavingsTarget} today."]
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
): Promise<{ 
  allocation: PortfolioAllocation,
  etf: Omit<StockRecommendation, 'amount'>[], 
  stocks: Omit<StockRecommendation, 'amount'>[] 
}> => {

  const prompt = `
    Act as a senior financial strategist.
    
    1. Determine the optimal Asset Allocation (Equity %, Debt %, Gold %) for this user:
       - Profile: ${profile.age} years old, ${investorType} Risk Profile.
       - Goal: ${profile.financialGoal}.
       - Current Market Context: Assume current real-world market conditions.
       - Constraint: Equity + Debt + Gold must equal 100.
    
    2. Generate investment recommendations for a ${investorType} investor in currency '${profile.currency}'.
       - Provide TWO lists: 'etf' (3-4 items) and 'stocks' (4-5 items).
       - If currency is '₹', use NSE/BSE tickers. If '$', use US tickers.
       - The 'allocationPercent' in each list must sum up to 100.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      allocation: {
        type: Type.OBJECT,
        description: "Recommended asset split based on current market data and user profile",
        properties: {
            equity: { type: Type.NUMBER, description: "Percentage for Stocks/Equity" },
            debt: { type: Type.NUMBER, description: "Percentage for Bonds/FDs" },
            gold: { type: Type.NUMBER, description: "Percentage for Gold/Commodities" }
        },
        required: ["equity", "debt", "gold"]
      },
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
    required: ["allocation", "etf", "stocks"]
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
    You are a friendly and encouraging financial advisor assistant for a COMPLETE BEGINNER.
    You are chatting with a user about their specifically generated investment plan.
    
    **Context:**
    - Goal: ${profile.financialGoal}
    - Monthly Investment: ${profile.currency}${profile.monthlySavingsTarget}
    - Horizon: ${profile.investmentHorizonYears} years
    - Risk Profile: ${profile.riskTolerance} (Score: ${riskScore}/100)
    - Asset Allocation: Equity ${allocation.equity}%, Debt ${allocation.debt}%, Gold ${allocation.gold}%
    
    **Rules:**
    - Use extremely simple language. No jargon.
    - Explain concepts like "Equity" as "buying small pieces of companies" and "Debt" as "loaning money safely".
    - Answer questions specifically about *this* plan.
    - Keep answers concise (max 2-3 sentences) unless asked for details.
    - Be professional but conversational.
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
  });
};
