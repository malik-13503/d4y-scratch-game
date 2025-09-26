import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  bonus: number;
  popular: boolean;
}

export function TokenPurchase() {
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Get available token packages
  const { data: tokenPackages = [] } = useQuery<TokenPackage[]>({
    queryKey: ["/api/token-packages"],
  });

  // Get user's current token balance
  const { data: tokenBalanceData } = useQuery<{ tokenBalance: number }>({
    queryKey: ["/api/user/token-balance"],
    refetchInterval: 5000,
  });

  // Get user's payment cards
  const { data: paymentCards = [] } = useQuery<any[]>({
    queryKey: ["/api/payment-cards"],
  });

  // Purchase tokens mutation
  const purchaseTokensMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await fetch("/api/purchase-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ packageId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Purchase failed");
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "✅ Tokens Purchased!",
        description: `Successfully purchased ${data.transaction.tokens} tokens!`,
      });
      
      // Refresh token balance
      queryClient.invalidateQueries({ queryKey: ["/api/user/token-balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/token-transactions"] });
      
      setSelectedPackage(null);
      setIsProcessing(false);
    },
    onError: (error: any) => {
      console.error("Token purchase failed:", error);
      toast({
        title: "❌ Purchase Failed",
        description: error.message || "Failed to purchase tokens. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handlePurchase = async (tokenPackage: TokenPackage) => {
    if (paymentCards.length === 0) {
      toast({
        title: "⚠️ Payment Card Required",
        description: "Please add a payment card before purchasing tokens.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPackage(tokenPackage);
    setIsProcessing(true);

    try {
      await purchaseTokensMutation.mutateAsync(tokenPackage.id);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Coins className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-white">Purchase Tokens</h1>
        </div>
        <p className="text-gray-400">
          Buy tokens to play games and win prizes. Tokens never expire!
        </p>
        
        {/* Current Balance */}
        <div className="flex items-center justify-center space-x-4 mt-4 p-4 bg-black/20 rounded-lg backdrop-blur-xl border border-purple-500/30">
          <span className="text-gray-400">Your Current Balance:</span>
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-green-400">
              {tokenBalanceData?.tokenBalance || 0}
            </span>
            <span className="text-gray-400">tokens</span>
          </div>
        </div>
      </div>

      {/* Token Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tokenPackages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative bg-black/20 backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              pkg.popular
                ? "border-yellow-500/50 shadow-yellow-500/20"
                : "border-purple-500/30"
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-500 text-black font-bold px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-white text-xl">{pkg.name}</CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-400">
                  {pkg.tokens} Tokens
                </div>
                {pkg.bonus > 0 && (
                  <div className="text-sm text-yellow-400">
                    +{pkg.bonus} Bonus Tokens!
                  </div>
                )}
                <div className="text-2xl font-bold text-white">
                  ${pkg.price.toFixed(2)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <Button
                onClick={() => handlePurchase(pkg)}
                disabled={isProcessing && selectedPackage?.id === pkg.id}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3"
                data-testid={`button-purchase-${pkg.id}`}
              >
                {isProcessing && selectedPackage?.id === pkg.id ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Purchase Now</span>
                  </div>
                )}
              </Button>

              <div className="mt-3 text-center text-xs text-gray-400">
                <div className="flex items-center justify-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>${(pkg.price / pkg.tokens).toFixed(3)} per token</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Card Status */}
      <div className="text-center">
        {paymentCards.length === 0 ? (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 mb-2">
              ⚠️ No payment cards found. Please add a payment card to purchase tokens.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/dashboard"}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              Add Payment Card
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400">
              ✅ Payment card ready. You can purchase tokens instantly!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}