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
import { Crown, User, Mail, DollarSign, Calendar, Trophy, AlertCircle, Users } from "lucide-react";

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
    onSuccess: (data) => {
      toast({
        title: "Winner Selected Successfully! 🎉",
        description: `${data.winner.playerName} has been selected as the winner and notified via email.`,
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-400" />
            Select Winner - {gameData.gameName}
          </DialogTitle>
          <div className="flex gap-4 mt-4">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {gameData.totalParticipants} Participants
            </Badge>
            <Badge className={`${gameData.gameCompleted ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>
              {gameData.gameCompleted ? 'Game Completed' : 'Game Active'}
            </Badge>
            {gameData.hasWinner && (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                Winner Already Selected
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Participants List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Participants
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {gameData.participants.map((participant) => (
                <Card
                  key={participant.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedPlayer?.id === participant.id
                      ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-400'
                      : participant.isWinner
                      ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-400'
                      : 'bg-slate-800/50 border-slate-700 hover:border-purple-400/50'
                  }`}
                  onClick={() => !participant.isWinner && setSelectedPlayer(participant)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          participant.isWinner 
                            ? 'bg-yellow-500/20 text-yellow-300' 
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {participant.isWinner ? (
                            <Trophy className="h-5 w-5" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{participant.playerName}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-300">
                            <Mail className="h-3 w-3" />
                            {participant.email}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-white">#{participant.spunNumber}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-300">
                          <DollarSign className="h-3 w-3" />
                          ${participant.amountPaid.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(participant.spunAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {participant.isWinner && (
                      <div className="mt-2 text-center">
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                          🎉 Current Winner
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Winner Selection Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              Winner Selection
            </h3>
            
            {selectedPlayer ? (
              <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-400/50">
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-bold text-white text-lg">{selectedPlayer.playerName}</h4>
                    <p className="text-gray-300 text-sm">{selectedPlayer.email}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white">
                      <span>Number:</span>
                      <span className="font-bold">#{selectedPlayer.spunNumber}</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span>Amount Paid:</span>
                      <span className="font-bold">${selectedPlayer.amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span>Played:</span>
                      <span>{new Date(selectedPlayer.spunAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-6 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                <Crown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a participant to choose as winner</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label htmlFor="reason" className="text-white">
                  Selection Reason *
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Enter the reason for selecting this winner (e.g., Random draw, First to play, etc.)"
                  value={selectionReason}
                  onChange={(e) => setSelectionReason(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white mt-1"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-6">
          <Button onClick={onClose} variant="outline" disabled={selectWinnerMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSelectWinner}
            disabled={!selectedPlayer || !selectionReason.trim() || selectWinnerMutation.isPending}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
          >
            {selectWinnerMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Selecting Winner...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Select Winner & Notify
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}