import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Zap, Trophy, Gift, Users, Shield, CheckCircle,
  Star, Crown, Flame, Bell, LogOut, Coins,
  ArrowRight, ChevronRight, Gamepad2, DollarSign,
  Home, User, TrendingUp, Lock, BarChart3, Timer,
  Sparkles, Play, Hash, CreditCard,
} from "lucide-react";
import { logout } from "@/lib/auth";
import type { Game } from "@shared/schema";
import logoPath from "@assets/logo_1777237644041.png";

/* ─── DUMMY DATA ───────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "🏆 PlugzKing just won $750 Cash!",
  "🎮 SpinMaster won a PS5 Console!",
  "💵 LuckyAce claimed $1,000!",
  "📺 WinnerBoss won a 65\" 4K TV!",
  "🎁 TokenPro won VIP Gift Pack!",
  "💰 JackAce just won $500 Cash!",
  "🔥 PrizePro claimed $250 Cash!",
];

const LIVE_WINNERS = [
  { name: "PlugzKing",  prize: "$750",    type: "Cash Prize",    color: "#10b981", emoji: "💵", ago: "Just now" },
  { name: "SpinMaster", prize: "PS5",     type: "PlayStation 5", color: "#6366f1", emoji: "🎮", ago: "2 min ago" },
  { name: "LuckyAce",   prize: "$1,000",  type: "Cash Prize",    color: "#10b981", emoji: "💵", ago: "5 min ago" },
  { name: "WinnerBoss", prize: "$500",    type: "Cash Prize",    color: "#10b981", emoji: "💵", ago: "8 min ago" },
  { name: "JackAce",    prize: "65\" TV", type: "Smart TV",      color: "#8b5cf6", emoji: "📺", ago: "12 min ago" },
  { name: "TokenKing",  prize: "$250",    type: "Cash Prize",    color: "#10b981", emoji: "💵", ago: "15 min ago" },
];

const FEATURED_PRIZES = [
  { emoji: "💵", tag: "CASH", title: "$500",    sub: "Cash Prize",    from: "#064e3b", to: "#065f46", border: "#10b981", glow: "rgba(16,185,129,0.3)" },
  { emoji: "💵", tag: "CASH", title: "$250",    sub: "Cash Prize",    from: "#064e3b", to: "#047857", border: "#10b981", glow: "rgba(16,185,129,0.2)" },
  { emoji: "🎮", tag: "PS5",  title: "PlayStation 5", sub: "Gaming Console", from: "#1e1b4b", to: "#1d2060", border: "#6366f1", glow: "rgba(99,102,241,0.3)" },
  { emoji: "📺", tag: "TV",   title: "65\" Smart TV", sub: "4K UHD Display", from: "#2d1b69", to: "#3730a3", border: "#8b5cf6", glow: "rgba(139,92,246,0.3)" },
  { emoji: "🎁", tag: "VIP",  title: "VIP Pack", sub: "Cash + Gift Cards", from: "#451a03", to: "#78350f", border: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
];

const HOW_IT_WORKS = [
  { step: "01", icon: Coins,     color: "#8b5cf6", label: "Buy Tokens",      desc: "Purchase token packs to fuel your entries." },
  { step: "02", icon: BarChart3, color: "#10b981", label: "Track Progress",  desc: "Watch the token bar fill toward the jackpot." },
  { step: "03", icon: Lock,      color: "#f59e0b", label: "Game Auto-Closes", desc: "When the goal is hit, entries close instantly." },
  { step: "04", icon: Trophy,    color: "#ec4899", label: "Winner Picked",   desc: "A verified winner is chosen automatically." },
];

/* ─── PRIZE SHOWCASE (hero right panel) ────────────────────────── */
function PrizeShowcase() {
  const cards = [
    { emoji: "💵", amount: "$1,000", label: "CASH PRIZE",    from: "#022c22", to: "#064e3b", border: "#10b981", glow: "rgba(16,185,129,0.5)", rotate: "-6deg", tx: "-24px", ty: "30px", z: 1 },
    { emoji: "🎮", amount: "PS5",    label: "CONSOLE",       from: "#1e1b4b", to: "#2e1065", border: "#8b5cf6", glow: "rgba(139,92,246,0.5)", rotate: "5deg",  tx: "20px",  ty: "15px", z: 2 },
    { emoji: "📺", amount: "65\" TV", label: "SMART TV",     from: "#172554", to: "#1e3a8a", border: "#3b82f6", glow: "rgba(59,130,246,0.5)", rotate: "-2deg", tx: "0px",   ty: "0px",  z: 3 },
  ];

  return (
    <div className="relative h-72 sm:h-80 w-full max-w-xs mx-auto">
      <style>{`
        @keyframes floatA { 0%,100%{transform:rotate(-6deg) translate(-24px,30px) translateY(0)} 50%{transform:rotate(-6deg) translate(-24px,30px) translateY(-10px)} }
        @keyframes floatB { 0%,100%{transform:rotate(5deg) translate(20px,15px) translateY(0)} 50%{transform:rotate(5deg) translate(20px,15px) translateY(-14px)} }
        @keyframes floatC { 0%,100%{transform:rotate(-2deg) translate(0px,0px) translateY(0)} 50%{transform:rotate(-2deg) translate(0px,0px) translateY(-8px)} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulseGlow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes countUp { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        .float-a { animation: floatA 4s ease-in-out infinite; }
        .float-b { animation: floatB 4.5s ease-in-out infinite 0.5s; }
        .float-c { animation: floatC 3.8s ease-in-out infinite 1s; }
        .ticker-track { animation: ticker 25s linear infinite; display:flex; width:max-content; }
        .shimmer-text { background: linear-gradient(90deg,#fff 0%,#f59e0b 25%,#fff 50%,#f59e0b 75%,#fff 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 3s linear infinite; }
        .card-glow-green { box-shadow: 0 0 30px rgba(16,185,129,0.4), 0 20px 60px rgba(0,0,0,0.5); }
        .card-glow-violet { box-shadow: 0 0 30px rgba(139,92,246,0.4), 0 20px 60px rgba(0,0,0,0.5); }
        .card-glow-blue   { box-shadow: 0 0 30px rgba(59,130,246,0.4), 0 20px 60px rgba(0,0,0,0.5); }
        .card-glow-gold   { box-shadow: 0 0 30px rgba(245,158,11,0.4), 0 20px 60px rgba(0,0,0,0.5); }
        .card-glow-pink   { box-shadow: 0 0 30px rgba(236,72,153,0.4), 0 20px 60px rgba(0,0,0,0.5); }
        .neon-border-violet { box-shadow: 0 0 0 1px rgba(139,92,246,0.5), 0 0 20px rgba(139,92,246,0.2); }
        .fade-up { animation: fadeSlideUp 0.6s ease both; }
        .count-up { animation: countUp 0.8s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>
      {cards.map((c, i) => (
        <div
          key={i}
          className={`absolute inset-0 rounded-2xl border overflow-hidden ${["float-a","float-b","float-c"][i]}`}
          style={{
            background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
            borderColor: c.border,
            boxShadow: `0 0 25px ${c.glow}, 0 20px 50px rgba(0,0,0,0.6)`,
            zIndex: c.z,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          <div className="relative h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="text-6xl leading-none">{c.emoji}</div>
            <div className="text-white font-black text-2xl sm:text-3xl leading-none">{c.amount}</div>
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: c.border }}>{c.label}</div>
            <div className="mt-1 px-4 py-1.5 rounded-full text-xs font-black text-black"
                 style={{ background: c.border }}>ENTER NOW</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── GAME CARD ─────────────────────────────────────────────────── */
function GameCard({ game, onPlay }: { game: Game; onPlay: () => void }) {
  const pct = game.tokenThreshold > 0 ? Math.min((game.tokensCollected / game.tokenThreshold) * 100, 100) : 0;
  const remaining = Math.max(game.tokenThreshold - game.tokensCollected, 0);
  const isHot = pct >= 80;
  const isAlmost = pct >= 95;

  return (
    <div
      onClick={onPlay}
      className="group relative bg-[#0e0d1f] border border-white/8 rounded-2xl overflow-hidden cursor-pointer hover:border-violet-500/40 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
      style={{ boxShadow: isHot ? "0 0 25px rgba(139,92,246,0.2)" : "0 4px 30px rgba(0,0,0,0.4)" }}
    >
      {/* Top accent strip */}
      <div className={`h-0.5 w-full ${isAlmost ? "bg-gradient-to-r from-red-500 via-orange-400 to-red-500" : isHot ? "bg-gradient-to-r from-orange-500 to-amber-400" : "bg-gradient-to-r from-violet-600 to-purple-500"}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="flex items-center space-x-1 bg-green-500/15 border border-green-500/30 text-green-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
                <span>LIVE</span>
              </span>
              <span className="text-gray-600 text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded-full">{game.code}</span>
            </div>
            <h3 className="text-white font-black text-lg leading-tight truncate">{game.name}</h3>
            {game.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{game.description}</p>}
          </div>
          <div className="shrink-0 text-right">
            <div className="text-yellow-400 font-black text-xl leading-none">${game.prizeValue}</div>
            <div className="text-gray-600 text-xs">prize value</div>
          </div>
        </div>

        {/* Prize image */}
        {game.prizeImageUrl ? (
          <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 mb-4 flex items-center justify-center border border-white/5 group-hover:border-violet-500/20 transition-colors">
            <img src={game.prizeImageUrl} alt={game.name} className="h-full w-full object-contain p-3 drop-shadow-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ) : (
          <div className="h-24 rounded-xl bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-500/10 mb-4 flex items-center justify-center">
            <span className="text-5xl">🎁</span>
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">{game.tokensCollected.toLocaleString()} tokens collected</span>
            <span className={`font-bold ${isAlmost ? "text-red-400" : isHot ? "text-orange-400" : "text-violet-400"}`}>
              {Math.round(pct)}%
            </span>
          </div>
          <div className="relative h-3 bg-white/6 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 relative overflow-hidden ${
                isAlmost ? "bg-gradient-to-r from-red-600 to-orange-500" :
                isHot    ? "bg-gradient-to-r from-orange-500 to-amber-400" :
                           "bg-gradient-to-r from-violet-600 to-purple-400"
              }`}
              style={{ width: `${pct}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>{remaining.toLocaleString()} tokens until winner</span>
            <span>{game.tokenThreshold.toLocaleString()} goal</span>
          </div>
        </div>

        {/* Cost + CTA */}
        <div className="flex items-center justify-between bg-white/3 border border-white/6 rounded-xl px-3 py-2 mb-3">
          <div className="flex items-center space-x-1.5">
            <Coins className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-gray-400 text-xs">Each spin</span>
          </div>
          <span className="text-yellow-300 font-black text-sm">{game.tokensPerPlay} TOKENS</span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
          className="w-full py-3 rounded-xl font-black text-sm transition-all duration-200 group-hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #9333ea)",
            boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            color: "white",
          }}
        >
          <Zap className="h-4 w-4 inline mr-1.5 -mt-0.5" />
          SPIN NOW — {game.tokensPerPlay} TOKENS
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────── */
export default function HomePage() {
  const [, setLocation] = useLocation();
  const [winnerTick, setWinnerTick] = useState(0);

  const { data: user }      = useQuery<any>({ queryKey: ["/api/user"] });
  const { data: tokenData } = useQuery<{ tokenBalance: number }>({ queryKey: ["/api/user/token-balance"], refetchInterval: 15000 });
  const { data: games, isLoading } = useQuery<Game[]>({ queryKey: ["/api/games"], refetchInterval: 20000 });

  const activeGames  = games?.filter((g) => g.isActive) ?? [];
  const tokenBalance = tokenData?.tokenBalance ?? 0;
  const username     = (user as any)?.username ?? (user as any)?.email?.split("@")[0] ?? "Player";
  const avatarLetter = username[0]?.toUpperCase() ?? "P";

  useEffect(() => {
    const t = setInterval(() => setWinnerTick((p) => (p + 1) % LIVE_WINNERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#060611] text-white overflow-x-hidden">

      {/* ── LIVE TICKER ─────────────────────────────────────────── */}
      <div className="bg-[#0a0918] border-b border-violet-500/10 py-2 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0918] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0918] to-transparent z-10" />
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center space-x-2 mx-8 text-sm text-gray-300 font-medium whitespace-nowrap">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#060611]/95 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <img src={logoPath} alt="Prize Plugz" className="h-11 sm:h-13 w-auto object-contain shrink-0" />

          <div className="hidden md:flex items-center space-x-1 bg-[#0e0d1f] border border-white/6 rounded-full p-1">
            {[
              { label: "Home",    path: "/",            icon: Home },
              { label: "Games",   path: "/games",       icon: Gamepad2 },
              { label: "My Entries", path: "/my-numbers", icon: Hash },
              { label: "Transactions", path: "/transactions", icon: CreditCard },
            ].map(({ label, path, icon: Icon }) => (
              <button key={label} onClick={() => setLocation(path)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  path === "/" ? "bg-violet-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}>
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center space-x-1.5 bg-[#13122a] border border-yellow-500/25 rounded-full px-3 py-2 cursor-pointer hover:border-yellow-400/50 transition-colors"
                 onClick={() => setLocation("/tokens")}
                 style={{ boxShadow: "0 0 15px rgba(245,158,11,0.15)" }}>
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-300 font-black text-sm">{tokenBalance}</span>
              <span className="text-yellow-600 text-xs font-medium hidden sm:inline">tokens</span>
            </div>

            <button onClick={() => setLocation("/tokens")}
              className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs px-4 py-2 rounded-full transition-all hover:scale-105 shadow-lg"
              style={{ boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}>
              <span>+ Add Tokens</span>
            </button>

            <div className="relative cursor-pointer p-2 bg-[#13122a] border border-white/8 rounded-full hover:bg-white/8 transition">
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center">3</span>
            </div>

            <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => setLocation("/dashboard")}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-black text-sm border-2 border-violet-400/30 group-hover:border-violet-400/60 transition-all shadow-lg"
                   style={{ boxShadow: "0 0 15px rgba(139,92,246,0.3)" }}>
                {avatarLetter}
              </div>
              <div className="hidden lg:block">
                <p className="text-gray-500 text-[10px] leading-none">Welcome back,</p>
                <p className="text-white font-black text-sm leading-none flex items-center gap-1">
                  {username} <Crown className="h-3.5 w-3.5 text-yellow-400" />
                </p>
              </div>
            </div>

            <button onClick={() => logout()} className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/8 rounded-full transition">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-12 sm:py-20 px-4 sm:px-6">
        {/* Ambient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0b25] via-[#0a0918] to-[#060611]" />
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-violet-600/8 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-2/3 bg-gradient-to-tr from-purple-900/15 to-transparent" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.08) 0%, transparent 50%)" }} />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">

            {/* Left: Headline */}
            <div className="lg:col-span-3 space-y-7">
              {/* Live pill */}
              <div className="inline-flex items-center space-x-3 bg-green-500/10 border border-green-500/25 rounded-full px-4 py-2">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-300 font-bold text-sm">LIVE NOW</span>
                </span>
                <span className="text-gray-500 text-sm">·</span>
                <span className="text-gray-300 text-sm font-medium">
                  <span className="text-white font-bold">12,458</span> players online
                </span>
              </div>

              {/* Main headline */}
              <div className="space-y-1">
                <h1 className="font-black leading-[0.88] tracking-tight">
                  <span className="block text-white" style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)" }}>REAL PRIZES.</span>
                  <span className="block text-white" style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)" }}>REAL WINNERS.</span>
                  <span className="block shimmer-text" style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)" }}>EVERY DAY.</span>
                </h1>
              </div>

              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                Spend tokens, watch the jackpot fill up, and win 
                <span className="text-white font-semibold"> real cash and prizes</span>.
                No numbers. No luck involved. Just pure, transparent giveaways.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => activeGames[0] ? setLocation(`/game/${activeGames[0].id}`) : setLocation("/games")}
                  className="group relative overflow-hidden text-black font-black text-base px-8 py-6 rounded-2xl transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 0 30px rgba(245,158,11,0.4), 0 10px 40px rgba(245,158,11,0.2)" }}
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                  <Zap className="h-5 w-5 mr-2 inline -mt-0.5" />
                  SPIN NOW
                </Button>
                <Button
                  onClick={() => setLocation("/how-to-play")}
                  variant="outline"
                  className="border-2 border-white/15 text-white hover:bg-white/6 hover:border-white/30 font-bold text-base px-7 py-6 rounded-2xl transition-all"
                >
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  HOW IT WORKS
                </Button>
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: "🏆", text: "$127K+ Paid Out" },
                  { icon: "⚡", text: "Instant Results" },
                  { icon: "🔒", text: "100% Transparent" },
                  { icon: "🎯", text: "Auto Winner Selection" },
                ].map(({ icon, text }) => (
                  <span key={text} className="flex items-center space-x-1.5 bg-white/4 border border-white/8 rounded-full px-3 py-1.5 text-xs text-gray-400 font-medium">
                    <span>{icon}</span><span>{text}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Prize showcase */}
            <div className="lg:col-span-2 flex flex-col items-center space-y-6">
              <PrizeShowcase />
              {/* Token CTA box */}
              <div className="w-full max-w-xs bg-[#0e0d1f] border border-white/8 rounded-2xl p-4"
                   style={{ boxShadow: "0 0 30px rgba(139,92,246,0.1)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">Your Token Balance</span>
                  <span className="text-yellow-300 font-black text-xl flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-yellow-400" /> {tokenBalance}
                  </span>
                </div>
                <button onClick={() => setLocation("/tokens")}
                  className="w-full py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
                  + Buy More Tokens
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS ROW ───────────────────────────────────────────── */}
      <section className="relative border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b25]/80 to-[#0a0918]/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/5">
            {[
              { icon: Trophy,     color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Total Prizes Paid",  val: "$127,250" },
              { icon: Users,      color: "#10b981", bg: "rgba(16,185,129,0.1)",  label: "Active Players",     val: "12,458" },
              { icon: Gamepad2,   color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", label: "Games Completed",    val: "98,623" },
              { icon: Gift,       color: "#ec4899", bg: "rgba(236,72,153,0.1)", label: "Prizes Won Today",   val: "583" },
            ].map(({ icon: Icon, color, bg, label, val }) => (
              <div key={label} className="px-6 sm:px-8 py-6 flex items-center space-x-4">
                <div className="p-3 rounded-2xl shrink-0" style={{ background: bg }}>
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <div>
                  <p className="font-black text-2xl sm:text-3xl text-white leading-none count-up" style={{ color }}>{val}</p>
                  <p className="text-gray-500 text-xs mt-1 font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE GAMES ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/15 rounded-xl border border-red-500/20">
              <Flame className="h-5 w-5 text-red-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl leading-none">Live Games</h2>
              <p className="text-gray-500 text-sm mt-0.5">{activeGames.length} active right now</p>
            </div>
          </div>
          <button onClick={() => setLocation("/games")}
            className="flex items-center space-x-1.5 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
            <span>View All</span><ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="h-72 bg-[#0e0d1f] rounded-2xl border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : activeGames.length === 0 ? (
          <div className="text-center py-16 bg-[#0e0d1f] border border-white/5 rounded-2xl">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-white font-black text-xl mb-2">No Live Games Right Now</h3>
            <p className="text-gray-500 mb-5 max-w-md mx-auto text-sm">New games launch regularly. Get your tokens ready and be first to play!</p>
            <Button onClick={() => setLocation("/tokens")} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-6 py-3 rounded-xl">
              <Coins className="h-4 w-4 mr-2" /> Get Tokens
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeGames.map((g) => (
              <GameCard key={g.id} game={g} onPlay={() => setLocation(`/game/${g.id}`)} />
            ))}
          </div>
        )}
      </section>

      {/* ── FEATURED PRIZES ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-violet-500/15 rounded-xl border border-violet-500/20">
              <Gift className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl leading-none">Featured Prizes</h2>
              <p className="text-gray-500 text-sm mt-0.5">Current and upcoming prizes</p>
            </div>
          </div>
          <button onClick={() => setLocation("/games")}
            className="flex items-center space-x-1.5 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
            <span>View All</span><ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Real game prizes first */}
          {activeGames.slice(0, 2).map((g) => (
            <div key={g.id} onClick={() => setLocation(`/game/${g.id}`)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #1e1b4b, #2d1b69)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 20px rgba(139,92,246,0.15)" }}>
              <div className="absolute top-2 left-2 z-10 flex items-center space-x-1 bg-green-500/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span>LIVE</span>
              </div>
              <div className="h-28 flex items-center justify-center p-3 bg-gradient-to-br from-violet-900/40 to-purple-900/40">
                {g.prizeImageUrl
                  ? <img src={g.prizeImageUrl} alt={g.name} className="h-20 w-full object-contain drop-shadow-xl" />
                  : <span className="text-5xl">🏆</span>
                }
              </div>
              <div className="p-3" style={{ background: "rgba(0,0,0,0.4)" }}>
                <p className="text-violet-300 text-[10px] font-black uppercase truncate">{g.code}</p>
                <p className="text-white font-black text-base leading-tight truncate">${g.prizeValue}</p>
                <p className="text-gray-500 text-xs truncate">{g.name}</p>
                <div className="mt-2 w-full py-2 rounded-xl font-black text-[11px] text-black text-center"
                     style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>
                  ENTER NOW
                </div>
              </div>
            </div>
          ))}

          {/* Dummy prizes */}
          {FEATURED_PRIZES.slice(0, Math.max(5 - Math.min(activeGames.length, 2), 3)).map((p, pi) => (
            <div key={`dummy-${pi}`} onClick={() => setLocation("/games")}
              className="group rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200"
              style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})`, border: `1px solid ${p.border}40`, boxShadow: `0 0 15px ${p.glow}` }}>
              <div className="h-28 flex items-center justify-center bg-black/20">
                <span className="text-5xl leading-none">{p.emoji}</span>
              </div>
              <div className="p-3" style={{ background: "rgba(0,0,0,0.4)" }}>
                <p className="text-[10px] font-black uppercase" style={{ color: p.border }}>{p.tag}</p>
                <p className="text-white font-black text-sm leading-tight">{p.title}</p>
                <p className="text-gray-500 text-[10px] truncate">{p.sub}</p>
                <div className="mt-2 w-full py-2 rounded-xl font-black text-[11px] text-black text-center"
                     style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>
                  ENTER NOW
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE WINNERS + HOW IT WORKS ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Live Winners (3 cols) */}
          <div className="lg:col-span-3 bg-[#0e0d1f] border border-white/6 rounded-2xl overflow-hidden"
               style={{ boxShadow: "0 0 30px rgba(16,185,129,0.05)" }}>
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-orange-500/15 rounded-lg border border-orange-500/20">
                  <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
                </div>
                <h3 className="text-white font-black text-lg">Live Winners</h3>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs font-semibold">Live</span>
              </div>
            </div>
            <div className="divide-y divide-white/4">
              {LIVE_WINNERS.map((w, i) => (
                <div key={i}
                     className={`flex items-center space-x-4 px-5 py-4 hover:bg-white/2 transition-colors ${i === winnerTick ? "bg-green-500/4" : ""}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-white shrink-0 border-2"
                       style={{ background: `linear-gradient(135deg, ${w.color}40, ${w.color}80)`, borderColor: `${w.color}50` }}>
                    {w.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-bold text-sm truncate">{w.name}</p>
                      {i === 0 && <span className="text-[9px] font-black bg-green-500/20 text-green-300 border border-green-500/30 px-1.5 py-0.5 rounded-full">NEW</span>}
                    </div>
                    <p className="text-gray-500 text-xs">{w.type} · {w.ago}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-lg leading-none" style={{ color: w.color }}>{w.prize}</p>
                    <p className="text-gray-600 text-xs mt-0.5">Just won</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-white/5">
              <button onClick={() => setLocation("/dashboard")}
                className="w-full flex items-center justify-center space-x-2 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors py-1">
                <span>View All Winners</span><ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* How It Works (2 cols) */}
          <div className="lg:col-span-2 bg-[#0e0d1f] border border-white/6 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-violet-500/15 rounded-lg border border-violet-500/20">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                </div>
                <h3 className="text-white font-black text-lg">How It Works</h3>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {HOW_IT_WORKS.map(({ step, icon: Icon, color, label, desc }) => (
                <div key={step} className="flex items-start space-x-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white relative"
                       style={{ background: `linear-gradient(135deg, ${color}40, ${color}80)`, border: `1px solid ${color}50` }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#060611] border border-white/10 text-[10px] font-black text-gray-400 flex items-center justify-center">
                      {step}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{label}</p>
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROMO BANNERS ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 2X */}
          <div className="relative overflow-hidden rounded-2xl p-6 flex items-center space-x-5"
               style={{ background: "linear-gradient(135deg, #1e1b4b, #2d1b69)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 30px rgba(139,92,246,0.1)" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent" />
            <div className="shrink-0 relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center border border-violet-400/30"
                   style={{ boxShadow: "0 0 25px rgba(139,92,246,0.5)" }}>
                <span className="font-black text-3xl text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>2X</span>
              </div>
            </div>
            <div className="relative flex-1">
              <p className="text-yellow-400 font-black text-xl leading-tight">DOUBLE YOUR ENTRIES!</p>
              <p className="text-gray-400 text-sm mt-1.5 leading-snug">Verify your account and earn 2X entries in every game you play.</p>
              <button onClick={() => setLocation("/dashboard")}
                className="mt-3 inline-flex items-center space-x-1.5 font-black text-sm text-black px-5 py-2.5 rounded-xl hover:scale-105 transition-all"
                style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 0 15px rgba(245,158,11,0.3)" }}>
                <span>CLAIM BONUS</span><ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Safe */}
          <div className="relative overflow-hidden rounded-2xl p-6 flex items-center space-x-5"
               style={{ background: "linear-gradient(135deg, #022c22, #064e3b)", border: "1px solid rgba(16,185,129,0.25)", boxShadow: "0 0 30px rgba(16,185,129,0.08)" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent" />
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-700 to-emerald-800 flex items-center justify-center border border-green-500/30"
                   style={{ boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}>
                <span className="font-black text-green-300 text-2xl leading-none text-center">100<br /><span className="text-base">%</span></span>
              </div>
            </div>
            <div className="relative flex-1">
              <p className="text-white font-black text-xl leading-tight">SAFE & SECURE</p>
              <div className="mt-2 space-y-1.5">
                {["Secure Payments","Instant Payouts","Trusted by Thousands"].map((t) => (
                  <div key={t} className="flex items-center space-x-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
                    <span className="text-gray-300 text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 md:pb-10">
        <div className="rounded-2xl overflow-hidden border border-white/5"
             style={{ background: "linear-gradient(135deg, #0e0d1f, #0a0918)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            {[
              { icon: Star,   color: "#f59e0b", bg: "rgba(245,158,11,0.1)", title: "4.8/5 Stars", sub: "From 2,500+ player reviews" },
              { icon: Zap,    color: "#10b981", bg: "rgba(16,185,129,0.1)", title: "Fast Payouts", sub: "Prizes delivered quickly" },
              { icon: Shield, color: "#6366f1", bg: "rgba(99,102,241,0.1)", title: "100% Secure",  sub: "Your data is always protected" },
            ].map(({ icon: Icon, color, bg, title, sub }) => (
              <div key={title} className="flex items-center space-x-4 px-6 py-5">
                <div className="p-3 rounded-xl shrink-0" style={{ background: bg }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-gray-700 text-xs mt-6">© 2025 Prize Plugz. All rights reserved. · <button onClick={() => setLocation("/terms")} className="hover:text-gray-500">Terms</button> · <button onClick={() => setLocation("/privacy")} className="hover:text-gray-500">Privacy</button></p>
      </section>

      {/* ── MOBILE NAV ──────────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden bg-[#0a0918]/98 backdrop-blur-2xl border-t border-white/8 z-50 flex items-center justify-around px-1 py-2">
        {[
          { icon: Home,       label: "Home",    path: "/",             active: true },
          { icon: Gamepad2,   label: "Games",   path: "/games" },
          { icon: DollarSign, label: "Tokens",  path: "/tokens" },
          { icon: Gift,       label: "Prizes",  path: "/games" },
          { icon: Trophy,     label: "Winners", path: "/dashboard" },
          { icon: Bell,       label: "Alerts",  path: "/dashboard",   badge: 3 },
          { icon: User,       label: "Account", path: "/dashboard" },
        ].map(({ icon: Icon, label, path, active, badge }) => (
          <button key={label} onClick={() => setLocation(path)}
            className={`relative flex flex-col items-center space-y-0.5 px-2 py-1.5 rounded-xl transition-all ${active ? "text-violet-400" : "text-gray-600 hover:text-gray-400"}`}>
            <Icon className="h-5 w-5" />
            {badge && (
              <span className="absolute -top-1 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[8px] font-black flex items-center justify-center text-white">
                {badge}
              </span>
            )}
            <span className="text-[9px] font-semibold leading-none">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
