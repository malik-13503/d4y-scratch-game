import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { SpinningWheel } from "@/components/spinning-wheel";
import { Button } from "@/components/ui/button";
import { formatTimeRemaining } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { Game } from "@shared/schema";

export default function GamePage() {
  const [, params] = useRoute("/game/:id");
  const [, setLocation] = useLocation();
  const [timeRemaining, setTimeRemaining] = useState("");
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const queryClient = useQueryClient();

  const gameId = params?.id ? parseInt(params.id) : null;

  const { data: game, isLoading } = useQuery<Game>({
    queryKey: [`/api/games/${gameId}`],
    enabled: !!gameId,
  });

  const joinGameMutation = useMutation({
    mutationFn: async (playerName: string) => {
      const response = await apiRequest("POST", `/api/games/${gameId}/join`, {
        playerName,
      });
      return response.json();
    },
    onSuccess: (player) => {
      setPlayerId(player.id);
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
    },
  });

  const spinWheelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/games/${gameId}/spin`, {
        playerId,
      });
      return response.json();
    },
    onSuccess: (result) => {
      setSelectedNumber(result.selectedNumber);
      // Show result modal after a brief delay
      setTimeout(() => setShowWinModal(true), 1000);
    },
  });

  useEffect(() => {
    if (!game) return;

    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(new Date(game.endTime)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [game]);

  useEffect(() => {
    // Auto-join as anonymous player
    if (game && !playerId && !joinGameMutation.isPending) {
      joinGameMutation.mutate("Anonymous Player");
    }
  }, [game, playerId]);

  const handleSpin = async () => {
    if (!playerId) return 0;
    
    const result = await spinWheelMutation.mutateAsync();
    return result.selectedNumber;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-red mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Not Found</h2>
          <p className="text-gray-600 mb-6">This game may have ended or doesn't exist.</p>
          <Button onClick={() => setLocation("/")} className="bg-brand-blue text-white">
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 text-xl p-2"
                onClick={() => setLocation("/")}
              >
                ←
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{game.name}</h1>
                <p className="text-white/70 text-sm">{game.code} • {game.prize}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-2">
                <div className="text-red-200 text-sm">Time Remaining</div>
                <div className="font-mono text-xl font-bold text-red-100">{timeRemaining}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {selectedNumber ? (
            /* Result Display */
            <div className="space-y-8">
              <div className="animate-bounce">
                <h2 className="text-4xl font-bold mb-6">🎉 You Drew:</h2>
                <div className="inline-block bg-gradient-to-br from-yellow-400 to-orange-500 text-black rounded-full w-48 h-48 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                  <span className="text-8xl font-bold">{selectedNumber}</span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <h3 className="text-2xl font-semibold mb-4">What happens next?</h3>
                <p className="text-white/80 text-lg leading-relaxed">
                  Your number has been recorded! Wait for the game to end and the winner will be announced. 
                  Good luck! 🍀
                </p>
              </div>
              
              <Button
                onClick={() => setLocation("/")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all"
              >
                Back to Games
              </Button>
            </div>
          ) : (
            /* Spinning Wheel */
            <div className="space-y-12">
              <div>
                <h2 className="text-4xl font-bold mb-4">Spin to Win!</h2>
                <p className="text-white/80 text-xl">Press the spin button to draw your lucky number</p>
              </div>
              
              <div className="flex justify-center">
                <SpinningWheel
                  onSpin={handleSpin}
                  disabled={!playerId || spinWheelMutation.isPending}
                />
              </div>
              
              {spinWheelMutation.isPending && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="animate-pulse text-xl">
                    🎲 Spinning the wheel of fortune...
                  </div>
                </div>
              )}
              
              {spinWheelMutation.isError && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6">
                  <div className="text-red-200 text-lg">
                    ❌ Failed to spin wheel. Please try again.
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-green-400">{game.numbersLeft}</div>
                  <div className="text-white/70">Numbers Left</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-blue-400">{game.totalNumbers}</div>
                  <div className="text-white/70">Total Numbers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-purple-400">1</div>
                  <div className="text-white/70">Winner Selected</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Result Modal */}
      {showWinModal && selectedNumber && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-black rounded-2xl p-8 max-w-md w-full text-center animate-scale-in">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-3xl font-bold mb-4">Your Lucky Number!</h3>
            <div className="text-8xl font-bold mb-6">{selectedNumber}</div>
            <p className="text-lg mb-6">Keep your fingers crossed for the final draw!</p>
            <Button
              onClick={() => setShowWinModal(false)}
              className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg font-semibold"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
