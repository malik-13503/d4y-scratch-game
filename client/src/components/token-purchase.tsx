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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <Coins className="h-12 w-12 text-yellow-400 drop-shadow-2xl" />
              <div className="absolute -inset-2 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-black text-white drop-shadow-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Purchase Tokens
            </h1>
          </div>
          <p className="text-xl text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed">
            🎮 Buy tokens to play games and win amazing prizes! 
            <br />
            <span className="text-yellow-300 font-bold">✨ Tokens never expire!</span>
          </p>
          
          {/* Current Balance - Enhanced */}
          <div className="inline-block mt-6">
            <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 backdrop-blur-xl border-2 border-emerald-400/50 rounded-2xl p-6 shadow-2xl shadow-emerald-500/20">
              <div className="flex items-center justify-center space-x-4">
                <span className="text-gray-200 text-lg font-semibold">Your Current Balance:</span>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Coins className="h-8 w-8 text-emerald-400 drop-shadow-lg" />
                    <div className="absolute -inset-1 bg-emerald-400/30 rounded-full blur-md"></div>
                  </div>
                  <span className="text-4xl font-black text-white drop-shadow-xl">
                    {tokenBalanceData?.tokenBalance || 0}
                  </span>
                  <span className="text-emerald-300 text-lg font-bold">tokens</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Token Packages - Enhanced with vibrant colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {tokenPackages.map((pkg, index) => {
          // Define vibrant color themes for each package
          const colorThemes = [
            {
              gradient: "from-emerald-600/30 to-green-600/30",
              border: "border-emerald-400/60",
              shadow: "shadow-emerald-500/40",
              accent: "text-emerald-300",
              button: "from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800",
              glow: "shadow-emerald-500/30"
            },
            {
              gradient: "from-blue-600/30 to-cyan-600/30", 
              border: "border-blue-400/60",
              shadow: "shadow-blue-500/40",
              accent: "text-blue-300",
              button: "from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800",
              glow: "shadow-blue-500/30"
            },
            {
              gradient: "from-purple-600/30 to-pink-600/30",
              border: "border-purple-400/60", 
              shadow: "shadow-purple-500/40",
              accent: "text-purple-300",
              button: "from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800",
              glow: "shadow-purple-500/30"
            },
            {
              gradient: "from-orange-600/30 to-red-600/30",
              border: "border-orange-400/60",
              shadow: "shadow-orange-500/40", 
              accent: "text-orange-300",
              button: "from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800",
              glow: "shadow-orange-500/30"
            }
          ];
          
          const theme = pkg.popular ? colorThemes[1] : colorThemes[index % colorThemes.length];
          
          return (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden bg-gradient-to-br ${theme.gradient} backdrop-blur-xl border-2 ${theme.border} ${theme.shadow} transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:${theme.glow} group cursor-pointer`}
            >
              {/* Animated background glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-50 group-hover:opacity-80 transition-opacity duration-500`}></div>
              
              {/* Popular badge with enhanced styling */}
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="relative">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black px-6 py-2 text-sm rounded-full shadow-2xl shadow-yellow-500/50 border-2 border-yellow-300">
                      ⭐ MOST POPULAR ⭐
                    </Badge>
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/50 to-orange-500/50 rounded-full blur-md animate-pulse"></div>
                  </div>
                </div>
              )}

              <CardHeader className="relative z-10 text-center pb-6 pt-8">
                <CardTitle className="text-white text-2xl font-black mb-4 drop-shadow-2xl">{pkg.name}</CardTitle>
                <div className="space-y-4">
                  {/* Token count with enhanced styling */}
                  <div className={`text-5xl font-black ${theme.accent} drop-shadow-2xl flex items-center justify-center space-x-2`}>
                    <Coins className="h-12 w-12 text-yellow-400 drop-shadow-lg" />
                    <span>{pkg.tokens}</span>
                  </div>
                  <div className="text-white text-lg font-bold">Tokens</div>
                  
                  {/* Bonus tokens with glow effect */}
                  {pkg.bonus > 0 && (
                    <div className="relative">
                      <div className="text-lg font-bold text-yellow-300 drop-shadow-xl bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg py-2 px-4 border border-yellow-400/40">
                        ✨ +{pkg.bonus} BONUS TOKENS! ✨
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg blur-lg animate-pulse"></div>
                    </div>
                  )}
                  
                  {/* Price with enhanced styling */}
                  <div className="text-4xl font-black text-white drop-shadow-2xl">
                    ${pkg.price.toFixed(2)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 pt-0 pb-6">
                {/* Enhanced purchase button */}
                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={isProcessing && selectedPackage?.id === pkg.id}
                  className={`w-full bg-gradient-to-r ${theme.button} text-white font-black py-4 px-6 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-white/20 hover:border-white/40 text-lg`}
                  data-testid={`button-purchase-${pkg.id}`}
                >
                  {isProcessing && selectedPackage?.id === pkg.id ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                      <span className="text-lg font-bold">Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-6 w-6" />
                      <span className="text-lg font-bold">PURCHASE NOW</span>
                      <Zap className="h-6 w-6" />
                    </div>
                  )}
                </Button>

                {/* Value per token with better contrast */}
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-white font-bold text-sm">
                      ${(pkg.price / pkg.tokens).toFixed(3)} per token
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
    </div>
  );
}