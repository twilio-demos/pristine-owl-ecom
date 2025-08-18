import { cookies } from 'next/headers';
import { type SessionData } from '@/types';

// In-memory storage for demo purposes
// In production, use Redis or a database
const sessions = new Map<string, SessionData>();
let currentUser: any = null;
let userCart: any[] = [];

export const generateSessionId = (): string => {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
};

export const createSession = (userData: { user_id: string; email: string; name: string }) => {
  const sessionId = generateSessionId();
  const sessionData: SessionData = {
    ...userData,
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  
  sessions.set(sessionId, sessionData);
  return sessionId;
};

export const getSession = (sessionId: string): SessionData | null => {
  const session = sessions.get(sessionId);
  
  if (!session || session.expires < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session;
};

export const deleteSession = (sessionId: string) => {
  sessions.delete(sessionId);
};

export const getSessionFromRequest = async (): Promise<SessionData | null> => {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    if (!sessionId) return null;
    
    return getSession(sessionId);
  } catch (error) {
    return null;
  }
};

// Cart and user management
export const getCurrentUser = () => currentUser;
export const setCurrentUser = (user: any) => { currentUser = user; };
export const getUserCart = () => userCart;
export const setUserCart = (cart: any[]) => { userCart = cart; };