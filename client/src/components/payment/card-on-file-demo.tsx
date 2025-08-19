import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function CardOnFileDemo() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNonce, setCardNonce] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [testAmount, setTestAmount] = useState("5.00");
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

  // Add new card mutation
  const addCardMutation = useMutation({
    mutationFn: async (data: { cardNonce: string }) => {
      return await apiRequest("POST", "/api/card/add", data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-cards"] });
      setShowAddCard(false);
      setCardNonce("");
      setCardholderName("");
      toast({
        title: "Success",
        description: `Card ending in ${response.cardLast4} added successfully!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add card",
        variant: "destructive",
      });
    },
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
        description: "Card deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete card",
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

  // Test payment with stored card
  const testPaymentMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/process-payment", {
        gameId: 1, // Test game ID
        number: parseInt(testAmount), // Use amount as number for testing
        // No cardNonce needed - will use stored card
      });
    },
    onSuccess: (response) => {
      toast({
        title: "Payment Success!",
        description: `Payment of $${testAmount} processed successfully using stored card`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Payment processing failed",
        variant: "destructive",
      });
    },
  });

  const handleAddCard = () => {
    if (!cardNonce.trim()) {
      toast({
        title: "Error",
        description: "Please enter a card nonce",
        variant: "destructive",
      });
      return;
    }

    addCardMutation.mutate({ cardNonce });
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
            Square Card on File Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              This demo shows how users can securely store their payment cards with Square 
              and use them for future payments without re-entering card details.
            </AlertDescription>
          </Alert>

          {/* Stored Cards Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Stored Payment Cards</h3>
              <Button
                onClick={() => setShowAddCard(!showAddCard)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Card
              </Button>
            </div>

            {cardsLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading cards...</span>
              </div>
            )}

            {cardsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load stored cards. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {storedCards && storedCards.length === 0 && (
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  No stored cards found. Add a card to enable automatic payments.
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
                  <Label htmlFor="cardNonce">Card Nonce (for testing)</Label>
                  <Input
                    id="cardNonce"
                    placeholder="Enter Square card nonce (e.g., cnon:test-card-nonce)"
                    value={cardNonce}
                    onChange={(e) => setCardNonce(e.target.value)}
                  />
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="Enter cardholder name"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddCard}
                      disabled={addCardMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {addCardMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Add Card
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddCard(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Separator />

            {/* Test Payment Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Payment with Stored Card</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="testAmount">Test Amount ($)</Label>
                  <Input
                    id="testAmount"
                    type="number"
                    step="0.01"
                    min="1"
                    max="100"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    placeholder="5.00"
                  />
                </div>
                <Button
                  onClick={() => testPaymentMutation.mutate()}
                  disabled={testPaymentMutation.isPending || !storedCards?.length}
                  className="mt-6"
                >
                  {testPaymentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Test Payment
                </Button>
              </div>
              {!storedCards?.length && (
                <p className="text-sm text-muted-foreground">
                  Add a stored card first to test payments
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}