import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { saveAuthToStorage, getAuthFromStorage, clearAuthFromStorage } from "@/lib/auth";
import Home from "@/pages/home";
import GamePage from "@/pages/game";
import AdminPage from "@/pages/admin";
import AdminLoginPage from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import HowToPlay from "@/pages/how-to-play";
import PrizeRules from "@/pages/prize-rules";
import Contact from "@/pages/contact";
import Terms from "@/pages/terms";
import GameInfo from "@/pages/game-info";
import InstantPlay from "@/pages/instant-play";
import RealPrizes from "@/pages/real-prizes";
import FreeSpins from "@/pages/free-spins";
import WelcomePage from "@/pages/welcome";
import AuthLandingPage from "@/pages/auth-landing";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Achievements from "@/pages/achievements";
import MyNumbers from "@/pages/my-numbers";

import NotFound from "@/pages/not-found";

function Router() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  
  const { data: serverUser, isLoading: serverLoading, error } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    // Initialize from localStorage on app startup ONLY
    const storedAuth = getAuthFromStorage();
    if (storedAuth && storedAuth.isAuthenticated && !user) {
      console.log("Restored authentication from localStorage");
      setUser(storedAuth.user);
    }
  }, []); // Only run once on app startup

  useEffect(() => {
    // Handle server authentication responses
    if (serverUser) {
      console.log("Server authenticated user:", serverUser);
      setUser(serverUser);
      saveAuthToStorage(serverUser);
    } else if (error && !serverLoading) {
      // Only clear auth if server explicitly rejects and significant time has passed
      const storedAuth = getAuthFromStorage();
      if (storedAuth && (Date.now() - storedAuth.timestamp) > 7200000) { // 2 hours grace period
        console.log("Clearing expired authentication after 2 hours");
        clearAuthFromStorage();
        setUser(null);
      } else if (storedAuth) {
        // Keep using localStorage auth for server connectivity issues
        console.log("Maintaining cached authentication during server issues");
        // Keep user authenticated with localStorage data
        if (!user) {
          setUser(storedAuth.user);
        }
      }
    }
    
    // Mark authentication check as complete after server response
    setIsCheckingAuth(false);
  }, [serverUser, serverLoading, error]);

  // Show loading spinner while checking auth state
  if (isCheckingAuth || serverLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isAuthenticated = !!user;

  return (
    <Switch>
      {/* Authentication required routes */}
      {isAuthenticated ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/games" component={Home} />
          <Route path="/game/:id" component={GamePage} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/my-numbers" component={MyNumbers} />
        </>
      ) : (
        <>
          <Route path="/" component={AuthLandingPage} />
          {/* Redirect authenticated routes to login */}
          <Route path="/games" component={AuthLandingPage} />
          <Route path="/game/:id" component={AuthLandingPage} />
          <Route path="/dashboard" component={AuthLandingPage} />
          <Route path="/transactions" component={AuthLandingPage} />
          <Route path="/achievements" component={AuthLandingPage} />
          <Route path="/my-numbers" component={AuthLandingPage} />
        </>
      )}
      
      {/* Public routes always available */}
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin-login" component={AdminLoginPage} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/how-to-play" component={HowToPlay} />
      <Route path="/prize-rules" component={PrizeRules} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/game-info" component={GameInfo} />
      <Route path="/instant-play" component={InstantPlay} />
      <Route path="/real-prizes" component={RealPrizes} />
      <Route path="/free-spins" component={FreeSpins} />
      <Route path="/welcome" component={WelcomePage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
