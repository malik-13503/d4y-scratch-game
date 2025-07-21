// Authentication utilities for session management
export const AUTH_STORAGE_KEY = 'hit_the_road_jackpot_auth';

export interface StoredAuth {
  isAuthenticated: boolean;
  user?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    cardOnFile: boolean;
  };
  timestamp: number;
}

export const saveAuthToStorage = (user: any) => {
  const authData: StoredAuth = {
    isAuthenticated: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      cardOnFile: user.cardOnFile
    },
    timestamp: Date.now()
  };
  
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
};

export const getAuthFromStorage = (): StoredAuth | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    
    const authData: StoredAuth = JSON.parse(stored);
    
    // Check if auth is expired (30 days for maximum persistence)
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - authData.timestamp > THIRTY_DAYS) {
      clearAuthFromStorage();
      return null;
    }
    
    return authData;
  } catch (error) {
    console.error('Error reading auth from storage:', error);
    clearAuthFromStorage();
    return null;
  }
};

export const clearAuthFromStorage = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const isAuthValid = (): boolean => {
  const authData = getAuthFromStorage();
  return authData?.isAuthenticated || false;
};