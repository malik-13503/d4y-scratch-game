import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
        console.log("Initializing Square card with production mode:", isProduction);
        
        // Wait for container to be available with more robust checking
        let attempts = 0;
        while (attempts < 20) {
          if (cardContainerRef.current && document.contains(cardContainerRef.current)) {
            console.log("Container found, proceeding with Square initialization...");
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 150));
          attempts++;
        }
        
        if (cardContainerRef.current && document.contains(cardContainerRef.current)) {
          console.log("Creating Square card payment method...");
          const card = await createCardPaymentMethod();
          
          console.log("Attaching card to container...", cardContainerRef.current);
          await card.attach(cardContainerRef.current);
          
          cardRef.current = card;
          setCardInitialized(true);
          console.log("Square card initialized and attached successfully");
        } else {
          console.error("Card container is not available in DOM after waiting");
          setCardInitialized(false);
        }
      } catch (error) {
        console.error("Failed to initialize Square card:", error);
        setCardInitialized(false);
      }
    };

    // Only initialize in production mode
    if (isProduction) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        setTimeout(initializeCard, 100);
      });
    }
  }, [isProduction]);

  const handleCardSetup = async () => {
    setIsLoading(true);

    try {
      if (!cardRef.current || !cardInitialized) {
        throw new Error("Card payment form is not properly initialized. Please refresh the page and try again.");
      }

      console.log("Attempting to tokenize card with Square SDK...");
      
      // Use real Square Web SDK to tokenize card with billing information
      const tokenResult = await cardRef.current.tokenize({
        includeNetworkTokenization: true,
        billingContact: {
          familyName: 'Test',
          givenName: 'User',
          email: user?.email || 'test@example.com',
          country: 'US',
          region: 'CA',
          city: 'San Francisco',
          postalCode: '94102',
          addressLines: ['123 Main Street']
        }
      });
      console.log("Square tokenization result:", tokenResult);
      
      if (tokenResult.status !== 'OK') {
        console.error("Square tokenization failed:", tokenResult);
        let errorMessage = 'Card validation failed';
        
        if (tokenResult.errors && tokenResult.errors.length > 0) {
          const errors = tokenResult.errors.map((err: any) => err.detail || err.message).join(', ');
          errorMessage = errors;
        }
        
        throw new Error(`Card validation failed: ${errorMessage}. Please check all card details including expiry date and CVV.`);
      }

      const cardNonce = tokenResult.token;
      console.log("Card tokenized successfully with billing info, sending to server...");
      
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

          {isProduction ? (
            <div className="space-y-3">
              {cardInitialized ? (
                <div className="p-3 bg-gradient-to-r from-green-800/40 to-emerald-800/40 rounded-xl border border-green-500/30">
                  <p className="text-sm text-green-200">
                    <strong className="text-white">Ready:</strong> Enter your card information below.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-gradient-to-r from-blue-800/40 to-purple-800/40 rounded-xl border border-blue-500/30">
                  <p className="text-sm text-blue-200">
                    <strong className="text-white">Loading:</strong> Initializing secure payment form...
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Card Information
                </label>
                <div 
                  ref={cardContainerRef}
                  className="border border-purple-400/40 rounded-lg p-4 min-h-[120px] bg-white/95"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gradient-to-r from-yellow-800/40 to-orange-800/40 rounded-xl border border-yellow-500/30">
              <p className="text-sm text-yellow-200">
                <strong className="text-white">Note:</strong> This is a sandbox environment. 
                Use test card: 4111 1111 1111 1111
              </p>
            </div>
          )}

          <Button
            onClick={handleCardSetup}
            disabled={isLoading || !cardInitialized}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding Card...</span>
              </div>
            ) : !cardInitialized ? (
              "Initializing Payment Form..."
            ) : (
              "Add Payment Method"
            )}
          </Button>
        </div>
      </CardContent>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-red-900/90 to-red-800/90 border-red-400/40 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-200">
              <AlertCircle className="h-5 w-5" />
              Payment Setup Failed
            </DialogTitle>
            <DialogDescription className="text-red-300">
              We couldn't verify your payment method.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-800/50 rounded-lg border border-red-600/30">
              <p className="text-sm text-red-100 font-medium">
                {dialogError}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-200">Common solutions:</p>
              <ul className="text-sm text-red-300 space-y-1 ml-4">
                <li>• Check that all card details are correct</li>
                <li>• Verify the expiry date is in MM/YY format</li>
                <li>• Ensure the CVV matches your card</li>
                <li>• Try using a different card</li>
                <li>• Contact your bank to verify the card is active</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => setShowErrorDialog(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}