import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, Star } from "lucide-react";

interface PaymentCard {
  id: number;
  userId: number;
  squareCardId?: string;
  cardNonce?: string;
  cardLast4: string;
  cardBrand: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CardManagement() {
  const [showAddCard, setShowAddCard] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cards, isLoading } = useQuery<PaymentCard[]>({
    queryKey: ["/api/payment-cards"],
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (cardId: number) => {
      await apiRequest("PUT", `/api/payment-cards/${cardId}/set-default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-cards"] });
      toast({
        title: "Success",
        description: "Default payment card updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update default card",
        variant: "destructive",
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      await apiRequest("DELETE", `/api/payment-cards/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-cards"] });
      toast({
        title: "Success",
        description: "Payment card deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment card",
        variant: "destructive",
      });
    },
  });

  const handleSetDefault = (cardId: number) => {
    setDefaultMutation.mutate(cardId);
  };

  const handleDeleteCard = (cardId: number) => {
    deleteCardMutation.mutate(cardId);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Payment Cards</h2>
        <Button 
          onClick={() => setShowAddCard(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Card
        </Button>
      </div>

      {cards && cards.length === 0 ? (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-white/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Payment Cards</h3>
            <p className="text-white/70 mb-4">Add a payment card to start playing games.</p>
            <Button 
              onClick={() => setShowAddCard(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Add Your First Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cards?.map((card) => (
            <Card key={card.id} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {card.cardBrand} •••• {card.cardLast4}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {card.isDefault && (
                      <Badge className="bg-green-600 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                    <Badge variant={card.isActive ? "default" : "secondary"}>
                      {card.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-white/70">
                    {card.cardholderName && (
                      <p className="text-sm">{card.cardholderName}</p>
                    )}
                    {card.expiryMonth && card.expiryYear && (
                      <p className="text-sm">
                        Expires {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
                      </p>
                    )}
                    <p className="text-xs">Added {new Date(card.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {!card.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(card.id)}
                        disabled={setDefaultMutation.isPending}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCard(card.id)}
                      disabled={deleteCardMutation.isPending || card.isDefault}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showAddCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white/95 backdrop-blur-md border-white/20 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-gray-900">Add New Payment Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Payment card management will be integrated with Square payment processing.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowAddCard(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}