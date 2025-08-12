import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Check } from "lucide-react";

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
  const { data: cards, isLoading } = useQuery<PaymentCard[]>({
    queryKey: ["/api/payment-cards"],
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-16 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-6 text-center">
          <CreditCard className="h-8 w-8 text-white/50 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">No Payment Cards</h3>
          <p className="text-white/70 text-sm mb-4">Add a payment card to continue with your purchase.</p>
          <Button 
            onClick={onAddCard}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Card
          </Button>
        </CardContent>
      </Card>
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