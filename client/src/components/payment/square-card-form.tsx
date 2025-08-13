import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, CreditCard, Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface SquareCardFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function SquareCardForm({ onClose, onSuccess }: SquareCardFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeSquare = async () => {
      try {
        // @ts-ignore
        if (!window.Square) {
          throw new Error("Square Web SDK not loaded");
        }

        // @ts-ignore
        const paymentsInstance = window.Square.payments(
          import.meta.env.VITE_SQUARE_APPLICATION_ID,
          import.meta.env.VITE_SQUARE_ENVIRONMENT
        );
        
        setPayments(paymentsInstance);

        const cardInstance = await paymentsInstance.card();
        await cardInstance.attach('#card-container');
        setCard(cardInstance);
      } catch (error) {
        console.error("Failed to initialize Square:", error);
        toast({
          title: "Error",
          description: "Failed to load payment form. Please try again.",
          variant: "destructive",
        });
      }
    };

    initializeSquare();

    return () => {
      if (card) {
        card.destroy();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!card) {
      toast({
        title: "Error",
        description: "Payment form not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await card.tokenize();
      console.log("Square tokenization result:", result);
      
      if (result.status === 'OK') {
        // Extract card details from the result
        const cardDetails = result.details;
        console.log("Card details:", cardDetails);
        
        // Send the token to your server with required card information
        const payload = {
          cardNonce: result.token,
          verificationToken: cardDetails?.verification_token,
          cardLast4: cardDetails?.card?.last_4 || cardDetails?.last_4 || "****",
          cardBrand: cardDetails?.card?.brand || cardDetails?.brand || "Unknown",
          expiryMonth: cardDetails?.card?.exp_month || cardDetails?.exp_month,
          expiryYear: cardDetails?.card?.exp_year || cardDetails?.exp_year,
          cardholderName: cardDetails?.card?.cardholder_name || cardDetails?.cardholder_name || "",
        };
        console.log("Payload being sent:", payload);
        
        await apiRequest("POST", "/api/payment-cards", payload);

        toast({
          title: "Success",
          description: "Payment card added successfully!",
        });

        // Refresh the cards list
        queryClient.invalidateQueries({ queryKey: ["/api/payment-cards"] });
        
        onSuccess();
      } else {
        throw new Error(result.errors?.[0]?.detail || "Failed to process card");
      }
    } catch (error: any) {
      console.error("Card tokenization error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add payment card",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl border-2 border-purple-500/50 shadow-2xl shadow-purple-500/25 rounded-3xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="relative text-center pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/50 to-blue-500/50 blur-xl rounded-full animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 rounded-full shadow-2xl shadow-purple-500/50">
              <CreditCard className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-black text-white mb-2 drop-shadow-lg">
            Add Payment Card
          </CardTitle>
          <p className="text-gray-300 text-sm font-medium">
            Securely add your payment method
          </p>
        </CardHeader>

        <CardContent className="relative space-y-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Square Card Form Container */}
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-white mb-2">
                  Card Information
                </label>
                <div 
                  id="card-container" 
                  className="p-6 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg border-2 border-purple-300/30 rounded-2xl shadow-2xl transition-all duration-300 hover:border-purple-400/50 focus-within:border-purple-500/70"
                  style={{ minHeight: "120px" }}
                >
                  {!card && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-white/60 text-sm">Loading payment form...</div>
                    </div>
                  )}
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl -z-10"></div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1.5 text-xs font-medium">
                    <Shield className="h-3 w-3 mr-1" />
                    PCI Compliant
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 text-xs font-medium">
                    <Lock className="h-3 w-3 mr-1" />
                    256-bit SSL
                  </Badge>
                </div>
              </div>
              <p className="text-center text-xs text-white/60 mt-2">
                Your payment information is encrypted and secure
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 bg-slate-800/60 border-2 border-gray-600/50 text-gray-300 hover:bg-slate-700/60 hover:text-white hover:border-gray-500/70 py-4 rounded-xl transition-all duration-300 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !card}
                className="flex-1 relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl shadow-2xl transform hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-300 border-2 border-white/20 disabled:border-gray-500/30"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Adding Card...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Add Payment Card
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}