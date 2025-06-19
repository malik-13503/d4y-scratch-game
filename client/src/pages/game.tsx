import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SpinningWheel } from "@/components/spinning-wheel";
import { NumberDrawer } from "@/components/number-drawer";
import { Confetti } from "@/components/confetti";
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
  const [gameMode, setGameMode] = useState<"wheel" | "numbers">("wheel");
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    const result = Math.floor(Math.random() * 100) + 1;
    setLastResult(result);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    return result;
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                  <span className="text-3xl">{game.emoji}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                    {game.name}
                  </h1>
                  <p className="text-gray-400 font-mono text-sm">{game.code}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Live Stats */}
              <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-400" />
                  <span className="text-white font-bold">{playerCount}</span>
                  <span className="text-gray-400 text-sm">playing</span>
                </div>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-white font-mono">{formatTimeRemaining(new Date(game.endTime))}</span>
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
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Interface */}
          <div className="lg:col-span-2 space-y-8">
            {/* Game Mode Selector */}
            <Card className="bg-black/20 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant={gameMode === "wheel" ? "default" : "outline"}
                    onClick={() => setGameMode("wheel")}
                    className={`${gameMode === "wheel" 
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                      : "border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                    } px-8 py-3 text-lg font-semibold`}
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Spinning Wheel
                  </Button>
                  <Button
                    variant={gameMode === "numbers" ? "default" : "outline"}
                    onClick={() => setGameMode("numbers")}
                    className={`${gameMode === "numbers" 
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white" 
                      : "border-green-500/50 text-green-400 hover:bg-green-500/20"
                    } px-8 py-3 text-lg font-semibold`}
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Number Draw
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Game Component */}
            <Card className="bg-black/20 backdrop-blur-xl border border-purple-500/30 shadow-2xl overflow-hidden">
              <CardContent className="p-8">
                {gameMode === "wheel" ? (
                  <div className="text-center space-y-8">
                    <div className="relative">
                      <SpinningWheel onSpin={handleSpin} />
                      {/* Glowing effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl -z-10"></div>
                    </div>
                    {lastResult && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                          <span className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            {lastResult}
                          </span>
                          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                        </div>
                        <p className="text-white text-xl">Congratulations! You spun {lastResult}!</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-8">
                    <NumberDrawer onDraw={handleNumberDraw} totalNumbers={game.totalNumbers} />
                    {lastResult && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Star className="h-6 w-6 text-green-400 animate-pulse" />
                          <span className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            {lastResult}
                          </span>
                          <Star className="h-6 w-6 text-green-400 animate-pulse" />
                        </div>
                        <p className="text-white text-xl">Amazing! You drew number {lastResult}!</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Game Info Sidebar */}
          <div className="space-y-6">
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