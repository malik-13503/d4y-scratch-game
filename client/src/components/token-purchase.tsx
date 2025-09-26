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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Subtle Gaming Background */}
      <div className="absolute inset-0">
        {/* Minimal background effects */}
        <div className="absolute top-32 left-32 w-12 h-12 bg-yellow-400/10 rotate-45"></div>
        <div className="absolute bottom-32 right-48 w-16 h-16 bg-purple-400/10 rounded-full"></div>
        
        {/* Subtle background orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Gaming Header Section */}
        <div className="text-center space-y-8 mb-12">
          {/* Main Title with Gaming Effects */}
          <div className="relative">
            <div className="flex items-center justify-center space-x-4 mb-6">
              {/* Animated Coins */}
              <div className="relative">
                <Coins className="h-16 w-16 text-yellow-400 drop-shadow-2xl animate-bounce" />
                <div className="absolute -inset-3 bg-yellow-400/30 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
              </div>
              
              {/* Epic Title */}
              <h1 className="text-6xl md:text-7xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text drop-shadow-2xl animate-pulse">
                TOKEN SHOP
              </h1>
              
              {/* More Animated Elements */}
              <div className="relative">
                <Zap className="h-16 w-16 text-purple-400 drop-shadow-2xl animate-bounce delay-500" />
                <div className="absolute -inset-3 bg-purple-400/30 rounded-full blur-xl animate-pulse delay-500"></div>
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-ping delay-300"></div>
              </div>
            </div>
            
            {/* Subtitle with Gaming Vibes */}
            <div className="space-y-3">
              <p className="text-2xl md:text-3xl text-white font-bold drop-shadow-lg">
                🎮 <span className="text-cyan-400">POWER UP</span> YOUR GAMING EXPERIENCE! 🎮
              </p>
              <p className="text-lg text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Buy tokens to unlock <span className="text-yellow-300 font-bold">EPIC PRIZES</span> and 
                <span className="text-green-400 font-bold"> ENDLESS FUN!</span>
                <br />
                <span className="text-purple-300 font-bold text-xl">✨ TOKENS NEVER EXPIRE! ✨</span>
              </p>
            </div>
          </div>
          
          {/* Enhanced Balance Display */}
          <div className="relative inline-block">
            <div className="bg-gradient-to-r from-slate-800/80 via-gray-800/80 to-slate-800/80 backdrop-blur-xl border-4 border-cyan-400/60 rounded-3xl p-8 shadow-2xl shadow-cyan-500/30">
              <div className="flex items-center justify-center space-x-6">
                <div className="text-cyan-200 text-xl font-bold">YOUR WALLET:</div>
                <div className="flex items-center space-x-4 bg-gradient-to-r from-emerald-600/30 to-green-600/30 rounded-2xl px-6 py-3 border-2 border-emerald-400/50">
                  <div className="relative">
                    <Coins className="h-10 w-10 text-emerald-400 drop-shadow-lg animate-spin" />
                    <div className="absolute -inset-2 bg-emerald-400/40 rounded-full blur-lg animate-pulse"></div>
                  </div>
                  <span className="text-5xl font-black text-white drop-shadow-2xl">
                    {tokenBalanceData?.tokenBalance || 0}
                  </span>
                  <div className="text-emerald-300 text-xl font-black">TOKENS</div>
                </div>
              </div>
              
              {/* Cool effects around the balance */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full animate-ping delay-300"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-purple-400 rounded-full animate-ping delay-700"></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping delay-1000"></div>
            </div>
          </div>
        </div>

        {/* Gaming Token Packages - Improved Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16 px-4">
          {tokenPackages.map((pkg, index) => {
            // Gaming-themed color schemes
            const gameThemes = [
              {
                name: "WARRIOR",
                bg: "from-emerald-500/20 via-green-500/30 to-emerald-500/20",
                border: "border-emerald-400 shadow-emerald-500/50",
                accent: "text-emerald-300",
                button: "from-emerald-600 via-green-600 to-emerald-700",
                icon: "🛡️"
              },
              {
                name: "MAGE", 
                bg: "from-blue-500/20 via-cyan-500/30 to-blue-500/20",
                border: "border-cyan-400 shadow-cyan-500/50",
                accent: "text-cyan-300",
                button: "from-blue-600 via-cyan-600 to-blue-700",
                icon: "🔮"
              },
              {
                name: "ASSASSIN",
                bg: "from-purple-500/20 via-pink-500/30 to-purple-500/20",
                border: "border-purple-400 shadow-purple-500/50",
                accent: "text-purple-300", 
                button: "from-purple-600 via-pink-600 to-purple-700",
                icon: "⚔️"
              },
              {
                name: "LEGEND",
                bg: "from-orange-500/20 via-red-500/30 to-yellow-500/20",
                border: "border-orange-400 shadow-orange-500/50",
                accent: "text-orange-300",
                button: "from-orange-600 via-red-600 to-yellow-700",
                icon: "👑"
              }
            ];
            
            const theme = gameThemes[index % gameThemes.length];
            
            return (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden bg-slate-900/95 backdrop-blur-xl border-2 ${theme.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group cursor-pointer`}
              >
                {/* Cleaner Background with Better Contrast */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-30`}></div>
                <div className="absolute inset-0 bg-slate-900/80"></div>
                
                {/* Subtle Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-6 py-2 text-sm rounded-full shadow-xl border border-yellow-400">
                      🔥 HOTTEST DEAL!
                    </Badge>
                  </div>
                )}

                {/* Gaming Class Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={`bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-1 border ${theme.border.split(' ')[0]}`}>
                    <span className="text-white font-bold text-xs">{theme.icon} {theme.name}</span>
                  </div>
                </div>

                <CardHeader className="relative z-10 text-center pt-12 pb-6">
                  <CardTitle className="text-white text-2xl font-bold mb-4 drop-shadow-lg uppercase tracking-wide">
                    {pkg.name}
                  </CardTitle>
                  
                  {/* Clear Token Display */}
                  <div className="space-y-4">
                    <div className={`flex items-center justify-center space-x-3 text-white`}>
                      <div className="relative">
                        <Coins className="h-12 w-12 text-yellow-400 drop-shadow-lg" />
                      </div>
                      <div className="text-5xl font-bold text-white drop-shadow-lg">
                        {pkg.tokens}
                      </div>
                    </div>
                    <div className="text-gray-200 text-lg font-bold uppercase tracking-wider">TOKENS</div>
                    
                    {/* Clean Bonus Display */}
                    {pkg.bonus > 0 && (
                      <div className="mx-auto w-fit">
                        <div className="bg-yellow-500/20 rounded-lg py-2 px-4 border border-yellow-400/60">
                          <div className="text-yellow-200 font-bold text-sm">
                            ⚡ +{pkg.bonus} BONUS TOKENS!
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Clear Price Display */}
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-white drop-shadow-lg">
                        ${pkg.price.toFixed(2)}
                      </div>
                      <div className="text-gray-300 text-sm font-medium">
                        ${(pkg.price / pkg.tokens).toFixed(3)} per token
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 px-6 pb-6">
                  {/* Clean Purchase Button */}
                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={isProcessing && selectedPackage?.id === pkg.id}
                    className={`w-full bg-gradient-to-r ${theme.button} text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 hover:border-white/40 text-lg uppercase tracking-wide hover:scale-[1.02]`}
                    data-testid={`button-purchase-${pkg.id}`}
                  >
                    {isProcessing && selectedPackage?.id === pkg.id ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        <span className="text-lg font-bold">PROCESSING...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <CreditCard className="h-6 w-6" />
                        <span className="text-lg font-bold">BUY NOW!</span>
                        <Zap className="h-6 w-6" />
                      </div>
                    )}
                  </Button>
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