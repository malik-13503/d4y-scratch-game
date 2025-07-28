import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Shield, CheckCircle } from "lucide-react";
import { ErrorDialog } from "@/components/error-dialog";

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
  const { toast } = useToast();

  const handleCardSetup = async () => {
    setIsLoading(true);

    try {
      // Check if we're in production mode
      const isProduction = import.meta.env.PROD;
      
      let cardNonce;
      if (isProduction) {
        // In production, use actual Square Web SDK integration
        // TODO: Implement Square Web SDK for production
        throw new Error("Production Square Web SDK integration required");
      } else {
        // For sandbox testing - using a test card nonce
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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle size={24} />
            Payment Method Ready
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="text-green-600" size={20} />
                <div>
                  <p className="font-medium text-green-800">
                    {user?.cardBrand || 'Card'} ending in {user?.cardLast4 || '****'}
                  </p>
                  <p className="text-sm text-green-700">
                    Verified and ready for games
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={onSuccess}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Continue to Games
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard size={24} />
          Add Payment Method
        </CardTitle>
        <p className="text-gray-600">
          Please add a credit or debit card to continue playing
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Secure Payment Processing</p>
                <p>
                  Your card information is processed securely through Square 
                  and encrypted for your protection. We never store your 
                  full card details.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Accepted Cards:</h4>
            <div className="flex gap-2 text-sm text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded">Visa</span>
              <span className="bg-gray-100 px-2 py-1 rounded">Mastercard</span>
              <span className="bg-gray-100 px-2 py-1 rounded">American Express</span>
              <span className="bg-gray-100 px-2 py-1 rounded">Discover</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a sandbox environment. 
              Use test card: 4111 1111 1111 1111
            </p>
          </div>

          <Button
            onClick={handleCardSetup}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? "Adding Card..." : "Add Payment Method"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}