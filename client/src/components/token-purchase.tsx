import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Coins, CreditCard, Zap, Star, TrendingUp,
  ChevronLeft, Home, Gamepad2, Wallet, Gift, Trophy, Bell, User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AuthorizeNetForm } from "@/components/authorize-net-form";
import logoPath from "@assets/logo_1777237644041.png";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  bonus: number;
  popular: boolean;
  valueLabel: string;
}

export function TokenPurchase() {
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: tokenPackages = [] } = useQuery<TokenPackage[]>({
    queryKey: ["/api/token-packages"],
  });

  const { data: tokenBalanceData } = useQuery<{ tokenBalance: number }>({
    queryKey: ["/api/user/token-balance"],
    refetchInterval: 5000,
  });

  const currentBalance = tokenBalanceData?.tokenBalance || 0;

  const handlePackageSelect = (pkg: TokenPackage) => {
    setSelectedPackage(pkg);
  };

  const handlePaymentSuccess = async (
    opaqueDataDescriptor: string,
    opaqueDataValue: string
  ) => {
    if (!selectedPackage) return;
    setIsProcessing(true);

    try {
      const response = await fetch("/api/purchase-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          packageId: selectedPackage.id,
          opaqueDataDescriptor,
          opaqueDataValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Purchase failed");
      }

      toast({
        title: "Tokens Purchased!",
        description: `${data.transaction.tokens} tokens added to your balance.`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/user/token-balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/token-transactions"] });
      setSelectedPackage(null);
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message || "Payment failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const packageStyles = [
    { gradient: "from-slate-700 to-slate-800", accent: "border-slate-500", badge: "bg-slate-600", btn: "from-slate-600 to-slate-700" },
    { gradient: "from-blue-900 to-slate-800",  accent: "border-blue-500",  badge: "bg-blue-700",  btn: "from-blue-600 to-blue-700"  },
    { gradient: "from-purple-900 to-slate-800",accent: "border-purple-400",badge: "bg-purple-700",btn: "from-purple-600 to-purple-700"},
    { gradient: "from-orange-900 to-slate-800",accent: "border-orange-400",badge: "bg-orange-700",btn: "from-orange-600 to-orange-700"},
    { gradient: "from-yellow-900 to-slate-800",accent: "border-yellow-400",badge: "bg-yellow-700",btn: "from-yellow-600 to-yellow-700"},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 pb-24 md:pb-10">

      {/* ── BACKGROUND BLOBS ─────────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl" />
      </div>

      {/* ── SITE HEADER ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5"
        style={{ background: "rgba(7,6,15,0.97)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

          {/* Left: back button + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-all hover:bg-white/8 rounded-xl px-2 py-1.5 text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={() => setLocation("/")} className="shrink-0">
              <img src={logoPath} alt="Prize Plugz" className="h-9 w-auto object-contain" />
            </button>
          </div>

          {/* Center: page title (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <div className="p-1.5 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
              <Coins className="h-4 w-4 text-yellow-400" />
            </div>
            <span className="text-white font-black text-lg">Token Shop</span>
          </div>

          {/* Right: token balance */}
          <button
            onClick={() => setLocation("/wallet")}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(249,115,22,0.1))",
              border: "1px solid rgba(251,191,36,0.3)",
            }}
          >
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-300 font-black text-sm">{currentBalance}</span>
            <span className="text-yellow-600 text-xs hidden sm:inline">tokens</span>
          </button>
        </div>
      </header>

      {/* ── PAGE CONTENT ─────────────────────────────────────────────── */}
      <div className="relative z-10 container mx-auto px-4 py-10 max-w-6xl">

        {/* Page heading */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-2xl border border-yellow-400/30">
              <Coins className="h-8 w-8 text-yellow-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white">Token Shop</h1>
          </div>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Buy tokens to play games and win real prizes. Larger packs give you more tokens per dollar.
          </p>
        </div>

        {/* Balance card */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-800/80 backdrop-blur-xl border border-purple-500/40 rounded-2xl px-8 py-5 shadow-xl flex items-center space-x-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-1">Your Balance</p>
              <div className="flex items-center space-x-3">
                <Coins className="h-7 w-7 text-yellow-400" />
                <span className="text-4xl font-black text-white">{currentBalance}</span>
                <span className="text-gray-300 font-semibold">tokens</span>
              </div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-1">New Users Get</p>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-bold text-lg">3 Free Tokens</span>
              </div>
            </div>
          </div>
        </div>

        {/* Token package grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
          {tokenPackages.map((pkg, index) => {
            const style = packageStyles[index % packageStyles.length];
            const totalTokens = pkg.tokens + pkg.bonus;

            return (
              <Card
                key={pkg.id}
                className={`relative bg-gradient-to-b ${style.gradient} border-2 ${style.accent} transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl cursor-pointer overflow-hidden`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400" />
                )}
                {pkg.popular && (
                  <div className="absolute -top-0 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-0.5 rounded-b-lg rounded-t-none shadow-lg">
                      BEST VALUE
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pt-8 pb-2 px-4">
                  <p className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-2">{pkg.name}</p>
                  <div className="flex flex-col items-center">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-black text-white">{totalTokens}</span>
                      <span className="text-gray-300 text-sm font-semibold">tokens</span>
                    </div>
                    {pkg.bonus > 0 && (
                      <Badge className="mt-1 bg-green-500/20 text-green-300 border border-green-500/40 text-xs px-2 py-0.5">
                        +{pkg.bonus} bonus included
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-white">${pkg.price}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{pkg.valueLabel}</p>
                </CardHeader>

                <CardContent className="px-4 pb-5">
                  <div className="mb-4">
                    <Progress
                      value={((5 - index) / 5) * 100 + (index * 20)}
                      className="h-1.5 bg-white/10"
                    />
                  </div>
                  <Button
                    onClick={() => handlePackageSelect(pkg)}
                    className={`w-full bg-gradient-to-r ${style.btn} hover:opacity-90 text-white font-bold py-2.5 rounded-lg shadow-lg transition-all duration-200 text-sm`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Buy ${pkg.price}</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Value guide */}
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="text-white font-bold">Token Value Guide</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {tokenPackages.map((pkg) => (
              <div key={pkg.id} className="text-center bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-white font-bold text-lg">{pkg.tokens + pkg.bonus}</p>
                <p className="text-gray-400 text-xs">tokens</p>
                <p className="text-purple-400 font-semibold text-sm mt-1">${pkg.price}</p>
                <p className="text-gray-500 text-xs">{pkg.valueLabel}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security note */}
        <div className="text-center">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl inline-flex items-center space-x-2">
            <Zap className="h-4 w-4 text-green-400 shrink-0" />
            <p className="text-green-400 font-medium text-sm">
              Payments secured by Authorize.net — tokens are added instantly after purchase.
            </p>
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 inset-x-0 md:hidden z-50 flex items-center justify-around px-1 py-2"
        style={{ background: "rgba(7,6,15,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        {[
          { icon: Home,     label: "Home",    path: "/" },
          { icon: Gamepad2, label: "Games",   path: "/games" },
          { icon: Coins,    label: "Tokens",  path: "/tokens",    active: true },
          { icon: Wallet,   label: "Wallet",  path: "/wallet" },
          { icon: User,     label: "Account", path: "/dashboard" },
        ].map(({ icon: Icon, label, path, active }) => (
          <button
            key={label}
            onClick={() => setLocation(path)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active ? "text-violet-400" : "text-gray-600 hover:text-gray-400"}`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-semibold">{label}</span>
          </button>
        ))}
      </nav>

      {/* ── AUTHORIZE.NET PAYMENT MODAL ──────────────────────────────── */}
      {selectedPackage && (
        <AuthorizeNetForm
          packageName={selectedPackage.name}
          packagePrice={selectedPackage.price}
          packageTokens={selectedPackage.tokens + selectedPackage.bonus}
          onSuccess={handlePaymentSuccess}
          onClose={() => !isProcessing && setSelectedPackage(null)}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
