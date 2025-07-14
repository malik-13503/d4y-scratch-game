import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coffee, Camera, Gift, Trophy, Star, Zap, Crown, Sparkles, Users, Gamepad2, Target, Gem } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Enhanced Professional Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute top-10 left-5 w-96 h-96 bg-gradient-to-br from-red-500/25 to-purple-600/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-5 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-yellow-500/15 to-orange-500/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Rotating elements */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-conic from-purple-500/8 via-blue-500/8 to-red-500/8 rounded-full blur-3xl animate-spin" style={{animationDuration: '30s'}}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-30"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(147, 51, 234, 0.15) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(147, 51, 234, 0.15) 1px, transparent 1px)
               `,
               backgroundSize: '60px 60px'
             }}>
        </div>
        
        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-950/30 to-slate-950/60"></div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-yellow-400/90 rounded-full animate-ping shadow-lg shadow-yellow-400/50"></div>
        <div className="absolute top-3/4 right-1/3 w-2 h-2 bg-cyan-400/90 rounded-full animate-ping delay-500 shadow-lg shadow-cyan-400/50"></div>
        <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-purple-400/90 rounded-full animate-ping delay-1000 shadow-lg shadow-purple-400/50"></div>
        <div className="absolute top-1/6 right-1/6 w-2 h-2 bg-red-400/90 rounded-full animate-ping delay-1500 shadow-lg shadow-red-400/50"></div>
        
        {/* Enhanced floating elements */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 12}s`
            }}
          >
            <div className={`w-${Math.random() > 0.5 ? '3' : '2'} h-${Math.random() > 0.5 ? '3' : '2'} bg-gradient-to-br from-white/30 to-white/10 rounded-full blur-sm shadow-lg`}></div>
          </div>
        ))}
      </div>

      {/* Enhanced Professional Header */}
      <header className="relative bg-gradient-to-r from-red-600/95 via-red-700/95 to-purple-700/95 shadow-2xl backdrop-blur-xl border-b border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 blur-xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
              <div className="flex items-center relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 blur-lg rounded-full"></div>
                <img 
                  src={logoPath} 
                  alt="Hit The Road Jackpot" 
                  className="relative h-16 w-auto object-contain sm:h-20 md:h-24 lg:h-28 max-w-none drop-shadow-2xl"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-white/95 text-sm sm:text-base bg-gradient-to-r from-yellow-500/30 to-orange-500/30 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-yellow-400/40 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 animate-pulse" />
                    <span className="font-bold tracking-wide">LIVE GAMES</span>
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-center sm:justify-end">
              <div className="text-white/95 text-sm sm:text-base bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-emerald-400/40 backdrop-blur-sm shadow-lg">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-300 animate-spin" />
                  <span className="font-bold">WIN BIG</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping delay-100"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent mb-6 tracking-tight">
              LIVE JACKPOT GAMES
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 via-red-500/20 to-purple-600/20 blur-2xl rounded-full"></div>
          </div>
          <p className="text-xl sm:text-2xl text-gray-300 font-medium mb-8 max-w-3xl mx-auto leading-relaxed">
            Spin the wheel of fortune and win amazing prizes! 
            <span className="text-yellow-400 font-bold"> Real games, real winners, real excitement!</span>
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/40 rounded-xl px-6 py-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-green-400" />
                <span className="text-green-300 font-bold">INSTANT PLAY</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-400/40 rounded-xl px-6 py-3">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-blue-400" />
                <span className="text-blue-300 font-bold">BIG PRIZES</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/40 rounded-xl px-6 py-3">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-purple-400" />
                <span className="text-purple-300 font-bold">FREE SPINS</span>
              </div>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-xl font-semibold">Loading Games...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
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
                  className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 cursor-pointer border border-white/10 overflow-hidden transform hover:scale-105 hover:-translate-y-2 group w-full"
                  onClick={() => setLocation(`/game/${game.id}`)}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {/* Enhanced Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-red-600/30 blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                  
                  {/* Enhanced Sparkle Effects */}
                  <div className="absolute top-6 right-6 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping shadow-lg shadow-yellow-500/50"></div>
                  <div className="absolute bottom-6 left-6 w-2 h-2 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-ping shadow-lg shadow-pink-500/50" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 right-8 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                  
                  {/* Dynamic Border Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.color} group-hover:h-2 transition-all duration-300`}></div>
                  
                  <CardContent className="relative p-4 sm:p-6">
                    {/* Enhanced Responsive Prize Highlight */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                      <div className={`bg-gradient-to-r ${colors.color} text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl font-black shadow-2xl flex items-center space-x-1 border border-white/20 backdrop-blur-sm`}>
                        <Trophy className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse flex-shrink-0" />
                        <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">${game.prizeValue}</span>
                        <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 animate-spin flex-shrink-0" />
                      </div>
                    </div>

                    {/* Enhanced Responsive Game Icon and Info */}
                    <div className="flex items-start space-x-3 sm:space-x-4 pr-[90px] sm:pr-[110px] md:pr-[120px]">
                      <div className={`relative p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colors.color} shadow-2xl group-hover:scale-110 transition-transform duration-500 flex-shrink-0`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl sm:rounded-2xl"></div>
                        <Icon className="relative h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white drop-shadow-lg" />
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex flex-col space-y-2 mb-3">
                          <h2 className="text-base sm:text-lg md:text-xl font-black text-white tracking-wide leading-tight">{game.name}</h2>
                          <Badge className={`${colors.bg} text-white text-xs font-bold px-2 py-1 rounded-full border border-white/20 w-fit`}>
                            {game.code}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2">{game.description}</p>
                        
                        {/* Status indicators */}
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                            <span className="text-green-400 font-bold text-xs">LIVE</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-3 w-3 text-blue-400" />
                            <span className="text-blue-400 font-bold text-xs">{Math.floor(Math.random() * 50) + 10} playing</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Responsive Game Progress */}
                    <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-bold text-white">Game Progress</span>
                        <span className="text-xs text-gray-300 font-mono bg-slate-800/50 px-2 py-1 rounded-full border border-white/10">{game.numbersLeft} / {game.totalNumbers} left</span>
                      </div>
                      <div className="relative">
                        <Progress value={progress} className="h-2 bg-slate-800/50 border border-white/10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-red-500/20 rounded-full blur-sm"></div>
                      </div>
                      <div className="text-center">
                        <span className="text-lg sm:text-xl font-black text-white">{Math.round(progress)}%</span>
                        <span className="text-gray-400 ml-2 text-xs sm:text-sm">Complete</span>
                      </div>
                    </div>

                    {/* Enhanced Responsive Game Details Grid */}
                    <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-2 sm:p-3 rounded-lg border border-green-400/30 backdrop-blur-sm">
                        <div className="text-xs text-green-300 font-bold uppercase tracking-wider">Free Play Range</div>
                        <div className="text-sm sm:text-base font-black text-green-200 mt-1">{freePlayRange}</div>
                        <div className="text-xs text-green-400 mt-1">🎁 No cost</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2 sm:p-3 rounded-lg border border-blue-400/30 backdrop-blur-sm">
                        <div className="text-xs text-blue-300 font-bold uppercase tracking-wider">Paid Range</div>
                        <div className="text-sm sm:text-base font-black text-blue-200 mt-1">{paidRange}</div>
                        <div className="text-xs text-blue-400 mt-1">💰 Pay exact</div>
                      </div>
                    </div>

                    {/* Enhanced Responsive Action Section */}
                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
                      <div className="flex flex-col space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-400">
                            <span className="font-medium">Game ends:</span>
                            <div className="text-white font-bold text-xs sm:text-sm">{timeRemaining}</div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-red-400 font-bold text-xs">ENDING SOON</span>
                          </div>
                        </div>
                        <Button size="lg" className={`w-full bg-gradient-to-r ${colors.color} hover:opacity-90 text-white font-black text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3 shadow-2xl border border-white/20 backdrop-blur-sm group-hover:shadow-purple-500/30 transition-all duration-300`}>
                          <Zap className="h-4 w-4 mr-2 animate-pulse" />
                          SPIN TO WIN
                          <Crown className="h-4 w-4 ml-2 animate-bounce" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }) : (
              <div className="text-center py-20 col-span-full">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-red-500/30 blur-xl rounded-full"></div>
                  <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/20 rounded-3xl px-12 py-16 shadow-2xl">
                    <Gem className="h-16 w-16 text-purple-400 mx-auto mb-6 animate-pulse" />
                    <h3 className="text-3xl font-black text-white mb-4">No Active Games</h3>
                    <p className="text-gray-300 text-lg">New exciting games are being prepared! Check back soon for amazing prizes.</p>
                    <div className="mt-8">
                      <Button size="lg" className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg">
                        <Star className="h-5 w-5 mr-2" />
                        Get Notified
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Enhanced Footer */}
        <footer className="relative mt-20 border-t border-white/10 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-4 mb-6">
                  <img src={logoPath} alt="Hit The Road Jackpot" className="h-12 w-auto" />
                  <div>
                    <h4 className="text-xl font-black text-white">Hit The Road Jackpot</h4>
                    <p className="text-gray-400 text-sm">Win Big, Play Smart</p>
                  </div>
                </div>
                <p className="text-gray-300 text-base leading-relaxed max-w-md">
                  Experience the thrill of real-time gaming with authentic prizes and instant rewards. 
                  Join thousands of players spinning their way to victory.
                </p>
              </div>
              
              <div>
                <h5 className="text-white font-bold mb-4">Game Info</h5>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span>Instant Play</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-blue-400" />
                    <span>Real Prizes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-purple-400" />
                    <span>Free Spins</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-white font-bold mb-4">Support</h5>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/how-to-play">
                      <a className="hover:text-white transition-colors">
                        How to Play
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/prize-rules">
                      <a className="hover:text-white transition-colors">
                        Prize Rules
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact">
                      <a className="hover:text-white transition-colors">
                        Contact Us
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms">
                      <a className="hover:text-white transition-colors">
                        Terms & Conditions
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/10 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 Hit The Road Jackpot. All rights reserved. 
                <span className="text-yellow-400 ml-2">Play responsibly.</span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}