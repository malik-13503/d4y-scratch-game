import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProfessionalWheel } from "@/components/professional-wheel";
import { Confetti } from "@/components/confetti";
import { DisclaimerPopup } from "@/components/disclaimer-popup";
import { AuthRequiredPopup } from "@/components/auth-required-popup";
import { PaymentRequiredPopup } from "@/components/payment-required-popup";
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
  Sparkles,
} from "lucide-react";
import { formatTimeRemaining, formatCountdownObject } from "@/lib/utils";
import { useCountdown } from "@/hooks/useCountdown";
import type { Game } from "@shared/schema";

export default function GamePage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [playerCount, setPlayerCount] = useState(1);
  const wheelRef = useRef<{ triggerSpin: () => Promise<void> }>(null);

  // Simulate real-time player count updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerCount((prev) => prev + Math.floor(Math.random() * 3 - 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { data: game, isLoading } = useQuery<Game>({
    queryKey: [`/api/games/${id}`],
    enabled: !!id,
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const gameId = game?.id;

  const { data: availableNumbers } = useQuery({
    queryKey: [`/api/games/${gameId}/available-numbers`],
    refetchInterval: 10000,
    enabled: !!gameId,
  });

  const { data: recentNumbers = [] } = useQuery({
    queryKey: [`/api/games/${gameId}/recent-numbers`],
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    enabled: !!gameId,
  });

  // Always call useCountdown hook consistently, even if game is not loaded yet
  const countdown = useCountdown(
    game?.endTime ? new Date(game.endTime) : new Date(),
  );

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
          <p className="text-gray-400 mb-6">
            This game may have ended or doesn't exist.
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  const handleInitiateSpin = () => {
    // Check if user is authenticated
    if (!user) {
      setShowAuthPopup(true);
      return;
    }

    // Check if user has payment method
    if (!(user as any)?.cardOnFile) {
      setShowPaymentPopup(true);
      return;
    }

    // User is authenticated and has payment method - proceed with game
    setShowDisclaimer(true);
  };

  const handleConfirmSpin = async () => {
    setShowDisclaimer(false);

    // Trigger the wheel to start spinning - this will call handleSpin internally
    if (wheelRef.current) {
      try {
        await wheelRef.current.triggerSpin();
      } catch (error) {
        console.error("Spin failed:", error);
        setIsSpinning(false);
      }
    }
  };

  const handleSpin = async (): Promise<number> => {
    if (!game) throw new Error("Game not found");

    console.log("🎯 Starting API call for game spin...");

    try {
      const response = await fetch("/api/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          gameId: game.id,
          agreedToTerms: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("🚨 API call failed:", error);

        if (response.status === 401) {
          setShowAuthPopup(true);
          throw new Error("Authentication required");
        }

        // For payment failures, we want to throw specific errors
        if (response.status === 400 && error.message?.includes("card")) {
          throw new Error("Payment method error: " + error.message);
        }

        throw new Error(error.message || "Spin request failed");
      }

      const data = await response.json();

      if (!data.success || !data.spinResult) {
        console.error("🚨 Invalid API response:", data);
        throw new Error("Invalid response from server");
      }

      const result = data.spinResult.number;
      console.log("🎯 API call successful, received result:", result);

      setLastResult(result);
      setShowConfetti(true);

      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);

      return result;
    } catch (error) {
      console.error("🚨 Spin API error:", error);
      // Re-throw the error so the wheel component can handle it appropriately
      throw error;
    }
  };

  const progress =
    ((game.totalNumbers - game.numbersLeft) / game.totalNumbers) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin"
          style={{ animationDuration: "20s" }}
        ></div>
      </div>

      {/* Confetti is handled by the wheel component */}

      {/* Enhanced Professional Header */}
      <header className="relative z-10 bg-gradient-to-r from-slate-900/90 via-purple-900/80 to-slate-900/90 backdrop-blur-2xl border-b border-purple-400/40 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 blur-xl"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Responsive Layout */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-0">
            {/* Top Row - Back Button + Brand Logo */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/games")}
                className="text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm font-semibold hidden xs:inline">
                  BACK TO GAMES
                </span>
                <span className="text-xs font-semibold xs:hidden">BACK</span>
              </Button>
              <img
                src={logoPath}
                alt="Hit The Road Jackpot"
                className="h-6 w-auto object-contain sm:h-8 md:h-10 lg:h-12 xl:h-14 drop-shadow-lg"
              />
            </div>

            {/* Game Title Section */}
            <div className="text-center sm:text-left">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between space-y-3 sm:space-y-4 xl:space-y-0 xl:space-x-6">
                {/* Game Identity */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start xl:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                  <div className="relative flex-shrink-0">
                    <div className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl relative z-10 drop-shadow-lg">
                        {game.emoji}
                      </span>
                    </div>
                    <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-br from-red-400/30 to-purple-400/30 rounded-2xl sm:rounded-3xl blur-xl -z-10"></div>
                  </div>

                  <div className="text-center sm:text-left min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight break-words">
                      {game.name}
                    </h1>
                    <div className="flex items-center justify-center sm:justify-start space-x-1.5 sm:space-x-2 mt-1 sm:mt-2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 px-2 sm:px-3 py-0.5 sm:py-1 font-bold shadow-lg text-xs sm:text-sm">
                        <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        LIVE
                      </Badge>
                      <span className="text-gray-300 font-mono text-xs sm:text-sm bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-white/20">
                        {game.code}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prize Showcase */}
                <div className="flex justify-center xl:justify-end flex-shrink-0">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-red-500/30 backdrop-blur-xl rounded-xl sm:rounded-2xl px-4 sm:px-5 lg:px-6 xl:px-8 2xl:px-10 py-3 sm:py-4 lg:py-5 xl:py-6 border border-yellow-400/50 shadow-2xl">
                      <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5">
                        <div className="p-2 sm:p-2.5 lg:p-3 xl:p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                          <Trophy className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 2xl:h-10 2xl:w-10 text-white drop-shadow-lg" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-yellow-300 text-xs sm:text-sm lg:text-base xl:text-lg font-bold uppercase tracking-wide">
                            Grand Prize
                          </p>
                          <p className="text-white text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-black drop-shadow-lg break-words leading-tight">
                            {game.prize}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl sm:rounded-2xl blur-lg -z-10"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
              {/* Live Players */}
              <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-xl rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-emerald-400/40 shadow-lg">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-md sm:rounded-lg shadow-lg flex-shrink-0">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-emerald-300 text-xs font-bold uppercase tracking-wide">
                      Live Players
                    </p>
                    <p className="text-white text-sm sm:text-lg font-black">
                      {playerCount}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Time Remaining */}
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-blue-400/40 shadow-lg">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-md sm:rounded-lg shadow-lg flex-shrink-0">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-blue-300 text-xs font-bold uppercase tracking-wide">
                      Time Left
                    </p>
                    <p className="text-white text-sm sm:text-lg font-black font-mono">
                      {formatCountdownObject(countdown)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Numbers Available */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-purple-400/40 shadow-lg">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-md sm:rounded-lg shadow-lg flex-shrink-0">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-purple-300 text-xs font-bold uppercase tracking-wide">
                      Available
                    </p>
                    <p className="text-white text-sm sm:text-lg font-black">
                      {game.numbersLeft}/{game.totalNumbers}
                    </p>
                  </div>
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
                <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
                  Click the wheel to spin and claim your number!
                </p>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 lg:p-8">
                <div className="text-center">
                  <ProfessionalWheel
                    ref={wheelRef}
                    onSpin={handleSpin}
                    disabled={isSpinning}
                    totalNumbers={game?.totalNumbers || 200}
                    onInitiateSpin={handleInitiateSpin}
                    availableNumbers={(availableNumbers as any)?.availableNumbers || []}
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
                  <span className="text-yellow-400 font-bold">
                    {game.prize}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Code</span>
                  <span className="text-white font-mono">{game.code}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Numbers Available</span>
                    <span className="text-white">
                      {game.numbersLeft} / {game.totalNumbers}
                    </span>
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
                {!Array.isArray(recentNumbers) || recentNumbers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-sm mb-2">
                      No recent numbers yet
                    </div>
                    <div className="text-gray-500 text-xs">
                      Be the first to spin!
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {(recentNumbers as any[]).map(
                      (entry: any, index: number) => (
                        <div
                          key={index}
                          className="aspect-square bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-xl flex items-center justify-center border border-purple-500/30"
                          title={`Spun ${new Date(entry.timestamp).toLocaleTimeString()}`}
                        >
                          <span className="text-white font-bold text-lg">
                            {entry.number}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
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
                  <p>Click on the spin the wheel</p>
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
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <p>No Purchase Necessary - Use free entry option!</p>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-black-900 border-green-500/30 text-green-300"
                    onClick={() => window.open("/how-to-play", "_blank")}
                  >
                    View Full Instructions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Disclaimer Popup */}
      <DisclaimerPopup
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        onConfirm={handleConfirmSpin}
        gameTitle={game.name}
      />

      {/* Auth Required Popup */}
      <AuthRequiredPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSignup={() => {
          setShowAuthPopup(false);
          setLocation("/");
        }}
        onLogin={() => {
          setShowAuthPopup(false);
          setLocation("/");
        }}
      />

      {/* Payment Method Required Popup */}
      <PaymentRequiredPopup
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
      />
    </div>
  );
}
