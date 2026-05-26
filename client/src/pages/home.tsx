import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  Gamepad2,
  DollarSign,
  Gift,
  Trophy,
  Bell,
  User,
  Zap,
  ChevronRight,
  Star,
  Shield,
  CheckCircle,
  TrendingUp,
  Users,
  Coins,
  Crown,
  Flame,
  Play,
  HelpCircle,
  LogOut,
  ArrowRight,
  Timer,
  Sparkles,
} from "lucide-react";
import { logout } from "@/lib/auth";
import type { Game } from "@shared/schema";
import logoPath from "@assets/logo_1777237644041.png";

// ── Dummy live winners ──────────────────────────────────────────────────────
const DUMMY_WINNERS = [
  { name: "PlugzKing",  prize: "$750 Cash",  ago: "1m ago",  color: "from-green-500 to-emerald-600" },
  { name: "WinnerBoss", prize: "$500 Cash",  ago: "2m ago",  color: "from-green-500 to-emerald-600" },
  { name: "LuckyAce",   prize: "$250 Cash",  ago: "5m ago",  color: "from-green-500 to-emerald-600" },
  { name: "JackpotPro", prize: "$1,000",     ago: "8m ago",  color: "from-yellow-500 to-orange-500" },
  { name: "SpinMaster", prize: "PS5",        ago: "12m ago", color: "from-blue-500 to-indigo-600" },
  { name: "TokenKing",  prize: "$350 Cash",  ago: "15m ago", color: "from-green-500 to-emerald-600" },
  { name: "PrizePro",   prize: "65\" TV",    ago: "18m ago", color: "from-purple-500 to-violet-600" },
];

// ── Dummy featured prizes ───────────────────────────────────────────────────
const DUMMY_PRIZES = [
  {
    tag: "CASH",
    label: "$500",
    sublabel: "CASH PRIZE",
    bg: "from-green-900 to-green-800",
    border: "border-green-500/50",
    accent: "text-green-400",
    badgeBg: "bg-green-500/20 border-green-500/40",
    icon: DollarSign,
    iconBg: "bg-green-500",
    visual: "💵",
  },
  {
    tag: "CASH",
    label: "$250",
    sublabel: "CASH PRIZE",
    bg: "from-emerald-900 to-green-800",
    border: "border-emerald-500/50",
    accent: "text-emerald-400",
    badgeBg: "bg-emerald-500/20 border-emerald-500/40",
    icon: DollarSign,
    iconBg: "bg-emerald-500",
    visual: "💵",
  },
  {
    tag: "PS5",
    label: "PlayStation 5",
    sublabel: "GAMING CONSOLE",
    bg: "from-slate-900 to-blue-950",
    border: "border-blue-500/40",
    accent: "text-blue-300",
    badgeBg: "bg-blue-500/20 border-blue-500/40",
    icon: Gamepad2,
    iconBg: "bg-blue-600",
    visual: "🎮",
  },
  {
    tag: "65\" TV",
    label: "4K Smart TV",
    sublabel: "65-INCH UHD",
    bg: "from-purple-950 to-indigo-950",
    border: "border-purple-500/40",
    accent: "text-purple-300",
    badgeBg: "bg-purple-500/20 border-purple-500/40",
    icon: Zap,
    iconBg: "bg-purple-600",
    visual: "📺",
  },
  {
    tag: "VIP PACK",
    label: "Cash + Gift Cards",
    sublabel: "VIP BUNDLE",
    bg: "from-yellow-950 to-orange-950",
    border: "border-yellow-500/50",
    accent: "text-yellow-400",
    badgeBg: "bg-yellow-500/20 border-yellow-500/40",
    icon: Crown,
    iconBg: "bg-yellow-500",
    visual: "🎁",
  },
];

