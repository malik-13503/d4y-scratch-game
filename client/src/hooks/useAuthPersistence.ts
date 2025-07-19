import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saveAuthToStorage, getAuthFromStorage, clearAuthFromStorage } from '@/lib/auth';

export function useAuthPersistence() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [localAuth] = useState(() => getAuthFromStorage());
  
  // Try to get user from server, but also check localStorage
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
    else if (error) {
      clearAuthFromStorage();
    }
    
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [serverUser, error, isInitialized]);

  // Determine authentication state
  const isAuthenticated = !!(serverUser || (localAuth && !error));
  const user = serverUser || localAuth?.user;
  const isLoading = !isInitialized || serverLoading;

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized
  };
}