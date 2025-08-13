import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, Lock, X, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { CardSelector } from "./payment/card-selector";
import { SquareCardForm } from "./payment/square-card-form";

interface PaymentRequiredPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCardSelected?: (cardId: number) => void;
  showCardSelector?: boolean;
}

export function PaymentRequiredPopup({ 
  isOpen, 
  onClose, 
  onCardSelected, 
  showCardSelector = false 
}: PaymentRequiredPopupProps) {
  const [, setLocation] = useLocation();
  const [selectedCardId, setSelectedCardId] = useState<number>();
  const [showAddCard, setShowAddCard] = useState(false);

  if (!isOpen) return null;

  const handleAddPaymentMethod = () => {
    setLocation("/dashboard?tab=payment");
  };

  const handleCardSelect = (cardId: number) => {
    setSelectedCardId(cardId);
    if (onCardSelected) {
      onCardSelected(cardId);
      onClose();
    }
  };

  const handleAddCard = () => {
    setShowAddCard(true);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl border-2 border-red-500/50 shadow-2xl shadow-red-500/25 rounded-3xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Animated border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 animate-pulse rounded-3xl"></div>
        
        <CardHeader className="relative text-center pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-500/50 to-orange-500/50 blur-xl rounded-full animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-full shadow-2xl shadow-red-500/50">
              <CreditCard className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-black text-white mb-2 drop-shadow-lg">
            Payment Method Required
          </CardTitle>
          <p className="text-gray-300 text-sm font-medium">
            Add a payment method to start playing games
          </p>
        </CardHeader>

        <CardContent className="relative space-y-6 pt-0">
          {showCardSelector ? (
            /* Card Selector Mode */
            <div className="space-y-4">
              <CardSelector
                selectedCardId={selectedCardId}
                onCardSelect={handleCardSelect}
                onAddCard={handleAddCard}
              />
              
              {selectedCardId && (
                <Button 
                  onClick={() => handleCardSelect(selectedCardId)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Use Selected Card
                </Button>
              )}
            </div>
          ) : (
            /* Setup Mode */
            <>
              {/* Security Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-green-500/30">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Secure Payments</p>
                    <p className="text-gray-400 text-xs">Protected by Square encryption</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-blue-500/30">
                  <div className="flex-shrink-0">
                    <Lock className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Your Data is Safe</p>
                    <p className="text-gray-400 text-xs">We never store card details</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500/50 to-orange-500/50 blur-lg rounded-2xl opacity-75"></div>
                  <Button
                    onClick={handleAddPaymentMethod}
                    className="relative w-full bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-700 hover:via-orange-700 hover:to-red-700 text-white font-black py-4 px-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 text-base border-2 border-white/20"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full bg-slate-800/50 border-gray-600 text-gray-300 hover:bg-slate-700/50 hover:text-white py-3 rounded-xl transition-all duration-300"
                >
                  Maybe Later
                </Button>
              </div>

              {/* Info Badge */}
              <div className="text-center">
                <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30 px-4 py-2 text-xs font-medium">
                  <Shield className="h-3 w-3 mr-1" />
                  SSL Secured & PCI Compliant
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Square Card Form */}
      {showAddCard && (
        <SquareCardForm 
          onClose={() => setShowAddCard(false)}
          onSuccess={() => {
            setShowAddCard(false);
            // Card list will refresh automatically via React Query
          }}
        />
      )}
    </div>
  );
}