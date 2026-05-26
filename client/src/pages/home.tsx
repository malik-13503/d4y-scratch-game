import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Zap, Trophy, Gift, Users, Shield, CheckCircle,
  Star, Crown, Flame, Bell, LogOut, Coins,
  ArrowRight, ChevronRight, Gamepad2, DollarSign,
  Home, User, BarChart3, Lock, Timer,
  Sparkles, Play, Hash, CreditCard, TrendingUp,
} from "lucide-react";
import { logout } from "@/lib/auth";
import type { Game } from "@shared/schema";
import logoPath from "@assets/logo_1777237644041.png";

/* ─── CSS ──────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @keyframes ticker    { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes floatY    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes floatY2   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes shimmer   { 0%{background-position:-400% center} 100%{background-position:400% center} }
  @keyframes pulseRing { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.5);opacity:0} }
  @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scanLine  { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
  @keyframes borderGlow{ 0%,100%{opacity:0.4} 50%{opacity:1} }

  .ticker-wrap  { overflow:hidden; position:relative; }
  .ticker-inner { animation: ticker 28s linear infinite; display:flex; width:max-content; white-space:nowrap; }

  .shimmer-gold {
    background: linear-gradient(90deg, #fff 0%, #fbbf24 20%, #f97316 40%, #fbbf24 60%, #fff 80%);
    background-size: 400% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 4s linear infinite;
  }
  .grad-shift {
    background: linear-gradient(270deg,#7c3aed,#9333ea,#ec4899,#7c3aed);
    background-size: 400% 400%;
    animation: gradShift 6s ease infinite;
  }
  .float-1 { animation: floatY  4s ease-in-out infinite; }
  .float-2 { animation: floatY2 5s ease-in-out infinite 0.8s; }
  .float-3 { animation: floatY  3.5s ease-in-out infinite 1.6s; }
  .fade-up  { animation: fadeUp  0.7s ease both; }

  .card-shine::before {
    content:'';
    position:absolute;
    top:-50%;left:-50%;width:30%;height:200%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);
    transform:skewX(-20deg);
    animation: scanLine 3s linear infinite;
  }
  .glow-gold  { box-shadow: 0 0 30px rgba(251,191,36,0.35), 0 0 80px rgba(249,115,22,0.15); }
  .glow-violet{ box-shadow: 0 0 30px rgba(124,58,237,0.4),  0 0 70px rgba(139,92,246,0.15); }
  .glow-green { box-shadow: 0 0 30px rgba(16,185,129,0.4),  0 0 70px rgba(16,185,129,0.1); }
  .glow-pink  { box-shadow: 0 0 30px rgba(236,72,153,0.4),  0 0 60px rgba(236,72,153,0.1); }
  .glow-blue  { box-shadow: 0 0 30px rgba(59,130,246,0.4),  0 0 60px rgba(59,130,246,0.1); }

  .prize-card {
    position:relative;
    overflow:hidden;
    border-radius:20px;
    cursor:pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .prize-card:hover { transform: translateY(-6px) scale(1.03); }

  .progress-bar-inner {
    position:relative;
    overflow:hidden;
    border-radius:999px;
  }
  .progress-bar-inner::after {
    content:'';
    position:absolute;
    inset:0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    animation: shimmer 2s linear infinite;
    background-size: 200% auto;
  }
  .pulse-dot::after {
    content:'';
    position:absolute;
    inset:-3px;
    border-radius:50%;
    border:2px solid #4ade80;
    animation: pulseRing 1.4s ease-out infinite;
  }
`;

/* ─── DUMMY DATA ────────────────────────────────────────────────────────── */
const TICKER = [
  "🏆 PlugzKing just won $750 Cash!",
  "🎮 SpinMaster claimed a PS5 Console!",
  "💵 LuckyAce hit the $1,000 jackpot!",
  "📺 WinnerBoss won a 65\" 4K Smart TV!",
  "🎁 TokenPro snagged the VIP Gift Pack!",
  "💰 JackAce cashed out $500!",
  "🔥 PrizePro won $350 Cash Prize!",
];

