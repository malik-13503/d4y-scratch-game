import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { queryClient } from "@/lib/queryClient";
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
  RefreshCw
} from "lucide-react";
import logoPath from "@assets/logo_1751918412862.png";

export default function Dashboard() {
  const [, setLocation] = useLocation();

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
  });

  const { data: gameHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/user/game-history"],
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    refetchOnWindowFocus: true,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    setLocation('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/games")}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Button>
              <img src={logoPath} alt="Hit The Road Jackpot" className="h-8 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
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
        {/* Enhanced User Profile Section */}
        <Card className="mb-8 relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-400/40 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-2xl"></div>
          <CardHeader className="relative">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                  <User className="h-10 w-10 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-purple-400/30 to-blue-400/30 rounded-full blur-lg"></div>
              </div>
              <div>
                <CardTitle className="text-3xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Player'}
                </CardTitle>
                <p className="text-gray-200 text-lg font-medium">{user.email}</p>
                <div className="flex items-center space-x-3 mt-3">
                  <Badge className={`${user.cardOnFile ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white" : "bg-gradient-to-r from-red-500 to-pink-500 text-white"} border-0 px-4 py-2 font-bold shadow-lg`}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {user.cardOnFile ? "Payment Verified" : "Payment Required"}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 font-bold">ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Stats Overview with eye-catching gradients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Wins Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 to-green-600/20 border-emerald-400/40 backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-green-500/10 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <Trophy className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Total Wins</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">
                    {statsLoading ? '...' : (userStats?.totalWins || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Spent Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-blue-400/40 backdrop-blur-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-500/10 blur-xl"></div>
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
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-400/40 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-500/10 blur-xl"></div>
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
          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border-yellow-400/40 backdrop-blur-xl shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 blur-xl"></div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-600/20 border-purple-400/40 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-blue-500/10 blur-xl"></div>
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

          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 to-green-600/20 border-emerald-400/40 backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-green-500/10 blur-xl"></div>
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

          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border-yellow-400/40 backdrop-blur-xl shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="text-center">
                <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl mx-auto w-fit mb-4 shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Achievements</h3>
                <p className="text-gray-200 text-sm mb-4">Track your wins and milestones</p>
                <Button 
                  disabled
                  className="bg-gray-600 text-gray-300 cursor-not-allowed px-6 py-2 rounded-xl"
                >
                  Coming Soon
                </Button>
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
                  Play Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {gameHistory.slice(0, 10).map((game: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600/30 hover:border-purple-500/30 transition-all duration-300 shadow-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full shadow-lg ${game.isFreePlay ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-cyan-500'}`}></div>
                      <div>
                        <p className="text-white font-bold text-lg">Number: {game.number}</p>
                        <p className="text-gray-200 flex items-center font-medium">
                          <Clock className="h-4 w-4 mr-2" />
                          {new Date(game.playedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-xl ${game.isFreePlay ? 'text-emerald-400' : 'text-cyan-400'}`}>
                        {game.isFreePlay ? 'FREE' : `$${game.amount.toFixed(2)}`}
                      </p>
                      <Badge className={`${game.isFreePlay ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"} text-white border-0 font-bold shadow-lg`}>
                        {game.isFreePlay ? 'Free Play' : 'Paid'}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {gameHistory.length > 10 && (
                  <div className="text-center pt-6">
                    <p className="text-gray-200 font-medium">
                      Showing 10 of {gameHistory.length} games
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}