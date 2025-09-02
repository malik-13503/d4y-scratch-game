import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Coffee,
  Camera,
  Gift,
  Trophy,
  Star,
  Zap,
  Crown,
  Sparkles,
  Users,
  Gamepad2,
  Target,
  Gem,
  User,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { formatTimeRemaining } from "@/lib/utils";
import type { Game } from "@shared/schema";
import logoPath from "@assets/logo_1751918412862.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const [availableNumbersMap, setAvailableNumbersMap] = useState<Map<number, number>>(new Map());

  // Fetch real games data from API
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Fetch available numbers for all active games
  useEffect(() => {
    if (!games) return;

    const fetchAvailableNumbers = async () => {
      const newMap = new Map<number, number>();
      
      for (const game of games.filter(g => g.isActive)) {
        try {
          const response = await fetch(`/api/games/${game.id}/available-numbers`);
          if (response.ok) {
            const data = await response.json();
            newMap.set(game.id, data.totalAvailable);
          } else {
            // Fallback to static value if API fails
            newMap.set(game.id, game.numbersLeft);
          }
        } catch (error) {
          // Fallback to static value if fetch fails
          newMap.set(game.id, game.numbersLeft);
        }
      }
      
      setAvailableNumbersMap(newMap);
    };

    fetchAvailableNumbers();
    
    // Set up interval to refresh available numbers
    const interval = setInterval(fetchAvailableNumbers, 15000);
    return () => clearInterval(interval);
  }, [games]);



  // Icon mapping for different game types
  const getGameIcon = (gameName: string) => {
    if (
      gameName.toLowerCase().includes("mug") ||
      gameName.toLowerCase().includes("coffee")
    )
      return Coffee;
    if (gameName.toLowerCase().includes("camera")) return Camera;
    if (gameName.toLowerCase().includes("gift")) return Gift;
    return Trophy; // Default icon
  };

  // Color scheme mapping
  const getGameColors = (index: number) => {
    const colorSchemes = [
      {
        color: "from-red-500 to-red-600",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
      },
      {
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
      },
      {
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
      },
      {
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
      },
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
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-conic from-purple-500/8 via-blue-500/8 to-red-500/8 rounded-full blur-3xl animate-spin"
          style={{ animationDuration: "30s" }}
        ></div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
                 linear-gradient(rgba(147, 51, 234, 0.15) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(147, 51, 234, 0.15) 1px, transparent 1px)
               `,
            backgroundSize: "60px 60px",
          }}
        ></div>

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
              animationDuration: `${8 + Math.random() * 12}s`,
            }}
          >
            <div
              className={`w-${Math.random() > 0.5 ? "3" : "2"} h-${Math.random() > 0.5 ? "3" : "2"} bg-gradient-to-br from-white/30 to-white/10 rounded-full blur-sm shadow-lg`}
            ></div>
          </div>
        ))}
      </div>

      {/* Ultra Professional Eye-Catching Header */}
      <header className="relative bg-gradient-to-r from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-2xl border-b border-purple-400/40 shadow-2xl overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-purple-500/15 blur-2xl"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-spin"
            style={{ animationDuration: "20s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          {/* Mobile-First Responsive Layout */}
          <div className="space-y-4 lg:space-y-0">
            {/* Top Row - Logo and Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              {/* Brand Logo with Enhanced Glow */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/40 via-orange-400/40 to-red-400/40 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <img
                  src={logoPath}
                  alt="Hit The Road Jackpot"
                  className="relative h-16 w-auto object-contain sm:h-20 md:h-24 lg:h-28 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 px-4 py-2 sm:px-6 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Dashboard</span>
                </Button>
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  className="text-black-300 border-gray-600 hover:bg-red-500/20 hover:border-red-500 hover:text-red-300 px-4 py-2 sm:px-6 sm:py-3"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Logout</span>
                </Button>
              </div>
            </div>

            {/* Compact Hero Title Section */}
            <div className="text-center py-2 sm:py-3">
              <div className="relative">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent drop-shadow-lg tracking-tight">
                  HIT THE ROAD JACKPOT
                </h1>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/15 to-blue-500/15 blur-lg -z-10"></div>
              </div>
              <p className="text-sm sm:text-base text-gray-400 font-medium mt-1 sm:mt-2">
                Spin the Wheel • Win Real Prizes • Live Action
              </p>
            </div>

            {/* Compact Status Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Live Games Status */}
              <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-xl rounded-xl px-4 py-3 border border-emerald-400/50 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg shadow-md">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wide">
                      Live Games
                    </p>
                    <p className="text-white text-lg font-bold">
                      {games?.length || 0} Active
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-md shadow-emerald-400/50"></div>
                  </div>
                </div>
              </div>

              {/* Players Online */}
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-xl px-4 py-3 border border-blue-400/50 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-md">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide">
                      Players Online
                    </p>
                    <p className="text-white text-lg font-bold">
                      {Math.floor(Math.random() * 50) + 25}
                    </p>
                  </div>
                </div>
              </div>

              {/* Big Win Zone */}
              <div className="bg-gradient-to-r from-yellow-500/25 via-orange-500/25 to-red-500/25 backdrop-blur-xl rounded-xl px-4 py-3 border border-yellow-400/50 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-yellow-300 text-xs font-semibold uppercase tracking-wide">
                      Win Big
                    </p>
                    <p className="text-white text-lg font-bold">Up to $500</p>
                  </div>
                  <div className="ml-auto">
                    <div className="flex space-x-0.5">
                      <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                      <div className="w-1 h-1 bg-orange-400 rounded-full animate-ping delay-100"></div>
                      <div className="w-1 h-1 bg-red-400 rounded-full animate-ping delay-200"></div>
                    </div>
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
            <span className="text-yellow-400 font-bold">
              {" "}
              Real games, real winners, real excitement!
            </span>
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
            {/* Only show "No Purchase Necessary" if any active games have free play actually enabled */}
            {games &&
              games.some(
                (game) =>
                  game.isActive &&
                  game.freePlayStart === 1 &&
                  game.freePlayEnd === game.totalNumbers &&
                  (availableNumbersMap.get(game.id) ?? game.numbersLeft) > 0,
              ) && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/40 rounded-xl px-6 py-3">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-purple-400" />
                    <span className="text-purple-300 font-bold">
                      NO PURCHASE NECESSARY
                    </span>
                  </div>
                </div>
              )}
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-xl font-semibold">Loading Games...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {games && games.length > 0 ? (
              games
                .filter((game) => game.isActive)
                .map((game, index) => {
                  const Icon = getGameIcon(game.name);
                  
                  // Get real-time available numbers for this game
                  const realTimeAvailable = availableNumbersMap.get(game.id) ?? game.numbersLeft;
                  
                  // Calculate progress using real-time data
                  const progress = ((game.totalNumbers - realTimeAvailable) / game.totalNumbers) * 100;
                  const colors = getGameColors(index);

                  // Removed automatic free play logic - all numbers require payment

                  // Format time remaining
                  const timeRemaining =
                    new Date(game.endTime) > new Date()
                      ? formatTimeRemaining(game.endTime)
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
                      <div
                        className="absolute bottom-6 left-6 w-2 h-2 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-ping shadow-lg shadow-pink-500/50"
                        style={{ animationDelay: "1s" }}
                      ></div>
                      <div
                        className="absolute top-1/2 right-8 w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                        style={{ animationDelay: "2s" }}
                      ></div>

                      {/* Dynamic Border Accent */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.color} group-hover:h-2 transition-all duration-300`}
                      ></div>

                      <CardContent className="relative p-4 sm:p-6">
                        {/* Enhanced Responsive Prize Highlight */}
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                          <div
                            className={`bg-gradient-to-r ${colors.color} text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl font-black shadow-2xl flex items-center space-x-1 border border-white/20 backdrop-blur-sm`}
                          >
                            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse flex-shrink-0" />
                            <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">
                              ${game.prizeValue}
                            </span>
                            <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 animate-spin flex-shrink-0" />
                          </div>
                        </div>

                        {/* Enhanced Responsive Game Icon and Info */}
                        <div className="flex items-start space-x-3 sm:space-x-4 pr-[90px] sm:pr-[110px] md:pr-[120px]">
                          <div
                            className={`relative p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colors.color} shadow-2xl group-hover:scale-110 transition-transform duration-500 flex-shrink-0`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl sm:rounded-2xl"></div>
                            {game.prizeImageUrl ? (
                              <img
                                src={game.prizeImageUrl}
                                alt={game.name}
                                className="relative h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 object-contain object-center rounded drop-shadow-lg"
                              />
                            ) : (
                              <Icon className="relative h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white drop-shadow-lg" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex flex-col space-y-2 mb-3">
                              <h2 className="text-base sm:text-lg md:text-xl font-black text-white tracking-wide leading-tight">
                                {game.name}
                              </h2>
                              <Badge
                                className={`${colors.bgColor} text-white text-xs font-bold px-2 py-1 rounded-full border border-white/20 w-fit`}
                              >
                                {game.code}
                              </Badge>
                            </div>
                            <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2">
                              {game.description}
                            </p>

                            {/* Status indicators */}
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                                <span className="text-green-400 font-bold text-xs">
                                  LIVE
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-3 w-3 text-blue-400" />
                                <span className="text-blue-400 font-bold text-xs">
                                  Active game
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Responsive Game Progress */}
                        <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm font-bold text-white">
                              Game Progress
                            </span>
                            <span className="text-xs text-gray-300 font-mono bg-slate-800/50 px-2 py-1 rounded-full border border-white/10">
                              {realTimeAvailable} spots left
                            </span>
                          </div>
                          <div className="relative">
                            <Progress
                              value={progress}
                              className="h-2 bg-slate-800/50 border border-white/10"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-red-500/20 rounded-full blur-sm"></div>
                          </div>
                          <div className="text-center">
                            <span className="text-lg sm:text-xl font-black text-white">
                              {Math.round(progress)}%
                            </span>
                            <span className="text-gray-400 ml-2 text-xs sm:text-sm">
                              Complete
                            </span>
                          </div>
                        </div>

                        {/* Enhanced Responsive Game Details Grid */}
                        <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-2 sm:gap-3">
                          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2 sm:p-3 rounded-lg border border-blue-400/30 backdrop-blur-sm">
                            <div className="text-xs text-blue-300 font-bold uppercase tracking-wider">
                              Game Info
                            </div>
                            <div className="text-sm sm:text-base font-black text-blue-200 mt-1">
                              Spin the wheel, pay what you land on
                            </div>
                            {/* Only show "No Purchase Necessary" if this specific game has free play actually enabled */}
                            {game.freePlayStart === 1 && 
                              game.freePlayEnd === game.totalNumbers && (
                                <div className="text-xs text-blue-400 mt-1">
                                  💰 No Purchase Necessary: One free entry per
                                  game
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Enhanced Responsive Action Section */}
                        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
                          <div className="flex flex-col space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-400">
                                <span className="font-medium">Game ends:</span>
                                <div className="text-white font-bold text-xs sm:text-sm">
                                  {timeRemaining}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-red-400 font-bold text-xs">
                                  ENDING SOON
                                </span>
                              </div>
                            </div>
                            <Button
                              size="lg"
                              className={`w-full bg-gradient-to-r ${colors.color} hover:opacity-90 text-white font-black text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3 shadow-2xl border border-white/20 backdrop-blur-sm group-hover:shadow-purple-500/30 transition-all duration-300`}
                            >
                              <Zap className="h-4 w-4 mr-2 animate-pulse" />
                              SPIN TO WIN
                              <Crown className="h-4 w-4 ml-2 animate-bounce" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            ) : (
              <div className="text-center py-20 col-span-full">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-red-500/30 blur-xl rounded-full"></div>
                  <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/20 rounded-3xl px-12 py-16 shadow-2xl">
                    <Gem className="h-16 w-16 text-purple-400 mx-auto mb-6 animate-pulse" />
                    <h3 className="text-3xl font-black text-white mb-4">
                      No Active Games
                    </h3>
                    <p className="text-gray-300 text-lg">
                      New exciting games are being prepared! Check back soon for
                      amazing prizes.
                    </p>
                    <div className="mt-8">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg"
                      >
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
                  <img
                    src={logoPath}
                    alt="Hit The Road Jackpot"
                    className="h-12 w-auto"
                  />
                  <div>
                    <h4 className="text-xl font-black text-white">
                      Hit The Road Jackpot
                    </h4>
                    <p className="text-gray-400 text-sm">Win Big, Play Smart</p>
                  </div>
                </div>
                <p className="text-gray-300 text-base leading-relaxed max-w-md">
                  Experience the thrill of real-time gaming with authentic
                  prizes and instant rewards. Join thousands of players spinning
                  their way to victory.
                </p>
              </div>

              <div>
                <h5 className="text-white font-bold mb-4">Game Info</h5>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <Link
                      href="/instant-play"
                      className="hover:text-white transition-colors"
                    >
                      Instant Play
                    </Link>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-blue-400" />
                    <Link
                      href="/real-prizes"
                      className="hover:text-white transition-colors"
                    >
                      Real Prizes
                    </Link>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-purple-400" />
                    <Link
                      href="/free-spins"
                      className="hover:text-white transition-colors"
                    >
                      No Purchase Necessary
                    </Link>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Gamepad2 className="h-4 w-4 text-green-400" />
                    <Link
                      href="/game-info"
                      className="hover:text-white transition-colors"
                    >
                      Game Info
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="text-white font-bold mb-4">Support</h5>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="/how-to-play"
                      className="hover:text-white transition-colors"
                    >
                      How to Play
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/prize-rules"
                      className="hover:text-white transition-colors"
                    >
                      Prize Rules
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="hover:text-white transition-colors"
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="hover:text-white transition-colors"
                    >
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/official-rules"
                      className="hover:text-white transition-colors"
                    >
                      Official Rules
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
