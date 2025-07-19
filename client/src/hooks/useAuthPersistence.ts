import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saveAuthToStorage, getAuthFromStorage, clearAuthFromStorage } from '@/lib/auth';

export function useAuthPersistence() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [localAuth, setLocalAuth] = useState(() => getAuthFromStorage());
  
  // Try to get user from server
  const { data: serverUser, isLoading: serverLoading, error } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: 0,
  });

  const updateLocalAuth = useCallback((user: any) => {
    if (user) {
      const authData = {
        isAuthenticated: true,
        user,
        timestamp: Date.now()
      };
      saveAuthToStorage(user);
      setLocalAuth(authData);
    } else {
      clearAuthFromStorage();
      setLocalAuth(null);
    }
  }, []);

  useEffect(() => {
    // If we get user from server, save to localStorage
    if (serverUser) {
      updateLocalAuth(serverUser);
    }
    // If server returns 401, clear localStorage
    else if (error) {
      updateLocalAuth(null);
    }
    
    setIsInitialized(true);
  }, [serverUser, error, updateLocalAuth]);

  // Check if localStorage auth is still valid (within 24 hours)
  const isLocalAuthValid = localAuth && localAuth.timestamp && 
    (Date.now() - localAuth.timestamp) < (24 * 60 * 60 * 1000);

  // Determine authentication state
  const isAuthenticated = !!(serverUser || (isLocalAuthValid && !error));
  const user = serverUser || (isLocalAuthValid ? localAuth?.user : null);
  const isLoading = !isInitialized || (serverLoading && !isLocalAuthValid);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized
  };
}