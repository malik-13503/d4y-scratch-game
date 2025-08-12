import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Plus, Check, AlertCircle, Shield, Star } from "lucide-react";

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

interface CardSelectorProps {
  selectedCardId?: number;
  onCardSelect: (cardId: number) => void;
  onAddCard: () => void;
}

export function CardSelector({ selectedCardId, onCardSelect, onAddCard }: CardSelectorProps) {
  const { data: cards, isLoading, error } = useQuery<PaymentCard[]>({
    queryKey: ["/api/payment-cards"],
  });

  const getCardBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa': return 'from-blue-600 to-blue-800';
      case 'mastercard': return 'from-red-600 to-orange-600';
      case 'amex': return 'from-green-600 to-teal-600';
      case 'discover': return 'from-orange-600 to-yellow-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-6">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-300">Loading your payment methods...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-500/50 bg-red-900/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-200">
          Failed to load payment cards. Please try again or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full w-fit mx-auto">
          <CreditCard className="h-10 w-10 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">No Payment Cards</h3>
          <p className="text-gray-400 mb-6">Add a secure payment method to continue playing</p>
        </div>
        <Button 
          onClick={onAddCard}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Card
        </Button>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="h-3 w-3" />
          <span>Secured by 256-bit SSL encryption</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Select Payment Method</h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={onAddCard}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New
        </Button>
      </div>

      <div className="space-y-2">
        {cards.map((card) => (
          <Card 
            key={card.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedCardId === card.id
                ? 'bg-purple-600/30 border-purple-400/50 shadow-lg'
                : 'bg-white/10 border-white/20 hover:bg-white/20'
            } backdrop-blur-md`}
            onClick={() => onCardSelect(card.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedCardId === card.id
                      ? 'bg-purple-500'
                      : 'bg-white/20'
                  }`}>
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {card.cardBrand} •••• {card.cardLast4}
                      </span>
                      {card.isDefault && (
                        <Badge className="bg-green-600 text-white text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    {card.cardholderName && (
                      <p className="text-white/70 text-sm">{card.cardholderName}</p>
                    )}
                    {card.expiryMonth && card.expiryYear && (
                      <p className="text-white/50 text-xs">
                        Expires {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
                      </p>
                    )}
                  </div>
                </div>
                {selectedCardId === card.id && (
                  <div className="p-1 bg-purple-500 rounded-full">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}