const WINNERS = [
  { name:"PlugzKing",  prize:"$750",   label:"Cash Prize",   color:"#10b981", icon:"💵", ago:"Just now",  hot:true },
  { name:"SpinMaster", prize:"PS5",    label:"PlayStation 5",color:"#6366f1", icon:"🎮", ago:"2 min ago",  hot:false },
  { name:"LuckyAce",   prize:"$1,000", label:"Cash Prize",   color:"#f59e0b", icon:"💵", ago:"5 min ago",  hot:false },
  { name:"WinnerBoss", prize:"$500",   label:"Cash Prize",   color:"#10b981", icon:"💵", ago:"8 min ago",  hot:false },
  { name:"JackAce",    prize:"65\" TV",label:"Smart TV",     color:"#8b5cf6", icon:"📺", ago:"12 min ago", hot:false },
  { name:"TokenKing",  prize:"$250",   label:"Cash Prize",   color:"#10b981", icon:"💵", ago:"15 min ago", hot:false },
];

const PRIZES = [
  { emoji:"💵", tag:"CASH",  title:"$500",          sub:"Cash Prize",     grad:"linear-gradient(145deg,#052e16,#14532d)", border:"#22c55e", glow:"rgba(34,197,94,0.5)" },
  { emoji:"💵", tag:"CASH",  title:"$250",          sub:"Cash Prize",     grad:"linear-gradient(145deg,#052e16,#166534)", border:"#16a34a", glow:"rgba(22,163,74,0.4)" },
  { emoji:"🎮", tag:"PS5",   title:"PlayStation 5", sub:"Gaming Console", grad:"linear-gradient(145deg,#0f172a,#1e1b4b)", border:"#818cf8", glow:"rgba(129,140,248,0.5)" },
  { emoji:"📺", tag:"65\" TV",title:"Smart TV",     sub:"4K UHD Display", grad:"linear-gradient(145deg,#0c0a24,#2e1065)", border:"#a855f7", glow:"rgba(168,85,247,0.5)" },
  { emoji:"🎁", tag:"VIP",   title:"VIP Bundle",    sub:"Cash+Gift Cards", grad:"linear-gradient(145deg,#1c0a00,#431407)", border:"#f97316", glow:"rgba(249,115,22,0.5)" },
];

const STATS = [
  { icon:Trophy,   color:"#f59e0b", bg:"rgba(245,158,11,0.12)", label:"Total Prizes Paid",  val:"$127,250" },
  { icon:Users,    color:"#10b981", bg:"rgba(16,185,129,0.12)", label:"Active Players",     val:"12,458" },
  { icon:Gamepad2, color:"#8b5cf6", bg:"rgba(139,92,246,0.12)", label:"Games Completed",   val:"98,623" },
  { icon:Gift,     color:"#ec4899", bg:"rgba(236,72,153,0.12)", label:"Prizes Won Today",  val:"583" },
];

