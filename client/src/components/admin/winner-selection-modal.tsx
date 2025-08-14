import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, User, Mail, DollarSign, Calendar, Trophy, AlertCircle, Users, Settings, Edit } from "lucide-react";

interface Participant {
  id: number;
  userId: number;
  playerName: string;
  email: string;
  spunNumber: number;
  amountPaid: number;
  spunAt: string;
  isWinner: boolean;
  spinResultId: number;
}

interface GameParticipants {
  gameId: number;
  gameName: string;
  totalParticipants: number;
  participants: Participant[];
  gameCompleted: boolean;
  hasWinner: boolean;
}

interface WinnerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: any;
  onWinnerSelected: () => void;
}

export function WinnerSelectionModal({ isOpen, onClose, game, onWinnerSelected }: WinnerSelectionModalProps) {
  const gameId = game?.id;
  const gameName = game?.name;
  const [selectedPlayer, setSelectedPlayer] = useState<Participant | null>(null);
  const [selectionReason, setSelectionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch game participants
  const { data: gameData, isLoading } = useQuery<GameParticipants>({
    queryKey: [`/api/admin/games/${gameId}/participants`],
    enabled: isOpen && !!gameId,
  });

  // Winner selection mutation
  const selectWinnerMutation = useMutation({
    mutationFn: async ({ playerId, reason }: { playerId: number; reason: string }) => {
      return await apiRequest("POST", `/api/admin/games/${gameId}/select-winner`, {
        playerId,
        reason,
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Winner Selected Successfully! 🎉",
        description: `${data.winner?.playerName || 'The participant'} has been selected as the winner and notified via email.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/games/${gameId}/participants`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      onWinnerSelected();
    },
    onError: (error) => {
      toast({
        title: "Failed to Select Winner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectWinner = () => {
    if (!selectedPlayer) {
      toast({
        title: "No Player Selected",
        description: "Please select a player to be the winner",
        variant: "destructive",
      });
      return;
    }

    if (!selectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for selecting this winner",
        variant: "destructive",
      });
      return;
    }

    selectWinnerMutation.mutate({
      playerId: selectedPlayer.id,
      reason: selectionReason.trim(),
    });
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              Select Winner - {gameName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-white">Loading participants...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!gameData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-400" />
              Error Loading Game
            </DialogTitle>
          </DialogHeader>
          <div className="text-center p-8">
            <p className="text-white">Failed to load game participants. Please try again.</p>
          </div>
          <DialogFooter>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 border-2 border-amber-500/40 shadow-2xl shadow-amber-500/20">
        <DialogHeader className="border-b border-amber-500/20 pb-6">
          <DialogTitle className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="h-7 w-7 text-white" />
            </div>
            Select Winner - {gameData.gameName}
          </DialogTitle>
          <div className="flex flex-wrap gap-3 mt-6">
            <Badge className="bg-blue-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
              <Users className="h-4 w-4 mr-2" />
              {gameData.totalParticipants} Participants
            </Badge>
            <Badge className={`${gameData.gameCompleted ? 'bg-red-600 text-white' : 'bg-green-600 text-white'} border-0 px-4 py-2 text-sm font-semibold shadow-lg`}>
              {gameData.gameCompleted ? '🏁 Game Completed' : '🔄 Game Active'}
            </Badge>
            {gameData.hasWinner && (
              <Badge className="bg-amber-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg animate-pulse">
                <Trophy className="h-4 w-4 mr-2" />
                Winner Already Selected
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
          {/* Participants List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gradient-to-r from-slate-800/80 to-gray-800/80 p-6 rounded-xl border border-slate-600/50">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                All Participants ({gameData.participants.length})
              </h3>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    ${gameData.participants.reduce((sum, p) => sum + p.amountPaid, 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-green-300">Total Revenue</div>
                </div>
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.round(gameData.participants.reduce((sum, p) => sum + p.amountPaid, 0) / gameData.participants.length * 100) / 100 || 0}
                  </div>
                  <div className="text-xs text-blue-300">Avg. Spend</div>
                </div>
                <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {new Set(gameData.participants.map(p => p.spunNumber)).size}
                  </div>
                  <div className="text-xs text-purple-300">Unique Numbers</div>
                </div>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
              {gameData.participants.map((participant, index) => (
                <Card
                  key={participant.id}
                  className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedPlayer?.id === participant.id
                      ? 'bg-gradient-to-r from-amber-600/30 to-orange-600/30 border-2 border-amber-400 shadow-lg shadow-amber-500/25'
                      : participant.isWinner
                      ? 'bg-gradient-to-r from-green-600/25 to-emerald-600/25 border-2 border-green-400 shadow-lg shadow-green-500/25'
                      : 'bg-gradient-to-r from-slate-800/60 to-gray-800/60 border border-slate-600/50 hover:border-amber-400/60 hover:shadow-lg'
                  }`}
                  onClick={() => !participant.isWinner && setSelectedPlayer(participant)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            participant.isWinner 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg' 
                              : selectedPlayer?.id === participant.id
                              ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg'
                              : 'bg-gradient-to-br from-slate-600 to-gray-700 text-white'
                          }`}>
                            {participant.isWinner ? (
                              <Trophy className="h-6 w-6" />
                            ) : (
                              <span>#{index + 1}</span>
                            )}
                          </div>
                          {selectedPlayer?.id === participant.id && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-black">✓</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg">{participant.playerName}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-300 mt-1">
                            <Mail className="h-4 w-4" />
                            <span>{participant.email}</span>
                          </div>
                          {participant.isWinner && (
                            <Badge className="bg-green-600 text-white border-0 mt-2 shadow-lg">
                              <Trophy className="h-3 w-3 mr-1" />
                              Current Winner
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="bg-slate-700/50 px-4 py-2 rounded-lg">
                          <div className="font-bold text-2xl text-white">#{participant.spunNumber}</div>
                          <div className="text-xs text-slate-300">Number Spun</div>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-sm">
                          <div className="bg-green-600/20 px-3 py-1 rounded-full border border-green-500/30">
                            <span className="text-green-400 font-bold">${participant.amountPaid.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(participant.spunAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Winner Selection Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-amber-600/10 to-orange-600/10 p-6 rounded-xl border border-amber-500/30">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                Winner Selection Panel
              </h3>
              
              {selectedPlayer ? (
                <div className="space-y-6">
                  {/* Selected Player Card */}
                  <Card className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-2 border-amber-400/60 shadow-xl">
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl">
                          <Crown className="h-10 w-10 text-white" />
                        </div>
                        <h4 className="font-bold text-white text-2xl mb-1">{selectedPlayer.playerName}</h4>
                        <p className="text-amber-200 text-sm font-medium">{selectedPlayer.email}</p>
                        <Badge className="bg-amber-600 text-white border-0 mt-2 px-4 py-1">
                          Selected for Winner
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-lg text-center">
                          <div className="text-3xl font-bold text-amber-400">#{selectedPlayer.spunNumber}</div>
                          <div className="text-xs text-amber-200">Number Spun</div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-lg text-center">
                          <div className="text-3xl font-bold text-green-400">${selectedPlayer.amountPaid.toFixed(2)}</div>
                          <div className="text-xs text-green-200">Amount Paid</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <div className="text-sm text-amber-200">
                          Played on {new Date(selectedPlayer.spunAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Admin Tools */}
                  <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-600/50">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-400" />
                      Admin Tools
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-blue-600/20 p-3 rounded-lg">
                        <div className="font-semibold text-blue-400">Player Rank</div>
                        <div className="text-white">#{gameData.participants.findIndex(p => p.id === selectedPlayer.id) + 1} of {gameData.participants.length}</div>
                      </div>
                      <div className="bg-purple-600/20 p-3 rounded-lg">
                        <div className="font-semibold text-purple-400">Selection Method</div>
                        <div className="text-white">Manual Admin</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-12 border-2 border-dashed border-amber-500/30 rounded-xl bg-amber-500/5">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <Crown className="h-10 w-10 text-amber-400 opacity-50" />
                  </div>
                  <p className="text-amber-200 text-lg font-medium mb-2">Select a Participant</p>
                  <p className="text-amber-300/70 text-sm">Click on any participant above to select them as the winner</p>
                </div>
              )}

              {/* Selection Reason */}
              <div className="space-y-3 mt-6">
                <Label htmlFor="reason" className="text-white font-semibold text-lg flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Selection Reason *
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Enter a detailed reason for selecting this winner (e.g., 'Random selection via admin review', 'First participant to join', 'Highest contribution', etc.)"
                  value={selectionReason}
                  onChange={(e) => setSelectionReason(e.target.value)}
                  className="bg-slate-800/70 border-2 border-slate-600/50 focus:border-amber-500/50 text-white placeholder:text-slate-400 min-h-[100px] text-sm"
                  rows={4}
                />
                <div className="text-xs text-slate-400">
                  This reason will be logged and included in the winner notification email.
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-4 pt-8 border-t border-slate-700/50">
          <Button 
            onClick={onClose} 
            variant="outline" 
            disabled={selectWinnerMutation.isPending}
            className="px-8 py-3 border-2 border-slate-500 hover:border-slate-400 text-slate-300 hover:text-white font-semibold"
          >
            Cancel Selection
          </Button>
          
          <div className="flex-1" />
          
          <Button
            onClick={handleSelectWinner}
            disabled={!selectedPlayer || !selectionReason.trim() || selectWinnerMutation.isPending || gameData.hasWinner}
            className={`px-8 py-3 font-bold text-lg shadow-xl transition-all duration-300 ${
              !selectedPlayer || !selectionReason.trim() || gameData.hasWinner
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white hover:shadow-2xl hover:shadow-amber-500/25 transform hover:scale-105'
            }`}
          >
            {selectWinnerMutation.isPending ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Selecting Winner...</span>
              </div>
            ) : gameData.hasWinner ? (
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5" />
                <span>Winner Already Selected</span>
              </div>
            ) : !selectedPlayer ? (
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5" />
                <span>Select a Participant First</span>
              </div>
            ) : !selectionReason.trim() ? (
              <div className="flex items-center gap-3">
                <Edit className="h-5 w-5" />
                <span>Add Selection Reason</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5" />
                <span>Confirm Winner & Send Notification</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}