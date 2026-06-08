import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getQueryFn } from "@/lib/queryClient";
import logoPath from "@assets/logo_1777237644041.png";
import { 
  ArrowLeft, 
  Hash, 
  DollarSign, 
  Gift, 
  Trophy,
  TrendingUp,
  Calendar,
  Target
} from "lucide-react";

interface NumberEntry {
  number: number;
  amount: number;
  isFreePlay: boolean;
  createdAt: string;
  gameId: number;
  gameName: string;
}

export default function MyNumbers() {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: gameHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/user/game-history"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (userLoading || historyLoading) {
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

  // Process game history to get number entries
  const numberEntries: NumberEntry[] = gameHistory?.map((entry: any) => ({
    number: entry.number,
    amount: typeof entry.amount === "number" ? entry.amount : parseFloat(entry.amount || "0"),
    isFreePlay: entry.isFreePlay,
    createdAt: entry.createdAt || new Date().toISOString(),
    gameId: entry.gameId || 1,
    gameName: entry.gameName || `Game #${entry.gameId || 1}`,
  })) || [];

  // Group numbers by type
  const freeNumbers = numberEntries.filter(entry => entry.isFreePlay);
  const paidNumbers = numberEntries.filter(entry => !entry.isFreePlay);
  const allNumbers = [...numberEntries].sort((a, b) => a.number - b.number);

  // Calculate statistics
  const totalSpent = paidNumbers.reduce((sum, entry) => sum + entry.amount, 0);
  const averageSpend = paidNumbers.length > 0 ? totalSpent / paidNumbers.length : 0;
  const numberRange = allNumbers.length > 0 ? {
    min: Math.min(...allNumbers.map(e => e.number)),
    max: Math.max(...allNumbers.map(e => e.number))
  } : { min: 0, max: 0 };

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
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="text-gray-300 hover:text-white hover:bg-white/10 px-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              <img src={logoPath} alt="Prize Plugz" className="h-6 w-auto sm:h-8" />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-lg">
                My Numbers
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900/70 to-purple-900/70 border-blue-400/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 to-purple-800/30 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Hash className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Total Numbers</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {allNumbers.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-green-900/70 to-emerald-900/70 border-green-400/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-800/30 to-emerald-800/30 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Gift className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Free Numbers</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {freeNumbers.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-900/70 to-red-900/70 border-orange-400/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-800/30 to-red-800/30 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <DollarSign className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Paid Numbers</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {paidNumbers.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/70 to-pink-900/70 border-purple-400/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-800/30 to-pink-800/30 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Target className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Range</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {numberRange.min}-{numberRange.max}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Numbers Display */}
        <Card className="mb-8 relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-600/40 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 blur-2xl"></div>
          <CardHeader className="relative">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mr-3 shadow-lg">
                <Hash className="h-6 w-6 text-white" />
              </div>
              All Your Numbers
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {allNumbers.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-2xl rounded-full"></div>
                  <Hash className="relative h-20 w-20 text-purple-400 mx-auto drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No Numbers Yet</h3>
                <p className="text-gray-200 text-lg mb-8">Start spinning to see your numbers here!</p>
                <Button 
                  onClick={() => setLocation('/games')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  Play Now
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                {allNumbers.map((entry, index) => (
                  <div
                    key={index}
                    className={`
                      relative p-4 rounded-xl text-center font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group
                      ${entry.isFreePlay 
                        ? 'bg-gradient-to-br from-green-600/80 to-emerald-600/80 border border-green-400/40' 
                        : 'bg-gradient-to-br from-orange-600/80 to-red-600/80 border border-orange-400/40'
                      }
                    `}
                    title={`${entry.isFreePlay ? 'Free' : `${entry.amount} tokens`} • ${entry.gameName} • ${new Date(entry.createdAt).toLocaleDateString()}`}
                  >
                    <div className="text-white drop-shadow-lg text-2xl mb-1">
                      {entry.number}
                    </div>
                    <Badge 
                      className={`
                        text-xs font-medium border-0
                        ${entry.isFreePlay 
                          ? 'bg-green-500/70 text-white' 
                          : 'bg-orange-500/70 text-white'
                        }
                      `}
                    >
                      {entry.isFreePlay ? 'FREE' : `${entry.amount}T`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Numbers */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-green-600/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 blur-2xl"></div>
            <CardHeader className="relative">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent flex items-center">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mr-3 shadow-lg">
                  <Gift className="h-5 w-5 text-white" />
                </div>
                Free Numbers ({freeNumbers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {freeNumbers.length === 0 ? (
                <p className="text-white text-center py-8">No free numbers yet</p>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                  {freeNumbers.map((entry, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gradient-to-br from-green-600/50 to-emerald-600/50 rounded-lg text-center text-white font-bold drop-shadow-md border border-green-400/30"
                      title={`${entry.gameName} • ${new Date(entry.createdAt).toLocaleDateString()}`}
                    >
                      {entry.number}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paid Numbers */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-orange-600/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 blur-2xl"></div>
            <CardHeader className="relative">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent flex items-center">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg mr-3 shadow-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                Paid Numbers ({paidNumbers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {paidNumbers.length === 0 ? (
                <p className="text-white text-center py-8">No paid numbers yet</p>
              ) : (
                <div>
                  <div className="mb-4 text-white">
                    <p className="text-sm opacity-80 mb-2">Average cost: ${averageSpend.toFixed(2)}</p>
                    <p className="text-sm opacity-80">Total spent: ${totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                    {paidNumbers.map((entry, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gradient-to-br from-orange-600/50 to-red-600/50 rounded-lg text-center text-white font-bold drop-shadow-md border border-orange-400/30"
                        title={`${entry.amount} tokens • ${entry.gameName} • ${new Date(entry.createdAt).toLocaleDateString()}`}
                      >
                        <div className="text-lg">{entry.number}</div>
                        <div className="text-xs opacity-80">${entry.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}