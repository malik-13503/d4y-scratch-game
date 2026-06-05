import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coins, CreditCard, Zap, Star, TrendingUp,
  ChevronLeft, Home, Gamepad2, Wallet, User, Shield, CheckCircle,
} from "lucide-react";
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

const PAYMENT_METHODS = [
  { icon: "💵", label: "Cash App",  color: "#00c244", bg: "rgba(0,194,68,0.12)"   },
  { icon: "💳", label: "Venmo",     color: "#3d95ce", bg: "rgba(61,149,206,0.12)" },
  { icon: "🏦", label: "Chime",     color: "#00c6a0", bg: "rgba(0,198,160,0.12)"  },
  { icon: "🍎", label: "Apple Pay", color: "#888888", bg: "rgba(136,136,136,0.12)"},
];

export function TokenPurchase() {
  const [, setLocation] = useLocation();

  const { data: tokenPackages = [] } = useQuery<TokenPackage[]>({
    queryKey: ["/api/token-packages"],
  });

  const { data: tokenBalanceData } = useQuery<{ tokenBalance: number }>({
    queryKey: ["/api/user/token-balance"],
    refetchInterval: 5000,
  });

  const currentBalance = tokenBalanceData?.tokenBalance || 0;

  const packageStyles = [
    { gradient: "from-slate-800 to-slate-900",  accent: "border-slate-500/50",  bar: "#64748b", btn: "from-slate-600 to-slate-700" },
    { gradient: "from-blue-950 to-slate-900",   accent: "border-blue-500/50",   bar: "#3b82f6", btn: "from-blue-600 to-blue-700"   },
    { gradient: "from-purple-950 to-slate-900", accent: "border-purple-400/60", bar: "#a855f7", btn: "from-purple-600 to-purple-700"},
    { gradient: "from-orange-950 to-slate-900", accent: "border-orange-400/60", bar: "#f97316", btn: "from-orange-500 to-orange-600"},
    { gradient: "from-yellow-950 to-slate-900", accent: "border-yellow-400/60", bar: "#eab308", btn: "from-yellow-500 to-yellow-600"},
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-10"
      style={{ background: "linear-gradient(135deg,#07060f 0%,#0d0b1e 50%,#07060f 100%)" }}>

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle,rgba(59,130,246,0.08),transparent 70%)" }} />
      </div>

      {/* ── SITE HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-white/5"
        style={{ background: "rgba(7,6,15,0.97)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-all hover:bg-white/8 rounded-xl px-2 py-1.5 text-sm font-medium">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={() => setLocation("/")} className="shrink-0">
              <img src={logoPath} alt="Prize Plugz" className="h-9 w-auto object-contain" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="p-1.5 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
              <Coins className="h-4 w-4 text-yellow-400" />
            </div>
            <span className="text-white font-black text-lg">Token Shop</span>
          </div>
          <button onClick={() => setLocation("/wallet")}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(249,115,22,0.1))", border: "1px solid rgba(251,191,36,0.3)" }}>
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-300 font-black text-sm">{currentBalance}</span>
            <span className="text-yellow-600 text-xs hidden sm:inline">tokens</span>
          </button>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-10 max-w-6xl">

        {/* ── PAGE HEADING ── */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <Coins className="h-8 w-8 text-yellow-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white">Token Shop</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Buy tokens to play games and win real prizes. Larger packs give you more value per dollar.
          </p>
        </div>

        {/* ── BALANCE + PAYMENT METHODS NOTICE ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          {/* Balance */}
          <div className="rounded-2xl px-7 py-5 flex items-center gap-5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.3)", backdropFilter: "blur(12px)" }}>
            <div className="text-center">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Your Balance</p>
              <div className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-yellow-400" />
                <span className="text-4xl font-black text-white">{currentBalance}</span>
                <span className="text-gray-400 font-semibold">tokens</span>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10 hidden sm:block" />
            <div className="text-center hidden sm:block">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">New Users Get</p>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-bold">3 Free Tokens</span>
              </div>
            </div>
          </div>

          {/* Payment notice */}
          <div className="rounded-2xl px-5 py-4 flex items-center gap-3"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <Shield className="h-5 w-5 text-violet-400 flex-shrink-0" />
            <div>
              <p className="text-violet-300 text-xs font-bold uppercase tracking-wide">Accepted Payment Methods</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {PAYMENT_METHODS.map(m => (
                  <span key={m.label} className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}40` }}>
                    {m.icon} {m.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── PACKAGE GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
          {tokenPackages.map((pkg, index) => {
            const style = packageStyles[index % packageStyles.length];
            const totalTokens = pkg.tokens + pkg.bonus;

            return (
              <Card key={pkg.id}
                className={`relative bg-gradient-to-b ${style.gradient} border-2 ${style.accent} overflow-hidden transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl cursor-pointer`}>
                {pkg.popular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-0.5"
                      style={{ background: "linear-gradient(90deg,#f59e0b,#f97316,#f59e0b)" }} />
                    <div className="absolute left-1/2 transform -translate-x-1/2" style={{ top: 0 }}>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-0.5 rounded-b-lg rounded-t-none shadow-lg">
                        BEST VALUE
                      </Badge>
                    </div>
                  </>
                )}

                <CardHeader className="text-center pt-8 pb-2 px-4">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{pkg.name}</p>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">{totalTokens}</span>
                      <span className="text-gray-400 text-sm font-semibold">tokens</span>
                    </div>
                    {pkg.bonus > 0 && (
                      <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs px-2 py-0.5">
                        +{pkg.bonus} bonus included
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-white">${pkg.price}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{pkg.valueLabel}</p>
                </CardHeader>

                <CardContent className="px-4 pb-5">
                  {/* Value bar */}
                  <div className="mb-4 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${((5 - index) / 5) * 100 + index * 20}%`, background: style.bar }} />
                  </div>
                  <button
                    onClick={() => setLocation("/add-credits")}
                    className={`w-full bg-gradient-to-r ${style.btn} hover:opacity-90 text-white font-bold py-2.5 rounded-xl shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2`}>
                    <CreditCard className="h-4 w-4" />
                    Buy ${pkg.price}
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="rounded-2xl p-6 mb-8"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <h3 className="text-white font-bold">How It Works</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step:"1", icon:"🎯", title:"Pick a Package",   desc:"Choose the token bundle that fits your budget — more tokens per dollar with larger packs." },
              { step:"2", icon:"💸", title:"Send Payment",     desc:"Pay via Cash App, Venmo, Chime, or Apple Pay using the addresses provided." },
              { step:"3", icon:"⚡", title:"Tokens Credited",  desc:"Our team verifies your payment and credits your tokens — usually within minutes." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
                  {icon}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── VALUE GUIDE ── */}
        <div className="rounded-2xl p-6 mb-8"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="text-white font-bold">Token Value Guide</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {tokenPackages.map((pkg) => (
              <div key={pkg.id} className="text-center rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-white font-black text-xl">{pkg.tokens + pkg.bonus}</p>
                <p className="text-gray-500 text-xs">tokens</p>
                <p className="text-violet-400 font-bold text-sm mt-1">${pkg.price}</p>
                <p className="text-gray-600 text-xs">{pkg.valueLabel}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECURITY NOTE ── */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl"
            style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>
            <Zap className="h-4 w-4 text-green-400 flex-shrink-0" />
            <p className="text-green-400 font-medium text-sm">
              No card payments — pay via Cash App, Venmo, Chime, or Apple Pay. Tokens credited after verification.
            </p>
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden z-50 flex items-center justify-around px-1 py-2"
        style={{ background: "rgba(7,6,15,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {[
          { icon: Home,     label: "Home",   path: "/" },
          { icon: Gamepad2, label: "Games",  path: "/games" },
          { icon: Coins,    label: "Tokens", path: "/tokens", active: true },
          { icon: Wallet,   label: "Wallet", path: "/wallet" },
          { icon: User,     label: "Account",path: "/dashboard" },
        ].map(({ icon: Icon, label, path, active }) => (
          <button key={label} onClick={() => setLocation(path)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active ? "text-violet-400" : "text-gray-600 hover:text-gray-400"}`}>
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-semibold">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
