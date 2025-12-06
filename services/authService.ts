import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

const USER_KEY = 'ai_advisor_active_user';
const USERS_DB_KEY = 'ai_advisor_users_db';

// Helper to get all registered users
const getUsersDB = (): Record<string, any> => {
  const db = localStorage.getItem(USERS_DB_KEY);
  return db ? JSON.parse(db) : {};
};

export const login = async (username: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const db = getUsersDB();
  const userRecord = Object.values(db).find((u: any) => u.username === username);

  if (!userRecord || userRecord.password !== password) {
    throw new Error('Invalid username or password');
  }

  const user: User = { 
    id: userRecord.id, 
    username: userRecord.username, 
    email: userRecord.email 
  };
  
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const register = async (username: string, email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const db = getUsersDB();
  
  // Check if username exists
  if (Object.values(db).some((u: any) => u.username === username)) {
    throw new Error('Username already taken');
  }

  const newUser = {
    id: uuidv4(),
    username,
    email,
    password // In a real app, never store plain text passwords!
  };

  db[newUser.id] = newUser;
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));

  const user: User = { 
    id: newUser.id, 
    username: newUser.username, 
    email: newUser.email 
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};