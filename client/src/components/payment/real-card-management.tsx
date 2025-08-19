import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Shield,
  Lock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SquareCardForm } from "./square-card-form";

interface StoredCard {
  id: number;
  cardLast4: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export function RealCardManagement() {
  const [showAddCard, setShowAddCard] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's stored cards
  const {
    data: storedCards,
    isLoading: cardsLoading,
    error: cardsError,
  } = useQuery<StoredCard[]>({
    queryKey: ["/api/payment-cards"],
    retry: false
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      return await apiRequest("DELETE", `/api/payment-cards/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-cards"] });
      toast({
        title: "Success",
        description: "Card removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove card",
        variant: "destructive",
      });
    },
  });

  // Set default card mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (cardId: number) => {
      return await apiRequest("PUT", `/api/payment-cards/${cardId}/set-default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-cards"] });
      toast({
        title: "Success",
        description: "Default card updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update default card",
        variant: "destructive",
      });
    },
  });

  const handleCardAdded = () => {
    // Refresh the cards list when a new card is added
    queryClient.invalidateQueries({ queryKey: ["/api/payment-cards"] });
    setShowAddCard(false);
    toast({
      title: "Success",
      description: "Payment card added successfully!",
    });
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'american_express':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Payment Card Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Securely store your payment cards with Square for fast, automatic payments when you spin the wheel.
              Your card information is protected with bank-level security.
            </AlertDescription>
          </Alert>

          {/* Stored Cards Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Payment Cards</h3>
              <Button
                onClick={() => setShowAddCard(!showAddCard)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Card
              </Button>
            </div>

            {cardsLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading your cards...</span>
              </div>
            )}

            {cardsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load your stored cards. Please refresh the page and try again.
                </AlertDescription>
              </Alert>
            )}

            {storedCards && storedCards.length === 0 && (
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  No payment cards found. Add a card to enable automatic payments when you play games.
                </AlertDescription>
              </Alert>
            )}

            {storedCards && storedCards.length > 0 && (
              <div className="grid gap-3">
                {storedCards.map((card) => (
                  <Card key={card.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCardBrandIcon(card.cardBrand)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {card.cardBrand.toUpperCase()} •••• {card.cardLast4}
                            </span>
                            {card.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {card.cardholderName} • Expires {card.expiryMonth}/{card.expiryYear}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!card.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDefaultMutation.mutate(card.id)}
                            disabled={setDefaultMutation.isPending}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCardMutation.mutate(card.id)}
                          disabled={deleteCardMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Add Card Form */}
            {showAddCard && (
              <Card className="p-4 border-dashed">
                <div className="space-y-4">
                  <h4 className="font-medium">Add New Payment Card</h4>
                  <SquareCardForm
                    onSuccess={handleCardAdded}
                    onCancel={() => setShowAddCard(false)}
                  />
                </div>
              </Card>
            )}

            <Separator />

            {/* Information Section */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">How It Works</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Add your payment card securely through Square's encrypted payment form</p>
                <p>• Your card is stored safely with Square, never on our servers</p>
                <p>• When you spin the wheel, your default card is automatically charged</p>
                <p>• Set any card as your default for automatic payments</p>
                <p>• Remove cards anytime from this dashboard</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}