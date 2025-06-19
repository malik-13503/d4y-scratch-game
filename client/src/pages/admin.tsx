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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800 text-xl p-2"
                onClick={() => setLocation("/")}
              >
                ←
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 text-sm">Manage games and monitor performance</p>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-brand-yellow hover:bg-yellow-400 text-black px-6 py-2 text-lg font-semibold">
                  + Add Game
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select Game</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {selectedGame && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Game Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedGame.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Code:</span>
                    <span className="font-mono">{selectedGame.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prize:</span>
                    <span className="font-medium">{selectedGame.prize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Numbers:</span>
                    <span>{selectedGame.numbersLeft} / {selectedGame.totalNumbers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${selectedGame.isActive ? "text-green-600" : "text-red-600"}`}>
                      {selectedGame.isActive ? "Active" : "Completed"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedGame ? (
              <div className="space-y-8">
                {/* Current Draw */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">You Drew:</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-8xl font-bold text-gray-800 mb-4">{drawnNumber}</div>
                    <p className="text-gray-600">Current drawn number for this game</p>
                  </CardContent>
                </Card>

                {/* Game Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Game Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                          {gameStats?.totalPlayers || 0}
                        </div>
                        <div className="text-sm text-gray-500 mb-3">Total Players</div>
                        <div className="flex justify-center">
                          <div className="toggle-switch"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                          {gameStats?.referrals || 0}
                        </div>
                        <div className="text-sm text-gray-500 mb-3">Referrals</div>
                        <div className="flex justify-center">
                          <div className="toggle-switch"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                          {gameStats?.freePlays || 0}
                        </div>
                        <div className="text-sm text-gray-500 mb-3">Free Plays</div>
                        <div className="flex justify-center">
                          <div className="toggle-switch off"></div>
                        </div>
                      </div>
                    </div>

                    {/* Previous Numbers */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">Previous Numbers</h4>
                      <div className="flex justify-center space-x-4">
                        {previousNumbers.map((number, index) => (
                          <div key={index} className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-xl font-bold text-gray-800">{number}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="text-center">
                      <Button
                        onClick={handleCompleteGame}
                        disabled={!selectedGame.isActive || completeGameMutation.isPending}
                        className="bg-brand-blue hover:bg-blue-600 text-white px-12 py-4 text-lg font-semibold"
                      >
                        {completeGameMutation.isPending ? "Completing..." : "Done"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Game</h3>
                <p className="text-gray-600">Choose a game from the sidebar to view details and statistics</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
