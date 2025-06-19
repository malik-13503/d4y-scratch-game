import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatTimeRemaining, generateGameCode } from "@/lib/utils";
import type { Game, AdminUser, WheelSegment, SystemSetting } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSegmentDialogOpen, setIsSegmentDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const user = localStorage.getItem("admin_user");
    if (user) {
      setAdminUser(JSON.parse(user));
    } else {
      setLocation("/admin-login");
    }
  }, [setLocation]);

  const { data: dashboardStats } = useQuery<{
    totalGames: number;
    activeGames: number;
    totalSpins: number;
    totalPrizeValue: number;
  }>({
    queryKey: ["/api/admin/dashboard/stats"],
    enabled: !!adminUser,
  });

  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/admin/games"],
    enabled: !!adminUser,
  });

  const { data: systemSettings } = useQuery<SystemSetting[]>({
    queryKey: ["/api/admin/settings"],
    enabled: !!adminUser,
  });

  const { data: wheelSegments } = useQuery<WheelSegment[]>({
    queryKey: [`/api/admin/games/${selectedGame?.id}/segments`],
    enabled: !!selectedGame,
  });

  const { data: players } = useQuery<any[]>({
    queryKey: [`/api/admin/games/${selectedGame?.id}/players`],
    enabled: !!selectedGame,
  });

  const createGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      const response = await apiRequest("POST", "/api/admin/games", gameData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
      setIsCreateGameOpen(false);
      toast({ title: "Game created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create game",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/games/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      toast({ title: "Game updated successfully" });
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/games/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
      toast({ title: "Game deleted successfully" });
    },
  });

  const createSegmentMutation = useMutation({
    mutationFn: async (segmentData: any) => {
      const response = await apiRequest("POST", `/api/admin/games/${selectedGame?.id}/segments`, segmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/games/${selectedGame?.id}/segments`] });
      setIsSegmentDialogOpen(false);
      toast({ title: "Wheel segment created successfully" });
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/settings/${key}`, { value });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Setting updated successfully" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      localStorage.removeItem("admin_user");
      setLocation("/admin-login");
    },
  });

  const handleCreateGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const gameData = {
      name: formData.get("name") as string,
      code: generateGameCode(),
      description: formData.get("description") as string,
      gameType: formData.get("gameType") as string,
      prize: formData.get("prize") as string,
      prizeValue: parseFloat(formData.get("prizeValue") as string) || 0,
      prizeDescription: formData.get("prizeDescription") as string,
      totalNumbers: parseInt(formData.get("totalNumbers") as string) || 125,
      maxParticipants: parseInt(formData.get("maxParticipants") as string) || null,
      maxWinners: parseInt(formData.get("maxWinners") as string) || 1,
      entryFee: parseFloat(formData.get("entryFee") as string) || 0,
      startTime: new Date(formData.get("startTime") as string),
      endTime: new Date(formData.get("endTime") as string),
      isFreePlay: formData.get("isFreePlay") === "on",
      emoji: formData.get("emoji") as string || "🎮",
    };

    createGameMutation.mutate(gameData);
  };

  const handleCreateSegment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const segmentData = {
      label: formData.get("label") as string,
      color: formData.get("color") as string,
      weight: parseInt(formData.get("weight") as string) || 1,
      order: parseInt(formData.get("order") as string) || 1,
    };

    createSegmentMutation.mutate(segmentData);
  };

  const handleToggleSetting = (key: string, currentValue: string) => {
    const newValue = currentValue === "true" ? "false" : "true";
    updateSettingMutation.mutate({ key, value: newValue });
  };

  if (!adminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">🎮</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Prize Game Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{adminUser.firstName} {adminUser.lastName}</p>
              </div>
              <Button 
                onClick={() => logoutMutation.mutate()}
                variant="outline"
                className="text-gray-600 hover:text-gray-800"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="wheel">Wheel Config</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Games</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{dashboardStats?.totalGames || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Games</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{dashboardStats?.activeGames || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Spins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{dashboardStats?.totalSpins || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Prize Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">${dashboardStats?.totalPrizeValue || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {games?.slice(0, 5).map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg">{game.emoji}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{game.name}</h3>
                          <p className="text-sm text-gray-500">{game.code} • {game.prize}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={game.isActive ? "default" : "secondary"}>
                          {game.isActive ? "Active" : "Completed"}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {game.numbersLeft} / {game.totalNumbers} left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Games Management Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Game Management</h2>
              <Dialog open={isCreateGameOpen} onOpenChange={setIsCreateGameOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    Create New Game
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Game</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateGame} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Game Name</Label>
                        <Input id="name" name="name" required />
                      </div>
                      <div>
                        <Label htmlFor="gameType">Game Type</Label>
                        <Select name="gameType" defaultValue="number_draw">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="number_draw">Number Draw</SelectItem>
                            <SelectItem value="wheel_spin">Wheel Spin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" name="description" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="prize">Prize Title</Label>
                        <Input id="prize" name="prize" required />
                      </div>
                      <div>
                        <Label htmlFor="prizeValue">Prize Value ($)</Label>
                        <Input id="prizeValue" name="prizeValue" type="number" step="0.01" min="0" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="prizeDescription">Prize Description</Label>
                      <Input id="prizeDescription" name="prizeDescription" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="totalNumbers">Total Numbers</Label>
                        <Input id="totalNumbers" name="totalNumbers" type="number" defaultValue="125" />
                      </div>
                      <div>
                        <Label htmlFor="maxParticipants">Max Participants</Label>
                        <Input id="maxParticipants" name="maxParticipants" type="number" />
                      </div>
                      <div>
                        <Label htmlFor="maxWinners">Max Winners</Label>
                        <Input id="maxWinners" name="maxWinners" type="number" defaultValue="1" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entryFee">Entry Fee ($)</Label>
                        <Input id="entryFee" name="entryFee" type="number" step="0.01" min="0" defaultValue="0" />
                      </div>
                      <div>
                        <Label htmlFor="emoji">Emoji</Label>
                        <Input id="emoji" name="emoji" defaultValue="🎮" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input 
                          id="startTime" 
                          name="startTime" 
                          type="datetime-local" 
                          defaultValue={new Date().toISOString().slice(0, 16)}
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <Input 
                          id="endTime" 
                          name="endTime" 
                          type="datetime-local" 
                          defaultValue={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="isFreePlay" name="isFreePlay" />
                      <Label htmlFor="isFreePlay">Free Play Game</Label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createGameMutation.isPending}
                    >
                      {createGameMutation.isPending ? "Creating..." : "Create Game"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games?.map((game) => (
                <Card key={game.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xl">{game.emoji}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{game.name}</CardTitle>
                          <p className="text-sm text-gray-500">{game.code}</p>
                        </div>
                      </div>
                      <Badge variant={game.isActive ? "default" : "secondary"}>
                        {game.isActive ? "Active" : "Completed"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Prize:</span>
                      <span className="text-sm font-medium">{game.prize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Value:</span>
                      <span className="text-sm font-medium">${game.prizeValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Numbers:</span>
                      <span className="text-sm font-medium">{game.numbersLeft} / {game.totalNumbers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium capitalize">{game.gameType.replace('_', ' ')}</span>
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedGame(game)}
                        className="flex-1"
                      >
                        Manage
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateGameMutation.mutate({ 
                          id: game.id, 
                          updates: { isActive: !game.isActive } 
                        })}
                        className="flex-1"
                      >
                        {game.isActive ? "Stop" : "Start"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteGameMutation.mutate(game.id)}
                        className="px-3"
                      >
                        🗑️
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Wheel Configuration Tab */}
          <TabsContent value="wheel" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Wheel Configuration</h2>
              <div className="space-x-2">
                <Select onValueChange={(value) => {
                  const game = games?.find(g => g.id === parseInt(value));
                  setSelectedGame(game || null);
                }}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a wheel game..." />
                  </SelectTrigger>
                  <SelectContent>
                    {games?.filter(g => g.gameType === 'wheel_spin').map((game) => (
                      <SelectItem key={game.id} value={game.id.toString()}>
                        {game.name} ({game.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedGame && (
                  <Dialog open={isSegmentDialogOpen} onOpenChange={setIsSegmentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Add Segment</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Wheel Segment</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateSegment} className="space-y-4">
                        <div>
                          <Label htmlFor="label">Label</Label>
                          <Input id="label" name="label" required />
                        </div>
                        <div>
                          <Label htmlFor="color">Color</Label>
                          <Input id="color" name="color" type="color" defaultValue="#FF6B6B" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="weight">Weight</Label>
                            <Input id="weight" name="weight" type="number" defaultValue="1" />
                          </div>
                          <div>
                            <Label htmlFor="order">Order</Label>
                            <Input id="order" name="order" type="number" defaultValue="1" />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">
                          Create Segment
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {selectedGame && selectedGame.gameType === 'wheel_spin' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Wheel Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center p-8">
                      <div className="w-64 h-64 rounded-full border-8 border-gray-300 relative overflow-hidden">
                        {wheelSegments?.map((segment, index) => {
                          const segmentAngle = 360 / wheelSegments.length;
                          const startAngle = index * segmentAngle;
                          
                          return (
                            <div
                              key={segment.id}
                              className="absolute w-1/2 h-1/2 origin-bottom-right"
                              style={{
                                transform: `rotate(${startAngle}deg)`,
                                clipPath: `polygon(0 0, 0 100%, 86.6% 50%)`,
                                backgroundColor: segment.color,
                              }}
                            >
                              <div
                                className="absolute text-white font-bold text-sm flex items-center justify-center w-8 h-8 rounded-full bg-black/20"
                                style={{
                                  top: "20px",
                                  right: "20px",
                                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                                }}
                              >
                                {segment.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Segments ({wheelSegments?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {wheelSegments?.map((segment) => (
                        <div key={segment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-6 h-6 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: segment.color }}
                            ></div>
                            <div>
                              <p className="font-medium">{segment.label}</p>
                              <p className="text-sm text-gray-500">Weight: {segment.weight}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="destructive">
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🎡</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Wheel Game</h3>
                  <p className="text-gray-600">Choose a wheel-type game to configure its segments</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Player Management</h2>
              <Select onValueChange={(value) => {
                const game = games?.find(g => g.id === parseInt(value));
                setSelectedGame(game || null);
              }}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a game..." />
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

            {selectedGame ? (
              <Card>
                <CardHeader>
                  <CardTitle>Players for {selectedGame.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Player Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Number</th>
                          <th className="text-left p-2">Referrals</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(players || []).map((player: any) => (
                          <tr key={player.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{player.playerName}</td>
                            <td className="p-2 text-gray-600">{player.email || "N/A"}</td>
                            <td className="p-2">
                              {player.selectedNumber ? (
                                <Badge variant="outline">{player.selectedNumber}</Badge>
                              ) : (
                                <span className="text-gray-400">Not drawn</span>
                              )}
                            </td>
                            <td className="p-2">{player.referralCount}</td>
                            <td className="p-2">
                              <Badge variant={player.isWinner ? "default" : "secondary"}>
                                {player.isWinner ? "Winner" : "Player"}
                              </Badge>
                            </td>
                            <td className="p-2 text-gray-600">
                              {new Date(player.joinedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Game</h3>
                  <p className="text-gray-600">Choose a game to view its players and statistics</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {systemSettings?.map((setting) => (
                <Card key={setting.key}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {setting.key.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                      {setting.value === "true" || setting.value === "false" ? (
                        <Switch
                          checked={setting.value === "true"}
                          onCheckedChange={() => handleToggleSetting(setting.key, setting.value)}
                        />
                      ) : (
                        <Input
                          value={setting.value}
                          onChange={(e) => updateSettingMutation.mutate({ 
                            key: setting.key, 
                            value: e.target.value 
                          })}
                          className="w-20"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}