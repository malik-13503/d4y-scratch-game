import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { saveAuthToStorage, getAuthFromStorage, clearAuthFromStorage } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';

export function useAuthPersistence() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);
  
  // Get initial auth from localStorage
  const storedAuth = getAuthFromStorage();
  
  // Session restoration mutation
  const restoreSessionMutation = useMutation({
    mutationFn: async ({ userId, email }: { userId: number; email: string }) => {
      const response = await apiRequest("POST", "/api/restore-session", { userId, email });
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Session restored successfully:", data.user.email);
      saveAuthToStorage(data.user);
      setSessionRestored(true);
    },
    onError: (error) => {
      console.error("Session restoration failed:", error);
      clearAuthFromStorage();
    }
  });
  
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
    }
    // If server returns 401 but we have localStorage auth, try to re-establish session
    else if (error && storedAuth && isStoredAuthValid && !sessionRestored && !restoreSessionMutation.isPending) {
      console.log("Server session lost, attempting to restore from localStorage auth");
      restoreSessionMutation.mutate({
        userId: storedAuth.user!.id,
        email: storedAuth.user!.email
      });
    }
    // Only clear localStorage if error persists and stored auth is old
    else if (error && storedAuth && !isStoredAuthValid) {
      console.log("Stored auth is expired, clearing localStorage");
      clearAuthFromStorage();
    }
    
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [serverUser, error, storedAuth, isInitialized, sessionRestored, restoreSessionMutation]);

  // Refetch user data after successful session restoration
  useEffect(() => {
    if (sessionRestored) {
      refetch();
    }
  }, [sessionRestored, refetch]);

  // Check if localStorage auth is still valid (within 7 days)
  const isStoredAuthValid = storedAuth && storedAuth.timestamp && 
    (Date.now() - storedAuth.timestamp) < (7 * 24 * 60 * 60 * 1000);
  
  useEffect(() => {
    if (isStoredAuthValid && storedAuth) {
      console.log("Restored authentication from localStorage for user:", storedAuth.user?.email);
    }
  }, [isStoredAuthValid, storedAuth]);

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