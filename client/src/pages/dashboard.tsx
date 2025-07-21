import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient } from "@/lib/queryClient";
import { CardSetup } from "@/components/payment/card-setup";
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
  Gauge
} from "lucide-react";
import logoPath from "@assets/logo_1751918412862.png";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  // Get current tab from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const currentTab = urlParams.get('tab') || 'overview';

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user/game-history"] });
  };
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale for real-time updates
  });

  const { data: gameHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/user/game-history"],
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale for real-time updates
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

  const handleTabChange = (value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({}, '', url);
  };

  const handleCardSetupSuccess = () => {
    // Refetch user data to update payment status
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    // Switch back to overview tab
    handleTabChange('overview');
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
                <img src={logoPath} alt="Hit The Road Jackpot" className="h-6 w-auto sm:h-8" />
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-lg">
                  My Dashboard
                </h1>
              </div>
              
              {/* Mobile Refresh Button */}
              <Button
                onClick={refreshData}
                size="sm"
                className="sm:hidden bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg px-3"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Desktop Refresh Button */}
            <div className="hidden sm:flex">
              <Button
                onClick={refreshData}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
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
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Player'}
                  </CardTitle>
                  <p className="text-gray-200 text-sm font-medium truncate">{user.email}</p>
                </div>
              </div>
              
              {/* Desktop User Details */}
              <div className="hidden sm:block flex-1 min-w-0">
                <CardTitle className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg truncate">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Player'}
                </CardTitle>
                <p className="text-gray-200 text-base lg:text-lg font-medium truncate">{user.email}</p>
              </div>
              
              {/* Responsive Status Badges */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Badge className={`${user.cardOnFile ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white" : "bg-gradient-to-r from-red-500 to-pink-500 text-white"} border-0 px-3 py-2 sm:px-4 sm:py-2 font-bold shadow-lg text-xs sm:text-sm`}>
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="drop-shadow-sm whitespace-nowrap">
                    {user.cardOnFile ? "Payment Verified" : "Payment Required"}
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
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-purple-500/30 p-1 rounded-xl mb-8">
            <TabsTrigger value="overview" className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg font-bold transition-all duration-300">
              <Gauge className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg font-bold transition-all duration-300">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg font-bold transition-all duration-300">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Enhanced Stats Overview with eye-catching gradients */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    {statsLoading ? '...' : (userStats?.totalWins || 0)}
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
                    ${statsLoading ? '...' : (userStats?.totalSpent || 0).toFixed(2)}
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
                    {statsLoading ? '...' : (userStats?.totalSpins || 0)}
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
                    {statsLoading ? '...' : (userStats?.freeSpins || 0)}
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
            ) : !gameHistory || gameHistory.length === 0 ? (
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
                {gameHistory.slice(0, 5).map((game: any, index: number) => (
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

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-8">
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-400/40 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-2xl"></div>
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mr-3 shadow-lg">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  Payment Methods
                </CardTitle>
                <p className="text-gray-300 text-lg mt-2">Manage your payment methods securely</p>
              </CardHeader>
              <CardContent className="relative">
                {user.cardOnFile ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-emerald-900/40 to-green-900/40 rounded-xl border border-emerald-500/30">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                          <CreditCard className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-xl">Payment Method Active</h3>
                          <p className="text-gray-300">
                            {user.cardBrand} ending in {user.cardLast4}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 font-bold">
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
                      <p className="text-blue-300 text-sm">
                        Your payment method is secure and ready for transactions. You can update it anytime.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-orange-500/30 blur-2xl rounded-full"></div>
                        <div className="relative p-6 bg-gradient-to-br from-red-500 to-orange-600 rounded-full shadow-2xl">
                          <CreditCard className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">No Payment Method</h3>
                      <p className="text-gray-300 text-lg mb-8">Add a payment method to start playing games and winning prizes!</p>
                    </div>
                    <CardSetup onSuccess={handleCardSetupSuccess} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-8">
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
                  <div className="p-6 bg-slate-700/50 rounded-xl border border-slate-600/30">
                    <h3 className="text-white font-bold text-lg mb-4">Account Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Email:</span>
                        <span className="text-white font-medium">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Name:</span>
                        <span className="text-white font-medium">
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Account Status:</span>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}