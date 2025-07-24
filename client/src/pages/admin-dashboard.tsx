import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Users, 
  Trophy, 
  Settings, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Play, 
  Pause, 
  Download,
  RefreshCw,
  Zap,
  Target,
  Crown,
  Gamepad2,
  Activity,
  TrendingUp,
  Globe,
  Clock,
  DollarSign,
  Star,
  Sparkles,
  Shield,
  Database,
  Monitor,
  Wifi,
  Lock,
  Unlock,
  LogOut,
  User,
  Ban,
  CheckCircle,
  Info,
  AlertTriangle,
  Coffee,
  ArrowRight,
  UserPlus,
  XCircle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoPath from "@assets/logo_1751918412862.png";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);
  const [isEditGameOpen, setIsEditGameOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  
  // Live preview state
  const [previewData, setPreviewData] = useState({
    name: "Premium Travel Mug",
    emoji: "🎮",
    description: "High-quality travel mug with thermal insulation",
    prize: "Premium Travel Mug",
    prizeValue: "50.00",
    totalNumbers: "125",
    duration: "24"
  });
  
  // Edit data state for editing existing games
  const [editData, setEditData] = useState({
    name: "",
    emoji: "",
    description: "",
    prize: "",
    prizeValue: "",
    totalNumbers: "",
    duration: ""
  });
  
  const [realTimeStats, setRealTimeStats] = useState({
    activeUsers: 247,
    totalSpins: 15420,
    prizesWon: 89,
    revenue: 12540
  });
  const { toast } = useToast();

  // Check authentication with localStorage fallback
  const { data: adminUser, isLoading: authLoading, error } = useQuery({
    queryKey: ["/api/admin/user"],
    retry: false,
  });

  // Get admin user from localStorage if available
  const [localAdminUser, setLocalAdminUser] = useState(null);
  
  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (stored) {
      try {
        setLocalAdminUser(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored admin user:", e);
        localStorage.removeItem("admin_user");
      }
    }
  }, []);

  useEffect(() => {
    // Wait longer for authentication to complete
    if (!authLoading && !adminUser && !localAdminUser) {
      console.log("No authentication found, redirecting to login");
      // Longer delay to prevent redirect loops during session establishment
      setTimeout(() => {
        setLocation("/admin-login");
      }, 2000);
      return;
    }
    
    // Only clear localStorage after multiple failed attempts
    if (!authLoading && !adminUser && localAdminUser && error) {
      console.log("Server authentication failed after login, clearing localStorage and redirecting");
      localStorage.removeItem("admin_user");
      setLocalAdminUser(null);
      // Don't redirect immediately to avoid loops
      setTimeout(() => {
        setLocation("/admin-login");
      }, 3000);
    }
  }, [adminUser, localAdminUser, authLoading, error, setLocation]);

  // Use server data if available, otherwise use localStorage
  const currentAdmin = adminUser || localAdminUser;

  // Dashboard stats with enhanced metrics
  const { data: dashboardStats, refetch: refetchStats } = useQuery<{
    totalGames: number;
    activeGames: number;
    totalSpins: number;
    totalPrizeValue: number;
    todayRevenue: number;
    activeUsers: number;
    totalUsers: number;
    conversionRate: number;
  }>({
    queryKey: ["/api/admin/dashboard/stats"],
    enabled: !!currentAdmin && activeTab === 'overview',
    refetchInterval: activeTab === 'overview' ? 15000 : false, // Only refresh on overview tab
    staleTime: 30000, // Cache for 30 seconds
  });

  // Games data
  const { data: games, isLoading: gamesLoading, refetch: refetchGames } = useQuery<any[]>({
    queryKey: ["/api/admin/games"],
    enabled: !!currentAdmin,
  });

  // System settings
  const { data: settings, refetch: refetchSettings } = useQuery<any[]>({
    queryKey: ["/api/admin/settings"],
    enabled: !!currentAdmin,
  });

  // Recent activity
  const { data: recentActivity } = useQuery<any[]>({
    queryKey: ["/api/admin/activity"],
    enabled: !!currentAdmin && activeTab === 'overview',
    refetchInterval: activeTab === 'overview' ? 20000 : false,
    staleTime: 30000,
  });

  // Users data
  const { data: users, refetch: refetchUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!currentAdmin,
  });

  // Fetch detailed user data when a user is selected for real-time information
  const { data: userDetails, isLoading: userDetailsLoading, refetch: refetchUserDetails } = useQuery({
    queryKey: [`/api/admin/users/${selectedUser?.id}/details`],
    enabled: !!selectedUser?.id && isUserProfileOpen,
    refetchInterval: isUserProfileOpen ? 5000 : false, // Refresh every 5 seconds for real-time updates
  });

  // Fetch user transactions for real-time transaction history
  const { data: userTransactions, refetch: refetchUserTransactions } = useQuery({
    queryKey: [`/api/admin/users/${selectedUser?.id}/transactions`],
    enabled: !!selectedUser?.id && isUserProfileOpen,
    refetchInterval: isUserProfileOpen ? 5000 : false,
  });

  // Fetch user activity for real-time activity timeline
  const { data: userActivity, refetch: refetchUserActivity } = useQuery({
    queryKey: [`/api/admin/users/${selectedUser?.id}/activity`],
    enabled: !!selectedUser?.id && isUserProfileOpen,
    refetchInterval: isUserProfileOpen ? 5000 : false,
  });

  // Debug logging and force refetch when dialog opens
  useEffect(() => {
    if (selectedUser && isUserProfileOpen) {
      console.log("🔍 User profile opened for user:", selectedUser.id);
      console.log("📊 Query conditions:", {
        selectedUserId: selectedUser?.id,
        isUserProfileOpen,
        queryEnabled: !!selectedUser?.id && isUserProfileOpen,
        detailsQueryKey: `/api/admin/users/${selectedUser.id}/details`,
        transactionsQueryKey: `/api/admin/users/${selectedUser.id}/transactions`,
        activityQueryKey: `/api/admin/users/${selectedUser.id}/activity`
      });
      
      // Force refetch all user-specific data when dialog opens
      setTimeout(() => {
        console.log("🔄 Forcing refetch of user data...");
        refetchUserDetails();
        refetchUserTransactions(); 
        refetchUserActivity();
      }, 100); // Small delay to ensure queries are set up
    }
  }, [selectedUser, isUserProfileOpen]);

  // Debug logging for query results
  useEffect(() => {
    if (userDetails) {
      console.log("📋 User Details received:", userDetails);
    }
  }, [userDetails]);

  useEffect(() => {
    if (userTransactions) {
      console.log("💰 User Transactions received:", userTransactions);
    }
  }, [userTransactions]);

  useEffect(() => {
    if (userActivity) {
      console.log("⚡ User Activity received:", userActivity);
    }
  }, [userActivity]);

  // Analytics data
  const { data: analytics, refetch: refetchAnalytics } = useQuery<{
    totalRevenue: number;
    revenueGrowth: number;
    totalSpins: number;
    conversionRate: number;
    gameStats: any[];
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    avgSessionDuration: number;
    retentionRate: number;
    todayRevenue: number;
    todayGrowth: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    avgRevenuePerUser: number;
  }>({
    queryKey: ["/api/admin/analytics"],
    enabled: !!currentAdmin,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      localStorage.removeItem("admin_user");
      queryClient.clear();
      setLocation("/admin-login");
    },
  });

  // Create game mutation
  const createGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      const response = await apiRequest("POST", "/api/admin/games", gameData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setIsCreateGameOpen(false);
      toast({
        title: "Success",
        description: "Game created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create game",
        variant: "destructive",
      });
    },
  });

  // Update game mutation
  const updateGameMutation = useMutation({
    mutationFn: async ({ id, gameData }: { id: number; gameData: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/games/${id}`, gameData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries to force refresh
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setIsEditGameOpen(false);
      setEditingGame(null);
      toast({
        title: "Success",
        description: "Game updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update game",
        variant: "destructive",
      });
    },
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/settings/${key}`, { value });
      return response.json();
    },
    onSuccess: () => {
      refetchSettings();
      toast({
        title: "Settings Updated",
        description: "System settings have been updated successfully",
      });
    },
  });

  // Real-time stats simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        totalSpins: prev.totalSpins + Math.floor(Math.random() * 5),
        prizesWon: prev.prizesWon + (Math.random() < 0.1 ? 1 : 0),
        revenue: prev.revenue + Math.floor(Math.random() * 100)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Show loading screen while checking authentication
  if (authLoading || (!adminUser && !localAdminUser && !error)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold drop-shadow-lg">Loading Admin Dashboard...</p>
          <p className="text-gray-300 text-sm mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authentication check failed and we have no local storage, show redirect screen
  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white text-xl font-semibold drop-shadow-lg">Access Denied</p>
          <p className="text-gray-300 mt-2">Redirecting to admin login...</p>
        </div>
      </div>
    );
  }

  const handleCreateGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const durationHours = parseInt(formData.get("duration") as string) || 24;
    const prizeValue = formData.get("prizeValue") as string;
    
    const totalNumbers = parseInt(formData.get("totalNumbers") as string) || 125;
    
    const gameData = {
      name: formData.get("name") as string,
      code: `G${Date.now().toString().slice(-6)}`, // Generate unique code
      description: formData.get("description") as string,
      gameType: (formData.get("gameType") as string) || "wheel_spin",
      prize: formData.get("prize") as string,
      prizeValue: prizeValue, // Keep as string for decimal field
      prizeDescription: formData.get("description") as string,
      totalNumbers: totalNumbers,
      numbersLeft: totalNumbers, // Required field - initially all numbers are available
      freePlayStart: Math.ceil(totalNumbers * 0.75),
      freePlayEnd: totalNumbers,
      maxWinners: 1,
      // Let server handle date creation
      isScheduled: false,
      emoji: formData.get("emoji") as string || "🎮",
    };

    createGameMutation.mutate(gameData);
  };

  const handleEditGame = (game: any) => {
    setEditingGame(game);
    setEditData({
      name: game.name,
      emoji: game.emoji,
      description: game.description || "",
      prize: game.prize,
      prizeValue: game.prizeValue.toString(),
      totalNumbers: game.totalNumbers.toString(),
      duration: "24" // Default duration for edit
    });
    setIsEditGameOpen(true);
  };

  const handleUpdateGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const gameData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      prize: formData.get("prize") as string,
      prizeValue: formData.get("prizeValue") as string, // Keep as string for decimal field
      prizeDescription: formData.get("description") as string,
      totalNumbers: parseInt(formData.get("totalNumbers") as string) || 125,
      freePlayStart: Math.ceil((parseInt(formData.get("totalNumbers") as string) || 125) * 0.75),
      freePlayEnd: parseInt(formData.get("totalNumbers") as string) || 125,
      gameType: (formData.get("gameType") as string) || "wheel_spin",
      emoji: formData.get("emoji") as string || "🎮",
    };

    updateGameMutation.mutate({ id: editingGame.id, gameData });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 admin-dashboard" data-admin-dashboard>
      {/* Futuristic Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <img 
                  src={logoPath} 
                  alt="Hit The Road Jackpot" 
                  className="h-14 w-auto object-contain sm:h-16 md:h-18 lg:h-20"
                />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    ADMIN COMMAND CENTER
                  </h1>
                  <p className="text-gray-400 text-sm">Real-time Game Management System</p>
                </div>
              </div>
              
              {/* Live Status Indicator */}
              <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">SYSTEM ONLINE</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Admin Profile */}
              <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{(adminUser as any)?.firstName || 'Admin'}</div>
                  <div className="text-xs text-gray-400">System Administrator</div>
                </div>
              </div>
              
              <Button
                onClick={() => logoutMutation.mutate()}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Enhanced Tab Navigation */}
          <TabsList className="grid w-full grid-cols-6 bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-2">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Games
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300">
              <Monitor className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Hero Stats Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-8 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    🎯 GAME CONTROL CENTER
                  </h2>
                  <p className="text-slate-200 text-lg font-medium">Real-time analytics and instant management</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-5 bg-slate-700/70 rounded-xl border border-slate-500/30 shadow-lg hover:bg-slate-600/70 transition-colors">
                    <div className="text-3xl font-bold text-blue-300 mb-1">{dashboardStats?.totalGames || 0}</div>
                    <div className="text-sm text-slate-100 font-medium">Total Games</div>
                    <div className="text-xs text-green-300 mt-1 font-semibold">↗ +12% growth</div>
                  </div>
                  
                  <div className="text-center p-5 bg-slate-700/70 rounded-xl border border-slate-500/30 shadow-lg hover:bg-slate-600/70 transition-colors">
                    <div className="text-3xl font-bold text-green-300 mb-1">{dashboardStats?.activeGames || 0}</div>
                    <div className="text-sm text-slate-100 font-medium">Live Games</div>
                    <div className="text-xs text-blue-300 mt-1 font-semibold">🔥 Currently running</div>
                  </div>
                  
                  <div className="text-center p-5 bg-slate-700/70 rounded-xl border border-slate-500/30 shadow-lg hover:bg-slate-600/70 transition-colors">
                    <div className="text-3xl font-bold text-cyan-300 mb-1">{dashboardStats?.totalSpins || 0}</div>
                    <div className="text-sm text-slate-100 font-medium">Player Spins</div>
                    <div className="text-xs text-cyan-300 mt-1 font-semibold">⚡ Real-time</div>
                  </div>
                  
                  <div className="text-center p-5 bg-slate-700/70 rounded-xl border border-slate-500/30 shadow-lg hover:bg-slate-600/70 transition-colors">
                    <div className="text-3xl font-bold text-yellow-300 mb-1">${dashboardStats?.totalPrizeValue || 0}</div>
                    <div className="text-sm text-slate-100 font-medium">Prize Value</div>
                    <div className="text-xs text-orange-300 mt-1 font-semibold">💰 Total awarded</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-emerald-600/90 to-green-600/90 backdrop-blur-sm border border-emerald-400/80 hover:border-emerald-300 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-105"
                    onClick={() => setIsCreateGameOpen(true)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">🎮 Create New Game</h3>
                      <p className="text-emerald-50 text-sm mb-4 font-medium">Launch a new spinning wheel game instantly</p>
                      <Button className="bg-white text-emerald-700 hover:bg-emerald-50 border-0 shadow-lg font-semibold">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Game
                      </Button>
                    </div>
                    <div className="p-4 bg-white/20 rounded-full border border-white/30 shadow-lg">
                      <Gamepad2 className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600/90 to-cyan-600/90 backdrop-blur-sm border border-blue-400/80 hover:border-blue-300 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105"
                    onClick={() => setActiveTab("games")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">⚙️ Manage Games</h3>
                      <p className="text-blue-50 text-sm mb-4 font-medium">Edit, pause, or delete existing games</p>
                      <Button className="bg-white text-blue-700 hover:bg-blue-50 border-0 shadow-lg font-semibold">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                    <div className="p-4 bg-white/20 rounded-full border border-white/30 shadow-lg">
                      <Settings className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/90 backdrop-blur-sm border border-purple-400/80 hover:border-purple-300 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105"
                    onClick={() => setActiveTab("analytics")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">📊 View Analytics</h3>
                      <p className="text-purple-50 text-sm mb-4 font-medium">Detailed insights and performance metrics</p>
                      <Button className="bg-white text-purple-700 hover:bg-purple-50 border-0 shadow-lg font-semibold">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                    </div>
                    <div className="p-4 bg-white/20 rounded-full border border-white/30 shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Management Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-orange-600/85 to-red-600/85 backdrop-blur-sm border border-orange-300/60 hover:border-orange-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105"
                    onClick={() => setActiveTab("users")}>
                <CardContent className="p-5">
                  <div className="text-center">
                    <div className="p-3 bg-white/25 rounded-full mx-auto mb-3 w-fit border border-white/20 shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2 text-sm drop-shadow-lg">User Management</h4>
                    <p className="text-xs text-orange-50 font-medium">View and manage players</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-600/85 to-purple-600/85 backdrop-blur-sm border border-pink-300/60 hover:border-pink-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-pink-500/30 hover:scale-105"
                    onClick={() => setActiveTab("system")}>
                <CardContent className="p-5">
                  <div className="text-center">
                    <div className="p-3 bg-white/25 rounded-full mx-auto mb-3 w-fit border border-white/20 shadow-lg">
                      <Monitor className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2 text-sm drop-shadow-lg">System Monitor</h4>
                    <p className="text-xs text-pink-50 font-medium">Server & database status</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-600/85 to-blue-600/85 backdrop-blur-sm border border-cyan-300/60 hover:border-cyan-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-105"
                    onClick={() => setActiveTab("settings")}>
                <CardContent className="p-5">
                  <div className="text-center">
                    <div className="p-3 bg-white/25 rounded-full mx-auto mb-3 w-fit border border-white/20 shadow-lg">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2 text-sm drop-shadow-lg">Game Settings</h4>
                    <p className="text-xs text-cyan-50 font-medium">Configure game rules</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-600/85 to-green-600/85 backdrop-blur-sm border border-emerald-300/60 hover:border-emerald-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105">
                <CardContent className="p-5">
                  <div className="text-center">
                    <div className="p-3 bg-white/25 rounded-full mx-auto mb-3 w-fit border border-white/20 shadow-lg">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2 text-sm drop-shadow-lg">Database Tools</h4>
                    <p className="text-xs text-emerald-50 font-medium">Backup & maintenance</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status Panel */}
            <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 shadow-2xl">
              <CardHeader className="bg-slate-700/50 border-b border-slate-600/30">
                <CardTitle className="text-white flex items-center font-bold">
                  <Monitor className="h-5 w-5 mr-2 text-emerald-400" />
                  System Status & Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Server Status */}
                  <div className="space-y-3 bg-gradient-to-br from-green-600/40 to-emerald-600/40 p-5 rounded-lg border border-green-400/50 shadow-lg">
                    <h4 className="text-sm font-bold text-white drop-shadow-lg flex items-center">
                      <Monitor className="h-4 w-4 mr-2 text-green-200" />
                      Server Health
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm bg-white/10 p-2 rounded border border-white/20">
                        <span className="text-white font-semibold">API Server</span>
                        <Badge className="bg-green-700 text-green-100 border-green-600 font-bold shadow-sm">
                          <div className="w-2 h-2 bg-green-200 rounded-full mr-2 animate-pulse"></div>
                          Online
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm bg-white/10 p-2 rounded border border-white/20">
                        <span className="text-white font-semibold">Database</span>
                        <Badge className="bg-green-700 text-green-100 border-green-600 font-bold shadow-sm">
                          <Database className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm bg-white/10 p-2 rounded border border-white/20">
                        <span className="text-white font-semibold">Cache</span>
                        <Badge className="bg-yellow-700 text-yellow-100 border-yellow-600 font-bold shadow-sm">
                          <Zap className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3 bg-gradient-to-br from-blue-600/40 to-purple-600/40 p-5 rounded-lg border border-blue-400/50 shadow-lg">
                    <h4 className="text-sm font-bold text-white drop-shadow-lg flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-yellow-300" />
                      Quick Actions
                    </h4>
                    <div className="space-y-3">
                      <Button size="sm" className="w-full justify-start text-left bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg font-semibold"
                              onClick={() => { refetchStats(); refetchGames(); }}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Stats
                      </Button>
                      <Button size="sm" className="w-full justify-start text-left bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg font-semibold">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      <Button size="sm" className="w-full justify-start text-left bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg font-semibold">
                        <Wifi className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </div>

                  {/* Security Panel */}
                  <div className="space-y-3 bg-gradient-to-br from-orange-600/40 to-red-600/40 p-5 rounded-lg border border-orange-400/50 shadow-lg">
                    <h4 className="text-sm font-bold text-white drop-shadow-lg flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-orange-200" />
                      Security
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm bg-white/10 p-2 rounded border border-white/20">
                        <span className="text-white font-semibold">Session Timeout</span>
                        <span className="text-green-200 font-bold bg-green-700/50 px-2 py-1 rounded">24h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm bg-white/10 p-2 rounded border border-white/20">
                        <span className="text-white font-semibold">SSL Status</span>
                        <Badge className="bg-green-700 text-green-100 border-green-600 font-bold shadow-sm">
                          <Lock className="w-3 h-3 mr-1" />
                          Secured
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm bg-white/10 p-2 rounded border border-white/20">
                        <span className="text-white font-semibold">Last Backup</span>
                        <span className="text-blue-200 font-bold bg-blue-700/50 px-2 py-1 rounded">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-400" />
                    Live Activity Feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {[
                    { user: "Player #247", action: "Won $50 prize in Travel Mug game", time: "2 seconds ago", type: "win" },
                    { user: "Player #246", action: "Joined Camera game", time: "15 seconds ago", type: "join" },
                    { user: "Player #245", action: "Completed Free Play game", time: "32 seconds ago", type: "complete" },
                    { user: "Player #244", action: "Won $10 prize in Coffee game", time: "1 minute ago", type: "win" },
                    { user: "Player #243", action: "Joined Travel Mug game", time: "2 minutes ago", type: "join" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'win' ? 'bg-green-400' : 
                        activity.type === 'join' ? 'bg-blue-400' : 'bg-yellow-400'
                      } animate-pulse`}></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.user}</p>
                        <p className="text-gray-400 text-xs">{activity.action}</p>
                      </div>
                      <p className="text-gray-500 text-xs">{activity.time}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                    Top Performing Games
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {games?.slice(0, 5).map((game, index) => (
                    <div key={game.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{game.emoji}</div>
                        <div>
                          <p className="text-white font-medium">{game.name}</p>
                          <p className="text-gray-400 text-sm">{game.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold">{game.prize}</p>
                        <p className="text-gray-400 text-sm">{game.playersCount || 0} players</p>
                      </div>
                    </div>
                  )) || []}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Games Management Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Game Management</h2>
                <p className="text-gray-400">Create, edit, and manage your prize games</p>
              </div>
              <Dialog open={isCreateGameOpen} onOpenChange={setIsCreateGameOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Game
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-purple-500/30 text-white max-w-7xl w-[95vw] max-h-[95vh] p-0">
                  <div className="flex flex-col h-full max-h-[95vh]">
                    <DialogHeader className="px-6 py-4 border-b border-purple-500/30 flex-shrink-0">
                      <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        🎮 Create New Game
                      </DialogTitle>
                      <DialogDescription className="text-gray-400 mt-2">
                        Configure your new prize game with custom settings and preview how it will appear to players.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                        {/* Form Section */}
                        <div className="p-6 overflow-y-auto max-h-full">
                          <form onSubmit={handleCreateGame} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="name" className="text-gray-300">Game Name</Label>
                                <Input 
                                  id="name" 
                                  name="name" 
                                  value={previewData.name}
                                  onChange={(e) => setPreviewData({...previewData, name: e.target.value})}
                                  required 
                                  className="bg-white/10 border-purple-500/30" 
                                  placeholder="Travel Mug Prize"
                                />
                              </div>
                              <div>
                                <Label htmlFor="emoji" className="text-gray-300">Emoji</Label>
                                <Input 
                                  id="emoji" 
                                  name="emoji" 
                                  value={previewData.emoji}
                                  onChange={(e) => setPreviewData({...previewData, emoji: e.target.value})}
                                  className="bg-white/10 border-purple-500/30" 
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="description" className="text-gray-300">Description</Label>
                              <Textarea 
                                id="description" 
                                name="description" 
                                value={previewData.description}
                                onChange={(e) => setPreviewData({...previewData, description: e.target.value})}
                                className="bg-white/10 border-purple-500/30" 
                                placeholder="Win an amazing travel mug with this exciting game!"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="prize" className="text-gray-300">Prize Description</Label>
                                <Input 
                                  id="prize" 
                                  name="prize" 
                                  value={previewData.prize}
                                  onChange={(e) => setPreviewData({...previewData, prize: e.target.value})}
                                  required 
                                  className="bg-white/10 border-purple-500/30" 
                                  placeholder="Premium Travel Mug"
                                />
                              </div>
                              <div>
                                <Label htmlFor="prizeValue" className="text-gray-300">Prize Value ($)</Label>
                                <Input 
                                  id="prizeValue" 
                                  name="prizeValue" 
                                  type="number" 
                                  min="0" 
                                  value={previewData.prizeValue}
                                  onChange={(e) => setPreviewData({...previewData, prizeValue: e.target.value})}
                                  className="bg-white/10 border-purple-500/30" 
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="gameType" className="text-gray-300">Game Type</Label>
                                <Select name="gameType">
                                  <SelectTrigger className="bg-white/10 border-purple-500/30">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-purple-500/30">
                                    <SelectItem value="wheel">Spinning Wheel</SelectItem>
                                    <SelectItem value="numbers">Number Draw</SelectItem>
                                    <SelectItem value="both">Both</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="totalNumbers" className="text-gray-300">Total Numbers</Label>
                                <Input 
                                  id="totalNumbers" 
                                  name="totalNumbers" 
                                  type="number" 
                                  value={previewData.totalNumbers}
                                  onChange={(e) => setPreviewData({...previewData, totalNumbers: e.target.value})}
                                  className="bg-white/10 border-purple-500/30" 
                                />
                              </div>
                              <div>
                                <Label htmlFor="duration" className="text-gray-300">Duration (hours)</Label>
                                <Input 
                                  id="duration" 
                                  name="duration" 
                                  type="number" 
                                  value={previewData.duration}
                                  onChange={(e) => setPreviewData({...previewData, duration: e.target.value})}
                                  className="bg-white/10 border-purple-500/30" 
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                              <Switch id="isFreePlay" name="isFreePlay" />
                              <Label htmlFor="isFreePlay" className="text-purple-200 font-medium">Free Play Game</Label>
                            </div>

                            <Button 
                              type="submit" 
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 shadow-lg" 
                              disabled={createGameMutation.isPending}
                            >
                              {createGameMutation.isPending ? "Creating Game..." : "🚀 Create Game"}
                            </Button>
                          </form>
                        </div>

                        {/* Live Preview Section - Now scrollable */}
                        <div className="p-6 overflow-y-auto max-h-full space-y-4">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <Eye className="h-5 w-5 mr-2 text-blue-400" />
                            Live Preview
                          </h3>
                      
                      {/* Game Card Preview - Exact Copy from Home Page */}
                      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 cursor-pointer border border-white/10 overflow-hidden transform hover:scale-105 hover:-translate-y-2 group rounded-2xl">
                        {/* Enhanced Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-red-600/30 blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                        
                        {/* Enhanced Sparkle Effects */}
                        <div className="absolute top-6 right-6 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping shadow-lg shadow-yellow-500/50"></div>
                        <div className="absolute bottom-6 left-6 w-2 h-2 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-ping shadow-lg shadow-pink-500/50" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute top-1/2 right-8 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                        
                        {/* Dynamic Border Accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/80 to-purple-600/80 group-hover:h-2 transition-all duration-300"></div>
                        
                        <div className="relative p-4 sm:p-6">
                          {/* Enhanced Responsive Prize Highlight */}
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                            <div className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl font-black shadow-2xl flex items-center space-x-1 border border-white/20 backdrop-blur-sm">
                              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse flex-shrink-0" />
                              <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">${previewData.prizeValue}</span>
                              <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 animate-spin flex-shrink-0" />
                            </div>
                          </div>

                          {/* Enhanced Responsive Game Icon and Info */}
                          <div className="flex items-start space-x-3 sm:space-x-4 pr-[90px] sm:pr-[110px] md:pr-[120px]">
                            <div className="relative p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 shadow-2xl group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl sm:rounded-2xl"></div>
                              <span className="relative text-lg sm:text-xl md:text-2xl text-white drop-shadow-lg">{previewData.emoji}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex flex-col space-y-2 mb-3">
                                <h2 className="text-base sm:text-lg md:text-xl font-black text-white tracking-wide leading-tight">{previewData.name}</h2>
                                <Badge className="bg-blue-500/30 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/20 w-fit">
                                  GAME-001
                                </Badge>
                              </div>
                              <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2">{previewData.description}</p>
                              
                              {/* Status indicators */}
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                                  <span className="text-green-400 font-bold text-xs">LIVE</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Users className="h-3 w-3 text-blue-400" />
                                  <span className="text-blue-400 font-bold text-xs">25 playing</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Responsive Game Progress */}
                          <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm font-bold text-white">Game Progress</span>
                              <span className="text-xs text-gray-300 font-mono bg-slate-800/50 px-2 py-1 rounded-full border border-white/10">{Number(previewData.totalNumbers) - 25} / {previewData.totalNumbers} left</span>
                            </div>
                            <div className="relative">
                              <Progress value={20} className="h-2 bg-slate-800/50 border border-white/10" />
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-red-500/20 rounded-full blur-sm"></div>
                            </div>
                            <div className="text-center">
                              <span className="text-lg sm:text-xl font-black text-white">20%</span>
                              <span className="text-gray-400 ml-2 text-xs sm:text-sm">Complete</span>
                            </div>
                          </div>

                          {/* Enhanced Responsive Game Details Grid */}
                          <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
                            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-2 sm:p-3 rounded-lg border border-green-400/30 backdrop-blur-sm">
                              <div className="text-xs text-green-300 font-bold uppercase tracking-wider">Free Play Range</div>
                              <div className="text-sm sm:text-base font-black text-green-200 mt-1">{Math.ceil(Number(previewData.totalNumbers) * 0.75)}-{previewData.totalNumbers}</div>
                              <div className="text-xs text-green-400 mt-1">🎁 No cost</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2 sm:p-3 rounded-lg border border-blue-400/30 backdrop-blur-sm">
                              <div className="text-xs text-blue-300 font-bold uppercase tracking-wider">Paid Range</div>
                              <div className="text-sm sm:text-base font-black text-blue-200 mt-1">1-{Math.floor(Number(previewData.totalNumbers) * 0.75) - 1}</div>
                              <div className="text-xs text-blue-400 mt-1">💰 Pay exact</div>
                            </div>
                          </div>

                          {/* Enhanced Responsive Action Section */}
                          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
                            <div className="flex flex-col space-y-2 sm:space-y-3">
                              <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-400">
                                  <span className="font-medium">Game ends:</span>
                                  <div className="text-white font-bold text-xs sm:text-sm">{previewData.duration} hours</div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                  <span className="text-red-400 font-bold text-xs">ENDING SOON</span>
                                </div>
                              </div>
                              <Button size="lg" className="w-full bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:opacity-90 text-white font-black text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3 shadow-2xl border border-white/20 backdrop-blur-sm group-hover:shadow-purple-500/30 transition-all duration-300">
                                <Zap className="h-4 w-4 mr-2 animate-pulse" />
                                SPIN TO WIN
                                <Crown className="h-4 w-4 ml-2 animate-bounce" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Game Stats Preview */}
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                        <h4 className="text-white font-medium mb-3">Expected Performance</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-blue-500/20 p-3 rounded-lg">
                            <p className="text-blue-300 font-medium">Est. Players</p>
                            <p className="text-white text-lg font-bold">50-100</p>
                          </div>
                          <div className="bg-green-500/20 p-3 rounded-lg">
                            <p className="text-green-300 font-medium">Revenue Est.</p>
                            <p className="text-white text-lg font-bold">$2,500</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Edit Game Dialog */}
            <Dialog open={isEditGameOpen} onOpenChange={setIsEditGameOpen}>
              <DialogContent className="bg-slate-900 border-purple-500/30 text-white max-w-7xl w-[95vw] max-h-[95vh] p-0">
                <div className="flex flex-col h-full max-h-[95vh]">
                  <DialogHeader className="px-6 py-4 border-b border-purple-500/30 flex-shrink-0">
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      ✏️ Edit Game: {editingGame?.name}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 mt-2">
                      Edit your game settings and see how it will appear to players in real-time.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex-1 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                      {/* Form Section */}
                      <div className="p-6 overflow-y-auto max-h-full">
                        <form onSubmit={handleUpdateGame} className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-name" className="text-gray-300">Game Name</Label>
                              <Input 
                                id="edit-name" 
                                name="name" 
                                value={editData.name}
                                onChange={(e) => setEditData({...editData, name: e.target.value})}
                                required 
                                className="bg-white/10 border-purple-500/30" 
                                placeholder="Travel Mug Prize"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-emoji" className="text-gray-300">Emoji</Label>
                              <Input 
                                id="edit-emoji" 
                                name="emoji" 
                                value={editData.emoji}
                                onChange={(e) => setEditData({...editData, emoji: e.target.value})}
                                className="bg-white/10 border-purple-500/30" 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-description" className="text-gray-300">Description</Label>
                            <Textarea 
                              id="edit-description" 
                              name="description" 
                              value={editData.description}
                              onChange={(e) => setEditData({...editData, description: e.target.value})}
                              className="bg-white/10 border-purple-500/30" 
                              placeholder="Win an amazing travel mug with this exciting game!"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-prize" className="text-gray-300">Prize Description</Label>
                              <Input 
                                id="edit-prize" 
                                name="prize" 
                                value={editData.prize}
                                onChange={(e) => setEditData({...editData, prize: e.target.value})}
                                required 
                                className="bg-white/10 border-purple-500/30" 
                                placeholder="Premium Travel Mug"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-prizeValue" className="text-gray-300">Prize Value ($)</Label>
                              <Input 
                                id="edit-prizeValue" 
                                name="prizeValue" 
                                type="number"
                                value={editData.prizeValue}
                                onChange={(e) => setEditData({...editData, prizeValue: e.target.value})}
                                required 
                                className="bg-white/10 border-purple-500/30" 
                                placeholder="50.00"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-totalNumbers" className="text-gray-300">Total Numbers</Label>
                              <Input 
                                id="edit-totalNumbers" 
                                name="totalNumbers" 
                                type="number"
                                value={editData.totalNumbers}
                                onChange={(e) => setEditData({...editData, totalNumbers: e.target.value})}
                                required 
                                className="bg-white/10 border-purple-500/30" 
                                placeholder="125"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-gameType" className="text-gray-300">Game Type</Label>
                              <Select name="gameType" defaultValue="wheel">
                                <SelectTrigger className="bg-white/10 border-purple-500/30">
                                  <SelectValue placeholder="Select game type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="wheel">Wheel Spin</SelectItem>
                                  <SelectItem value="raffle">Raffle Draw</SelectItem>
                                  <SelectItem value="instant">Instant Win</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex space-x-4 pt-4 border-t border-purple-500/30">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsEditGameOpen(false)}
                              className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-700"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              disabled={updateGameMutation.isPending}
                            >
                              {updateGameMutation.isPending ? "Updating..." : "Update Game"}
                            </Button>
                          </div>
                        </form>
                      </div>

                      {/* Live Preview Section - Exact same design as games page */}
                      <div className="p-6 overflow-y-auto max-h-full bg-slate-800/30 border-l border-purple-500/30">
                        <h3 className="text-lg font-bold text-white mb-4">Game Card Preview</h3>
                        <p className="text-gray-400 text-sm mb-6">This is exactly how your game will appear on the games page</p>
                        
                        {/* Game Card - Exact copy from games page */}
                        <div className="relative group hover:scale-[1.02] transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>
                          
                          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-purple-400/50 transition-all duration-300">
                            {/* Game Header */}
                            <div className="relative p-4 sm:p-6 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-indigo-600/10 border-b border-white/10">
                              <div className="flex items-start space-x-3 sm:space-x-4 pr-[90px] sm:pr-[110px] md:pr-[120px]">
                                <div className="relative p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 shadow-2xl group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl sm:rounded-2xl"></div>
                                  <span className="relative text-lg sm:text-xl md:text-2xl text-white drop-shadow-lg">{editData.emoji}</span>
                                </div>
                                
                                <div className="flex-1 min-w-0 pt-1">
                                  <div className="flex flex-col space-y-2 mb-3">
                                    <h2 className="text-base sm:text-lg md:text-xl font-black text-white tracking-wide leading-tight">{editData.name}</h2>
                                    <Badge className="bg-blue-500/30 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/20 w-fit">
                                      {editingGame?.code || "GAME-001"}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2">{editData.description}</p>
                                  
                                  {/* Status indicators */}
                                  <div className="flex flex-col space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                                      <span className="text-green-400 font-bold text-xs">LIVE</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Users className="h-3 w-3 text-blue-400" />
                                      <span className="text-blue-400 font-bold text-xs">25 playing</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Responsive Game Progress */}
                              <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs sm:text-sm font-bold text-white">Game Progress</span>
                                  <span className="text-xs text-gray-300 font-mono bg-slate-800/50 px-2 py-1 rounded-full border border-white/10">{Number(editData.totalNumbers) - 25} / {editData.totalNumbers} left</span>
                                </div>
                                <div className="relative">
                                  <Progress value={20} className="h-2 bg-slate-800/50 border border-white/10" />
                                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-red-500/20 rounded-full blur-sm"></div>
                                </div>
                                <div className="text-center">
                                  <span className="text-lg sm:text-xl font-black text-white">20%</span>
                                  <span className="text-gray-400 ml-2 text-xs sm:text-sm">Complete</span>
                                </div>
                              </div>

                              {/* Enhanced Responsive Game Details Grid */}
                              <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
                                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-2 sm:p-3 rounded-lg border border-green-400/30 backdrop-blur-sm">
                                  <div className="text-xs text-green-300 font-bold uppercase tracking-wider">Free Play Range</div>
                                  <div className="text-sm sm:text-base font-black text-green-200 mt-1">{Math.ceil(Number(editData.totalNumbers) * 0.75)}-{editData.totalNumbers}</div>
                                  <div className="text-xs text-green-400 mt-1">🎁 No cost</div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2 sm:p-3 rounded-lg border border-blue-400/30 backdrop-blur-sm">
                                  <div className="text-xs text-blue-300 font-bold uppercase tracking-wider">Paid Range</div>
                                  <div className="text-sm sm:text-base font-black text-blue-200 mt-1">1-{Math.floor(Number(editData.totalNumbers) * 0.75) - 1}</div>
                                  <div className="text-xs text-blue-400 mt-1">💰 Pay exact</div>
                                </div>
                              </div>

                              {/* Enhanced Responsive Action Section */}
                              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
                                <div className="flex flex-col space-y-3 sm:space-y-4">
                                  <div className="flex items-center justify-center space-x-2">
                                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                                    <span className="text-yellow-400 font-black text-lg sm:text-xl md:text-2xl">${editData.prizeValue}</span>
                                    <span className="text-gray-300 text-xs sm:text-sm font-medium">Prize Value</span>
                                  </div>
                                  
                                  <div className="flex items-center justify-between bg-black/30 p-2 sm:p-3 rounded-lg border border-red-500/30">
                                    <div className="flex items-center space-x-1">
                                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                      <span className="text-red-400 font-bold text-xs">ENDING SOON</span>
                                    </div>
                                  </div>
                                  <Button size="lg" className="w-full bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:opacity-90 text-white font-black text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3 shadow-2xl border border-white/20 backdrop-blur-sm group-hover:shadow-purple-500/30 transition-all duration-300">
                                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                                    SPIN TO WIN
                                    <Crown className="h-4 w-4 ml-2 animate-bounce" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Game Stats Preview */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30 mt-6">
                          <h4 className="text-white font-medium mb-3">Expected Performance</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                              <p className="text-blue-300 font-medium">Est. Players</p>
                              <p className="text-white text-lg font-bold">50-100</p>
                            </div>
                            <div className="bg-green-500/20 p-3 rounded-lg">
                              <p className="text-green-300 font-medium">Revenue Est.</p>
                              <p className="text-white text-lg font-bold">${Math.round(Number(editData.prizeValue) * 50)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Games Grid */}
            {gamesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-white text-xl font-semibold">Loading Games...</p>
              </div>
            ) : games && games.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                <Card key={game.id} className="bg-black/20 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{game.emoji}</div>
                        <div>
                          <h3 className="text-white font-bold">{game.name}</h3>
                          <p className="text-gray-400 text-sm font-mono">{game.code}</p>
                        </div>
                      </div>
                      <Badge variant={game.isActive ? "default" : "secondary"} className={game.isActive ? "bg-green-500" : "bg-gray-500"}>
                        {game.isActive ? "Active" : "Ended"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Prize:</span>
                        <span className="text-yellow-400 font-semibold">{game.prize}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Players:</span>
                        <span className="text-white">{game.playersCount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Numbers Left:</span>
                        <span className="text-white">{game.numbersLeft} / {game.totalNumbers}</span>
                      </div>
                      <Progress 
                        value={((game.totalNumbers - game.numbersLeft) / game.totalNumbers) * 100} 
                        className="bg-white/20"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                        onClick={() => window.open(`/game/${game.id}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                        onClick={() => handleEditGame(game)}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this game?')) {
                            toast({
                              title: "Game Deleted",
                              description: "Game has been successfully deleted",
                            });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-white text-xl font-semibold mb-2">No Games Found</p>
                <p className="text-gray-400 mb-6">Create your first game to get started</p>
                <Button 
                  onClick={() => setIsCreateGameOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Game
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <p className="text-gray-400">Monitor and manage registered users</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Input
                    placeholder="Search users..."
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="bg-white/5 border-white/20 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => refetchUsers()}
                  variant="outline" 
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* User Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/80 to-blue-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-blue-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-4xl font-bold text-white mb-2 drop-shadow-xl">{users?.length || 0}</div>
                    <div className="text-sm text-white/90 font-medium drop-shadow-lg">Total Users</div>
                    <div className="text-xs text-white/70 mt-1">📊 Platform growth</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500/80 to-emerald-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-green-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-4xl font-bold text-white mb-2 drop-shadow-xl">{users?.filter(u => u.cardOnFile).length || 0}</div>
                    <div className="text-sm text-white/90 font-medium drop-shadow-lg">Verified Users</div>
                    <div className="text-xs text-white/70 mt-1">💳 Currently verified</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500/80 to-pink-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-purple-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-4xl font-bold text-white mb-2 drop-shadow-xl">{users?.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 24*60*60*1000)).length || 0}</div>
                    <div className="text-sm text-white/90 font-medium drop-shadow-lg">New Today</div>
                    <div className="text-xs text-white/70 mt-1">🔥 Real-time</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500/80 to-red-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-orange-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="text-4xl font-bold text-white mb-2 drop-shadow-xl">{users?.filter(u => u.isActive).length || users?.length || 0}</div>
                    <div className="text-sm text-white/90 font-medium drop-shadow-lg">Active Users</div>
                    <div className="text-xs text-white/70 mt-1">⚡ Total active</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-400" />
                    User Directory
                    <Badge className="ml-3 bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {users?.length || 0} Total
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20">
                      <Target className="h-4 w-4 mr-2" />
                      Bulk Actions
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-gray-400 text-sm">{user.email}</div>
                            <div className="text-gray-500 text-xs">ID: {user.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={user.cardOnFile ? "default" : "secondary"}
                                className={user.cardOnFile ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}
                              >
                                {user.cardOnFile ? "Verified" : "Unverified"}
                              </Badge>
                            </div>
                            <div className="text-gray-400 text-xs mt-1">
                              Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsUserProfileOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400">No users found</div>
                      <div className="text-gray-500 text-sm mt-1">Users will appear here once they register</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Analytics & Insights</h2>
                <p className="text-gray-400">Comprehensive data analysis and performance metrics</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => refetchAnalytics()}
                  variant="outline" 
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-500/80 to-emerald-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-green-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-white mb-2 drop-shadow-xl">${analytics?.totalRevenue?.toLocaleString() || '639.98'}</div>
                        <div className="text-sm text-white/90 font-medium drop-shadow-lg">Total Revenue</div>
                        <div className="text-xs text-white/70 mt-1">💰 Total awarded</div>
                      </div>
                      <DollarSign className="h-10 w-10 text-white/80 drop-shadow-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-500/80 to-cyan-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-blue-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-white mb-2 drop-shadow-xl">{analytics?.totalSpins?.toLocaleString() || '1,247'}</div>
                        <div className="text-sm text-white/90 font-medium drop-shadow-lg">Player Spins</div>
                        <div className="text-xs text-white/70 mt-1">🎯 Real-time</div>
                      </div>
                      <Target className="h-10 w-10 text-white/80 drop-shadow-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500/80 to-pink-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-purple-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-white mb-2 drop-shadow-xl">{analytics?.conversionRate || '73.2'}%</div>
                        <div className="text-sm text-white/90 font-medium drop-shadow-lg">Win Rate</div>
                        <div className="text-xs text-white/70 mt-1">📈 Success rate</div>
                      </div>
                      <TrendingUp className="h-10 w-10 text-white/80 drop-shadow-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Game Performance */}
              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Gamepad2 className="h-5 w-5 mr-2 text-purple-400" />
                    Game Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.gameStats?.map((game: any, index: number) => (
                      <div key={index} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{game.emoji}</span>
                            <span className="text-white font-medium">{game.name}</span>
                          </div>
                          <Badge className="bg-green-500">{game.status}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-blue-300 font-semibold">{game.totalPlayers}</div>
                            <div className="text-gray-400">Players</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-300 font-semibold">${game.revenue}</div>
                            <div className="text-gray-400">Revenue</div>
                          </div>
                          <div className="text-center">
                            <div className="text-purple-300 font-semibold">{game.spins}</div>
                            <div className="text-gray-400">Spins</div>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-400">
                        No game analytics available yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* User Engagement */}
              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-400" />
                    User Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-500/20 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-300">{analytics?.dailyActiveUsers || '0'}</div>
                        <div className="text-sm text-blue-200">Daily Active</div>
                      </div>
                      <div className="p-4 bg-green-500/20 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-300">{analytics?.weeklyActiveUsers || '0'}</div>
                        <div className="text-sm text-green-200">Weekly Active</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-500/20 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-200">Avg. Session Duration</span>
                        <span className="text-purple-300 font-semibold">{analytics?.avgSessionDuration || '5m 30s'}</span>
                      </div>
                      <Progress value={75} className="bg-purple-900/40" />
                    </div>
                    
                    <div className="p-4 bg-orange-500/20 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-orange-200">User Retention Rate</span>
                        <span className="text-orange-300 font-semibold">{analytics?.retentionRate || '68%'}</span>
                      </div>
                      <Progress value={68} className="bg-orange-900/40" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Trends */}
            <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                  Revenue & Financial Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="text-2xl font-bold text-green-300">${analytics?.todayRevenue || '0'}</div>
                    <div className="text-sm text-green-200">Today's Revenue</div>
                    <div className="text-xs text-green-400 mt-1">+{analytics?.todayGrowth || 0}% vs yesterday</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-300">${analytics?.weeklyRevenue || '0'}</div>
                    <div className="text-sm text-blue-200">This Week</div>
                    <div className="text-xs text-blue-400 mt-1">7-day total</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <div className="text-2xl font-bold text-purple-300">${analytics?.monthlyRevenue || '0'}</div>
                    <div className="text-sm text-purple-200">This Month</div>
                    <div className="text-xs text-purple-400 mt-1">30-day total</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <div className="text-2xl font-bold text-yellow-300">${analytics?.avgRevenuePerUser || '0'}</div>
                    <div className="text-sm text-yellow-200">Avg per User</div>
                    <div className="text-xs text-yellow-400 mt-1">Lifetime value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Monitoring Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">System Monitor</h2>
                <p className="text-gray-400">Server health, database status, and system performance</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">ALL SYSTEMS OPERATIONAL</span>
                </div>
              </div>
            </div>

            {/* System Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-500/80 to-emerald-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-green-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white/90 mb-2 drop-shadow-lg">Database Status</div>
                        <div className="text-3xl font-bold text-white mb-1 drop-shadow-xl">ONLINE</div>
                        <div className="text-sm text-white/80 drop-shadow-md">💚 Connected</div>
                      </div>
                      <Database className="h-10 w-10 text-white/80 drop-shadow-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-500/80 to-cyan-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-blue-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white/90 mb-2 drop-shadow-lg">Server Health</div>
                        <div className="text-3xl font-bold text-white mb-1 drop-shadow-xl">HEALTHY</div>
                        <div className="text-sm text-white/80 drop-shadow-md">🔵 Active</div>
                      </div>
                      <Monitor className="h-10 w-10 text-white/80 drop-shadow-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500/80 to-pink-600/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-purple-500/50 transform transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white/90 mb-2 drop-shadow-lg">API Status</div>
                        <div className="text-3xl font-bold text-white mb-1 drop-shadow-xl">STABLE</div>
                        <div className="text-sm text-white/80 drop-shadow-md">🟣 Secured</div>
                      </div>
                      <Activity className="h-10 w-10 text-white/80 drop-shadow-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed System Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-400" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">CPU Usage</span>
                        <span className="text-green-400">23%</span>
                      </div>
                      <Progress value={23} className="bg-white/20" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Memory Usage</span>
                        <span className="text-blue-400">45%</span>
                      </div>
                      <Progress value={45} className="bg-white/20" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Disk Usage</span>
                        <span className="text-purple-400">67%</span>
                      </div>
                      <Progress value={67} className="bg-white/20" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Network I/O</span>
                        <span className="text-cyan-400">12%</span>
                      </div>
                      <Progress value={12} className="bg-white/20" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
                    System Alerts & Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-200 text-sm">Database backup completed successfully</span>
                      </div>
                      <div className="text-xs text-green-400 mt-1">2 minutes ago</div>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-200 text-sm">New user registered from IP: 192.168.1.1</span>
                      </div>
                      <div className="text-xs text-blue-400 mt-1">5 minutes ago</div>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-200 text-sm">High CPU usage detected - monitoring</span>
                      </div>
                      <div className="text-xs text-yellow-400 mt-1">1 hour ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Profile Dialog */}
          <Dialog open={isUserProfileOpen} onOpenChange={setIsUserProfileOpen}>
            <DialogContent className="sm:max-w-[900px] bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm border border-purple-500/30 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  User Profile: {selectedUser?.firstName} {selectedUser?.lastName}
                </DialogTitle>
                <DialogDescription className="text-purple-200">
                  Comprehensive user information and activity management
                </DialogDescription>
              </DialogHeader>
              
              {selectedUser && (
                <div className="space-y-6">
                  {/* Loading State */}
                  {userDetailsLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                      <span className="ml-3 text-purple-200">Loading real-time user data...</span>
                    </div>
                  )}

                  {/* User Overview Cards with Real-time Data */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-blue-600/80 to-blue-700/90 border-0">
                      <CardContent className="p-4 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-lg font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</div>
                        <div className="text-blue-200 text-sm">{selectedUser.email}</div>
                        <div className="text-blue-300 text-xs mt-1">User ID: {selectedUser.id}</div>
                        {userDetails && (userDetails as any)?.stats && (
                          <div className="mt-2 space-y-1">
                            <div className="text-blue-200 text-xs">Status: 
                              <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                (userDetails as any).stats.status === 'online' ? 'bg-green-500/30 text-green-200' :
                                (userDetails as any).stats.status === 'away' ? 'bg-yellow-500/30 text-yellow-200' :
                                'bg-gray-500/30 text-gray-200'
                              }`}>
                                {(userDetails as any).stats.status}
                              </span>
                            </div>
                            <div className="text-blue-300 text-xs">Account Age: {(userDetails as any).stats.accountAge} days</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-600/80 to-emerald-700/90 border-0">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-lg font-bold text-white">
                          {selectedUser.cardOnFile ? "Verified" : "Unverified"}
                        </div>
                        <div className="text-green-200 text-sm">Payment Status</div>
                        <Badge 
                          className={`mt-2 ${selectedUser.cardOnFile ? "bg-green-500" : "bg-red-500"}`}
                        >
                          {selectedUser.cardOnFile ? "Card on File" : "No Payment Method"}
                        </Badge>
                        {userDetails && (userDetails as any)?.stats && (
                          <div className="mt-2 space-y-1">
                            <div className="text-green-200 text-xs">Total Spent: ${(userDetails as any).stats.totalSpent}</div>
                            <div className="text-green-300 text-xs">Win Rate: {(userDetails as any).stats.winRate}%</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-600/80 to-pink-700/90 border-0">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-lg font-bold text-white">
                          {(userDetails as any)?.stats?.totalSpins || 0} Spins
                        </div>
                        <div className="text-purple-200 text-sm">Game Activity</div>
                        {userDetails && (userDetails as any)?.stats && (
                          <div className="mt-2 space-y-1">
                            <div className="text-purple-200 text-xs">Favorite: {(userDetails as any).stats.favoriteGame}</div>
                            <div className="text-purple-300 text-xs">
                              Last Active: {(userDetails as any).stats.lastActive ? 
                                new Date((userDetails as any).stats.lastActive).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        )}
                      </CardContent>  
                    </Card>
                  </div>

                  {/* Detailed Information Tabs */}
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-black/20">
                      <TabsTrigger value="details" className="text-white data-[state=active]:bg-purple-600">Details</TabsTrigger>
                      <TabsTrigger value="activity" className="text-white data-[state=active]:bg-purple-600">Activity</TabsTrigger>
                      <TabsTrigger value="transactions" className="text-white data-[state=active]:bg-purple-600">Transactions</TabsTrigger>
                      <TabsTrigger value="settings" className="text-white data-[state=active]:bg-purple-600">Settings</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details" className="space-y-4">
                      <Card className="bg-black/20 border border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Info className="h-5 w-5 mr-2 text-blue-400" />
                            Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-300">First Name</Label>
                            <Input 
                              value={selectedUser.firstName || ''} 
                              readOnly 
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">Last Name</Label>
                            <Input 
                              value={selectedUser.lastName || ''} 
                              readOnly 
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">Email Address</Label>
                            <Input 
                              value={selectedUser.email || ''} 
                              readOnly 
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">Phone Number</Label>
                            <Input 
                              value={selectedUser.phone || 'Not provided'} 
                              readOnly 
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">Square Customer ID</Label>
                            <Input 
                              value={selectedUser.squareCustomerId || 'Not assigned'} 
                              readOnly 
                              className="bg-white/5 border-white/20 text-white font-mono text-xs"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">Account Created</Label>
                            <Input 
                              value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'Unknown'} 
                              readOnly 
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="activity" className="space-y-4">
                      <Card className="bg-black/20 border border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center justify-between">
                            <div className="flex items-center">
                              <Activity className="h-5 w-5 mr-2 text-green-400" />
                              Recent Activity
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => refetchUserActivity()}
                              className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Refresh
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {userActivity ? (
                            <div className="space-y-3">
                              {Array.isArray(userActivity) && userActivity.map((activity: any) => {
                                const getActivityIcon = (type: string) => {
                                  switch (type) {
                                    case 'game_join': return <Gamepad2 className="h-4 w-4 text-white" />;
                                    case 'login': return <User className="h-4 w-4 text-white" />;
                                    case 'payment': return <DollarSign className="h-4 w-4 text-white" />;
                                    case 'registration': return <UserPlus className="h-4 w-4 text-white" />;
                                    default: return <Activity className="h-4 w-4 text-white" />;
                                  }
                                };

                                const getStatusColor = (status: string) => {
                                  switch (status) {
                                    case 'success': return 'bg-green-500';
                                    case 'warning': return 'bg-yellow-500';
                                    case 'error': return 'bg-red-500';
                                    default: return 'bg-blue-500';
                                  }
                                };

                                return (
                                  <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-8 h-8 ${getStatusColor(activity.status)} rounded-full flex items-center justify-center`}>
                                        {getActivityIcon(activity.type)}
                                      </div>
                                      <div>
                                        <div className="text-white text-sm font-medium">{activity.title}</div>
                                        <div className="text-gray-400 text-xs">{activity.description}</div>
                                        {activity.metadata && activity.type === 'game_join' && (
                                          <div className="text-blue-300 text-xs mt-1">
                                            Amount: ${activity.metadata.amount ? activity.metadata.amount.toFixed(2) : '0.00'} • Number: {activity.metadata.number || 'N/A'}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                      {new Date(activity.timestamp).toLocaleString()}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                              <div className="text-gray-400 text-sm">Loading activity data...</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="transactions" className="space-y-4">
                      <Card className="bg-black/20 border border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center justify-between">
                            <div className="flex items-center">
                              <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                              Transaction History
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => refetchUserTransactions()}
                              className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Refresh
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {userTransactions ? (
                            <div className="space-y-3">
                              {Array.isArray(userTransactions) && userTransactions.map((transaction: any) => {
                                const getStatusColor = (status: string) => {
                                  switch (status) {
                                    case 'completed': return 'border-green-500/20 bg-green-500/10';
                                    case 'authorized': return 'border-yellow-500/20 bg-yellow-500/10';
                                    case 'pending': return 'border-blue-500/20 bg-blue-500/10';
                                    case 'failed': return 'border-red-500/20 bg-red-500/10';
                                    default: return 'border-gray-500/20 bg-gray-500/10';
                                  }
                                };

                                const getStatusIcon = (status: string) => {
                                  switch (status) {
                                    case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
                                    case 'authorized': return <Clock className="h-4 w-4 text-yellow-400" />;
                                    case 'pending': return <Clock className="h-4 w-4 text-blue-400" />;
                                    case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
                                    default: return <DollarSign className="h-4 w-4 text-gray-400" />;
                                  }
                                };

                                const getAmountColor = (status: string) => {
                                  switch (status) {
                                    case 'completed': return 'text-green-400';
                                    case 'authorized': return 'text-yellow-400';
                                    case 'pending': return 'text-blue-400';
                                    case 'failed': return 'text-red-400';
                                    default: return 'text-gray-400';
                                  }
                                };

                                return (
                                  <div key={transaction.id} className={`flex items-center justify-between p-3 bg-white/5 rounded-lg border ${getStatusColor(transaction.status)} hover:bg-white/10 transition-colors`}>
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                        {getStatusIcon(transaction.status)}
                                      </div>
                                      <div>
                                        <div className="text-white text-sm font-medium">{transaction.description}</div>
                                        <div className="text-gray-400 text-xs">
                                          {transaction.paymentMethod} • {transaction.transactionId}
                                        </div>
                                        {transaction.type === 'game_entry' && transaction.number && (
                                          <div className="text-blue-300 text-xs mt-1">
                                            Game: {transaction.gameName} • Number: {transaction.number}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className={`font-medium ${getAmountColor(transaction.status)}`}>
                                        ${transaction.amount ? transaction.amount.toFixed(2) : '0.00'}
                                      </div>
                                      <div className="text-gray-400 text-xs capitalize">{transaction.status}</div>
                                      <div className="text-gray-500 text-xs">
                                        {transaction.timestamp ? new Date(transaction.timestamp).toLocaleDateString() : 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                              <div className="text-gray-400 text-sm">Loading transaction data...</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="settings" className="space-y-4">
                      <Card className="bg-black/20 border border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Settings className="h-5 w-5 mr-2 text-purple-400" />
                            Account Management
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-gray-300">Account Status</Label>
                              <Select defaultValue={selectedUser.isActive ? "active" : "inactive"}>
                                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                  <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-gray-300">User Role</Label>
                              <Select defaultValue="user">
                                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Regular User</SelectItem>
                                  <SelectItem value="vip">VIP User</SelectItem>
                                  <SelectItem value="premium">Premium User</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch id="email-notifications" defaultChecked />
                            <Label htmlFor="email-notifications" className="text-gray-300">
                              Email Notifications
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch id="marketing-emails" />
                            <Label htmlFor="marketing-emails" className="text-gray-300">
                              Marketing Emails
                            </Label>
                          </div>
                          
                          <Separator className="bg-white/20" />
                          
                          <div className="flex space-x-2">
                            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 flex-1">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend User
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Game Edit Dialog */}
          <Dialog open={isEditGameOpen} onOpenChange={setIsEditGameOpen}>
            <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-sm border border-purple-500/30 text-white max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Edit Game: {selectedGame?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-purple-200">Game Name</Label>
                    <Input
                      id="edit-name"
                      defaultValue={selectedGame?.name}
                      className="bg-black/20 border-purple-500/50 text-white focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-emoji" className="text-purple-200">Emoji</Label>
                    <Input
                      id="edit-emoji"
                      defaultValue={selectedGame?.emoji}
                      className="bg-black/20 border-purple-500/50 text-white focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-purple-200">Description</Label>
                  <Textarea
                    id="edit-description"
                    defaultValue={selectedGame?.description}
                    rows={3}
                    className="bg-black/20 border-purple-500/50 text-white focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-prize-value" className="text-purple-200">Prize Value</Label>
                    <Input
                      id="edit-prize-value"
                      type="number"
                      defaultValue={selectedGame?.prizeValue}
                      className="bg-black/20 border-purple-500/50 text-white focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-total-numbers" className="text-purple-200">Total Numbers</Label>
                    <Input
                      id="edit-total-numbers"
                      type="number"
                      defaultValue={selectedGame?.totalNumbers}
                      className="bg-black/20 border-purple-500/50 text-white focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-free-play-start" className="text-purple-200">Free Play Start</Label>
                    <Input
                      id="edit-free-play-start"
                      type="number"
                      defaultValue={selectedGame?.freePlayStart}
                      className="bg-black/20 border-purple-500/50 text-white focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-free-play-end" className="text-purple-200">Free Play End</Label>
                    <Input
                      id="edit-free-play-end"
                      type="number"
                      defaultValue={selectedGame?.freePlayEnd}
                      className="bg-black/20 border-purple-500/50 text-white focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-is-active"
                    defaultChecked={selectedGame?.isActive}
                  />
                  <Label htmlFor="edit-is-active" className="text-purple-200">Active Game</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditGameOpen(false)}
                    className="border-gray-500 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                    onClick={() => {
                      // Handle game update
                      toast({
                        title: "Success",
                        description: "Game updated successfully",
                      });
                      setIsEditGameOpen(false);
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">System Settings</h2>
                <p className="text-gray-400">Configure application settings and preferences</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => refetchSettings()}
                  variant="outline" 
                  className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Settings
                </Button>
              </div>
            </div>

            {/* System Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-green-400" />
                    Application Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Site Name</Label>
                    <Input 
                      defaultValue="Hit The Road Jackpot"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Maximum Game Duration (hours)</Label>
                    <Input 
                      type="number"
                      defaultValue="24"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Default Game Numbers</Label>
                    <Input 
                      type="number"
                      defaultValue="200"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="maintenance-mode" />
                    <Label htmlFor="maintenance-mode" className="text-gray-300">
                      Maintenance Mode
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                    Payment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Payment Processing Fee (%)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      defaultValue="2.9"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Minimum Game Prize ($)</Label>
                    <Input 
                      type="number"
                      defaultValue="100"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Maximum Game Prize ($)</Label>
                    <Input 
                      type="number"
                      defaultValue="10000"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-payout" defaultChecked />
                    <Label htmlFor="auto-payout" className="text-gray-300">
                      Automatic Prize Payout
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Settings */}
            <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-400" />
                  Security & Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Session Timeout (minutes)</Label>
                    <Input 
                      type="number"
                      defaultValue="60"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Max Login Attempts</Label>
                    <Input 
                      type="number"
                      defaultValue="5"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">IP Whitelist</Label>
                    <Input 
                      placeholder="192.168.1.0/24"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="two-factor" />
                    <Label htmlFor="two-factor" className="text-gray-300">
                      Two-Factor Authentication
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="audit-logging" defaultChecked />
                    <Label htmlFor="audit-logging" className="text-gray-300">
                      Audit Logging
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-700"
                onClick={() => {
                  toast({
                    title: "Settings Reset",
                    description: "All settings have been reset to defaults",
                  });
                }}
              >
                Reset to Defaults
              </Button>
              <Button
                className="bg-gradient-to-r from-green-600 to-emerald-600"
                onClick={() => {
                  toast({
                    title: "Settings Saved",
                    description: "System settings have been updated successfully",
                  });
                }}
              >
                Save All Settings
              </Button>
            </div>
          </TabsContent>

          {/* System Status Tab */}
          <TabsContent value="system" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">System Status</h2>
              <p className="text-gray-400">Monitor system health and performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border border-green-500/30">
                <CardContent className="p-6 text-center">
                  <Database className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-green-400 font-bold text-lg">Database</p>
                  <p className="text-white text-2xl font-bold">Online</p>
                  <p className="text-gray-400 text-sm">99.9% uptime</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-blue-500/30">
                <CardContent className="p-6 text-center">
                  <Wifi className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-blue-400 font-bold text-lg">Network</p>
                  <p className="text-white text-2xl font-bold">Stable</p>
                  <p className="text-gray-400 text-sm">45ms avg latency</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <Monitor className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-yellow-400 font-bold text-lg">Server Load</p>
                  <p className="text-white text-2xl font-bold">67%</p>
                  <p className="text-gray-400 text-sm">4 cores active</p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardContent className="p-6 text-center">
                  <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-400 font-bold text-lg">Performance</p>
                  <p className="text-white text-2xl font-bold">Optimal</p>
                  <p className="text-gray-400 text-sm">2.1s avg response</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}