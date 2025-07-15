import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import PaymentGuide from "@/pages/payment-guide";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/game/:id" component={GamePage} />
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
      <Route path="/payment-guide" component={PaymentGuide} />
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
