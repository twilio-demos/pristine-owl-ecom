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

// Helper function to get session from cookie string (for API routes)
export const getSessionFromCookieString = (cookieString: string | null): SessionData | null => {
  if (!cookieString) return null;
  
  const sessionMatch = cookieString.match(/session_id=([^;]+)/);
  if (!sessionMatch) return null;
  
  const sessionId = sessionMatch[1];
  return getSession(sessionId);
};

// Simplified session helper for API routes
export const getSessionFromRequest = async (): Promise<SessionData | null> => {
  // This will be used in API routes with proper cookie handling
  return null;
};

// Cart and user management
export const getCurrentUser = () => currentUser;
export const setCurrentUser = (user: any) => { currentUser = user; };
export const getUserCart = () => userCart;
export const setUserCart = (cart: any[]) => { userCart = cart; };