import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saveAuthToStorage, getAuthFromStorage, clearAuthFromStorage } from '@/lib/auth';

export function useAuthPersistence() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Try to get user from server, but also check localStorage
  const { data: serverUser, isLoading: serverLoading, error } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: 0,
  });

  const [localAuth, setLocalAuth] = useState(() => getAuthFromStorage());

  useEffect(() => {
    // If we get user from server, save to localStorage
    if (serverUser) {
      saveAuthToStorage(serverUser);
      setLocalAuth({
        isAuthenticated: true,
        user: serverUser,
        timestamp: Date.now()
      });
    }
    // If server returns 401 but we have localStorage auth, clear it
    else if (error && localAuth) {
      clearAuthFromStorage();
      setLocalAuth(null);
    }
    
    setIsInitialized(true);
  }, [serverUser, error, localAuth]);

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