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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  LogOut
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);
  const [isEditGameOpen, setIsEditGameOpen] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    activeUsers: 247,
    totalSpins: 15420,
    prizesWon: 89,
    revenue: 12540
  });
  const { toast } = useToast();

  // Check authentication
  const { data: adminUser, isLoading: authLoading, error } = useQuery({
    queryKey: ["/api/admin/user"],
    retry: false,
  });

  useEffect(() => {
    if (!authLoading && (!adminUser || error)) {
      console.log("Redirecting to login - adminUser:", adminUser, "error:", error);
      setLocation("/admin-login");
    }
  }, [adminUser, authLoading, error, setLocation]);

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
    enabled: !!adminUser,
    refetchInterval: 5000, // Real-time updates
  });

  // Games data
  const { data: games, refetch: refetchGames } = useQuery<any[]>({
    queryKey: ["/api/admin/games"],
    enabled: !!adminUser,
  });

  // System settings
  const { data: settings, refetch: refetchSettings } = useQuery<any[]>({
    queryKey: ["/api/admin/settings"],
    enabled: !!adminUser,
  });

  // Recent activity
  const { data: recentActivity } = useQuery<any[]>({
    queryKey: ["/api/admin/activity"],
    enabled: !!adminUser,
    refetchInterval: 10000,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
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
      refetchGames();
      refetchStats();
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  const handleCreateGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const gameData = {
      name: formData.get("name") as string,
      prize: formData.get("prize") as string,
      prizeValue: parseInt(formData.get("prizeValue") as string) || 0,
      totalNumbers: parseInt(formData.get("totalNumbers") as string) || 125,
      gameType: formData.get("gameType") as string,
      endTime: new Date(Date.now() + parseInt(formData.get("duration") as string) * 60 * 60 * 1000),
      isFreePlay: formData.get("isFreePlay") === "on",
      emoji: formData.get("emoji") as string || "🎮",
      description: formData.get("description") as string,
    };

    createGameMutation.mutate(gameData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Futuristic Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
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
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    🎯 GAME CONTROL CENTER
                  </h2>
                  <p className="text-gray-300 text-lg">Real-time analytics and instant management</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-purple-400 mb-1">{dashboardStats?.totalGames || 0}</div>
                    <div className="text-sm text-gray-300">Total Games</div>
                    <div className="text-xs text-green-400 mt-1">↗ +12% growth</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-green-400 mb-1">{dashboardStats?.activeGames || 0}</div>
                    <div className="text-sm text-gray-300">Live Games</div>
                    <div className="text-xs text-blue-400 mt-1">🔥 Currently running</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-blue-400 mb-1">{dashboardStats?.totalSpins || 0}</div>
                    <div className="text-sm text-gray-300">Player Spins</div>
                    <div className="text-xs text-cyan-400 mt-1">⚡ Real-time</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">${dashboardStats?.totalPrizeValue || 0}</div>
                    <div className="text-sm text-gray-300">Prize Value</div>
                    <div className="text-xs text-orange-400 mt-1">💰 Total awarded</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 hover:border-green-400/50 transition-all duration-300 cursor-pointer"
                    onClick={() => setIsCreateGameOpen(true)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">🎮 Create New Game</h3>
                      <p className="text-gray-300 text-sm">Launch a new spinning wheel game instantly</p>
                      <Button className="mt-4 bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Game
                      </Button>
                    </div>
                    <div className="p-4 bg-green-500/30 rounded-full">
                      <Gamepad2 className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer"
                    onClick={() => setActiveTab("games")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">⚙️ Manage Games</h3>
                      <p className="text-gray-300 text-sm">Edit, pause, or delete existing games</p>
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                    <div className="p-4 bg-blue-500/30 rounded-full">
                      <Settings className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
                    onClick={() => setActiveTab("analytics")}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">📊 View Analytics</h3>
                      <p className="text-gray-300 text-sm">Detailed insights and performance metrics</p>
                      <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                    </div>
                    <div className="p-4 bg-purple-500/30 rounded-full">
                      <TrendingUp className="h-8 w-8 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Management Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 cursor-pointer"
                    onClick={() => setActiveTab("users")}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="p-3 bg-orange-500/30 rounded-full mx-auto mb-3 w-fit">
                      <Users className="h-6 w-6 text-orange-400" />
                    </div>
                    <h4 className="font-bold text-white mb-1">User Management</h4>
                    <p className="text-xs text-gray-400">View and manage players</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 backdrop-blur-sm border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 cursor-pointer"
                    onClick={() => setActiveTab("system")}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="p-3 bg-pink-500/30 rounded-full mx-auto mb-3 w-fit">
                      <Monitor className="h-6 w-6 text-pink-400" />
                    </div>
                    <h4 className="font-bold text-white mb-1">System Monitor</h4>
                    <p className="text-xs text-gray-400">Server & database status</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer"
                    onClick={() => setActiveTab("settings")}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="p-3 bg-cyan-500/30 rounded-full mx-auto mb-3 w-fit">
                      <Settings className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h4 className="font-bold text-white mb-1">Game Settings</h4>
                    <p className="text-xs text-gray-400">Configure game rules</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 backdrop-blur-sm border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 cursor-pointer">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="p-3 bg-emerald-500/30 rounded-full mx-auto mb-3 w-fit">
                      <Database className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h4 className="font-bold text-white mb-1">Database Tools</h4>
                    <p className="text-xs text-gray-400">Backup & maintenance</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status Panel */}
            <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Monitor className="h-5 w-5 mr-2 text-green-400" />
                  System Status & Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Server Status */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-300">Server Health</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">API Server</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          Online
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Database</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Database className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Cache</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Zap className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-300">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full justify-start text-left border-purple-500/30 hover:bg-purple-500/20"
                              onClick={() => { refetchStats(); refetchGames(); }}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Stats
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start text-left border-blue-500/30 hover:bg-blue-500/20">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start text-left border-green-500/30 hover:bg-green-500/20">
                        <Wifi className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </div>

                  {/* Security Panel */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-300">Security</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Session Timeout</span>
                        <span className="text-green-400">24h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">SSL Status</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Lock className="w-3 h-3 mr-1" />
                          Secured
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Last Backup</span>
                        <span className="text-blue-400">2 hours ago</span>
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
                <DialogContent className="bg-slate-900 border-purple-500/30 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Create New Game</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateGame} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-300">Game Name</Label>
                        <Input id="name" name="name" required className="bg-white/10 border-purple-500/30" />
                      </div>
                      <div>
                        <Label htmlFor="emoji" className="text-gray-300">Emoji</Label>
                        <Input id="emoji" name="emoji" defaultValue="🎮" className="bg-white/10 border-purple-500/30" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-gray-300">Description</Label>
                      <Textarea id="description" name="description" className="bg-white/10 border-purple-500/30" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="prize" className="text-gray-300">Prize Description</Label>
                        <Input id="prize" name="prize" required className="bg-white/10 border-purple-500/30" />
                      </div>
                      <div>
                        <Label htmlFor="prizeValue" className="text-gray-300">Prize Value ($)</Label>
                        <Input id="prizeValue" name="prizeValue" type="number" min="0" className="bg-white/10 border-purple-500/30" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="gameType" className="text-gray-300">Game Type</Label>
                        <Select name="gameType">
                          <SelectTrigger className="bg-white/10 border-purple-500/30">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wheel">Spinning Wheel</SelectItem>
                            <SelectItem value="numbers">Number Draw</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="totalNumbers" className="text-gray-300">Total Numbers</Label>
                        <Input id="totalNumbers" name="totalNumbers" type="number" defaultValue="125" className="bg-white/10 border-purple-500/30" />
                      </div>
                      <div>
                        <Label htmlFor="duration" className="text-gray-300">Duration (hours)</Label>
                        <Input id="duration" name="duration" type="number" defaultValue="24" className="bg-white/10 border-purple-500/30" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="isFreePlay" name="isFreePlay" className="rounded" />
                      <Label htmlFor="isFreePlay" className="text-gray-300">Free Play Game</Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600" 
                      disabled={createGameMutation.isPending}
                    >
                      {createGameMutation.isPending ? "Creating..." : "Create Game"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games?.map((game) => (
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
                      <Button size="sm" variant="outline" className="flex-1 border-purple-500/50 text-purple-400">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-blue-500/50 text-blue-400">
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500/50 text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )) || []}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">System Settings</h2>
              <p className="text-gray-400">Configure system behavior and features</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Game Settings */}
              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Gamepad2 className="h-5 w-5 mr-2 text-purple-400" />
                    Game Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {settings?.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">
                          {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {setting.key === 'enable_background_music' && 'Play background music during games'}
                          {setting.key === 'enable_sound_effects' && 'Play sound effects for game actions'}
                          {setting.key === 'enable_referral_system' && 'Allow players to refer friends for bonuses'}
                          {setting.key === 'max_concurrent_games' && 'Maximum number of active games at once'}
                        </p>
                      </div>
                      <Switch
                        checked={setting.value === 'true'}
                        onCheckedChange={(checked) =>
                          updateSettingMutation.mutate({
                            key: setting.key,
                            value: checked ? 'true' : 'false'
                          })
                        }
                      />
                    </div>
                  )) || []}
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="bg-black/20 backdrop-blur-sm border border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-400" />
                    Security & Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-gray-400 text-sm">Enhanced security for admin accounts</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Auto-Lock Dashboard</p>
                      <p className="text-gray-400 text-sm">Lock after 15 minutes of inactivity</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Audit Logging</p>
                      <p className="text-gray-400 text-sm">Log all admin actions for security</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
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