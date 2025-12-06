import { AdvisorResult } from '../types';

const HISTORY_KEY = 'ai_advisor_history';

export const saveHistory = (userId: string, result: AdvisorResult) => {
  const existingStr = localStorage.getItem(HISTORY_KEY);
  let history: Record<string, AdvisorResult[]> = existingStr ? JSON.parse(existingStr) : {};
  
  if (!history[userId]) {
    history[userId] = [];
  }
  
  // Add new result to the beginning
  history[userId].unshift(result);
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getHistory = (userId: string): AdvisorResult[] => {
  const existingStr = localStorage.getItem(HISTORY_KEY);
  if (!existingStr) return [];
  
  const history: Record<string, AdvisorResult[]> = JSON.parse(existingStr);
  return history[userId] || [];
};

export const getPlanById = (id: string): AdvisorResult | undefined => {
  const existingStr = localStorage.getItem(HISTORY_KEY);
  if (!existingStr) return undefined;
  
  const history: Record<string, AdvisorResult[]> = JSON.parse(existingStr);
  
  // Search through all users' history to find the plan
  // Since IDs are unique UUIDs, this is safe
  for (const userId in history) {
    const found = history[userId].find(r => r.id === id);
    if (found) return found;
  }
  return undefined;
};