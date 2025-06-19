import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { generateGameCode } from "@/lib/utils";
import type { Game } from "@shared/schema";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [drawnNumber] = useState(56);
  const [previousNumbers] = useState([3, 87, 24]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const { data: gameStats } = useQuery({
    queryKey: [`/api/games/${selectedGame?.id}/stats`],
    enabled: !!selectedGame,
  });

  const createGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      const response = await apiRequest("POST", "/api/games", gameData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setIsDialogOpen(false);
    },
  });

  const completeGameMutation = useMutation({
    mutationFn: async (gameId: number) => {
      const response = await apiRequest("POST", `/api/games/${gameId}/complete`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
  });

  const handleCreateGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const gameData = {
      name: formData.get("name") as string,
      code: generateGameCode(),
      prize: formData.get("prize") as string,
      prizeValue: parseInt(formData.get("prizeValue") as string) || 0,
      totalNumbers: parseInt(formData.get("totalNumbers") as string) || 125,
      endTime: new Date(Date.now() + parseInt(formData.get("duration") as string) * 60 * 60 * 1000),
      isFreePlay: formData.get("isFreePlay") === "on",
      emoji: formData.get("emoji") as string || "🎮",
    };

    createGameMutation.mutate(gameData);
  };

  const handleCompleteGame = () => {
    if (selectedGame) {
      completeGameMutation.mutate(selectedGame.id);
    }
  };

  return (
    <div className="phone-container">
      <div className="phone-screen">
        {/* Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
          <Button
            variant="ghost"
            size="sm"
            className="text-xl text-gray-600 hover:text-gray-800 p-0 h-auto"
            onClick={() => setLocation("/")}
          >
            ←
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-yellow hover:bg-yellow-400 text-black px-3 py-1 text-sm font-semibold">
                + Add Game
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Game</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGame} className="space-y-4">
                <div>
                  <Label htmlFor="name">Game Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="prize">Prize Description</Label>
                  <Input id="prize" name="prize" required />
                </div>
                <div>
                  <Label htmlFor="prizeValue">Prize Value ($)</Label>
                  <Input id="prizeValue" name="prizeValue" type="number" min="0" />
                </div>
                <div>
                  <Label htmlFor="totalNumbers">Total Numbers</Label>
                  <Input id="totalNumbers" name="totalNumbers" type="number" defaultValue="125" />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input id="duration" name="duration" type="number" defaultValue="24" />
                </div>
                <div>
                  <Label htmlFor="emoji">Emoji</Label>
                  <Input id="emoji" name="emoji" defaultValue="🎮" />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="isFreePlay" name="isFreePlay" />
                  <Label htmlFor="isFreePlay">Free Play Game</Label>
                </div>
                <Button type="submit" className="w-full" disabled={createGameMutation.isPending}>
                  {createGameMutation.isPending ? "Creating..." : "Create Game"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Game Selection */}
        <div className="px-4 py-4">
          <Label htmlFor="gameSelect">Select Game to Manage</Label>
          <Select onValueChange={(value) => {
            const game = games?.find(g => g.id === parseInt(value));
            setSelectedGame(game || null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a game..." />
            </SelectTrigger>
            <SelectContent>
              {games?.map((game) => (
                <SelectItem key={game.id} value={game.id.toString()}>
                  {game.name} ({game.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedGame && (
          <>
            {/* Drew Number Display */}
            <div className="px-4 py-6 text-center">
              <h2 className="text-lg text-gray-600 mb-2">Current Draw:</h2>
              <div className="text-6xl font-bold text-gray-800">{drawnNumber}</div>
            </div>
            
            {/* Game Stats */}
            <div className="px-4 py-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Game Statistics</h3>
              
              <div className="flex justify-between items-center mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {gameStats?.totalPlayers || 0}
                  </div>
                  <div className="text-xs text-gray-500">Total Players</div>
                  <div className="toggle-switch mt-2"></div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {gameStats?.referrals || 0}
                  </div>
                  <div className="text-xs text-gray-500">Referrals</div>
                  <div className="toggle-switch mt-2"></div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {gameStats?.freePlays || 0}
                  </div>
                  <div className="text-xs text-gray-500">Free Plays</div>
                  <div className="toggle-switch off mt-2"></div>
                </div>
              </div>
              
              {/* Previous Numbers Display */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Previous Numbers</h4>
                <div className="flex justify-center space-x-4">
                  {previousNumbers.map((number, index) => (
                    <div key={index} className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-gray-800">{number}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Game Info */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-sm">Game Details</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span>{selectedGame.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Code:</span>
                    <span>{selectedGame.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prize:</span>
                    <span>{selectedGame.prize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Numbers Left:</span>
                    <span>{selectedGame.numbersLeft} / {selectedGame.totalNumbers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={selectedGame.isActive ? "text-green-600" : "text-red-600"}>
                      {selectedGame.isActive ? "Active" : "Completed"}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Complete Game Button */}
              <div className="text-center">
                <Button
                  onClick={handleCompleteGame}
                  disabled={!selectedGame.isActive || completeGameMutation.isPending}
                  className="bg-brand-blue hover:bg-blue-600 text-white px-8 py-3 text-lg w-full"
                >
                  {completeGameMutation.isPending ? "Completing..." : "Complete Game"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
