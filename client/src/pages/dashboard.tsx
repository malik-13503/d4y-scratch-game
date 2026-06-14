import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Responsive Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            
            {/* Top Row: Back Button + Logo + Title */}
            <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/games")}
                  className="text-gray-300 hover:text-white hover:bg-white/10 px-2 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Games</span>
                </Button>
                <img src={logoPath} alt="Prize Plugz" className="h-6 w-auto sm:h-8" />
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-lg">
                  My Dashboard
                </h1>
              </div>
              
              {/* Mobile Actions */}
              <div className="sm:hidden flex items-center space-x-2">
                <Button
                  onClick={refreshData}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg px-3"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => logout()}
                  size="sm"
                  variant="outline"
                  className="text-gray-300 border-gray-600 hover:bg-red-500/20 hover:border-red-500 hover:text-red-300 px-3"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <Button
                onClick={refreshData}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => logout()}
                size="sm"
                variant="outline"
                className="text-gray-300 border-gray-600 hover:bg-red-500/20 hover:border-red-500 hover:text-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Responsive Enhanced User Profile Section */}
        <Card className="mb-8 relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-400/40 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-2xl"></div>
          <CardHeader className="relative p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              
              {/* Avatar and Mobile User Info */}
              <div className="flex items-center space-x-4 sm:space-x-0">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-br from-purple-400/30 to-blue-400/30 rounded-full blur-lg"></div>
                </div>
                
                {/* Mobile User Details */}
                <div className="sm:hidden min-w-0">
                  <CardTitle className="text-xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg truncate">
                    {(user as any).firstName && (user as any).lastName ? `${(user as any).firstName} ${(user as any).lastName}` : 'Player'}
                  </CardTitle>
                  <p className="text-gray-200 text-sm font-medium truncate">{(user as any).email}</p>
                </div>
              </div>
              
              {/* Desktop User Details */}
              <div className="hidden sm:block flex-1 min-w-0">
                <CardTitle className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg truncate">
                  {(user as any).firstName && (user as any).lastName ? `${(user as any).firstName} ${(user as any).lastName}` : 'Player'}
                </CardTitle>
                <p className="text-gray-200 text-base lg:text-lg font-medium truncate">{(user as any).email}</p>
              </div>
              
              {/* Responsive Status Badges */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Badge className={`${(user as any).cardOnFile ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white" : "bg-gradient-to-r from-red-500 to-pink-500 text-white"} border-0 px-3 py-2 sm:px-4 sm:py-2 font-bold shadow-lg text-xs sm:text-sm`}>
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="drop-shadow-sm whitespace-nowrap">
                    {(user as any).cardOnFile ? "Payment Verified" : "Payment Required"}
                  </span>
                </Badge>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-green-500/20 px-3 py-2 sm:px-4 sm:py-2 rounded-full border border-green-400/30">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 font-bold text-xs sm:text-sm drop-shadow-sm">ONLINE</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs for Dashboard Sections */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          {/* Mobile Tabs - Scrollable */}
          <div className="lg:hidden">
            <TabsList className="flex w-full overflow-x-auto bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-2 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                <TabsTrigger value="overview" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-200 whitespace-nowrap px-3 py-2">
                  <Gauge className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-200 whitespace-nowrap px-3 py-2">
                  <Activity className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Transactions</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-200 whitespace-nowrap px-3 py-2">
                  <Award className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Achievements</span>
                </TabsTrigger>
                <TabsTrigger value="payment" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-200 whitespace-nowrap px-3 py-2">
                  <CreditCard className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Payment</span>
                </TabsTrigger>
                <TabsTrigger value="cards" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-200 whitespace-nowrap px-3 py-2">
                  <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">My Cards</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-200 whitespace-nowrap px-3 py-2">
                  <Settings className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">System</span>
                </TabsTrigger>
              </div>
            </TabsList>
          </div>

          {/* Desktop Tabs - Grid */}
          <div className="hidden lg:block">
            <TabsList className="grid w-full grid-cols-6 bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-2">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-200">
                <Gauge className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="transactions" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-200">
                <Activity className="h-4 w-4 mr-2" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-200">
                <Award className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="payment" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-200">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Setup
              </TabsTrigger>
              <TabsTrigger value="cards" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-200">
                <Shield className="h-4 w-4 mr-2" />
                My Cards
              </TabsTrigger>
              <TabsTrigger value="system" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-200">
                <Settings className="h-4 w-4 mr-2" />
                System
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Enhanced Stats Overview with eye-catching gradients */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
          {/* Token Purchase Card - Featured */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-900/60 to-orange-900/60 border-yellow-400/40 backdrop-blur-xl shadow-2xl hover:shadow-yellow-500/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-800/20 to-orange-800/20 blur-xl"></div>
            <CardContent 
              className="relative p-6 h-full flex flex-col justify-between"
              onClick={() => window.location.href = '/tokens'}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Coins className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Buy Tokens</p>
                  <p className="text-2xl font-black text-yellow-300 drop-shadow-lg">
                    Get Started
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Button 
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
                  data-testid="button-buy-tokens-dashboard"
                >
                  Purchase Tokens →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Low Numbers Card (1-50) */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-900/60 to-green-900/60 border-emerald-400/40 backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/20 to-green-800/20 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <Trophy className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Low Numbers</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">
                    {statsLoading ? '...' : ((userStats as any)?.totalWins || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Spent Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900/60 to-cyan-900/60 border-blue-400/40 backdrop-blur-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 to-cyan-800/20 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <DollarSign className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Total Spent</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">
                    ${statsLoading ? '...' : ((userStats as any)?.totalSpent || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Spins Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/60 to-pink-900/60 border-purple-400/40 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-800/20 to-pink-800/20 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Target className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Total Spins</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">
                    {statsLoading ? '...' : ((userStats as any)?.totalSpins || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Free Spins Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-900/60 to-orange-900/60 border-yellow-400/40 backdrop-blur-xl shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-800/20 to-orange-800/20 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                  <Award className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Free Spins</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">
                    {statsLoading ? '...' : ((userStats as any)?.freeSpins || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/70 to-blue-900/70 border-purple-400/40 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-800/30 to-blue-800/30 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="text-center">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl mx-auto w-fit mb-4 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Play Games</h3>
                <p className="text-gray-200 text-sm mb-4">Spin the wheel and win amazing prizes</p>
                <Button 
                  onClick={() => setLocation("/games")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-300"
                >
                  Play Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-900/70 to-green-900/70 border-emerald-400/40 backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/30 to-green-800/30 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="text-center">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl mx-auto w-fit mb-4 shadow-lg">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Transactions</h3>
                <p className="text-gray-200 text-sm mb-4">View your payment history and spins</p>
                <Button 
                  onClick={() => setLocation("/transactions")}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-300"
                >
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-900/70 to-orange-900/70 border-yellow-400/40 backdrop-blur-xl shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-800/30 to-orange-800/30 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="text-center">
                <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl mx-auto w-fit mb-4 shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Achievements</h3>
                <p className="text-gray-200 text-sm mb-4">Track your wins and milestones</p>
                <Button 
                  onClick={() => setLocation("/achievements")}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-300"
                >
                  View Progress
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="relative overflow-hidden bg-gradient-to-br from-cyan-900/60 to-teal-900/60 border-cyan-400/30 backdrop-blur-xl shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300 group"
            onClick={() => setLocation('/my-numbers')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 blur-2xl group-hover:blur-xl transition-all duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300">
                  <Hash className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl drop-shadow-lg">My Numbers</h3>
                  <p className="text-gray-200 drop-shadow-sm">View all your spins</p>
                </div>
                <ChevronRight className="h-6 w-6 text-white/70 ml-auto group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Tokens + Promo Code Section */}
        <DailyTokensAndPromoSection />

        {/* Real-time Activity Feed */}
        <Card className="mb-8 relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-600/40 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-2xl"></div>
          <CardHeader className="relative">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg mr-3 shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              Live Activity
              <div className="flex items-center space-x-2 ml-auto">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-bold text-sm">LIVE</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600/30">
                <p className="text-gray-200 font-medium">Welcome to your dashboard! Start playing games to see your activity here.</p>
                <p className="text-gray-400 text-sm mt-1">Your spins and wins will appear in real-time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Game History */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-600/40 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 blur-2xl"></div>
          <CardHeader className="relative">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mr-3 shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              Recent Game History
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
                  <div className="absolute inset-0 animate-ping w-8 h-8 border-4 border-purple-400/30 rounded-full" />
                </div>
                <p className="ml-4 text-gray-200 font-medium">Loading game history...</p>
              </div>
            ) : !gameHistory || (gameHistory as any).length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 to-gray-600/20 blur-2xl rounded-full"></div>
                  <Gamepad2 className="relative h-20 w-20 text-gray-400 mx-auto drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No Games Played Yet</h3>
                <p className="text-gray-200 text-lg mb-8">Start playing to see your game history here!</p>
                <Button 
                  onClick={() => setLocation('/games')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  <Gamepad2 className="h-5 w-5 mr-2" />
                  Start Playing Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(gameHistory as any).slice(0, 5).map((game: any, index: number) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">Game #{game.id}</p>
                        <p className="text-gray-400 text-sm">Recent activity</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold">${game.amount}</p>
                        <p className="text-gray-400 text-sm">{new Date(game.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-8">
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-blue-400/40 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl"></div>
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-3 shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="relative">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                      <div className="absolute inset-0 animate-ping w-8 h-8 border-4 border-blue-400/30 rounded-full" />
                    </div>
                    <p className="ml-4 text-gray-200 font-medium">Loading transactions...</p>
                  </div>
                ) : !transactions || (transactions as any).length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-2xl rounded-full"></div>
                      <DollarSign className="relative h-20 w-20 text-gray-400 mx-auto drop-shadow-lg" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">No Transactions Yet</h3>
                    <p className="text-gray-200 text-lg mb-8">Start playing games to see your transaction history!</p>
                    <Button 
                      onClick={() => setLocation('/games')}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                    >
                      <Gamepad2 className="h-5 w-5 mr-2" />
                      Start Playing Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(transactions as any).map((transaction: any, index: number) => (
                      <div key={index} className="p-6 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600/30 hover:border-blue-500/50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl shadow-lg ${
                              parseFloat(transaction.amount) === 0 
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                            }`}>
                              {parseFloat(transaction.amount) === 0 ? (
                                <Trophy className="h-6 w-6 text-white" />
                              ) : (
                                <DollarSign className="h-6 w-6 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-semibold">
                                Game Spin #{transaction.id}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {parseFloat(transaction.amount) === 0 ? 'Free Play' : `Paid Spin - Number ${transaction.spunNumber || 'Unknown'}`}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {new Date(transaction.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${
                              parseFloat(transaction.amount) === 0 
                                ? 'text-green-400' 
                                : 'text-blue-400'
                            }`}>
                              {parseFloat(transaction.amount) === 0 ? 'FREE' : `$${parseFloat(transaction.amount).toFixed(2)}`}
                            </div>
                            <Badge className={`${
                              parseFloat(transaction.amount) === 0 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            } text-white`}>
                              {parseFloat(transaction.amount) === 0 ? 'Free Play' : 'Paid'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-8">
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-yellow-400/40 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 blur-2xl"></div>
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg mr-3 shadow-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  Your Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {achievementsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="relative">
                      <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
                      <div className="absolute inset-0 animate-ping w-8 h-8 border-4 border-yellow-400/30 rounded-full" />
                    </div>
                    <p className="ml-4 text-gray-200 font-medium">Loading achievements...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getAchievements(achievementData).map((achievement: any) => (
                      <div key={achievement.id} className={`relative p-6 rounded-xl border transition-all duration-300 ${
                        achievement.completed 
                          ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/50' 
                          : 'bg-gradient-to-r from-slate-700/50 to-slate-800/50 border-slate-600/30'
                      }`}>
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-xl shadow-lg ${
                            achievement.completed 
                              ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                              : 'bg-gradient-to-br from-gray-500 to-gray-600'
                          }`}>
                            <achievement.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-white font-bold text-lg">{achievement.title}</h3>
                              {achievement.completed && (
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-white font-medium">
                                  {achievement.current} / {achievement.target}
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    achievement.completed 
                                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                  }`}
                                  style={{
                                    width: `${Math.min((achievement.current / achievement.target) * 100, 100)}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                            {achievement.reward && (
                              <div className="mt-3 p-2 bg-blue-900/30 rounded-lg border border-blue-500/30">
                                <p className="text-blue-300 text-xs">
                                  <span className="font-semibold">Reward:</span> {achievement.reward}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
          <TabsContent value="system" className="space-y-8">
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-400/40 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-2xl"></div>
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mr-3 shadow-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-6">
                  {/* Account Information */}
                  <div className="p-6 bg-slate-700/50 rounded-xl border border-slate-600/30">
                    <h3 className="text-white font-bold text-lg mb-4">Account Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Email:</span>
                        <span className="text-white font-medium">{(user as any).email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Name:</span>
                        <span className="text-white font-medium">
                          {(user as any).firstName && (user as any).lastName ? `${(user as any).firstName} ${(user as any).lastName}` : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Account Status:</span>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                          Active
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4 border-purple-500 text-black-300">
                      Edit Profile
                    </Button>
                  </div>

                  {/* Game Preferences */}
                  <div className="p-6 bg-slate-700/50 rounded-xl border border-slate-600/30">
                    <h3 className="text-white font-bold text-lg mb-4">Game Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-medium">Sound Effects</span>
                          <p className="text-gray-400 text-sm">Play sound effects during games</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-medium">Auto-Spin</span>
                          <p className="text-gray-400 text-sm">Enable automatic spinning</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-medium">Confetti Effects</span>
                          <p className="text-gray-400 text-sm">Show celebration animations</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="p-6 bg-slate-700/50 rounded-xl border border-slate-600/30">
                    <h3 className="text-white font-bold text-lg mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-medium">Email Notifications</span>
                          <p className="text-gray-400 text-sm">Receive game updates via email</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-medium">Win Notifications</span>
                          <p className="text-gray-400 text-sm">Get notified when you win</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-medium">Daily Bonuses</span>
                          <p className="text-gray-400 text-sm">Reminder for daily free spins</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Security */}
                  <div className="p-6 bg-slate-700/50 rounded-xl border border-slate-600/30">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="mt-6">
            <div className="text-center p-12 bg-slate-800/50 border border-purple-500/30 rounded-xl">
              <CreditCard className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">Payment Methods</h3>
              <p className="text-gray-300">A new payment system is being set up. Check back soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
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
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(referralLink);
                      setCopiedReferral(true);
                      setTimeout(() => setCopiedReferral(false), 2000);
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg transition-all duration-300"
                  >
                    {copiedReferral ? (
                      <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" />Copied!</span>
                    ) : (
                      <span className="flex items-center"><Copy className="h-4 w-4 mr-2" />Copy Link</span>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="h-16 bg-amber-700/30 rounded-lg animate-pulse" />
              )}
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
    </div>
  );
}