// ── Spinning Wheel component ────────────────────────────────────────────────
function SpinningWheel({ spinning }: { spinning: boolean }) {
  const segments = [
    "#FF2D2D","#FF7A00","#FFD700","#00CC44",
    "#00AAFF","#7B2FFF","#FF2D9A","#FF2D2D",
    "#FF7A00","#FFD700","#00CC44","#00AAFF",
  ];
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full"
           style={{ background: "radial-gradient(circle, rgba(255,200,0,0.25) 0%, transparent 70%)" }} />
      {/* Wheel */}
      <div
        className="relative rounded-full shadow-2xl border-4 border-yellow-400/80 overflow-hidden"
        style={{
          width: 220, height: 220,
          background: `conic-gradient(${segments.map((c, i) => `${c} ${(i/segments.length)*360}deg ${((i+1)/segments.length)*360}deg`).join(", ")})`,
          animation: spinning ? "spin 1.5s linear infinite" : "spin 4s linear infinite",
          boxShadow: "0 0 40px rgba(255,200,0,0.5), 0 0 80px rgba(120,0,255,0.3)",
        }}
      >
        {/* Spoke lines */}
        {segments.map((_, i) => (
          <div key={i}
               className="absolute top-1/2 left-1/2 w-px bg-black/30"
               style={{
                 height: "50%",
                 transformOrigin: "top center",
                 transform: `translateX(-50%) rotate(${(i / segments.length) * 360}deg)`,
               }}
          />
        ))}
        {/* Center hub */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#1a0a30] border-4 border-yellow-400 flex flex-col items-center justify-center shadow-xl">
            <span className="text-yellow-400 font-black text-xs leading-none">SPIN</span>
            <span className="text-yellow-300 font-black text-xs leading-none">TO WIN</span>
          </div>
        </div>
      </div>
      {/* Pointer */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
        <div className="w-0 h-0"
             style={{ borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "22px solid #FFD700", filter: "drop-shadow(0 0 6px #FFD700)" }} />
      </div>
      {/* Lights around wheel */}
      {[...Array(16)].map((_, i) => (
        <div key={i}
             className="absolute w-3 h-3 rounded-full animate-pulse"
             style={{
               background: i % 2 === 0 ? "#FFD700" : "#FF2D9A",
               transform: `rotate(${i * 22.5}deg) translateY(-120px)`,
               animationDelay: `${i * 0.1}s`,
               boxShadow: `0 0 6px ${i % 2 === 0 ? "#FFD700" : "#FF2D9A"}`,
             }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [winnerIndex, setWinnerIndex] = useState(0);
  const [liveWinners, setLiveWinners] = useState(DUMMY_WINNERS);
  const [isSpinning, setIsSpinning] = useState(false);

  const { data: user } = useQuery<any>({ queryKey: ["/api/user"] });
  const { data: tokenData } = useQuery<{ tokenBalance: number }>({
    queryKey: ["/api/user/token-balance"],
    refetchInterval: 15000,
  });
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    refetchInterval: 20000,
  });

  const activeGames = games?.filter((g) => g.isActive) ?? [];
  const tokenBalance = tokenData?.tokenBalance ?? 0;
  const username = (user as any)?.username ?? (user as any)?.email?.split("@")[0] ?? "Player";
  const avatarLetter = username[0]?.toUpperCase() ?? "P";
  const totalGames = activeGames.length;

  // Rotate featured winner card every 4s
  useEffect(() => {
    const t = setInterval(() => {
      setWinnerIndex((p) => (p + 1) % DUMMY_WINNERS.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Occasionally add a new winner to the feed
  useEffect(() => {
    const names = ["CashMaster","LuckyDog","PlugzPro","WheelWiz","TokenAce","BigWin99","JackAce"];
    const prizes = ["$750","$200","$500","PS5","65\" TV","$1,000","VIP Pack"];
    const t = setInterval(() => {
      setLiveWinners((prev) => [
        { name: names[Math.floor(Math.random() * names.length)],
          prize: prizes[Math.floor(Math.random() * prizes.length)] + " Prize",
          ago: "Just now",
          color: "from-green-500 to-emerald-600" },
        ...prev.slice(0, 6),
      ]);
    }, 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#08080f] text-white pb-20 md:pb-0">
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes glow { 0%,100%{opacity:0.7} 50%{opacity:1} }
        .ticker-inner { animation: ticker 22s linear infinite; display:flex; width:max-content; }
        .float-anim { animation: float 3s ease-in-out infinite; }
        .glow-text { animation: glow 2s ease-in-out infinite; }
        .neon-border { box-shadow: 0 0 12px rgba(168,85,247,0.5), 0 0 30px rgba(168,85,247,0.2); }
        .gold-glow { box-shadow: 0 0 20px rgba(255,215,0,0.4), 0 0 50px rgba(255,140,0,0.2); }
      `}</style>

      {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0d0c1a]/98 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
          {/* Logo */}
          <img src={logoPath} alt="Prize Plugz" className="h-12 sm:h-14 w-auto object-contain shrink-0" />

          {/* Center CTA */}
          <button className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-4 py-2 rounded-xl border border-green-400/40 shadow-lg transition-all text-sm">
            <Coins className="h-4 w-4 text-yellow-300" />
            <div className="text-left">
              <p className="text-xs font-black leading-none">CASH GIVEAWAYS</p>
              <p className="text-green-200 text-xs leading-none font-medium">Every Single Day!</p>
            </div>
          </button>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Token balance */}
            <div className="flex items-center space-x-1.5 bg-[#1e1d2e] border border-yellow-500/30 rounded-full px-3 py-1.5 gold-glow">
              <Coins className="h-4 w-4 text-yellow-400 shrink-0" />
              <span className="text-yellow-300 font-black text-sm">{tokenBalance}</span>
            </div>
            {/* Bell */}
            <div className="relative p-2 bg-[#1e1d2e] border border-white/10 rounded-full cursor-pointer hover:bg-white/10 transition">
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center">3</span>
            </div>
            {/* User */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setLocation("/dashboard")}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-black text-sm border-2 border-purple-400/50 shadow-lg">
                {avatarLetter}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-gray-400 text-xs leading-none">Welcome Back,</p>
                <p className="text-white font-black text-sm leading-none flex items-center gap-1">
                  {username} <Crown className="h-3.5 w-3.5 text-yellow-400" />
                </p>
              </div>
            </div>
            {/* Logout */}
            <button onClick={() => logout()} className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-full transition">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0d0b25] via-[#150d30] to-[#0a0a18] py-8 sm:py-12 px-4 sm:px-6">
        {/* BG glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-10"
             style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(120,40,255,0.4) 0%, transparent 60%)" }} />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            {/* LEFT: Headline */}
            <div className="space-y-5 text-center md:text-left">
              {/* Players badge */}
              <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <div className="flex -space-x-2">
                  {["bg-green-500","bg-blue-500","bg-purple-500"].map((c,i) => (
                    <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-[#0d0b25] flex items-center justify-center text-[8px] font-bold`}>
                      {String.fromCharCode(65+i)}
                    </div>
                  ))}
                </div>
                <span className="text-white font-bold text-sm">12,458</span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-gray-400 text-sm">Playing Now</span>
              </div>

              {/* Main headline */}
              <div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight">
                  <span className="block text-white">SPIN.</span>
                  <span className="block text-white">WIN.</span>
                  <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent glow-text">
                    GET PAID.
                  </span>
                </h1>
                <p className="text-gray-300 text-base sm:text-lg mt-3 font-medium leading-snug">
                  Real games. Real winners.<br />Real cash prizes.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button
                  onClick={() => activeGames[0] ? setLocation(`/game/${activeGames[0].id}`) : setLocation("/games")}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-black text-lg py-6 px-8 rounded-2xl gold-glow transition-all hover:scale-105 border border-yellow-300/50"
                >
                  <Zap className="h-5 w-5 mr-2" /> SPIN NOW
                </Button>
                <Button
                  onClick={() => setLocation("/how-to-play")}
                  variant="outline"
                  className="border-2 border-purple-500/60 text-purple-300 hover:bg-purple-500/20 hover:text-white font-black text-base py-6 px-6 rounded-2xl"
                >
                  <Play className="h-4 w-4 mr-2 fill-current" /> HOW IT WORKS
                </Button>
              </div>

              {/* Quick stats pills */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {[
                  { icon: "🏆", label: "$127K+ Paid Out" },
                  { icon: "⚡", label: "Instant Results" },
                  { icon: "🔒", label: "100% Secure" },
                ].map(({ icon, label }) => (
                  <span key={label} className="flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300 font-semibold">
                    <span>{icon}</span><span>{label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT: Wheel + prize display */}
            <div className="flex flex-col items-center space-y-4">
              {/* Wheel */}
              <div className="float-anim">
                <SpinningWheel spinning={isSpinning} />
              </div>

              {/* "WIN REAL CASH & PRIZES" neon */}
              <div className="bg-gradient-to-r from-red-600 to-pink-600 border-2 border-red-400/60 rounded-2xl px-6 py-3 text-center neon-border w-full max-w-xs"
                   style={{ boxShadow: "0 0 25px rgba(239,68,68,0.5), 0 0 60px rgba(239,68,68,0.2)" }}>
                <p className="text-white font-black text-xl sm:text-2xl leading-tight tracking-wide">
                  WIN REAL<br />
                  <span className="text-yellow-300">CASH & PRIZES!</span>
                </p>
              </div>

              {/* Token balance shortcut */}
              <div className="flex items-center gap-3 w-full max-w-xs">
                <div className="flex-1 bg-[#1a1830] border border-white/10 rounded-xl px-4 py-3 text-center">
                  <p className="text-gray-500 text-xs font-medium mb-0.5">Your Tokens</p>
                  <p className="text-yellow-300 font-black text-xl">{tokenBalance}</p>
                </div>
                <Button
                  onClick={() => setLocation("/tokens")}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl"
                >
                  + Add Tokens
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────── */}
      <section className="bg-[#0f0e1c] border-y border-white/5 py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { icon: Trophy,      color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Total Prizes Paid",    value: "$127,250" },
            { icon: Users,       color: "text-blue-400",   bg: "bg-blue-500/10",   label: "Active Players",      value: "12,458" },
            { icon: Gamepad2,    color: "text-green-400",  bg: "bg-green-500/10",  label: "Games Played",        value: "98,623" },
            { icon: Gift,        color: "text-pink-400",   bg: "bg-pink-500/10",   label: "Prizes Won Today",    value: "583" },
            { icon: Timer,       color: "text-orange-400", bg: "bg-orange-500/10", label: "Prizes Ending Today", value: String(Math.max(totalGames, 1)) },
          ].map(({ icon: Icon, color, bg, label, value }) => (
            <div key={label} className="flex items-center space-x-3 bg-[#14132a] border border-white/5 rounded-xl px-4 py-3">
              <div className={`${bg} rounded-lg p-2 shrink-0`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-white font-black text-base leading-none truncate">{value}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-tight truncate">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE WINNERS ────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-400 animate-pulse" />
            <h2 className="text-white font-black text-lg sm:text-xl uppercase tracking-wide">Live Winners</h2>
          </div>
          <button onClick={() => setLocation("/dashboard")} className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors">
            <span>View All Winners</span><ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {liveWinners.slice(0, 5).map((w, i) => (
            <div key={i} className={`bg-[#13122a] border border-white/8 rounded-2xl p-4 hover:border-purple-500/40 transition-all duration-300 ${i === 0 ? "ring-1 ring-green-500/40" : ""}`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${w.color} flex items-center justify-center font-black text-white text-base border-2 border-white/20`}>
                  {w.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{w.name}</p>
                  <p className="text-gray-500 text-xs">{w.ago}</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs mb-0.5">Just Won</p>
              <p className="text-green-400 font-black text-lg leading-none">{w.prize}</p>
              <p className="text-gray-600 text-xs mt-0.5">Cash Prize</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRIZES ─────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-purple-400" />
            <h2 className="text-white font-black text-lg sm:text-xl uppercase tracking-wide">Featured Prizes</h2>
          </div>
          <button onClick={() => setLocation("/games")} className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors">
            <span>View All Prizes</span><ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Real active games first */}
          {activeGames.slice(0, 2).map((g) => (
            <div
              key={g.id}
              onClick={() => setLocation(`/game/${g.id}`)}
              className="group bg-[#13122a] border border-purple-500/30 rounded-2xl overflow-hidden cursor-pointer hover:border-purple-400/60 hover:scale-105 transition-all duration-200"
            >
              <div className="relative bg-gradient-to-br from-purple-900 to-violet-950 h-32 flex flex-col items-center justify-center p-3">
                <span className="absolute top-2 left-2 bg-green-500/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                  LIVE
                </span>
                {g.prizeImageUrl ? (
                  <img src={g.prizeImageUrl} alt={g.name} className="h-20 w-full object-contain drop-shadow-xl" />
                ) : (
                  <div className="text-5xl leading-none">🏆</div>
                )}
              </div>
              <div className="p-3 bg-[#0f0e20]">
                <p className="text-purple-300 text-xs font-black uppercase truncate">{g.code}</p>
                <p className="text-white font-black text-base leading-tight truncate">${g.prizeValue}</p>
                <p className="text-gray-500 text-xs truncate">{g.name}</p>
                <button className="mt-2 w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-xs py-2 rounded-xl transition-all">
                  ENTER NOW
                </button>
              </div>
            </div>
          ))}

          {/* Dummy prize cards to fill out the grid */}
          {DUMMY_PRIZES.slice(0, Math.max(5 - activeGames.slice(0,2).length, 3)).map((p) => (
            <div
              key={p.tag}
              onClick={() => setLocation("/games")}
              className={`group bg-gradient-to-br ${p.bg} border ${p.border} rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200`}
            >
              <div className="relative h-32 flex flex-col items-center justify-center p-3">
                <span className={`absolute top-2 left-2 ${p.badgeBg} border ${p.accent} text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide`}>
                  {p.tag}
                </span>
                <div className="text-5xl leading-none">{p.visual}</div>
              </div>
              <div className="p-3 bg-black/30">
                <p className={`${p.accent} text-xs font-black uppercase`}>{p.sublabel}</p>
                <p className="text-white font-black text-base leading-tight">{p.label}</p>
                <button className="mt-2 w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-xs py-2 rounded-xl transition-all">
                  ENTER NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ACTIVE GAMES SPOTLIGHT ──────────────────────────────────────── */}
      {activeGames.length > 0 && (
        <section className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 mb-4">
            <Flame className="h-5 w-5 text-red-400 animate-pulse" />
            <h2 className="text-white font-black text-lg sm:text-xl uppercase tracking-wide">🔴 Live Right Now</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGames.map((g) => {
              const progress = g.tokenThreshold > 0 ? Math.min((g.tokensCollected / g.tokenThreshold) * 100, 100) : 0;
              const tokensLeft = Math.max(g.tokenThreshold - g.tokensCollected, 0);
              return (
                <div
                  key={g.id}
                  onClick={() => setLocation(`/game/${g.id}`)}
                  className="group bg-[#13122a] border border-white/8 hover:border-purple-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="relative bg-gradient-to-br from-violet-900/60 to-purple-950 p-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5 absolute top-2 left-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-300 text-xs font-bold">LIVE NOW</span>
                    </div>
                    {g.prizeImageUrl ? (
                      <img src={g.prizeImageUrl} alt={g.name} className="w-16 h-16 object-contain rounded-xl bg-black/20 p-1 mt-4" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center mt-4 text-3xl">
                        🎁
                      </div>
                    )}
                    <div className="flex-1 min-w-0 mt-4">
                      <p className="text-white font-black text-base truncate">{g.name}</p>
                      <p className="text-yellow-400 font-black text-lg">${g.prizeValue} Prize</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-400">{g.tokensCollected.toLocaleString()} collected</span>
                        <span className="text-gray-400">{g.tokenThreshold.toLocaleString()} goal</span>
                      </div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            progress >= 95 ? "bg-red-500" : progress >= 80 ? "bg-orange-500" : "bg-gradient-to-r from-violet-600 to-purple-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{tokensLeft.toLocaleString()} tokens until winner!</p>
                    </div>
                    {/* Spin button */}
                    <Button
                      onClick={(e) => { e.stopPropagation(); setLocation(`/game/${g.id}`); }}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-black text-sm py-3 rounded-xl"
                    >
                      <Zap className="h-4 w-4 mr-1.5" />
                      SPIN NOW — {g.tokensPerPlay} TOKENS
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* ── PROMO BANNERS ───────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-6 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 2X Entries */}
        <div className="relative overflow-hidden bg-[#0f0e20] border border-purple-500/30 rounded-2xl p-5 flex items-center space-x-4"
             style={{ boxShadow: "0 0 30px rgba(168,85,247,0.15)" }}>
          <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 border-2 border-purple-400/50 flex items-center justify-center font-black text-3xl text-white shadow-xl"
               style={{ textShadow: "0 0 15px rgba(168,85,247,0.8)" }}>
            2X
          </div>
          <div className="flex-1">
            <p className="text-yellow-400 font-black text-lg sm:text-xl">DOUBLE YOUR ENTRIES!</p>
            <p className="text-gray-400 text-sm mt-1">Get 2X entries for every game when you verify your account!</p>
            <button
              onClick={() => setLocation("/dashboard")}
              className="mt-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-sm px-5 py-2 rounded-xl transition-all hover:scale-105"
            >
              SIGN UP NOW
            </button>
          </div>
        </div>

        {/* Safe & Secure */}
        <div className="relative overflow-hidden bg-[#0f0e20] border border-green-500/20 rounded-2xl p-5 flex items-center space-x-4">
          <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-green-900 to-emerald-900 border-2 border-green-500/50 flex items-center justify-center"
               style={{ boxShadow: "0 0 20px rgba(34,197,94,0.2)" }}>
            <span className="font-black text-green-400 text-2xl leading-none text-center">100<span className="text-lg">%</span></span>
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-lg sm:text-xl">SAFE &amp; SECURE</p>
            <div className="mt-2 space-y-1.5">
              {["Secure Payments","Instant Payouts","Trusted by Thousands"].map((t) => (
                <div key={t} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                  <span className="text-gray-300 text-sm">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-[#0d0c1a] border border-white/5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5 overflow-hidden">
          <div className="flex items-center space-x-4 px-5 py-4">
            <div className="p-2.5 bg-yellow-500/15 rounded-xl border border-yellow-500/20">
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center space-x-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-white font-bold text-sm">JOIN THOUSANDS OF WINNERS TODAY!</p>
              <p className="text-gray-500 text-xs">4.8/5 from 2,500+ reviews</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 px-5 py-4">
            <div className="p-2.5 bg-green-500/15 rounded-xl border border-green-500/20">
              <Zap className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">FAST PAYOUTS</p>
              <p className="text-gray-500 text-xs">Get your winnings fast</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 px-5 py-4">
            <div className="p-2.5 bg-blue-500/15 rounded-xl border border-blue-500/20">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">TRUSTED &amp; SECURED</p>
              <p className="text-gray-500 text-xs">Your security is our priority</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#0d0c1a]/98 backdrop-blur-xl border-t border-white/8 z-40 flex items-center justify-around px-1 py-2 md:hidden">
        {[
          { icon: Home,     label: "Home",    path: "/",             active: true },
          { icon: Gamepad2, label: "Games",   path: "/games" },
          { icon: DollarSign,label: "Cash",   path: "/tokens" },
          { icon: Gift,     label: "Prizes",  path: "/games" },
          { icon: Trophy,   label: "Winners", path: "/dashboard" },
          { icon: Bell,     label: "Alerts",  path: "/dashboard",   badge: 3 },
          { icon: User,     label: "Account", path: "/dashboard" },
        ].map(({ icon: Icon, label, path, active, badge }) => (
          <button
            key={label}
            onClick={() => setLocation(path)}
            className={`relative flex flex-col items-center space-y-0.5 px-2 py-1 rounded-xl transition-all ${
              active ? "text-purple-400" : "text-gray-600 hover:text-gray-400"
            }`}
          >
            <Icon className="h-5 w-5" />
            {badge && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-black flex items-center justify-center text-white">
                {badge}
              </span>
            )}
            <span className="text-[9px] font-semibold">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
