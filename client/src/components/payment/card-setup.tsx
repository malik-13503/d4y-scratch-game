import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Shield, CheckCircle } from "lucide-react";
import { ErrorDialog } from "@/components/error-dialog";
import { getEnvironmentBadge, isProduction } from "@/lib/environment";
import { createCardPaymentMethod } from "@/lib/square";

interface CardSetupProps {
  onSuccess: () => void;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    cardOnFile: boolean;
    cardLast4?: string;
    cardBrand?: string;
  };
}

export function CardSetup({ onSuccess, user }: CardSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [cardInitialized, setCardInitialized] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize Square Web SDK
  useEffect(() => {
    const initializeCard = async () => {
      try {
        // Always try to initialize the card since we have the production ID
        if (cardContainerRef.current) {
          const card = await createCardPaymentMethod();
          await card.attach(cardContainerRef.current);
          cardRef.current = card;
          setCardInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize Square card:", error);
        // Card initialization failed, will fallback to sandbox mode
      }
    };

    initializeCard();
  }, []);

  const handleCardSetup = async () => {
    setIsLoading(true);

    try {
      let cardNonce;
      
      if (cardRef.current && cardInitialized) {
        // Use real Square Web SDK to tokenize card
        const tokenResult = await cardRef.current.tokenize();
        
        if (tokenResult.status === 'OK') {
          cardNonce = tokenResult.token;
        } else {
          throw new Error(`Card tokenization failed: ${tokenResult.errors?.[0]?.detail || 'Unknown error'}`);
        }
      } else {
        // Fallback to sandbox testing
        cardNonce = "cnon_test_card_nonce_sandbox";
      }
      
      const response = await apiRequest("POST", "/api/card/add", {
        cardNonce: cardNonce
      });
      
      const result = await response.json();
      
      toast({
        title: "Payment Method Added",
        description: `${result.cardBrand} card ending in ${result.cardLast4} has been verified successfully.`,
      });
      
      onSuccess();
    } catch (error: any) {
      console.error("Card setup error:", error);
      setDialogError(error.message || "Payment setup failed");
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.cardOnFile) {
    return (
      <Card className="w-full max-w-md mx-auto relative overflow-hidden bg-gradient-to-br from-emerald-900/80 to-green-900/80 border-emerald-400/40 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/20 to-green-800/20 blur-xl"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 text-white font-bold text-xl drop-shadow-lg">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <CheckCircle size={20} />
            </div>
            Payment Method Ready
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-emerald-800/40 to-green-800/40 rounded-xl border border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-lg">
                  <CreditCard className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-bold text-white text-lg drop-shadow-lg">
                    {user?.cardBrand || 'Card'} ending in {user?.cardLast4 || '****'}
                  </p>
                  <p className="text-emerald-200 font-medium">
                    Verified and ready for games
                  </p>
                </div>
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <Button
              onClick={onSuccess}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Continue to Games
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-purple-400/40 backdrop-blur-xl shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-xl"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between text-white font-bold text-xl drop-shadow-lg">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
              <CreditCard size={20} />
            </div>
            Add Payment Method
          </div>
          <Badge className={`${getEnvironmentBadge().color} text-white text-xs font-bold shadow-lg`}>
            {getEnvironmentBadge().text}
          </Badge>
        </CardTitle>
        <p className="text-gray-300 font-medium">
          Please add a credit or debit card to continue playing
        </p>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-800/40 to-purple-800/40 rounded-xl border border-blue-500/30">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                <Shield className="text-white" size={20} />
              </div>
              <div className="text-sm text-gray-200">
                <p className="font-bold mb-1 text-white drop-shadow-lg">Secure Payment Processing</p>
                <p className="text-gray-300">
                  Your card information is processed securely through Square 
                  and encrypted for your protection. We never store your 
                  full card details.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-lg drop-shadow-lg">Accepted Cards:</h4>
            <div className="flex gap-2 text-sm">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg font-bold shadow-lg">Visa</span>
              <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-2 rounded-lg font-bold shadow-lg">Mastercard</span>
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-3 py-2 rounded-lg font-bold shadow-lg">American Express</span>
              <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-2 rounded-lg font-bold shadow-lg">Discover</span>
            </div>
          </div>

          {cardInitialized ? (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Ready:</strong> Enter your card information below.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Card Information
                </label>
                <div 
                  ref={cardContainerRef}
                  className="border border-gray-300 rounded-lg p-4 min-h-[120px] bg-white"
                />
              </div>
            </div>
          ) : !isProduction ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a sandbox environment. 
                Use test card: 4111 1111 1111 1111
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Configuration Required:</strong> Square Application ID needed for payment processing.
              </p>
            </div>
          )}

          <Button
            onClick={handleCardSetup}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding Card...</span>
              </div>
            ) : (
              "Add Payment Method"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}