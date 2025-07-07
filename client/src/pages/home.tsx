import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coffee, Camera, Gift, Trophy, Star, Zap, Crown, Sparkles } from "lucide-react";
import type { Game } from "@shared/schema";
import logoPath from "@assets/logo_1751918412862.png";

export default function Home() {
  const [, setLocation] = useLocation();

  // Fetch real games data from API
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Icon mapping for different game types
  const getGameIcon = (gameName: string) => {
    if (gameName.toLowerCase().includes('mug') || gameName.toLowerCase().includes('coffee')) return Coffee;
    if (gameName.toLowerCase().includes('camera')) return Camera;
    if (gameName.toLowerCase().includes('gift')) return Gift;
    return Trophy; // Default icon
  };

  // Color scheme mapping
  const getGameColors = (index: number) => {
    const colorSchemes = [
      {
        color: "from-red-500 to-red-600",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30"
      },
      {
        color: "from-blue-500 to-blue-600", 
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30"
      },
      {
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-500/10", 
        borderColor: "border-purple-500/30"
      },
      {
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30"
      }
    ];
    return colorSchemes[index % colorSchemes.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          >
            <div className="w-2 h-2 bg-white/20 rounded-full blur-sm"></div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-red-600 via-red-700 to-purple-700 shadow-2xl backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="flex items-center">
                <img 
                  src={logoPath} 
                  alt="Hit The Road Jackpot" 
                  className="h-12 sm:h-16 w-auto object-contain"
                />
              </div>
              <div className="text-white/90 text-xs sm:text-sm bg-gradient-to-r from-white/20 to-white/10 px-3 sm:px-4 py-1 sm:py-2 rounded-full border border-white/20 backdrop-blur-sm">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-300" />
                  <span>A7T6</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-center sm:justify-end">
              <div className="text-white/90 text-xs sm:text-sm bg-gradient-to-r from-white/20 to-white/10 px-3 sm:px-4 py-1 sm:py-2 rounded-lg border border-white/20 backdrop-blur-sm">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300" />
                  <span className="text-center">Free coins | <span className="text-yellow-300 font-semibold">personality</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-md mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-xl font-semibold">Loading Games...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {games && games.length > 0 ? games.filter(game => game.isActive).map((game, index) => {
              const Icon = getGameIcon(game.name);
              const progress = ((game.totalNumbers - game.numbersLeft) / game.totalNumbers) * 100;
              const colors = getGameColors(index);
              
              // Calculate free play range (last 25% of numbers)
              const freePlayStart = Math.floor(game.totalNumbers * 0.75) + 1;
              const freePlayRange = `${freePlayStart}-${game.totalNumbers}`;
              const paidRange = `1-${freePlayStart - 1}`;
              
              // Format time remaining
              const timeRemaining = new Date(game.endTime) > new Date() 
                ? new Date(game.endTime).toLocaleString()
                : "Ended";
              
              return (
                <Card
                  key={game.id}
                  className="relative bg-gradient-to-br from-white via-white to-gray-50 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer border-0 overflow-hidden transform hover:scale-105 hover:-translate-y-2 group"
                  onClick={() => setLocation(`/game/${game.id}`)}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${colors.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
                  
                  {/* Top Border Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.color}`}></div>
                  
                  <CardContent className="relative p-6">
                    {/* Prize Highlight */}
                    <div className="absolute top-4 right-4">
                      <div className={`bg-gradient-to-r ${colors.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1`}>
                        <Trophy className="h-3 w-3" />
                        <span>${game.prizeValue}</span>
                      </div>
                    </div>

                    {/* Game Icon and Info */}
                    <div className="flex items-start space-x-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors.color} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h2 className="text-xl font-bold text-gray-800 truncate">{game.name}</h2>
                          <Badge variant="secondary" className="text-xs font-mono">
                            {game.code}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{game.description}</p>
                      </div>
                    </div>

                    {/* Game Progress */}
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">{game.numbersLeft} / {game.totalNumbers} left</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Game Details Grid */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                        <div className="text-xs text-green-700 font-medium">Free Play Range</div>
                        <div className="text-sm font-bold text-green-800">{freePlayRange}</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                        <div className="text-xs text-blue-700 font-medium">Paid Range</div>
                        <div className="text-sm font-bold text-blue-800">{paidRange}</div>
                      </div>
                    </div>

                    {/* Action Section */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          <span>Ends: {timeRemaining}</span>
                        </div>
                        <Button size="sm" className={`bg-gradient-to-r ${colors.color} hover:opacity-90 text-white font-semibold px-6 shadow-lg`}>
                          <Zap className="h-4 w-4 mr-1" />
                          Play Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }) : (
              <div className="text-center py-12">
                <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Active Games</h3>
                <p className="text-gray-400">Check back soon for new exciting games!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}