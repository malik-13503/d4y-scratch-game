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
      <div className="phone-container">
        <div className="phone-screen flex items-center justify-center">
          <div className="text-center">Loading game...</div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="phone-container">
        <div className="phone-screen flex items-center justify-center">
          <div className="text-center">Game not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-container">
      <div className="phone-screen">
        {/* Header */}
        <div className="bg-brand-red text-white px-4 py-3 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-3 text-xl text-white hover:text-white hover:bg-red-600 p-0 h-auto"
            onClick={() => setLocation("/")}
          >
            ←
          </Button>
          <h1 className="text-lg font-bold">{game.name}</h1>
        </div>
        
        {/* Game Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          {selectedNumber ? (
            /* Result Display */
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">You Drew:</h2>
              <div className="text-8xl font-bold text-brand-red mb-8">{selectedNumber}</div>
              <p className="text-gray-600 mb-8">
                Wait for the game to end to see if you won!
              </p>
              <Button
                onClick={() => setLocation("/")}
                className="bg-brand-blue hover:bg-blue-600 text-white px-8 py-3 text-lg"
              >
                Back to Games
              </Button>
            </div>
          ) : (
            /* Spinning Wheel */
            <>
              <SpinningWheel
                onSpin={handleSpin}
                disabled={!playerId || spinWheelMutation.isPending}
              />
              
              {/* Countdown Timer */}
              <div className="bg-brand-red text-white px-6 py-2 rounded-lg font-mono text-lg font-bold mt-8">
                {timeRemaining}
              </div>
              
              {spinWheelMutation.isError && (
                <div className="mt-4 text-red-600 text-center">
                  Failed to spin wheel. Please try again.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
