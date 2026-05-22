import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProfessionalWheel } from "@/components/professional-wheel";
import { Confetti } from "@/components/confetti";
import { DisclaimerPopup } from "@/components/disclaimer-popup";
import { AuthRequiredPopup } from "@/components/auth-required-popup";
import { PaymentRequiredPopup } from "@/components/payment-required-popup";
import logoPath from "@assets/logo_1777237644041.png";
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
  Coins,
} from "lucide-react";
import { formatTimeRemaining, formatCountdownObject } from "@/lib/utils";
import { useCountdown } from "@/hooks/useCountdown";
import type { Game } from "@shared/schema";

export default function GamePage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number>();
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [playerCount, setPlayerCount] = useState(1);
  const [hasUsedFreePlay, setHasUsedFreePlay] = useState(false);
  const [isFreePlay, setIsFreePlay] = useState(false);
  const [freePlayMessage, setFreePlayMessage] = useState<string | null>(null);
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

  // Check if user has already used free play when game loads
  useEffect(() => {
    const checkFreePlayStatus = async () => {
      if (!game?.id) return;
      
      try {
        const response = await fetch(`/api/games/${game.id}/free-play-status`);
        
        if (response.ok) {
          const data = await response.json();
          setHasUsedFreePlay(data.hasUsedFreePlay);
        }
      } catch (error) {
        console.log("Free play status check failed, assuming available");
      }
    };

    checkFreePlayStatus();
  }, [game?.id]);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Get user's token balance for display
  const { data: tokenBalanceData } = useQuery<{ tokenBalance: number }>({
    queryKey: ["/api/user/token-balance"],
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5 seconds to show real-time balance
  });

  const gameId = game?.id;

  const { data: availableNumbersData } = useQuery<{availableNumbers: number[], totalAvailable: number}>({
    queryKey: [`/api/games/${gameId}/available-numbers`],
    refetchInterval: 10000,
    enabled: !!gameId,
  });

  const availableNumbers = availableNumbersData?.availableNumbers || [];
  const totalAvailable = availableNumbersData?.totalAvailable || 0;

  const { data: recentNumbers = [] } = useQuery({
    queryKey: [`/api/games/${gameId}/recent-numbers`],
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    enabled: !!gameId,
  });

  // Always call useCountdown hook consistently with stable value
  const countdown = useCountdown(game?.endTime || new Date().toISOString());

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

  // Check if game has ended
  const isGameEnded = game.endTime && new Date() > new Date(game.endTime);
  
  // Check if all numbers are taken
  const areAllNumbersTaken = availableNumbers.length === 0;

  if (isGameEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-white mb-2">Game Has Ended</h2>
          <p className="text-gray-400 mb-6">
            This game ended on {new Date(game.endTime).toLocaleDateString()}. No more spins are allowed.
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

  if (areAllNumbersTaken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-white mb-2">All Numbers Taken!</h2>
          <p className="text-gray-400 mb-6">
            All numbers in this game have been claimed. The game is complete!
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
    // Check if game has ended
    if (isGameEnded) {
      return;
    }

    // Check if all numbers are taken
    if (areAllNumbersTaken) {
      return;
    }

    // Check if user is authenticated
    if (!user) {
      setShowAuthPopup(true);
      return;
    }

    // User is authenticated - proceed with game (tokens are deducted on the server during spin)
    setIsFreePlay(false);
    setShowDisclaimer(true);
  };

  const handleFreePlay = () => {
    // Check if game has ended
    if (isGameEnded) {
      return;
    }

    // Check if all numbers are taken
    if (areAllNumbersTaken) {
      return;
    }

    if (hasUsedFreePlay) {
      return; // Already used free play
    }

    setIsFreePlay(true);
    setHasUsedFreePlay(true);
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

    // For free play, use the dedicated free play API endpoint
    if (isFreePlay) {
      try {
        const response = await fetch("/api/free-spin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gameId: game.id,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          if (data.code === 'FREE_PLAY_EXHAUSTED') {
            setHasUsedFreePlay(true);
            throw new Error(data.description || "Free play already used for this game");
          }
          throw new Error(data.message || "Free spin failed");
        }

        console.log("🎯 Free play spin result:", data.result.number);
        setLastResult(data.result.number);
        setShowConfetti(true);
        setFreePlayMessage(data.result.message);

        // Invalidate queries to refresh available numbers and game data
        queryClient.invalidateQueries({ queryKey: [`/api/games/${game.id}/available-numbers`] });
        queryClient.invalidateQueries({ queryKey: [`/api/games/${game.id}/recent-numbers`] });
        queryClient.invalidateQueries({ queryKey: [`/api/games/${game.id}`] });

        setTimeout(() => {
          setShowConfetti(false);
          setFreePlayMessage(null);
        }, 8000);
        
        return data.result.number;
      } catch (error) {
        console.error("Free play spin error:", error);
        throw error;
      }
    }

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

        // Handle payment failures - throw error instead of returning object
        if (response.status === 400 && error.paymentFailed) {
          console.log(`❌ Payment failed for spun number ${error.number}:`, error.paymentMessage);
          throw new Error(`Payment failed: ${error.paymentMessage}`);
        }

        // For other payment/card errors
        if (response.status === 400 && error.message?.includes("card")) {
          throw new Error("Payment method error: " + error.message);
        }

        throw new Error(error.message || "Spin request failed");
      }

      const data = await response.json();
      console.log("🎯 API call successful, received result:", data);

      // Server now returns just the number directly for successful spins
      setLastResult(data);
      setShowConfetti(true);

      // Invalidate queries to refresh available numbers and game data
      queryClient.invalidateQueries({ queryKey: [`/api/games/${game.id}/available-numbers`] });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${game.id}/recent-numbers`] });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${game.id}`] });

      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);

      return data; // Return just the number for successful spins
    } catch (error) {
      console.error("🚨 Spin API error:", error);
      // Re-throw the error so the wheel component can handle it appropriately
      throw error;
    }
  };

  // Calculate progress using token collection vs token threshold
  const tokenThreshold = (game as any)?.tokenThreshold || 0;
  const tokensCollected = (game as any)?.tokensCollected || 0;
  const tokenCostPerEntry = (game as any)?.tokenCostPerEntry || 10;
  const progress = tokenThreshold > 0 ? Math.min((tokensCollected / tokenThreshold) * 100, 100) : 0;
  const tokensRemaining = Math.max(tokenThreshold - tokensCollected, 0);
  const playsRemaining = tokenCostPerEntry > 0 ? Math.ceil(tokensRemaining / tokenCostPerEntry) : 0;
  const isAlmostFull = progress >= 80;
  const isCritical = progress >= 95;

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
                alt="Prize Plugz"
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
                      {game.prizeImageUrl ? (
                        <img 
                          src={game.prizeImageUrl} 
                          alt={game.name}
                          className="w-28 h-24 sm:w-32 sm:h-28 md:w-36 md:h-32 lg:w-40 lg:h-36 xl:w-44 xl:h-40 object-contain object-center rounded-lg relative z-10 drop-shadow-lg"
                        />
                      ) : (
                        <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-10xl relative z-10 drop-shadow-lg">
                          {game.emoji}
                        </span>
                      )}
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
                      {totalAvailable}/{game.totalNumbers}
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
                <div className="text-center space-y-4 sm:space-y-6">
                  <ProfessionalWheel
                    ref={wheelRef}
                    onSpin={handleSpin}
                    disabled={isSpinning}
                    totalNumbers={game?.totalNumbers || 200}
                    onInitiateSpin={handleInitiateSpin}
                    gameData={game ? {
                      id: game.id,
                      totalNumbers: game.totalNumbers,
                      freePlayStart: game.freePlayStart,
                      freePlayEnd: game.freePlayEnd
                    } : undefined}
                  />
                  

                  
                  {/* Free Play Button - Hidden when freePlayStart > freePlayEnd (disabled free play) */}
                  {!hasUsedFreePlay && game && 
                   game.freePlayStart && game.freePlayEnd &&
                   game.freePlayStart <= game.freePlayEnd && 
                   game.freePlayStart <= game.totalNumbers && game.freePlayEnd <= game.totalNumbers && 
                   game.freePlayStart > 0 && game.freePlayEnd > 0 && // Only show if free play is actually enabled
                   game.freePlayStart !== game.totalNumbers + 1 && // Don't show if set to disabled values
                   (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl border border-green-400/40 shadow-2xl p-4 sm:p-6">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex items-center space-x-2">
                          <Gift className="h-5 w-5 text-green-400" />
                          <span className="text-green-300 font-bold text-sm uppercase tracking-wide">
                            Free Play Available
                          </span>
                        </div>
                        <p className="text-white text-sm sm:text-base text-center">
                          Try your luck with one free spin - no payment required!
                        </p>
                        <Button
                          onClick={handleFreePlay}
                          disabled={isSpinning}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          {isSpinning ? "Spinning..." : "Free Play Spin"}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {hasUsedFreePlay && game && 
                   game.freePlayStart <= game.freePlayEnd && 
                   game.freePlayStart <= game.totalNumbers && game.freePlayEnd <= game.totalNumbers && (
                    <div className="bg-gradient-to-r from-gray-500/20 to-slate-500/20 backdrop-blur-xl rounded-xl border border-gray-400/40 shadow-2xl p-4">
                      <div className="flex items-center justify-center space-x-2 text-gray-400">
                        <Gift className="h-4 w-4" />
                        <span className="text-sm">Free play used - Join the game to continue playing!</span>
                      </div>
                    </div>
                  )}

                  {/* Free Play Result Display */}
                  {freePlayMessage && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl border border-green-400/40 shadow-2xl p-4 sm:p-6 animate-pulse">
                      <div className="text-center space-y-2">
                        <div className="text-2xl">🎉</div>
                        <p className="text-green-300 font-bold text-lg">
                          Free Play Complete!
                        </p>
                        <p className="text-white text-sm">
                          {freePlayMessage}
                        </p>
                        <p className="text-green-400 text-xs">
                          Sign up to play for real prizes!
                        </p>
                      </div>
                    </div>
                  )}
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
                {user ? (
                  <div className="flex items-center justify-between border-t border-purple-500/30 pt-3 mt-3">
                    <span className="text-gray-400">Your Tokens</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 font-bold text-lg">
                        {tokenBalanceData?.tokenBalance || 0}
                      </span>
                      <span className="text-xs bg-purple-600/50 px-2 py-1 rounded-full">
                        Cost: {(game as any)?.tokenCostPerEntry || 5} tokens per spin
                      </span>
                    </div>
                  </div>
                ) : null}
                {/* Token Progress Bar */}
                <div className="space-y-2">
                  {/* Almost Full Alert */}
                  {isCritical && (
                    <div className="flex items-center space-x-2 bg-red-500/20 border border-red-400/50 rounded-lg px-3 py-2 animate-pulse">
                      <Zap className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <span className="text-red-300 text-xs font-bold uppercase tracking-wide">ALMOST GONE! Only {playsRemaining} plays left!</span>
                    </div>
                  )}
                  {isAlmostFull && !isCritical && (
                    <div className="flex items-center space-x-2 bg-orange-500/20 border border-orange-400/50 rounded-lg px-3 py-2">
                      <Star className="h-4 w-4 text-orange-400 flex-shrink-0" />
                      <span className="text-orange-300 text-xs font-bold">Almost full! {playsRemaining} plays remaining</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Game Progress</span>
                    <span className={`font-bold ${isCritical ? 'text-red-400' : isAlmostFull ? 'text-orange-400' : 'text-white'}`}>
                      {tokensCollected} / {tokenThreshold} tokens
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={progress}
                      className={`h-4 ${isCritical ? 'bg-red-950' : isAlmostFull ? 'bg-orange-950' : 'bg-white/10'}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold drop-shadow">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{tokensRemaining} tokens to go</span>
                    <span className={`font-semibold ${isCritical ? 'text-red-400' : 'text-gray-400'}`}>
                      {playsRemaining} plays left
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-1">
                    <span className="text-gray-400 text-xs">Cost per play</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400 font-bold text-sm">{tokenCostPerEntry}</span>
                      <span className="text-gray-400 text-xs">tokens</span>
                    </div>
                  </div>
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

                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="text-xs text-gray-400">
                    <div className="flex items-center justify-between">
                      <span>Active Segments:</span>
                      <span className="text-green-300 font-bold">
                        {availableNumbers.length} / {game?.totalNumbers || 0} max
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${game?.totalNumbers ? (availableNumbers.length / game.totalNumbers) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-xs text-gray-500">
                        {game ? `${game.totalNumbers - availableNumbers.length} numbers claimed` : ''}
                      </span>
                    </div>
                  </div>
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
        isFreePlay={isFreePlay}
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
        onClose={() => {
          setShowPaymentPopup(false);
          setShowCardSelector(false);
        }}
        showCardSelector={showCardSelector}
        onCardSelected={(cardId) => {
          setSelectedCardId(cardId);
          setShowPaymentPopup(false);
          setShowCardSelector(false);
        }}
      />
    </div>
  );
}
