import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
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
import Privacy from "@/pages/privacy";
import OfficialRules from "@/pages/official-rules";
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
import WalletPage from "@/pages/wallet";
import AddCreditsPage from "@/pages/add-credits";
import { TokenPurchase } from "@/components/token-purchase";
import NotFound from "@/pages/not-found";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const { data: serverUser, isLoading: serverLoading, error } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    const storedAuth = getAuthFromStorage();
    if (storedAuth && storedAuth.isAuthenticated && !user) {
      console.log("Restored authentication from localStorage");
      setUser(storedAuth.user);
    }
  }, []);

  useEffect(() => {
    if (serverUser) {
      console.log("Server authenticated user:", serverUser);
      setUser(serverUser);
      saveAuthToStorage(serverUser);
      setIsCheckingAuth(false);
    } else if (error && !serverLoading) {
      const storedAuth = getAuthFromStorage();
      if (storedAuth && storedAuth.isAuthenticated) {
        console.log("Server authentication failed, using stored authentication for user:", storedAuth.user?.email);
        setUser(storedAuth.user);
        setIsCheckingAuth(false);
      } else {
        console.log("No authentication available");
        setUser(null);
        setIsCheckingAuth(false);
      }
    } else if (!serverLoading && !serverUser && !error) {
      const storedAuth = getAuthFromStorage();
      if (storedAuth && storedAuth.isAuthenticated) {
        console.log("No server session, but using stored authentication for user:", storedAuth.user?.email);
        setUser(storedAuth.user);
      } else {
        setUser(null);
      }
      setIsCheckingAuth(false);
    }
  }, [serverUser, serverLoading, error]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isAuthenticated = !!user;

  return (
    <Switch>
      {isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/games" component={Home} />
          <Route path="/game/:id" component={GamePage} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/my-numbers" component={MyNumbers} />
          <Route path="/tokens" component={TokenPurchase} />
          <Route path="/wallet" component={WalletPage} />
          <Route path="/add-credits" component={AddCreditsPage} />
        </>
      ) : (
        <>
          <Route path="/" component={AuthLandingPage} />
          <Route path="/games" component={AuthLandingPage} />
          <Route path="/game/:id" component={AuthLandingPage} />
          <Route path="/dashboard" component={AuthLandingPage} />
          <Route path="/transactions" component={AuthLandingPage} />
          <Route path="/achievements" component={AuthLandingPage} />
          <Route path="/my-numbers" component={AuthLandingPage} />
          <Route path="/tokens" component={AuthLandingPage} />
          <Route path="/wallet" component={AuthLandingPage} />
          <Route path="/add-credits" component={AuthLandingPage} />
        </>
      )}
      
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin-login" component={AdminLoginPage} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/how-to-play" component={HowToPlay} />
      <Route path="/prize-rules" component={PrizeRules} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/official-rules" component={OfficialRules} />
      <Route path="/game-info" component={GameInfo} />
      <Route path="/instant-play" component={InstantPlay} />
      <Route path="/real-prizes" component={RealPrizes} />
      <Route path="/free-spins" component={FreeSpins} />
      <Route path="/welcome" component={WelcomePage} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ScrollToTop />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