/* ─── FEATURED PRIZE VISUAL ─────────────────────────────────────────────── */
function HeroPrizeDisplay({ games, onPlay }: { games: Game[]; onPlay: (id: number) => void }) {
  const [active, setActive] = useState(0);
  const featured = games[active];

  useEffect(() => {
    if (games.length <= 1) return;
    const t = setInterval(() => setActive(p => (p + 1) % games.length), 5000);
    return () => clearInterval(t);
  }, [games.length]);

  if (!featured) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
        {PRIZES.slice(0, 3).map((p, i) => (
          <div key={i} className={`w-full max-w-xs prize-card ${["float-1","float-2","float-3"][i]}`}
               style={{ background: p.grad, border:`1px solid ${p.border}60`, boxShadow:`0 0 25px ${p.glow}`, padding:"20px" }}>
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{p.emoji}</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest" style={{color:p.border}}>{p.tag}</p>
                <p className="text-white font-black text-xl leading-tight">{p.title}</p>
                <p className="text-gray-400 text-xs">{p.sub}</p>
              </div>
              <div className="ml-auto px-3 py-1.5 rounded-lg font-black text-xs text-black"
                   style={{background:`linear-gradient(135deg,#f59e0b,#f97316)`}}>ENTER</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const pct = featured.tokenThreshold > 0 ? Math.min((featured.tokensCollected / featured.tokenThreshold) * 100, 100) : 0;
  const remaining = Math.max(featured.tokenThreshold - featured.tokensCollected, 0);

  return (
    <div className="w-full">
      {/* Game selector tabs */}
      {games.length > 1 && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {games.map((g, i) => (
            <button key={g.id} onClick={() => setActive(i)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${active===i?"text-white":"text-gray-500 hover:text-gray-300"}`}
              style={active===i ? {background:"linear-gradient(135deg,#7c3aed,#9333ea)",boxShadow:"0 0 15px rgba(124,58,237,0.4)"} : {background:"rgba(255,255,255,0.05)"}}>
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* Main featured card */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/25"
           style={{background:"linear-gradient(145deg,#13112a,#1c1538)", boxShadow:"0 0 50px rgba(124,58,237,0.25),0 20px 60px rgba(0,0,0,0.6)"}}>
        {/* Scanning shimmer */}
        <div className="absolute inset-0 card-shine pointer-events-none" />

        {/* Live badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-1.5 bg-green-500/20 border border-green-500/40 rounded-full px-3 py-1">
          <span className="relative w-2 h-2">
            <span className="absolute inset-0 bg-green-400 rounded-full animate-pulse" />
          </span>
          <span className="text-green-300 text-xs font-black">LIVE NOW</span>
        </div>

        {/* Prize image */}
        <div className="relative h-44 sm:h-52 bg-gradient-to-br from-violet-900/50 to-purple-950/50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-pink-600/10" />
          {featured.prizeImageUrl
            ? <img src={featured.prizeImageUrl} alt={featured.name} className="h-full w-full object-contain p-4 drop-shadow-2xl relative z-10" />
            : <span className="text-8xl relative z-10">🏆</span>
          }
          {/* Bottom fade */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#13112a] to-transparent" />
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-white font-black text-xl leading-tight">{featured.name}</p>
              {featured.description && <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{featured.description}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-yellow-400 font-black text-2xl leading-none">${featured.prizeValue}</p>
              <p className="text-gray-600 text-xs">prize</p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400">{featured.tokensCollected.toLocaleString()} / {featured.tokenThreshold.toLocaleString()} tokens</span>
              <span className={`font-bold ${pct>=95?"text-red-400":pct>=80?"text-orange-400":"text-violet-400"}`}>{Math.round(pct)}%</span>
            </div>
            <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
              <div className="progress-bar-inner h-full rounded-full"
                   style={{width:`${pct}%`, background: pct>=95?"linear-gradient(90deg,#ef4444,#f97316)":pct>=80?"linear-gradient(90deg,#f97316,#fbbf24)":"linear-gradient(90deg,#7c3aed,#a855f7)"}} />
            </div>
            <p className="text-gray-600 text-xs mt-1">{remaining.toLocaleString()} tokens until winner!</p>
          </div>

          <button onClick={() => onPlay(featured.id)}
            className="w-full py-3.5 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02] glow-gold"
            style={{background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>
            <Zap className="h-4 w-4 inline mr-1.5 -mt-0.5 text-black" />
            <span className="text-black">SPIN NOW — {featured.tokensPerPlay} TOKENS</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── GAME CARD ─────────────────────────────────────────────────────────── */
function GameCard({ game, onPlay }: { game: Game; onPlay: () => void }) {
  const pct = game.tokenThreshold > 0 ? Math.min((game.tokensCollected / game.tokenThreshold) * 100, 100) : 0;
  const remaining = Math.max(game.tokenThreshold - game.tokensCollected, 0);
  const isHot = pct >= 80, isAlmost = pct >= 95;
  const barColor = isAlmost ? "linear-gradient(90deg,#ef4444,#f97316)" : isHot ? "linear-gradient(90deg,#f97316,#fbbf24)" : "linear-gradient(90deg,#7c3aed,#a855f7)";
  const borderColor = isAlmost ? "rgba(239,68,68,0.4)" : isHot ? "rgba(249,115,22,0.4)" : "rgba(124,58,237,0.3)";

  return (
    <div onClick={onPlay} className="prize-card" style={{background:"linear-gradient(145deg,#0e0c22,#160f2e)",border:`1px solid ${borderColor}`,boxShadow:`0 4px 30px rgba(0,0,0,0.5),0 0 20px ${isAlmost?"rgba(239,68,68,0.15)":isHot?"rgba(249,115,22,0.15)":"rgba(124,58,237,0.1)"}`}}>
      <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl" style={{background:barColor}} />
      <div className="card-shine pointer-events-none" />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="flex items-center gap-1 bg-green-500/15 border border-green-500/30 text-green-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />LIVE
              </span>
              {isAlmost && <span className="text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full animate-pulse">🔥 ALMOST FULL</span>}
              {isHot && !isAlmost && <span className="text-[10px] font-black bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full">⚡ HOT</span>}
            </div>
            <h3 className="text-white font-black text-lg leading-tight">{game.name}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-yellow-400 font-black text-xl">${game.prizeValue}</p>
            <p className="text-gray-600 text-xs">prize</p>
          </div>
        </div>

        {game.prizeImageUrl
          ? <div className="relative h-32 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-white/5">
              <img src={game.prizeImageUrl} alt={game.name} className="h-full w-full object-contain p-2 drop-shadow-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          : <div className="h-24 rounded-xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-violet-500/10 mb-4 flex items-center justify-center">
              <span className="text-5xl">🎁</span>
            </div>
        }

        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">{game.tokensCollected.toLocaleString()} collected</span>
            <span className={`font-bold ${isAlmost?"text-red-400":isHot?"text-orange-400":"text-violet-400"}`}>{Math.round(pct)}%</span>
          </div>
          <div className="h-3 bg-white/6 rounded-full overflow-hidden">
            <div className="progress-bar-inner h-full rounded-full" style={{width:`${pct}%`,background:barColor}} />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>{remaining.toLocaleString()} tokens left</span>
            <span>{game.tokenThreshold.toLocaleString()} goal</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/4 border border-white/6 rounded-xl px-3 py-2 mb-3">
          <span className="text-gray-400 text-xs flex items-center gap-1.5"><Coins className="h-3.5 w-3.5 text-yellow-400" />Each spin</span>
          <span className="text-yellow-300 font-black text-sm">{game.tokensPerPlay} TOKENS</span>
        </div>

        <button onClick={e=>{e.stopPropagation();onPlay();}} className="w-full py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02]"
          style={{background:"linear-gradient(135deg,#7c3aed,#9333ea)",boxShadow:"0 4px 20px rgba(124,58,237,0.4)"}}>
          <Zap className="h-4 w-4 inline mr-1.5 -mt-0.5" />SPIN NOW
        </button>
      </div>
    </div>
  );
}

/* ─── PAGE ──────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [, setLocation] = useLocation();
  const [winnerIdx, setWinnerIdx]   = useState(0);

  const { data: user }      = useQuery<any>({ queryKey: ["/api/user"] });
  const { data: tokenData } = useQuery<{ tokenBalance: number }>({ queryKey: ["/api/user/token-balance"], refetchInterval: 15000 });
  const { data: games, isLoading } = useQuery<Game[]>({ queryKey: ["/api/games"], refetchInterval: 20000 });

  const activeGames  = games?.filter(g => g.isActive) ?? [];
  const tokenBalance = tokenData?.tokenBalance ?? 0;
  const username     = (user as any)?.username ?? (user as any)?.email?.split("@")[0] ?? "Player";
  const avatarLetter = username[0]?.toUpperCase() ?? "P";

  useEffect(() => {
    const t = setInterval(() => setWinnerIdx(p => (p+1) % WINNERS.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{background:"#07060f"}}>
      <style>{GLOBAL_CSS}</style>

      {/* ── LIVE TICKER ──────────────────────────────────────────────── */}
      <div className="relative border-b border-white/5 overflow-hidden py-2.5" style={{background:"linear-gradient(90deg,#0d0b1e,#110e26,#0d0b1e)"}}>
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10" style={{background:"linear-gradient(90deg,#0d0b1e,transparent)"}} />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10" style={{background:"linear-gradient(270deg,#0d0b1e,transparent)"}} />
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...TICKER,...TICKER].map((item,i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-10 text-sm font-medium whitespace-nowrap" style={{color:"#a78bfa"}}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:"#4ade80"}} />
                <span className="text-gray-200">{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5" style={{background:"rgba(7,6,15,0.97)",backdropFilter:"blur(20px)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <img src={logoPath} alt="Prize Plugz" className="h-11 w-auto object-contain shrink-0" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 rounded-full p-1" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
            {[
              {label:"Home",      path:"/",            icon:Home,       active:true},
              {label:"Games",     path:"/games",       icon:Gamepad2},
              {label:"My Entries",path:"/my-numbers",  icon:Hash},
              {label:"Transactions",path:"/transactions",icon:CreditCard},
            ].map(({label,path,icon:Icon,active}) => (
              <button key={label} onClick={() => setLocation(path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${active?"text-white":"text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
                style={active?{background:"linear-gradient(135deg,#7c3aed,#9333ea)",boxShadow:"0 0 15px rgba(124,58,237,0.4)"}:{}}>
                <Icon className="h-3.5 w-3.5" /><span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Token balance */}
            <button onClick={() => setLocation("/tokens")}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-all hover:scale-105 glow-gold"
              style={{background:"linear-gradient(135deg,rgba(245,158,11,0.15),rgba(249,115,22,0.1))",border:"1px solid rgba(251,191,36,0.3)"}}>
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-300 font-black text-sm">{tokenBalance}</span>
              <span className="text-yellow-600 text-xs hidden sm:inline">tokens</span>
            </button>

            <button onClick={() => setLocation("/tokens")}
              className="hidden sm:flex items-center gap-1.5 text-white font-bold text-xs px-4 py-2 rounded-full transition-all hover:scale-105 glow-violet"
              style={{background:"linear-gradient(135deg,#7c3aed,#9333ea)",border:"1px solid rgba(139,92,246,0.4)"}}>
              <span>+ Add Tokens</span>
            </button>

            <button className="relative p-2 rounded-full transition hover:bg-white/8" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center">3</span>
            </button>

            <button className="flex items-center gap-2 group" onClick={() => setLocation("/dashboard")}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm border-2 glow-violet"
                   style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",borderColor:"rgba(139,92,246,0.4)"}}>
                {avatarLetter}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-gray-500 text-[10px] leading-none">Welcome back,</p>
                <p className="text-white font-black text-sm leading-none flex items-center gap-1">
                  {username}<Crown className="h-3.5 w-3.5 text-yellow-400" />
                </p>
              </div>
            </button>

            <button onClick={() => logout()} className="p-2 text-gray-600 hover:text-red-400 rounded-full transition hover:bg-red-500/8">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{background:"linear-gradient(160deg,#0d0b25 0%,#0a0816 40%,#07060f 100%)"}}>
        {/* BG texture */}
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"radial-gradient(ellipse at 20% 50%,rgba(124,58,237,0.18) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(236,72,153,0.1) 0%,transparent 50%),radial-gradient(ellipse at 70% 80%,rgba(59,130,246,0.08) 0%,transparent 50%)"}} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage:"linear-gradient(rgba(139,92,246,1) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,1) 1px,transparent 1px)",backgroundSize:"80px 80px"}} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-center">

            {/* LEFT */}
            <div className="lg:col-span-3 space-y-7 fade-up">
              {/* Live pill */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full" style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)"}}>
                <span className="flex items-center gap-1.5">
                  <span className="relative w-2 h-2 pulse-dot">
                    <span className="block w-2 h-2 bg-green-400 rounded-full" />
                  </span>
                  <span className="text-green-300 font-bold text-sm">LIVE NOW</span>
                </span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400 text-sm"><span className="text-white font-bold">12,458</span> players online</span>
              </div>

              {/* Headline */}
              <div className="space-y-1">
                {["YOUR NEXT", "BIG WIN", "AWAITS."].map((line, i) => (
                  <div key={i}>
                    {i < 2
                      ? <h1 className="font-black text-white leading-[0.9] tracking-tight" style={{fontSize:"clamp(2.8rem,7vw,5rem)"}}>{line}</h1>
                      : <h1 className="shimmer-gold font-black leading-[0.9] tracking-tight" style={{fontSize:"clamp(2.8rem,7vw,5rem)"}}>{line}</h1>
                    }
                  </div>
                ))}
              </div>

              <p className="text-gray-400 text-base sm:text-lg max-w-lg leading-relaxed">
                Spend tokens, watch the jackpot fill in real-time, and win
                <span className="text-white font-semibold"> real cash and amazing prizes</span>.
                100% transparent. Auto winner selection.
              </p>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => activeGames[0] ? setLocation(`/game/${activeGames[0].id}`) : setLocation("/games")}
                  className="group relative overflow-hidden flex items-center gap-2 font-black text-black px-8 py-4 rounded-2xl transition-all hover:scale-105 glow-gold"
                  style={{background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12" />
                  <Zap className="h-5 w-5" /><span className="text-base">SPIN NOW</span>
                </button>
                <button onClick={() => setLocation("/how-to-play")}
                  className="flex items-center gap-2 font-bold text-gray-300 px-7 py-4 rounded-2xl transition-all hover:text-white hover:bg-white/8"
                  style={{border:"2px solid rgba(255,255,255,0.12)"}}>
                  <Play className="h-4 w-4 fill-current" />HOW IT WORKS
                </button>
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-2">
                {[
                  {e:"🏆",t:"$127K+ Paid Out"},{e:"⚡",t:"Instant Results"},
                  {e:"🔒",t:"100% Transparent"},{e:"🤖",t:"Auto Winner"},
                ].map(({e,t}) => (
                  <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gray-400 font-medium" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
                    <span>{e}</span><span>{t}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT: Prize display */}
            <div className="lg:col-span-2 space-y-4">
              {isLoading
                ? <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{background:"rgba(255,255,255,0.04)"}} />)}
                  </div>
                : <HeroPrizeDisplay games={activeGames} onPlay={id => setLocation(`/game/${id}`)} />
              }

              {/* Token box */}
              <div className="p-4 rounded-2xl" style={{background:"linear-gradient(145deg,#0e0c22,#160f2e)",border:"1px solid rgba(124,58,237,0.2)"}}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm font-medium">Your Token Balance</span>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-300 font-black text-xl">{tokenBalance}</span>
                  </div>
                </div>
                <button onClick={() => setLocation("/tokens")}
                  className="w-full py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02] glow-violet"
                  style={{background:"linear-gradient(135deg,#7c3aed,#9333ea)"}}>
                  + Buy More Tokens
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="border-y border-white/5" style={{background:"linear-gradient(90deg,#0e0c22,#11103a,#0e0c22)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/5">
            {STATS.map(({icon:Icon,color,bg,label,val}) => (
              <div key={label} className="px-6 py-5 flex items-center gap-4 hover:bg-white/2 transition-colors">
                <div className="p-3 rounded-2xl shrink-0" style={{background:bg}}>
                  <Icon className="h-5 w-5" style={{color}} />
                </div>
                <div>
                  <p className="font-black text-2xl leading-none" style={{color}}>{val}</p>
                  <p className="text-gray-500 text-xs mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE GAMES ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.2)"}}>
              <Flame className="h-5 w-5 text-red-400" style={{animation:"pulseRing 1.5s ease-out infinite"}} />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl leading-none">Live Games</h2>
              <p className="text-gray-600 text-sm mt-0.5">{activeGames.length} active right now</p>
            </div>
          </div>
          <button onClick={() => setLocation("/games")} className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
            View All <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {isLoading
          ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => <div key={i} className="h-80 rounded-2xl animate-pulse" style={{background:"rgba(255,255,255,0.04)"}} />)}
            </div>
          : activeGames.length === 0
            ? <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/5" style={{background:"rgba(255,255,255,0.02)"}}>
                <span className="text-6xl mb-4">🎮</span>
                <h3 className="text-white font-black text-xl mb-2">No Live Games Right Now</h3>
                <p className="text-gray-500 text-sm mb-5 text-center max-w-sm">New games launch regularly. Get your tokens ready and be first to play!</p>
                <button onClick={() => setLocation("/tokens")} className="flex items-center gap-2 font-bold text-white px-6 py-3 rounded-xl glow-violet" style={{background:"linear-gradient(135deg,#7c3aed,#9333ea)"}}>
                  <Coins className="h-4 w-4" />Get Tokens
                </button>
              </div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeGames.map(g => <GameCard key={g.id} game={g} onPlay={() => setLocation(`/game/${g.id}`)} />)}
              </div>
        }
      </section>

      {/* ── FEATURED PRIZES ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{background:"rgba(139,92,246,0.12)",border:"1px solid rgba(139,92,246,0.2)"}}>
              <Gift className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl leading-none">Featured Prizes</h2>
              <p className="text-gray-600 text-sm mt-0.5">Current and upcoming prizes</p>
            </div>
          </div>
          <button onClick={() => setLocation("/games")} className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
            View All <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {activeGames.slice(0,2).map(g => (
            <div key={g.id} onClick={() => setLocation(`/game/${g.id}`)}
              className="prize-card" style={{background:"linear-gradient(145deg,#1a1538,#2d1b69)",border:"1px solid rgba(139,92,246,0.35)",boxShadow:"0 0 20px rgba(139,92,246,0.2)"}}>
              <div className="card-shine pointer-events-none" />
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-green-500/80 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE
              </div>
              <div className="h-28 flex items-center justify-center p-3 bg-gradient-to-br from-violet-900/40 to-purple-900/40">
                {g.prizeImageUrl ? <img src={g.prizeImageUrl} alt={g.name} className="h-20 w-full object-contain drop-shadow-xl" /> : <span className="text-5xl">🏆</span>}
              </div>
              <div className="p-3" style={{background:"rgba(0,0,0,0.3)"}}>
                <p className="text-violet-300 text-[10px] font-black uppercase">{g.code}</p>
                <p className="text-white font-black text-base">${g.prizeValue}</p>
                <p className="text-gray-500 text-xs truncate">{g.name}</p>
                <div className="mt-2 w-full py-2 rounded-xl font-black text-[11px] text-black text-center" style={{background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>ENTER NOW</div>
              </div>
            </div>
          ))}
          {PRIZES.slice(0, Math.max(5 - Math.min(activeGames.length,2), 3)).map((p,i) => (
            <div key={`p${i}`} onClick={() => setLocation("/games")}
              className="prize-card" style={{background:p.grad,border:`1px solid ${p.border}50`,boxShadow:`0 0 20px ${p.glow}`}}>
              <div className="card-shine pointer-events-none" />
              <div className="h-28 flex items-center justify-center bg-black/15">
                <span className="text-5xl">{p.emoji}</span>
              </div>
              <div className="p-3" style={{background:"rgba(0,0,0,0.35)"}}>
                <p className="text-[10px] font-black uppercase" style={{color:p.border}}>{p.tag}</p>
                <p className="text-white font-black text-sm leading-tight">{p.title}</p>
                <p className="text-gray-500 text-xs">{p.sub}</p>
                <div className="mt-2 w-full py-2 rounded-xl font-black text-[11px] text-black text-center" style={{background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>ENTER NOW</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE WINNERS + HOW IT WORKS ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Winners */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden" style={{background:"linear-gradient(145deg,#0e0c22,#130f28)",border:"1px solid rgba(255,255,255,0.06)"}}>
            <div className="px-5 py-4 flex items-center justify-between" style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div className="flex items-center gap-2.5">
                <Flame className="h-5 w-5 text-orange-400 animate-pulse" />
                <h3 className="text-white font-black text-lg">Live Winners</h3>
              </div>
              <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />Live
              </span>
            </div>
            <div>
              {WINNERS.map((w,i) => (
                <div key={i} className={`flex items-center gap-4 px-5 py-4 transition-colors ${i===winnerIdx?"":"hover:bg-white/2"}`}
                     style={i===winnerIdx?{background:"rgba(16,185,129,0.05)"}:{}}
                     border-b="true">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black border-2 shrink-0"
                       style={{background:`linear-gradient(135deg,${w.color}30,${w.color}60)`,borderColor:`${w.color}40`}}>
                    {w.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-sm truncate">{w.name}</p>
                      {w.hot && <span className="text-[9px] font-black bg-green-500/20 text-green-300 border border-green-500/30 px-1.5 py-0.5 rounded-full">NEW</span>}
                    </div>
                    <p className="text-gray-500 text-xs">{w.label} · {w.ago}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-lg leading-none" style={{color:w.color}}>{w.prize}</p>
                    <p className="text-gray-600 text-xs">Just won</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
              <button onClick={() => setLocation("/dashboard")} className="w-full flex items-center justify-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-semibold py-1 transition-colors">
                View All Winners <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* How It Works */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{background:"linear-gradient(145deg,#0e0c22,#130f28)",border:"1px solid rgba(255,255,255,0.06)"}}>
            <div className="px-5 py-4 flex items-center gap-2.5" style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <Sparkles className="h-5 w-5 text-violet-400" />
              <h3 className="text-white font-black text-lg">How It Works</h3>
            </div>
            <div className="p-5 space-y-5">
              {[
                {step:"01",icon:Coins,    color:"#8b5cf6",label:"Buy Tokens",       desc:"Purchase token packs to fuel your entries." },
                {step:"02",icon:BarChart3,color:"#10b981",label:"Track Progress",   desc:"Watch the bar fill toward the jackpot goal." },
                {step:"03",icon:Lock,     color:"#f59e0b",label:"Game Auto-Closes", desc:"When goal is hit, entries close instantly." },
                {step:"04",icon:Trophy,   color:"#ec4899",label:"Winner Picked",    desc:"A verified winner is chosen automatically." },
              ].map(({step,icon:Icon,color,label,desc}) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center relative"
                       style={{background:`${color}25`,border:`1px solid ${color}40`}}>
                    <Icon className="h-5 w-5" style={{color}} />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-gray-400"
                          style={{background:"#07060f",border:"1px solid rgba(255,255,255,0.1)"}}>
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

      {/* ── PROMO BANNERS ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-2xl p-6 flex items-center gap-5"
               style={{background:"linear-gradient(145deg,#1e1b4b,#2d1b69)",border:"1px solid rgba(139,92,246,0.3)",boxShadow:"0 0 30px rgba(124,58,237,0.12)"}}>
            <div className="card-shine pointer-events-none" />
            <div className="shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl text-white relative"
                 style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"1px solid rgba(139,92,246,0.4)",boxShadow:"0 0 25px rgba(124,58,237,0.5)",textShadow:"0 0 20px rgba(255,255,255,0.4)"}}>
              2X
            </div>
            <div className="flex-1">
              <p className="text-yellow-400 font-black text-xl">DOUBLE YOUR ENTRIES!</p>
              <p className="text-gray-400 text-sm mt-1.5">Verify your account and earn 2X entries in every game.</p>
              <button onClick={() => setLocation("/dashboard")}
                className="mt-3 flex items-center gap-1.5 font-black text-sm text-black px-5 py-2.5 rounded-xl transition-all hover:scale-105 glow-gold"
                style={{background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>
                CLAIM BONUS <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl p-6 flex items-center gap-5"
               style={{background:"linear-gradient(145deg,#022c22,#064e3b)",border:"1px solid rgba(16,185,129,0.25)",boxShadow:"0 0 30px rgba(16,185,129,0.08)"}}>
            <div className="shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center font-black text-green-300 text-2xl"
                 style={{background:"linear-gradient(135deg,#14532d,#166534)",border:"1px solid rgba(34,197,94,0.3)",boxShadow:"0 0 20px rgba(16,185,129,0.3)"}}>
              <div className="text-center leading-none">
                <span className="text-2xl font-black">100</span>
                <span className="block text-lg font-black">%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-xl">SAFE & SECURE</p>
              <div className="mt-2 space-y-1.5">
                {["Secure Payments","Instant Payouts","Trusted by Thousands"].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
                    <span className="text-gray-300 text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 md:pb-10">
        <div className="rounded-2xl overflow-hidden" style={{background:"linear-gradient(145deg,#0e0c22,#0d0b1e)",border:"1px solid rgba(255,255,255,0.05)"}}>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            {[
              {icon:Star,  color:"#f59e0b",bg:"rgba(245,158,11,0.1)", title:"4.8/5 Stars",   sub:"From 2,500+ player reviews"},
              {icon:Zap,   color:"#10b981",bg:"rgba(16,185,129,0.1)", title:"Fast Payouts",  sub:"Prizes delivered quickly"},
              {icon:Shield,color:"#6366f1",bg:"rgba(99,102,241,0.1)", title:"100% Secure",   sub:"Your data is always protected"},
            ].map(({icon:Icon,color,bg,title,sub}) => (
              <div key={title} className="flex items-center gap-4 px-6 py-5">
                <div className="p-3 rounded-xl shrink-0" style={{background:bg}}>
                  <Icon className="h-5 w-5" style={{color}} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-gray-700 text-xs mt-5">
          © 2025 Prize Plugz. All rights reserved.
          {" · "}<button onClick={() => setLocation("/terms")} className="hover:text-gray-500 transition">Terms</button>
          {" · "}<button onClick={() => setLocation("/privacy")} className="hover:text-gray-500 transition">Privacy</button>
        </p>
      </section>

      {/* ── MOBILE NAV ───────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden z-50 flex items-center justify-around px-1 py-2"
           style={{background:"rgba(7,6,15,0.97)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
        {[
          {icon:Home,      label:"Home",   path:"/",           active:true},
          {icon:Gamepad2,  label:"Games",  path:"/games"},
          {icon:DollarSign,label:"Tokens", path:"/tokens"},
          {icon:Gift,      label:"Prizes", path:"/games"},
          {icon:Trophy,    label:"Winners",path:"/dashboard"},
          {icon:Bell,      label:"Alerts", path:"/dashboard",  badge:3},
          {icon:User,      label:"Account",path:"/dashboard"},
        ].map(({icon:Icon,label,path,active,badge}) => (
          <button key={label} onClick={() => setLocation(path)}
            className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${active?"text-violet-400":"text-gray-600 hover:text-gray-400"}`}>
            <Icon className="h-5 w-5" />
            {badge && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[8px] font-black flex items-center justify-center text-white">{badge}</span>}
            <span className="text-[9px] font-semibold">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
