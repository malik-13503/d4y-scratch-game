import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { saveAuthToStorage, getAuthFromStorage, clearAuthFromStorage } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';

export function useAuthPersistence() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get initial auth from localStorage
  const storedAuth = getAuthFromStorage();
  
  // Try to get user from server
  const { data: serverUser, isLoading: serverLoading, error, refetch } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    // If we get user from server, save to localStorage
    if (serverUser) {
      console.log("Received user from server, saving to localStorage");
      saveAuthToStorage(serverUser);
      setIsInitialized(true);
    }
    // If server returns 401 but we have valid localStorage auth, redirect to login
    else if (error && storedAuth && isStoredAuthValid) {
      console.log("Server session lost but localStorage is valid. User needs to re-authenticate.");
      // Keep localStorage for now but user will need to login again
      setIsInitialized(true);
    }
    // Clear expired localStorage auth
    else if (error && storedAuth && !isStoredAuthValid) {
      console.log("Stored auth is expired, clearing localStorage");
      clearAuthFromStorage();
      setIsInitialized(true);
    }
    // No server user and no stored auth
    else if (!serverUser && !storedAuth) {
      setIsInitialized(true);
    }
  }, [serverUser, error, storedAuth]);

  // Check if localStorage auth is still valid (within 7 days)
  const isStoredAuthValid = storedAuth && storedAuth.timestamp && 
    (Date.now() - storedAuth.timestamp) < (7 * 24 * 60 * 60 * 1000);
  
  useEffect(() => {
    if (isStoredAuthValid && storedAuth) {
      console.log("Restored authentication from localStorage for user:", storedAuth.user?.email);
    }
  }, [isStoredAuthValid, storedAuth]);

  // Determine authentication state - only trust server user, not localStorage
  const isAuthenticated = !!serverUser;
  const user = serverUser;
  const isLoading = !isInitialized || serverLoading;

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized
  };
}