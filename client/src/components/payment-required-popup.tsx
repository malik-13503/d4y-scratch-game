import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, Lock, X, Plus } from "lucide-react";
import { useLocation } from "wouter";

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
          <div className="space-y-4">
            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-center">
              <p className="text-purple-300 font-medium text-sm">A new payment system is coming soon.</p>
              <p className="text-gray-400 text-xs mt-1">Purchase tokens to play games.</p>
            </div>
            <Button
              onClick={() => { onClose(); window.location.href = "/tokens"; }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl"
            >
              Buy Tokens
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full bg-slate-800/50 border-gray-600 text-gray-300 hover:bg-slate-700/50 hover:text-white py-3 rounded-xl"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}