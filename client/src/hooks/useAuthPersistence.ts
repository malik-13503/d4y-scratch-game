import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saveAuthToStorage, getAuthFromStorage, clearAuthFromStorage } from '@/lib/auth';

export function useAuthPersistence() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get initial auth from localStorage
  const storedAuth = getAuthFromStorage();
  
  // Try to get user from server
  const { data: serverUser, isLoading: serverLoading, error } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    // If we get user from server, save to localStorage
    if (serverUser) {
      saveAuthToStorage(serverUser);
    }
    // If server returns 401, clear localStorage
    else if (error && storedAuth) {
      clearAuthFromStorage();
    }
    
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [serverUser, error, storedAuth, isInitialized]);

  // Check if localStorage auth is still valid (within 7 days)
  const isStoredAuthValid = storedAuth && storedAuth.timestamp && 
    (Date.now() - storedAuth.timestamp) < (7 * 24 * 60 * 60 * 1000);

  // Determine authentication state
  const isAuthenticated = !!(serverUser || (isStoredAuthValid && !error));
  const user = serverUser || (isStoredAuthValid ? storedAuth.user : null);
  const isLoading = !isInitialized || (serverLoading && !isStoredAuthValid);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized
  };
}