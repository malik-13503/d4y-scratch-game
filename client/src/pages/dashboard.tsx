import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MobileNav from "@/components/MobileNav";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { logout } from "@/lib/auth";
import { 
  User, 
  Trophy, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  ArrowLeft,
  CreditCard,
  Target,
  Coins,
  Award,
  Activity,
  Clock,
  Gamepad2,
  RefreshCw,
  Hash,
  ChevronRight,
  Settings,
  Gauge,
  Crown,
  Shield,
  LogOut,
  Gift,
  Tag,
  CheckCircle,
  Timer,
  Copy,
  Share2,
  Bell,
} from "lucide-react";
import logoPath from "@assets/logo_1777237644041.png";

// Achievement calculation function
const getAchievements = (userStats: any) => {
  const stats = userStats || { totalSpins: 0, totalWins: 0, freeSpins: 0, totalSpent: 0 };
  
  return [
    {
      id: 'first_spin',
      title: 'First Spin',
      description: 'Complete your very first spin',
      icon: Target,
      category: 'spins',
      target: 1,
      current: stats.totalSpins,
      completed: stats.totalSpins >= 1,
      reward: 'Unlock daily bonuses',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'spin_master',
      title: 'Spin Master',
      description: 'Complete 10 spins',
      icon: Gamepad2,
      category: 'spins',
      target: 10,
      current: stats.totalSpins,
      completed: stats.totalSpins >= 10,
      reward: '$5 bonus credit',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'spin_legend',
      title: 'Spin Legend',
      description: 'Complete 50 spins',
      icon: Crown,
      category: 'spins',
      target: 50,
      current: stats.totalSpins,
      completed: stats.totalSpins >= 50,
      reward: 'VIP status upgrade',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'first_purchase',
      title: 'First Purchase',
      description: 'Make your first paid spin',
      icon: Award,
      category: 'spending',
      target: 1,
      current: stats.totalSpent > 0 ? 1 : 0,
      completed: stats.totalSpent > 0,
      reward: '10% discount on next spin',
      color: 'from-emerald-500 to-green-500'
    },
    {
      id: 'big_spender',
      title: 'Big Spender',
      description: 'Spend $100 total',
      icon: DollarSign,
      category: 'spending',
      target: 100,
      current: stats.totalSpent,
      completed: stats.totalSpent >= 100,
      reward: 'Free spin voucher',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'first_win',
      title: 'Lucky Beginner',
      description: 'Get your first win',
      icon: Trophy,
      category: 'wins',
      target: 1,
      current: stats.totalWins,
      completed: stats.totalWins >= 1,
      reward: 'Winner badge',
      color: 'from-yellow-400 to-yellow-600'
    }
  ];
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [currentTab, setCurrentTab] = useState('overview');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const { toast } = useToast();
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    // Update URL without page reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', value);
    window.history.pushState({}, '', newUrl.toString());
  };

  // Initialize tab from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab') || 'overview';
    setCurrentTab(tabFromUrl);
  }, []);

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user/game-history"] });
  };
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user && currentTab === 'overview',
    refetchInterval: currentTab === 'overview' ? 10000 : false, // Only refresh on overview tab
    refetchOnWindowFocus: false, // Disable aggressive refetching
    staleTime: 30000, // Cache for 30 seconds
  });

  const { data: gameHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/user/game-history"],
    enabled: !!user && currentTab === 'overview',
    refetchInterval: currentTab === 'overview' ? 10000 : false, // Only refresh on overview tab
    refetchOnWindowFocus: false, // Disable aggressive refetching
    staleTime: 30000, // Cache for 30 seconds
  });

  // Transactions data for Transactions tab
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user && currentTab === 'transactions',
    refetchInterval: currentTab === 'transactions' ? 10000 : false,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  // Achievement data for Achievements tab
  const { data: achievementData, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user && currentTab === 'achievements',
    refetchInterval: currentTab === 'achievements' ? 10000 : false,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const { data: walletData, isLoading: walletLoading } = useQuery<{
    balance: number;
    payments: any[];
    transactions: any[];
  }>({
    queryKey: ["/api/wallet"],
    enabled: !!user && currentTab === 'payment',
    refetchInterval: currentTab === 'payment' ? 15000 : false,
    staleTime: 10000,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background:"#08080f"}}>
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Use useEffect to avoid setState during render
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation('/');
    }
  }, [userLoading, user, setLocation]);

  if (!user) {
    return null;
  }



  const handleCardSetupSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    handleTabChange('overview');
  };

  // Change Password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest("POST", "/api/user/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      setChangePasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
    },
  });

  // Delete Account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/user/delete-account");
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account.",
        variant: "destructive",
      });
    },
  });

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== 'DELETE') {
      toast({
        title: "Error",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }
    deleteAccountMutation.mutate();
  };

  return (
    <div className="min-h-screen" style={{background:"#08080f"}}>
      {/* Background glow orbs matching homepage */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{zIndex:0}}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full" style={{background:"radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)",filter:"blur(40px)"}}/>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full" style={{background:"radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%)",filter:"blur(40px)"}}/>
      </div>

      {/* Header — matches homepage nav */}
      <header className="relative z-10 sticky top-0" style={{background:"rgba(8,8,15,0.85)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(124,58,237,0.2)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocation("/games")}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Games</span>
              </button>
              <div className="w-px h-5 bg-white/10" />
              <img src={logoPath} alt="Prize Plugz" className="h-7 w-auto" />
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">My Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshData}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
                style={{background:"rgba(124,58,237,0.25)", border:"1px solid rgba(124,58,237,0.4)"}}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 transition-all hover:text-red-300"
                style={{background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)"}}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* User Profile Section */}
        <div className="mb-6 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5"
          style={{background:"#131124", border:"1px solid rgba(124,58,237,0.3)", boxShadow:"0 0 40px rgba(124,58,237,0.08)"}}>
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
              style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)", boxShadow:"0 0 24px rgba(124,58,237,0.5)"}}>
              <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{background:"#22c55e", borderColor:"#08080f"}}>
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-white truncate">
              {(user as any).firstName && (user as any).lastName ? `${(user as any).firstName} ${(user as any).lastName}` : 'Player'}
            </h2>
            <p className="text-gray-400 text-sm truncate">{(user as any).email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-green-300 uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.3)"}}>● ONLINE</span>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex-shrink-0">
            <span className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${(user as any).cardOnFile ? "text-emerald-300" : "text-red-300"}`}
              style={(user as any).cardOnFile
                ? {background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.3)"}
                : {background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)"}}>
              <CreditCard className="h-4 w-4" />
              {(user as any).cardOnFile ? "Payment Verified" : "Payment Required"}
            </span>
          </div>
        </div>

        {/* Tabs for Dashboard Sections */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          {/* Tabs — unified scrollable bar matching homepage pill style */}
          <div className="overflow-x-auto scrollbar-hide mb-6">
            <TabsList className="flex gap-1 p-1.5 rounded-2xl min-w-max"
              style={{background:"#131124", border:"1px solid rgba(255,255,255,0.06)"}}>
              {[
                { value:"overview",      icon: Gauge,      label:"Overview"     },
                { value:"transactions",  icon: Activity,   label:"Transactions" },
                { value:"achievements",  icon: Award,      label:"Achievements" },
                { value:"payment",       icon: CreditCard, label:"Payment"      },
                { value:"cards",         icon: Shield,     label:"My Cards"     },
                { value:"system",        icon: Settings,   label:"System"       },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger key={value} value={value}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 transition-all whitespace-nowrap data-[state=active]:text-white"
                  style={{} as any}>
                  <Icon className="h-4 w-4" />{label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats row — dark cards matching homepage */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-2">
              {/* Buy Tokens CTA */}
              <div className="col-span-2 sm:col-span-1 rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-all group"
                style={{background:"linear-gradient(135deg,rgba(234,179,8,0.18),rgba(234,88,12,0.18))", border:"1px solid rgba(234,179,8,0.35)", boxShadow:"0 0 20px rgba(234,179,8,0.08)"}}
                onClick={() => window.location.href = '/tokens'}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl" style={{background:"linear-gradient(135deg,#eab308,#ea580c)"}}>
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-yellow-200 text-sm font-bold">Buy Tokens</p>
                </div>
                <button className="w-full py-2 rounded-xl text-xs font-black text-white"
                  style={{background:"linear-gradient(135deg,#eab308,#ea580c)"}}>
                  Purchase Tokens →
                </button>
              </div>

              {[
                { label:"Wins", value: statsLoading ? "..." : String((userStats as any)?.totalWins || 0), icon: Trophy, color:"#10b981", bg:"rgba(16,185,129,0.15)", border:"rgba(16,185,129,0.3)" },
                { label:"Total Spent", value: `$${statsLoading ? "..." : ((userStats as any)?.totalSpent || 0).toFixed(2)}`, icon: DollarSign, color:"#3b82f6", bg:"rgba(59,130,246,0.15)", border:"rgba(59,130,246,0.3)" },
                { label:"Spins", value: statsLoading ? "..." : String((userStats as any)?.totalSpins || 0), icon: Target, color:"#a78bfa", bg:"rgba(167,139,250,0.15)", border:"rgba(167,139,250,0.3)" },
                { label:"Free Spins", value: statsLoading ? "..." : String((userStats as any)?.freeSpins || 0), icon: Award, color:"#f59e0b", bg:"rgba(245,158,11,0.15)", border:"rgba(245,158,11,0.3)" },
              ].map(({ label, value, icon: Icon, color, bg, border }) => (
                <div key={label} className="rounded-2xl p-5 flex flex-col gap-2"
                  style={{background:"#131124", border:`1px solid ${border}`, boxShadow:`0 0 16px ${bg}`}}>
                  <div className="p-2.5 rounded-xl w-fit" style={{background:bg}}>
                    <Icon className="h-5 w-5" style={{color}} />
                  </div>
                  <p className="text-gray-400 text-xs font-semibold">{label}</p>
                  <p className="text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
          {[
            { label:"Play Games",   sub:"Spin & win prizes",    icon: Target,   color:"#7c3aed", bg:"rgba(124,58,237,0.15)", border:"rgba(124,58,237,0.3)", btnLabel:"Play Now",       action: () => setLocation("/games") },
            { label:"Transactions", sub:"Payment history",      icon: CreditCard, color:"#10b981", bg:"rgba(16,185,129,0.15)", border:"rgba(16,185,129,0.3)", btnLabel:"View History",  action: () => setLocation("/transactions") },
            { label:"Achievements", sub:"Track milestones",     icon: Trophy,   color:"#f59e0b", bg:"rgba(245,158,11,0.15)", border:"rgba(245,158,11,0.3)", btnLabel:"View Progress", action: () => handleTabChange("achievements") },
            { label:"My Numbers",   sub:"View all your spins",  icon: Hash,     color:"#06b6d4", bg:"rgba(6,182,212,0.15)", border:"rgba(6,182,212,0.3)", btnLabel:"View Numbers",  action: () => setLocation("/my-numbers") },
          ].map(({ label, sub, icon: Icon, color, bg, border, btnLabel, action }) => (
            <div key={label} className="rounded-2xl p-5 flex flex-col gap-4 cursor-pointer hover:scale-[1.02] transition-all"
              style={{background:"#131124", border:`1px solid ${border}`}}
              onClick={action}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{background:bg}}>
                  <Icon className="h-6 w-6" style={{color}} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{label}</p>
                  <p className="text-gray-500 text-xs">{sub}</p>
                </div>
              </div>
              <button className="w-full py-2 rounded-xl text-xs font-black text-white transition-all"
                style={{background:bg, border:`1px solid ${border}`}}>
                {btnLabel} →
              </button>
            </div>
          ))}
        </div>

        {/* Daily Tokens + Promo Code Section */}
        <DailyTokensAndPromoSection />

        {/* Live Activity */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{background:"#131124", border:"1px solid rgba(255,255,255,0.06)"}}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{background:"rgba(124,58,237,0.2)"}}>
                <Activity className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-white font-black text-base">Live Activity</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-300">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />LIVE
            </span>
          </div>
          <div className="p-5">
            <div className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)"}}>
              <p className="text-gray-300 font-medium text-sm">Welcome to your dashboard! Start playing games to see your activity here.</p>
              <p className="text-gray-600 text-xs mt-1">Your spins and wins will appear in real-time</p>
            </div>
          </div>
        </div>

        {/* Game History */}
        <div className="rounded-2xl overflow-hidden" style={{background:"#131124", border:"1px solid rgba(255,255,255,0.06)"}}>
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
            <div className="p-2 rounded-lg" style={{background:"rgba(124,58,237,0.2)"}}>
              <Gamepad2 className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-white font-black text-base">Recent Game History</span>
          </div>
          <div className="p-5">
            {historyLoading ? (
              <div className="flex items-center justify-center py-10 gap-3">
                <div className="animate-spin w-7 h-7 border-4 border-purple-500 border-t-transparent rounded-full" />
                <p className="text-gray-400">Loading history...</p>
              </div>
            ) : !gameHistory || (gameHistory as any).length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="h-14 w-14 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-black text-white mb-2">No Games Played Yet</h3>
                <p className="text-gray-500 text-sm mb-6">Start playing to see your game history here!</p>
                <button onClick={() => setLocation('/games')}
                  className="px-6 py-3 rounded-xl font-black text-sm text-white"
                  style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)"}}>
                  🎮 Start Playing Now
                </button>
              </div>
            ) : (
              <div className="divide-y" style={{borderColor:"rgba(255,255,255,0.05)"}}>
                {(gameHistory as any).slice(0, 5).map((game: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl" style={{background:"rgba(124,58,237,0.15)"}}>
                        <Gamepad2 className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Game #{game.id}</p>
                        <p className="text-gray-500 text-xs">Recent activity</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-400 font-bold text-sm">${game.amount}</p>
                      <p className="text-gray-600 text-xs">{new Date(game.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <div className="rounded-2xl overflow-hidden" style={{background:"#131124", border:"1px solid rgba(255,255,255,0.06)"}}>
              <div className="flex items-center gap-2 px-5 py-4 border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
                <div className="p-2 rounded-lg" style={{background:"rgba(59,130,246,0.2)"}}>
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-white font-black text-base">Transaction History</span>
              </div>
              <div className="p-5">
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-10 gap-3">
                    <div className="animate-spin w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full" />
                    <p className="text-gray-400">Loading transactions...</p>
                  </div>
                ) : !transactions || (transactions as any).length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-14 w-14 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-white mb-2">No Transactions Yet</h3>
                    <p className="text-gray-500 text-sm mb-6">Start playing games to see your transaction history!</p>
                    <button onClick={() => setLocation('/games')}
                      className="px-6 py-3 rounded-xl font-black text-sm text-white"
                      style={{background:"linear-gradient(135deg,#3b82f6,#06b6d4)"}}>
                      🎮 Start Playing Now
                    </button>
                  </div>
                ) : (
                  <div className="divide-y" style={{borderColor:"rgba(255,255,255,0.05)"}}>
                    {(transactions as any).map((transaction: any, index: number) => {
                      const isFree = parseFloat(transaction.amount) === 0;
                      return (
                        <div key={index} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl" style={{background: isFree ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)"}}>
                              {isFree ? <Trophy className="h-4 w-4 text-emerald-400" /> : <DollarSign className="h-4 w-4 text-blue-400" />}
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">Game Spin #{transaction.id}</p>
                              <p className="text-gray-500 text-xs">{isFree ? 'Free Play' : `Paid Spin - #${transaction.spunNumber || '?'}`}</p>
                              <p className="text-gray-700 text-xs">{new Date(transaction.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-black text-sm ${isFree ? "text-emerald-400" : "text-blue-400"}`}>
                              {isFree ? "FREE" : `$${parseFloat(transaction.amount).toFixed(2)}`}
                            </p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isFree ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300"}`}>
                              {isFree ? "Free" : "Paid"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="rounded-2xl overflow-hidden" style={{background:"#131124", border:"1px solid rgba(255,255,255,0.06)"}}>
              <div className="flex items-center gap-2 px-5 py-4 border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
                <div className="p-2 rounded-lg" style={{background:"rgba(245,158,11,0.2)"}}>
                  <Trophy className="h-4 w-4 text-yellow-400" />
                </div>
                <span className="text-white font-black text-base">Your Achievements</span>
              </div>
              <div className="p-5">
                {achievementsLoading ? (
                  <div className="flex items-center justify-center py-10 gap-3">
                    <div className="animate-spin w-7 h-7 border-4 border-yellow-500 border-t-transparent rounded-full" />
                    <p className="text-gray-400">Loading achievements...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getAchievements(achievementData).map((achievement: any) => (
                      <div key={achievement.id} className="rounded-xl p-5 transition-all"
                        style={achievement.completed
                          ? {background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.3)"}
                          : {background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)"}}>
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl flex-shrink-0"
                            style={achievement.completed
                              ? {background:"linear-gradient(135deg,#f59e0b,#ea580c)"}
                              : {background:"rgba(255,255,255,0.07)"}}>
                            <achievement.icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className="text-white font-black text-sm">{achievement.title}</h3>
                              {achievement.completed && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-black text-yellow-300 flex-shrink-0"
                                  style={{background:"rgba(245,158,11,0.2)"}}>✓ Done</span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs mb-3">{achievement.description}</p>
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Progress</span>
                                <span className="text-gray-400 font-medium">{achievement.current} / {achievement.target}</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.07)"}}>
                                <div className="h-full rounded-full transition-all"
                                  style={{
                                    width:`${Math.min((achievement.current / achievement.target) * 100, 100)}%`,
                                    background: achievement.completed ? "linear-gradient(90deg,#f59e0b,#ea580c)" : "linear-gradient(90deg,#7c3aed,#3b82f6)"
                                  }} />
                              </div>
                            </div>
                            {achievement.reward && (
                              <div className="mt-2 px-3 py-1.5 rounded-lg text-xs text-blue-300"
                                style={{background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.2)"}}>
                                🎁 <span className="font-semibold">Reward:</span> {achievement.reward}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            {walletLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl animate-pulse bg-white/5" />)}
              </div>
            ) : (
              <>
                {/* Token Balance Card */}
                <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
                  style={{background:"linear-gradient(135deg,rgba(124,58,237,0.2),rgba(59,130,246,0.2))", border:"1px solid rgba(124,58,237,0.35)"}}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)"}}>
                    <Coins className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm font-medium">Your Token Balance</p>
                    <p className="text-4xl font-black text-white">{walletData?.balance ?? (user as any).tokenBalance ?? 0}</p>
                    <p className="text-purple-300 text-sm mt-1">Tokens are used to spin games and win prizes</p>
                  </div>
                  <button
                    onClick={() => setLocation("/add-credits")}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex-shrink-0"
                    style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)"}}>
                    <Gift className="h-4 w-4" /> Add Tokens
                  </button>
                </div>

                {/* How it works */}
                <div className="rounded-xl p-5" style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)"}}>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" /> How to Add Tokens
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { step:"1", title:"Choose a Package", desc:"Pick a token package from $5 to $100" },
                      { step:"2", title:"Send Payment",     desc:"Pay via Cash App, Venmo, Chime, or Apple Pay" },
                      { step:"3", title:"Get Your Tokens",  desc:"Tokens credited after staff approval (usually within minutes)" },
                    ].map(({ step, title, desc }) => (
                      <div key={step} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5"
                          style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)"}}>
                          {step}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{title}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment History */}
                <div className="rounded-xl overflow-hidden" style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)"}}>
                  <div className="px-5 py-4 border-b flex items-center justify-between" style={{borderColor:"rgba(255,255,255,0.08)"}}>
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-400" /> Payment History
                    </h3>
                    <button onClick={() => setLocation("/wallet")}
                      className="text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors">
                      View All →
                    </button>
                  </div>
                  {!walletData?.payments?.length ? (
                    <div className="text-center py-12">
                      <CreditCard className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 font-semibold">No payments yet</p>
                      <p className="text-gray-600 text-sm mt-1">Your payment history will appear here</p>
                      <button onClick={() => setLocation("/add-credits")}
                        className="mt-4 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
                        style={{background:"linear-gradient(135deg,#7c3aed,#3b82f6)"}}>
                        Add Your First Tokens
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y" style={{borderColor:"rgba(255,255,255,0.05)"}}>
                      {(walletData.payments as any[]).slice(0, 5).map((p: any) => {
                        const methodLabels: Record<string,string> = { cashapp:"Cash App", venmo:"Venmo", chime:"Chime", applepay:"Apple Pay" };
                        const statusCfg =
                          p.status === "approved" ? { cls:"bg-emerald-500/20 text-emerald-300", label:"Approved" } :
                          p.status === "rejected" ? { cls:"bg-red-500/20 text-red-300",         label:"Rejected" } :
                                                    { cls:"bg-yellow-500/20 text-yellow-300",   label:"Pending"  };
                        return (
                          <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{background:"rgba(124,58,237,0.2)"}}>
                              <Coins className="h-4 w-4 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold">+{p.creditsAmount} tokens</p>
                              <p className="text-gray-500 text-xs">{methodLabels[p.paymentMethod] ?? p.paymentMethod} · {p.paymentHandle}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-emerald-400 font-bold text-sm">${Number(p.dollarAmount).toFixed(2)}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusCfg.cls}`}>{statusCfg.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Security note */}
                <div className="p-4 rounded-xl flex items-start gap-3" style={{background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)"}}>
                  <Shield className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">All payments are manually reviewed by our team before tokens are applied. Approved payments are processed quickly, usually within minutes.</p>
                </div>
              </>
            )}
          </TabsContent>



          {/* System Tab */}
          <TabsContent value="system" className="space-y-4">
            <div className="rounded-2xl overflow-hidden" style={{background:"#131124", border:"1px solid rgba(255,255,255,0.06)"}}>
              <div className="flex items-center gap-2 px-5 py-4 border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
                <div className="p-2 rounded-lg" style={{background:"rgba(124,58,237,0.2)"}}>
                  <Settings className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-white font-black text-base">Account Settings</span>
              </div>
              <div className="p-5 space-y-4">
                  {/* Account Information */}
                  <div className="p-5 rounded-xl" style={{background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)"}}>
                    <h3 className="text-white font-black text-sm mb-4 uppercase tracking-wider">Account Information</h3>
                    <div className="space-y-3">
                      {[
                        { label:"Email", value:(user as any).email },
                        { label:"Name", value:(user as any).firstName && (user as any).lastName ? `${(user as any).firstName} ${(user as any).lastName}` : "Not set" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">{label}</span>
                          <span className="text-white font-medium text-sm">{value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Status</span>
                        <span className="text-[11px] px-2.5 py-1 rounded-full font-black text-emerald-300"
                          style={{background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.3)"}}>● Active</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-purple-300 transition-all"
                      style={{background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.3)"}}>
                      Edit Profile
                    </button>
                  </div>

                  {/* Game Preferences */}
                  <div className="p-5 rounded-xl" style={{background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)"}}>
                    <h3 className="text-white font-black text-sm mb-4 uppercase tracking-wider">Game Preferences</h3>
                    <div className="space-y-4">
                      {[
                        { label:"Sound Effects", desc:"Play sound effects during games", defaultOn:true },
                        { label:"Auto-Spin", desc:"Enable automatic spinning", defaultOn:false },
                        { label:"Confetti Effects", desc:"Show celebration animations", defaultOn:true },
                      ].map(({ label, desc, defaultOn }) => (
                        <div key={label} className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-semibold text-sm">{label}</p>
                            <p className="text-gray-600 text-xs">{desc}</p>
                          </div>
                          <Switch defaultChecked={defaultOn} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="p-5 rounded-xl" style={{background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)"}}>
                    <h3 className="text-white font-black text-sm mb-4 uppercase tracking-wider">Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { label:"Email Notifications", desc:"Receive game updates via email", defaultOn:true },
                        { label:"Win Notifications", desc:"Get notified when you win", defaultOn:true },
                        { label:"Daily Bonuses", desc:"Reminder for daily free spins", defaultOn:false },
                      ].map(({ label, desc, defaultOn }) => (
                        <div key={label} className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-semibold text-sm">{label}</p>
                            <p className="text-gray-600 text-xs">{desc}</p>
                          </div>
                          <Switch defaultChecked={defaultOn} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy & Security */}
                  <div className="p-5 rounded-xl" style={{background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)"}}>
                    <h3 className="text-white font-bold text-lg mb-4">Privacy & Security</h3>
                    <div className="space-y-4">
                      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full border-blue-500 text-blue-300 hover:bg-blue-500/20">
                            Change Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-700 text-white">
                          <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Enter your current password and choose a new one.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="current-password" className="text-right text-white">
                                Current
                              </Label>
                              <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="col-span-3 bg-slate-800 border-slate-600 text-white"
                                placeholder="Current password"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="new-password" className="text-right text-white">
                                New
                              </Label>
                              <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="col-span-3 bg-slate-800 border-slate-600 text-white"
                                placeholder="New password"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="confirm-password" className="text-right text-white">
                                Confirm
                              </Label>
                              <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="col-span-3 bg-slate-800 border-slate-600 text-white"
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={handleChangePassword}
                              disabled={changePasswordMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={twoFactorOpen} onOpenChange={setTwoFactorOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full border-green-500 text-green-300 hover:bg-green-500/20">
                            Two-Factor Authentication
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-700 text-white">
                          <DialogHeader>
                            <DialogTitle>Two-Factor Authentication</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Enable 2FA for enhanced account security.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <div className="text-center space-y-4">
                              <div className="p-6 bg-slate-800 rounded-lg border border-slate-600">
                                <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                                <p className="text-gray-300">
                                  Two-factor authentication adds an extra layer of security to your account.
                                </p>
                              </div>
                              <div className="text-yellow-400 text-sm">
                                Feature coming soon! We're working on implementing 2FA for all users.
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={() => setTwoFactorOpen(false)}
                              className="bg-gray-600 hover:bg-gray-700 text-white"
                            >
                              Close
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full border-orange-500 text-orange-300 hover:bg-orange-500/20">
                            Privacy Settings
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Privacy Settings</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Manage your privacy and data preferences.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-6">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                                <div>
                                  <h4 className="text-white font-medium">Marketing Communications</h4>
                                  <p className="text-gray-400 text-sm">Receive promotional emails and offers</p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                                <div>
                                  <h4 className="text-white font-medium">Analytics Data</h4>
                                  <p className="text-gray-400 text-sm">Help improve our service with usage data</p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                                <div>
                                  <h4 className="text-white font-medium">Profile Visibility</h4>
                                  <p className="text-gray-400 text-sm">Show your profile to other players</p>
                                </div>
                                <Switch />
                              </div>
                              <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                                <div>
                                  <h4 className="text-white font-medium">Transaction History</h4>
                                  <p className="text-gray-400 text-sm">Keep detailed transaction records</p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={() => {
                                toast({
                                  title: "Settings Saved",
                                  description: "Your privacy preferences have been updated.",
                                });
                                setPrivacyOpen(false);
                              }}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              Save Settings
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full border-red-500 text-red-300 hover:bg-red-500/20">
                            Delete Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-700 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-red-400">Delete Account</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <div className="space-y-4">
                              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                <p className="text-red-300 text-sm font-medium">
                                  ⚠️ Warning: Account deletion is permanent and irreversible
                                </p>
                                <ul className="text-red-200 text-sm mt-2 ml-4 list-disc">
                                  <li>All your game history will be lost</li>
                                  <li>Payment cards will be removed</li>
                                  <li>Achievement progress will be deleted</li>
                                  <li>You won't be able to recover this account</li>
                                </ul>
                              </div>
                              <div>
                                <Label htmlFor="delete-confirmation" className="text-white">
                                  Type "DELETE" to confirm:
                                </Label>
                                <Input
                                  id="delete-confirmation"
                                  value={deleteConfirmation}
                                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                                  className="mt-2 bg-slate-800 border-slate-600 text-white"
                                  placeholder="DELETE"
                                />
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={() => setDeleteAccountOpen(false)}
                              variant="outline"
                              className="border-gray-500 text-gray-300"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleDeleteAccount}
                              disabled={deleteAccountMutation.isPending || deleteConfirmation !== 'DELETE'}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards">
            <div className="rounded-2xl p-10 text-center" style={{background:"#131124", border:"1px solid rgba(124,58,237,0.25)"}}>
              <div className="p-4 rounded-2xl w-fit mx-auto mb-4" style={{background:"rgba(124,58,237,0.15)"}}>
                <CreditCard className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-white font-black text-xl mb-2">Payment Methods</h3>
              <p className="text-gray-500 text-sm">A new payment system is being set up. Check back soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* Mobile bottom nav — persists on dashboard too */}
      <MobileNav />
      {/* Spacer so content isn't hidden behind fixed nav on mobile */}
      <div className="h-16 md:hidden" />
    </div>
  );
}

// ── Daily Tokens + Promo Code Component ────────────────────────────────────
function DailyTokensAndPromoSection() {
  const { toast } = useToast();
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  const { data: referralData } = useQuery<{ referralCode: string | null }>({
    queryKey: ["/api/user/referral-code"],
  });
  const referralCode = referralData?.referralCode;
  const referralLink = referralCode ? `${window.location.origin}/?ref=${referralCode}` : null;

  const { data: referralStats } = useQuery<{ referredCount: number; tokensEarned: number }>({
    queryKey: ["/api/user/referral-stats"],
  });

  const { data: emailPrefs, refetch: refetchPrefs } = useQuery<Record<string, boolean>>({
    queryKey: ["/api/user/notification-preferences"],
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<Record<string, boolean> | null>(null);
  const prefs = localPrefs ?? emailPrefs ?? {};

  async function togglePref(key: string, val: boolean) {
    const updated = { ...prefs, [key]: val };
    setLocalPrefs(updated);
    setSavingPrefs(true);
    try {
      await apiRequest("PUT", "/api/user/notification-preferences", updated);
    } catch (_) {}
    setSavingPrefs(false);
  }

  const { data: dailyStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<{
    canClaim: boolean;
    nextClaimAt: string | null;
    lastClaimedAt?: string;
  }>({
    queryKey: ["/api/user/daily-token-status"],
    refetchInterval: 30000,
  });

  const claimMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/user/claim-daily-tokens"),
    onSuccess: async (data: any) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/user/daily-token-status"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/user/token-balance"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      refetchStatus();
      toast({ title: "🎉 Daily tokens claimed!", description: `+${data.tokensAdded} tokens added to your account!` });
    },
    onError: (e: any) => toast({ title: "Cannot claim", description: e.message, variant: "destructive" }),
  });

  const handleRedeemPromo = async () => {
    if (!promoInput.trim()) {
      toast({ title: "Enter a promo code", variant: "destructive" });
      return;
    }
    setPromoLoading(true);
    try {
      const res = await apiRequest("POST", "/api/user/redeem-promo", { code: promoInput.trim().toUpperCase() });
      await queryClient.invalidateQueries({ queryKey: ["/api/user/token-balance"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      setPromoInput("");
      toast({ title: "🎁 Promo code applied!", description: res.message });
    } catch (e: any) {
      toast({ title: "Invalid code", description: e.message, variant: "destructive" });
    } finally {
      setPromoLoading(false);
    }
  };

  const formatCountdown = (nextClaimAt: string) => {
    const diff = new Date(nextClaimAt).getTime() - Date.now();
    if (diff <= 0) return "Available now!";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Daily Token Claim Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-violet-900/70 to-purple-900/70 border-violet-400/40 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-800/20 to-purple-800/20 blur-xl" />
        <CardContent className="relative p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shrink-0">
              <Gift className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1">Daily Free Tokens</h3>
              <p className="text-violet-200 text-sm mb-4">Claim 1 free token every 24 hours — no purchase needed!</p>
              {statusLoading ? (
                <div className="h-10 bg-violet-700/40 rounded-lg animate-pulse" />
              ) : dailyStatus?.canClaim ? (
                <Button
                  onClick={() => claimMutation.mutate()}
                  disabled={claimMutation.isPending}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold shadow-lg transition-all duration-300"
                >
                  {claimMutation.isPending ? (
                    <span className="flex items-center"><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Claiming...</span>
                  ) : (
                    <span className="flex items-center"><Gift className="h-4 w-4 mr-2" />Claim 1 Free Token</span>
                  )}
                </Button>
              ) : (
                <div className="bg-violet-900/50 border border-violet-500/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    <span className="text-green-300 text-sm font-medium">Already claimed today!</span>
                  </div>
                  {dailyStatus?.nextClaimAt && (
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4 text-violet-300 shrink-0" />
                      <span className="text-violet-200 text-sm">Next claim in: <span className="font-bold text-white">{formatCountdown(dailyStatus.nextClaimAt)}</span></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-amber-900/70 to-orange-900/70 border-amber-400/40 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-800/20 to-orange-800/20 blur-xl" />
        <CardContent className="relative p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shrink-0">
              <Share2 className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1">Refer a Friend</h3>
              <p className="text-amber-200 text-sm mb-3">Share your link — you both get <strong>5 bonus tokens</strong> when they sign up!</p>
              {referralLink ? (
                <div className="space-y-2">
                  <div className="bg-amber-900/50 border border-amber-500/40 rounded-lg px-3 py-2 text-amber-100 text-xs font-mono tracking-wide truncate">
                    {referralLink}
                  </div>
                  <div className="flex gap-2">
                    {typeof navigator !== "undefined" && typeof (navigator as any).share === "function" && (
                      <Button
                        onClick={async () => {
                          try {
                            await (navigator as any).share({
                              title: "Join me on Prize Plugz!",
                              text: "Sign up using my referral link and we both get 5 FREE bonus tokens! 🎉",
                              url: referralLink,
                            });
                          } catch (_) {}
                        }}
                        className="flex-1 bg-white hover:bg-gray-100 text-orange-700 font-bold shadow-lg border-0 transition-all duration-300"
                      >
                        <span className="flex items-center justify-center"><Share2 className="h-4 w-4 mr-2" />Share</span>
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(referralLink);
                        } catch (_) {
                          const el = document.createElement("textarea");
                          el.value = referralLink;
                          document.body.appendChild(el);
                          el.select();
                          document.execCommand("copy");
                          document.body.removeChild(el);
                        }
                        setCopiedReferral(true);
                        setTimeout(() => setCopiedReferral(false), 2000);
                      }}
                      className="flex-1 bg-white hover:bg-gray-100 text-orange-700 font-bold shadow-lg border-0 transition-all duration-300"
                    >
                      {copiedReferral ? (
                        <span className="flex items-center justify-center"><CheckCircle className="h-4 w-4 mr-2" />Copied!</span>
                      ) : (
                        <span className="flex items-center justify-center"><Copy className="h-4 w-4 mr-2" />Copy Link</span>
                      )}
                    </Button>
                  </div>
                  {/* Social share buttons */}
                  <div className="flex gap-2 mt-2">
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Join me on Prize Plugz! Sign up with my referral link and we both get 5 FREE bonus tokens 🎉 ${referralLink}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg text-center text-xs font-bold text-white transition-all hover:brightness-110"
                      style={{background:"rgba(37,211,102,0.15)",border:"1px solid rgba(37,211,102,0.4)"}}>
                      📱 WhatsApp
                    </a>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Sign up using my referral link and we both get 5 FREE bonus tokens! 🎉 ${referralLink}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg text-center text-xs font-bold text-white transition-all hover:brightness-110"
                      style={{background:"rgba(29,161,242,0.15)",border:"1px solid rgba(29,161,242,0.4)"}}>
                      𝕏 Twitter
                    </a>
                  </div>
                </div>
              ) : (
                <div className="h-16 bg-amber-700/30 rounded-lg animate-pulse" />
              )}

              {/* Referral Stats */}
              <div className="flex items-center gap-6 mt-3 pt-3 border-t border-amber-500/20">
                <div className="text-center">
                  <p className="text-yellow-300 font-black text-2xl leading-none">{referralStats?.referredCount ?? 0}</p>
                  <p className="text-amber-200/60 text-[11px] mt-0.5">Friends referred</p>
                </div>
                <div className="w-px h-8 bg-amber-500/25" />
                <div className="text-center">
                  <p className="text-yellow-300 font-black text-2xl leading-none">+{referralStats?.tokensEarned ?? 0}</p>
                  <p className="text-amber-200/60 text-[11px] mt-0.5">Tokens earned</p>
                </div>
                <div className="w-px h-8 bg-amber-500/25" />
                <div className="text-center">
                  <p className="text-yellow-300 font-black text-2xl leading-none">{(referralStats?.tokensEarned ?? 0) > 0 ? `$${((referralStats?.tokensEarned ?? 0) * 0.5).toFixed(0)}` : "$0"}</p>
                  <p className="text-amber-200/60 text-[11px] mt-0.5">Value earned</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo Code Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-900/70 to-teal-900/70 border-emerald-400/40 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/20 to-teal-800/20 blur-xl" />
        <CardContent className="relative p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shrink-0">
              <Tag className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1">Redeem Promo Code</h3>
              <p className="text-emerald-200 text-sm mb-4">Have a promo code? Enter it below to receive bonus tokens!</p>
              <div className="flex space-x-2">
                <input
                  className="flex-1 min-w-0 bg-emerald-900/50 border border-emerald-500/40 rounded-lg px-3 py-2 text-white text-sm placeholder-emerald-300/50 focus:outline-none focus:border-emerald-400 uppercase tracking-widest"
                  placeholder="ENTER CODE"
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={e => { if (e.key === "Enter") handleRedeemPromo(); }}
                />
                <Button
                  onClick={handleRedeemPromo}
                  disabled={promoLoading || !promoInput.trim()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg shrink-0 transition-all duration-300"
                >
                  {promoLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Notification Preferences Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-violet-950/90 border-violet-500/30 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-800/10 to-slate-800/10 blur-xl" />
        <CardContent className="relative p-6">
          <div className="flex items-start space-x-4 mb-5">
            <div className="p-3 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl shadow-lg shrink-0">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-0.5">Email Notifications</h3>
              <p className="text-violet-300/70 text-sm">Choose which emails you receive from us.</p>
            </div>
          </div>
          <div className="space-y-1">
            {([
              { key: "lowTokenWarning",      label: "Low token warning",     desc: "When you have fewer than 5 tokens" },
              { key: "tokenPurchaseReceipt", label: "Purchase receipts",     desc: "After every token purchase" },
              { key: "gameClosingSoon",      label: "Game closing soon",     desc: "When a game you're in hits 90% full" },
              { key: "winnerAnnounced",      label: "Winner announcements",  desc: "When a game you played is won" },
              { key: "newGameLive",          label: "New game launches",     desc: "When a brand-new game goes live" },
              { key: "referralConfirmed",    label: "Referral bonus emails", desc: "When a friend you referred signs up" },
            ] as { key: string; label: string; desc: string }[]).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold leading-none">{label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
                <Switch
                  checked={prefs[key] !== false}
                  onCheckedChange={v => togglePref(key, v)}
                  disabled={savingPrefs}
                  className="shrink-0 data-[state=checked]:bg-violet-600"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}