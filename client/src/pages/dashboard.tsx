import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Gamepad2
} from "lucide-react";
import logoPath from "@assets/logo_1751918412862.png";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const { data: gameHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/user/game-history"],
    enabled: !!user,
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
            <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* User Profile Section */}
        <Card className="mb-8 bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-500/30 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Player'}
                </CardTitle>
                <p className="text-gray-400">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={user.cardOnFile ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                    <CreditCard className="h-3 w-3 mr-1" />
                    {user.cardOnFile ? "Payment Verified" : "Payment Required"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Trophy className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-green-300 text-sm font-medium">Total Wins</p>
                  <p className="text-2xl font-bold text-white">
                    {statsLoading ? '...' : (userStats?.totalWins || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <DollarSign className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-blue-300 text-sm font-medium">Total Spent</p>
                  <p className="text-2xl font-bold text-white">
                    ${statsLoading ? '...' : (userStats?.totalSpent || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Target className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-purple-300 text-sm font-medium">Total Spins</p>
                  <p className="text-2xl font-bold text-white">
                    {statsLoading ? '...' : (userStats?.totalSpins || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Award className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-yellow-300 text-sm font-medium">Free Spins</p>
                  <p className="text-2xl font-bold text-white">
                    {statsLoading ? '...' : (userStats?.freeSpins || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game History */}
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-500/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Game History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading game history...</p>
              </div>
            ) : !gameHistory || gameHistory.length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No Games Played Yet</h3>
                <p className="text-gray-500 mb-6">Start playing to see your game history here!</p>
                <Button 
                  onClick={() => setLocation('/games')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Play Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {gameHistory.slice(0, 10).map((game: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${game.isFreePlay ? 'bg-green-400' : 'bg-blue-400'}`} />
                      <div>
                        <p className="font-medium text-white">Number: {game.number}</p>
                        <p className="text-sm text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(game.playedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${game.isFreePlay ? 'text-green-400' : 'text-blue-400'}`}>
                        {game.isFreePlay ? 'FREE' : `$${game.amount.toFixed(2)}`}
                      </p>
                      <Badge variant={game.isFreePlay ? "secondary" : "default"} className="text-xs">
                        {game.isFreePlay ? 'Free Play' : 'Paid'}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {gameHistory.length > 10 && (
                  <div className="text-center pt-4">
                    <p className="text-gray-400 text-sm">
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