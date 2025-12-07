
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { InvestmentProfile, PortfolioAllocation, StockRecommendation, EquityBreakdown } from '../types';

const ai = new GoogleGenAI({ apiKey: 'AIzaSyBT94ZS6t85fvOcGa27CbBLO1qlvhoaPTU' });

export const generateAIExplanation = async (
  profile: InvestmentProfile,
  allocation: PortfolioAllocation,
  investorType: string,
  projectedCorpus: number,
  equityBreakdown?: EquityBreakdown
): Promise<string> => {
  
  let stocksContext = "";
  if (equityBreakdown) {
    // Combine ETFs and Stocks for context
    const allAssets = [...equityBreakdown.etf, ...equityBreakdown.stocks];
    // Take top 5 assets with sector info to give AI enough context
    const assetDetails = allAssets.slice(0, 5).map(s => `${s.symbol} (${s.sector})`).join(', ');
    stocksContext = `Recommended Assets: ${assetDetails}`;
  }

  const prompt = `
    Act as a knowledgeable financial advisor.
    Analyze this investment plan for a ${profile.age}-year-old user with the goal: "${profile.financialGoal}".
    Risk Profile: ${investorType}.
    Allocation: ${allocation.equity}% Equity, ${allocation.debt}% Debt, ${allocation.gold}% Gold.
    ${stocksContext}

    **Strict Output Format (4 bullet points):**
    • **Strategy:** [Short, catchy strategy name]
    • **Why It Fits:** [Briefly explain alignment with age/risk]
    • **Asset Spotlight:** [Specifically mention 1-2 assets from the provided list. Explain their sector relevance or why they were chosen (e.g. "Tech for growth", "Banking for stability"). Be specific.]
    • **Action:** [One simple next step]

    Use clear, accessible language. Total length under 100 words.
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
