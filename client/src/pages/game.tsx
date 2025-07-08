import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProfessionalWheel } from "@/components/professional-wheel";
import { Confetti } from "@/components/confetti";
import logoPath from "@assets/logo_1751918412862.png";
import { 
  Clock, 
  Users, 
  Trophy, 
  ArrowLeft, 
  Zap, 
  Target,
  Star,
  Crown,
  Gift,
  Sparkles
} from "lucide-react";
import { formatTimeRemaining } from "@/lib/utils";
import type { Game } from "@shared/schema";

export default function GamePage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [playerCount, setPlayerCount] = useState(1);

  // Simulate real-time player count updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerCount(prev => prev + Math.floor(Math.random() * 3 - 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { data: game, isLoading } = useQuery<Game>({
    queryKey: [`/api/games/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading Game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-white mb-2">Game Not Found</h2>
          <p className="text-gray-400 mb-6">This game may have ended or doesn't exist.</p>
          <Button onClick={() => setLocation("/")} className="bg-purple-600 hover:bg-purple-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  const handleSpin = async (): Promise<number> => {
    if (!game) throw new Error("Game not found");
    
    try {
      // Create a temporary player for this spin
      const playerResponse = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: parseInt(id!),
          name: `Player-${Date.now()}`,
          email: `player-${Date.now()}@example.com`
        })
      });
      
      if (!playerResponse.ok) {
        throw new Error("Failed to create player");
      }
      
      const player = await playerResponse.json();
      
      // Perform the spin
      const spinResponse = await fetch(`/api/games/${id}/spin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id })
      });
      
      if (!spinResponse.ok) {
        const error = await spinResponse.json();
        throw new Error(error.message || "Failed to spin wheel");
      }
      
      const spinResult = await spinResponse.json();
      setLastResult(spinResult.spunNumber);
      setShowConfetti(true);
      
      setTimeout(() => setShowConfetti(false), 3000);
      
      return spinResult.spunNumber;
    } catch (error) {
      console.error("Spin error:", error);
      throw error;
    }
  };

  const handleNumberDraw = async (): Promise<number> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = Math.floor(Math.random() * 125) + 1;
    setLastResult(result);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    return result;
  };

  const progress = ((game.totalNumbers - game.numbersLeft) / game.totalNumbers) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}}></div>
      </div>

      <Confetti active={showConfetti} duration={3000} />

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            {/* Left side - Back button and game info */}
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-gray-300 hover:text-white hover:bg-white/10 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg flex-shrink-0">
                  <span className="text-xl sm:text-3xl">{game.emoji}</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent truncate">
                    {game.name}
                  </h1>
                  <p className="text-gray-400 font-mono text-xs sm:text-sm">{game.code}</p>
                </div>
              </div>
            </div>
            
            {/* Right side - Logo and Live Stats */}
            <div className="flex items-center space-x-3 sm:space-x-6 w-full sm:w-auto">
              <img 
                src={logoPath} 
                alt="Hit The Road Jackpot" 
                className="h-10 w-auto object-contain sm:h-12 md:h-14 lg:h-16"
              />
              <div className="flex items-center space-x-2 sm:space-x-4 bg-white/5 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 border border-white/10 flex-1 sm:flex-none">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                  <span className="text-white font-bold text-sm sm:text-base">{playerCount}</span>
                  <span className="text-gray-400 text-xs sm:text-sm">playing</span>
                </div>
                <div className="w-px h-4 sm:h-6 bg-white/20"></div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                  <span className="text-white font-mono text-xs sm:text-sm">{formatTimeRemaining(new Date(game.endTime))}</span>
                </div>
              </div>
              
              {/* Prize Display */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-yellow-500/30">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-xl">{game.prize}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Game Interface */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Professional Spinning Wheel */}
            <Card className="bg-black/20 backdrop-blur-xl border border-purple-500/30 shadow-2xl overflow-hidden">
              <CardHeader className="text-center pb-2 sm:pb-4 p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center justify-center space-x-2">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-400" />
                  <span>Spin to Win</span>
                </CardTitle>
                <p className="text-slate-400 text-sm sm:text-base lg:text-lg">Click the wheel to spin and claim your number!</p>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 lg:p-8">
                <div className="text-center">
                  <ProfessionalWheel 
                    onSpin={handleSpin} 
                    disabled={false}
                    totalNumbers={game?.totalNumbers || 200}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Info Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Game Status */}
            <Card className="bg-black/20 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                  Game Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <Badge variant="default" className="bg-green-500 text-white">
                    Live
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Prize</span>
                  <span className="text-yellow-400 font-bold">{game.prize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Code</span>
                  <span className="text-white font-mono">{game.code}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Numbers Available</span>
                    <span className="text-white">{game.numbersLeft} / {game.totalNumbers}</span>
                  </div>
                  <Progress value={progress} className="bg-white/20 h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Numbers */}
            <Card className="bg-black/20 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-400" />
                  Recent Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[42, 17, 89, 33, 76, 24].map((number, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-xl flex items-center justify-center border border-purple-500/30"
                    >
                      <span className="text-white font-bold text-lg">{number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Rules */}
            <Card className="bg-black/20 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-green-400" />
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p>Choose between spinning wheel or number drawing</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p>Click the action button to play</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p>Win prizes based on your result!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}