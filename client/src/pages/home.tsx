import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import {
  Zap, Trophy, Gift, Users, Shield, CheckCircle,
  Star, Crown, Flame, Bell, LogOut, Coins,
  ArrowRight, ChevronRight, Gamepad2, DollarSign,
  Home, User, BarChart3, Lock, Timer,
  Sparkles, Play, Hash, CreditCard, TrendingUp, Wallet,
} from "lucide-react";
import { logout } from "@/lib/auth";
import type { Game } from "@shared/schema";
import logoPath from "@assets/logo_1777237644041.png";
import imgCash     from "@assets/prize-cash.png";
import imgPs5      from "@assets/prize-ps5.png";
import imgTv       from "@assets/prize-tv.png";
import imgVip      from "@assets/prize-vip.png";
import imgHero     from "@assets/hero-jackpot.png";
import imgToken    from "@assets/prize-token.png";
import imgHeroBg   from "@assets/hero-bg.png";
import imgTreasure from "@assets/hero-treasure.png";
import imgWheel    from "@assets/hero-wheel.png";

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
  { img:imgCash, tag:"CASH",   title:"$500",          sub:"Cash Prize",      grad:"linear-gradient(145deg,#052e16,#14532d)", border:"#22c55e", glow:"rgba(34,197,94,0.5)" },
  { img:imgCash, tag:"CASH",   title:"$250",          sub:"Cash Prize",      grad:"linear-gradient(145deg,#052e16,#166534)", border:"#16a34a", glow:"rgba(22,163,74,0.4)" },
  { img:imgPs5,  tag:"PS5",    title:"PlayStation 5", sub:"Gaming Console",  grad:"linear-gradient(145deg,#0f172a,#1e1b4b)", border:"#818cf8", glow:"rgba(129,140,248,0.5)" },
  { img:imgTv,   tag:"65\" TV",title:"Smart TV",      sub:"4K UHD Display",  grad:"linear-gradient(145deg,#0c0a24,#2e1065)", border:"#a855f7", glow:"rgba(168,85,247,0.5)" },
  { img:imgVip,  tag:"VIP",    title:"VIP Bundle",    sub:"Cash+Gift Cards",  grad:"linear-gradient(145deg,#1c0a00,#431407)", border:"#f97316", glow:"rgba(249,115,22,0.5)" },
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
          <div key={i} className={`w-full prize-card ${["float-1","float-2","float-3"][i]}`}
               style={{ background: p.grad, border:`1px solid ${p.border}60`, boxShadow:`0 0 30px ${p.glow}`, padding:"0" }}>
            <div className="flex items-center gap-3 p-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-black/20">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-widest" style={{color:p.border}}>{p.tag}</p>
                <p className="text-white font-black text-xl leading-tight">{p.title}</p>
                <p className="text-gray-400 text-xs">{p.sub}</p>
              </div>
              <div className="shrink-0 px-3 py-1.5 rounded-xl font-black text-xs text-black"
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
            <span className="text-black">SPIN NOW — {featured.tokenCostPerEntry} TOKENS</span>
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
          <span className="text-yellow-300 font-black text-sm">{game.tokenCostPerEntry} TOKENS</span>
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
  const [winnerIdx, setWinnerIdx] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  useQueryClient(); // keep import active

  const { data: user }      = useQuery<any>({ queryKey: ["/api/user"] });
  const { data: tokenData } = useQuery<{ tokenBalance: number }>({ queryKey: ["/api/user/token-balance"], refetchInterval: 15000 });
  const { data: games, isLoading } = useQuery<Game[]>({ queryKey: ["/api/games"], refetchInterval: 20000 });
  const { data: winnersData } = useQuery<{ winnerName: string; prize: string; prizeValue: string; completedAt: string; gameName: string }[]>({
    queryKey: ["/api/winners"],
    refetchInterval: 60000,
  });
  const { data: closingSoonGames } = useQuery<(Game & { pct: number })[]>({
    queryKey: ["/api/games/closing-soon"],
    refetchInterval: 30000,
  });
  const { data: gameOfTheDay } = useQuery<Game | null>({
    queryKey: ["/api/games/game-of-the-day"],
    refetchInterval: 60000,
  });
  const { data: notifsData, refetch: refetchNotifs } = useQuery<{ notifications: any[]; unreadCount: number }>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const realWinners = winnersData && winnersData.length > 0 ? winnersData : null;
  const displayWinners = realWinners
    ? realWinners.map((w, i) => ({
        name: w.winnerName,
        prize: w.prize,
        label: w.prize,
        color: ["#10b981","#f59e0b","#6366f1","#8b5cf6","#ec4899","#f97316"][i % 6],
        icon: w.prize.toLowerCase().includes("cash") || w.prize.startsWith("$") ? "💵" : "🏆",
        ago: new Date(w.completedAt).toLocaleDateString(),
        hot: i === 0,
      }))
    : WINNERS;

  const tickerItems = realWinners && realWinners.length > 0
    ? realWinners.map(w => `🏆 ${w.winnerName} won ${w.prize}!`)
    : TICKER;

  const unreadCount = notifsData?.unreadCount ?? 0;
  const notifsList  = notifsData?.notifications ?? [];

  const activeGames  = games?.filter(g => g.isActive) ?? [];
  const tokenBalance = tokenData?.tokenBalance ?? 0;
  const username     = (user as any)?.username ?? (user as any)?.email?.split("@")[0] ?? "Player";
  const avatarLetter = username[0]?.toUpperCase() ?? "P";

  useEffect(() => {
    const t = setInterval(() => setWinnerIdx(p => (p + 1) % displayWinners.length), 3000);
    return () => clearInterval(t);
  }, [displayWinners.length]);

  async function markAllRead() {
    try {
      await fetch("/api/notifications/read-all", { method: "POST", credentials: "include" });
      refetchNotifs();
    } catch (_) {}
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{background:"#07060f"}}>
      <style>{GLOBAL_CSS}</style>

      {/* ── LIVE TICKER ──────────────────────────────────────────────── */}
      <div className="relative border-b border-white/5 overflow-hidden py-2.5" style={{background:"linear-gradient(90deg,#0d0b1e,#110e26,#0d0b1e)"}}>
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10" style={{background:"linear-gradient(90deg,#0d0b1e,transparent)"}} />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10" style={{background:"linear-gradient(270deg,#0d0b1e,transparent)"}} />
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...tickerItems,...tickerItems].map((item,i) => (
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

            <button onClick={() => setLocation("/wallet")}
              className="hidden sm:flex items-center gap-1.5 text-white font-bold text-xs px-4 py-2 rounded-full transition-all hover:scale-105 glow-violet"
              style={{background:"linear-gradient(135deg,#7c3aed,#9333ea)",border:"1px solid rgba(139,92,246,0.4)"}}>
              <span>+ Add Tokens</span>
            </button>

            <div className="relative">
              <button
                onClick={() => { setShowNotifs(p => !p); if (!showNotifs) markAllRead(); }}
                className="relative p-2 rounded-full transition hover:bg-white/8"
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)"}}>
                <Bell className="h-4 w-4 text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  style={{background:"linear-gradient(145deg,#0e0c22,#130f28)",border:"1px solid rgba(255,255,255,0.1)"}}>
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-white font-black text-sm">Notifications</span>
                    <button onClick={() => setShowNotifs(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
                  </div>
                  {notifsList.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">No notifications yet</div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {notifsList.map((n: any) => (
                        <div key={n.id} className="px-4 py-3 border-b border-white/3 hover:bg-white/3 transition-colors"
                          style={!n.isRead ? {background:"rgba(124,58,237,0.06)"} : {}}>
                          <p className="text-white text-sm font-semibold leading-tight">{n.title}</p>
                          <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-gray-600 text-[10px] mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

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
      <section className="relative overflow-hidden" style={{minHeight:"90vh",display:"flex",flexDirection:"column",justifyContent:"center",background:"linear-gradient(135deg,#1a0533 0%,#0f0628 35%,#1b0a40 65%,#120625 100%)"}}>

        {/* ── BG LAYERS ── */}
        {/* 1. AI background — visible, not smothered */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img src={imgHeroBg} alt="" aria-hidden
            className="w-full h-full object-cover scale-110"
            style={{opacity:0.5,filter:"saturate(1.8) brightness(0.75) contrast(1.1)",mixBlendMode:"screen"}} />
        </div>

        {/* 2. Big vivid glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full float-1" style={{width:"700px",height:"700px",top:"-180px",left:"-200px",background:"radial-gradient(circle,rgba(124,58,237,0.55) 0%,transparent 65%)"}} />
          <div className="absolute rounded-full float-2" style={{width:"600px",height:"600px",top:"5%",right:"-180px",background:"radial-gradient(circle,rgba(236,72,153,0.4) 0%,transparent 65%)"}} />
          <div className="absolute rounded-full float-3" style={{width:"500px",height:"500px",bottom:"-100px",left:"30%",background:"radial-gradient(circle,rgba(245,158,11,0.25) 0%,transparent 65%)"}} />
          <div className="absolute rounded-full" style={{width:"350px",height:"350px",top:"30%",left:"20%",background:"radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 65%)"}} />
        </div>

        {/* 3. Neon grid — more visible */}
        <div className="absolute inset-0 pointer-events-none"
          style={{backgroundImage:"linear-gradient(rgba(139,92,246,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.15) 1px,transparent 1px)",backgroundSize:"80px 80px",opacity:1}} />

        {/* 4. Top accent line */}
        <div className="absolute top-0 inset-x-0 h-0.5 pointer-events-none"
          style={{background:"linear-gradient(90deg,transparent 0%,#7c3aed 30%,#ec4899 60%,#f59e0b 80%,transparent 100%)"}} />

        {/* 5. Floating neon particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            {w:6,h:6,top:"15%",left:"8%",  color:"#a78bfa",anim:"float-1",delay:"0s"},
            {w:4,h:4,top:"45%",left:"3%",  color:"#f472b6",anim:"float-2",delay:"1s"},
            {w:5,h:5,top:"70%",left:"12%", color:"#fbbf24",anim:"float-3",delay:"0.5s"},
            {w:3,h:3,top:"25%",left:"45%", color:"#34d399",anim:"float-1",delay:"1.5s"},
            {w:6,h:6,top:"80%",left:"55%", color:"#818cf8",anim:"float-2",delay:"0.2s"},
            {w:4,h:4,top:"10%",left:"75%", color:"#fb923c",anim:"float-3",delay:"0.8s"},
            {w:5,h:5,top:"60%",left:"90%", color:"#c084fc",anim:"float-1",delay:"1.2s"},
          ].map((p,i) => (
            <div key={i} className={`absolute rounded-full ${p.anim}`}
              style={{width:p.w,height:p.h,top:p.top,left:p.left,background:p.color,boxShadow:`0 0 ${p.w*4}px ${p.color}`,animationDelay:p.delay,opacity:0.7}} />
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* ── LEFT ── */}
            <div className="space-y-8 fade-up">

              {/* Live badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm"
                style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.3)"}}>
                <span className="relative w-2.5 h-2.5 pulse-dot shrink-0">
                  <span className="block w-2.5 h-2.5 bg-green-400 rounded-full" />
                </span>
                <span className="text-green-300 font-bold text-sm tracking-wide">LIVE NOW</span>
                <span className="w-px h-4 bg-white/10" />
                <span className="text-gray-300 text-sm">
                  <span className="text-white font-black">12,458</span> players online
                </span>
              </div>

              {/* Headline */}
              <div>
                <p className="text-violet-400 text-sm sm:text-base font-bold tracking-[0.3em] uppercase mb-3">Prize Plugz</p>
                <h1 className="font-black leading-[0.88] tracking-tight text-white"
                  style={{fontSize:"clamp(3.2rem,8vw,5.8rem)"}}>
                  YOUR NEXT<br />
                  <span className="shimmer-gold">BIG WIN</span><br />
                  AWAITS.
                </h1>
              </div>

              <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md">
                Spend tokens, watch the jackpot fill up live, and win{" "}
                <span className="text-white font-semibold">real cash & amazing prizes</span>.{" "}
                Fully transparent. Auto winner every time.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => activeGames[0] ? setLocation(`/game/${activeGames[0].id}`) : setLocation("/games")}
                  className="group relative overflow-hidden flex items-center gap-2.5 font-black text-black text-base px-9 py-4 rounded-2xl transition-all duration-200 hover:scale-105"
                  style={{background:"linear-gradient(135deg,#f59e0b,#f97316)",boxShadow:"0 0 40px rgba(245,158,11,0.45),0 8px 30px rgba(249,115,22,0.3)"}}>
                  <div className="absolute inset-0 bg-white/25 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12" />
                  <Zap className="h-5 w-5 relative z-10 shrink-0" />
                  <span className="relative z-10">SPIN NOW</span>
                </button>
                <button
                  onClick={() => setLocation("/how-to-play")}
                  className="flex items-center gap-2.5 font-bold text-gray-200 text-base px-8 py-4 rounded-2xl backdrop-blur-sm transition-all duration-200 hover:text-white hover:bg-white/10"
                  style={{border:"2px solid rgba(255,255,255,0.14)"}}>
                  <Play className="h-4 w-4 fill-current shrink-0" />
                  HOW IT WORKS
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2.5">
                {[
                  {img:imgToken, t:"$127K+ Paid Out"},
                  {icon:Zap,     t:"Instant Results"},
                  {icon:Shield,  t:"100% Transparent"},
                  {icon:Trophy,  t:"Auto Winner"},
                ].map(({img,icon:Icon,t},bi) => (
                  <span key={bi} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gray-400 font-semibold backdrop-blur-sm"
                    style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)"}}>
                    {img ? <img src={img} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                         : Icon && <Icon className="h-3 w-3 text-violet-400" />}
                    {t}
                  </span>
                ))}
              </div>

              {/* Mini stat row */}
              <div className="flex gap-6 pt-2">
                {[
                  {val:"12,458",lbl:"Players Online",color:"#10b981"},
                  {val:"$127K+",lbl:"Total Paid",    color:"#f59e0b"},
                  {val:"583",   lbl:"Won Today",     color:"#8b5cf6"},
                ].map(({val,lbl,color}) => (
                  <div key={lbl}>
                    <p className="font-black text-xl leading-none" style={{color}}>{val}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div className="relative flex flex-col items-center lg:items-end gap-4">

              {/* Central treasure/jackpot showcase */}
              <div className="relative w-full max-w-sm">
                {/* Outer glow ring */}
                <div className="absolute inset-[-20px] rounded-3xl pointer-events-none"
                  style={{background:"radial-gradient(ellipse at center,rgba(124,58,237,0.3) 0%,transparent 70%)",filter:"blur(20px)"}} />

                {/* Main card */}
                <div className="relative rounded-3xl overflow-hidden card-shine"
                  style={{background:"linear-gradient(145deg,#110e2a,#1a1040)",border:"1px solid rgba(139,92,246,0.35)",boxShadow:"0 0 60px rgba(109,40,217,0.3),0 30px 80px rgba(0,0,0,0.7)"}}>

                  {/* Prize image */}
                  <div className="relative h-56 overflow-hidden">
                    <img src={imgTreasure} alt="Prize Jackpot" className="w-full h-full object-cover scale-105 float-1"
                      style={{filter:"saturate(1.3) brightness(1.05)"}} />
                    <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,transparent 50%,rgba(17,14,42,1) 100%)"}} />

                    {/* Live overlay badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 backdrop-blur-md px-3 py-1.5 rounded-full"
                      style={{background:"rgba(16,185,129,0.2)",border:"1px solid rgba(16,185,129,0.4)"}}>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-300 text-xs font-black tracking-wide">LIVE JACKPOT</span>
                    </div>

                    {/* Prize value badge */}
                    <div className="absolute top-3 right-3 backdrop-blur-md px-3 py-1.5 rounded-full"
                      style={{background:"rgba(245,158,11,0.2)",border:"1px solid rgba(245,158,11,0.4)"}}>
                      <span className="text-yellow-300 text-xs font-black">🏆 BIG PRIZES</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-white font-black text-xl leading-tight">Win Real Prizes</h3>
                      <p className="text-gray-500 text-sm mt-1">Tokens fill the jackpot — last one in triggers the draw!</p>
                    </div>

                    {/* Floating prize chips */}
                    <div className="flex gap-2">
                      {[
                        {img:imgCash,  label:"$500 Cash",  color:"#22c55e"},
                        {img:imgPs5,   label:"PS5",         color:"#818cf8"},
                        {img:imgTv,    label:"65\" TV",     color:"#a855f7"},
                        {img:imgVip,   label:"VIP Pack",   color:"#f97316"},
                      ].map(({img,label,color},ci) => (
                        <div key={ci} className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-transform hover:scale-105 cursor-pointer"
                          style={{background:`${color}12`,border:`1px solid ${color}30`}}>
                          <div className="w-9 h-9 rounded-lg overflow-hidden">
                            <img src={img} alt={label} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[9px] font-black text-center leading-tight" style={{color}}>{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <button onClick={() => activeGames[0] ? setLocation(`/game/${activeGames[0].id}`) : setLocation("/games")}
                      className="w-full py-3.5 rounded-xl font-black text-sm text-black transition-all hover:scale-[1.02]"
                      style={{background:"linear-gradient(135deg,#f59e0b,#f97316)",boxShadow:"0 0 25px rgba(245,158,11,0.4)"}}>
                      <Zap className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                      ENTER NOW
                    </button>
                  </div>
                </div>
              </div>

              {/* Token balance pill */}
              <div className="relative w-full max-w-sm overflow-hidden rounded-2xl px-4 py-3 backdrop-blur-sm"
                style={{background:"linear-gradient(135deg,rgba(14,12,34,0.9),rgba(22,15,46,0.9))",border:"1px solid rgba(124,58,237,0.2)"}}>
                <img src={imgToken} alt="" aria-hidden
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 object-contain opacity-20 pointer-events-none float-2" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2.5">
                    <img src={imgToken} alt="token" className="w-8 h-8 object-contain rounded-full" />
                    <div>
                      <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Your Balance</p>
                      <p className="text-yellow-300 font-black text-xl leading-none">{tokenBalance} <span className="text-yellow-600 text-sm font-semibold">tokens</span></p>
                    </div>
                  </div>
                  <button onClick={() => setLocation("/tokens")}
                    className="flex items-center gap-1.5 font-black text-white text-xs px-4 py-2.5 rounded-xl transition-all hover:scale-105"
                    style={{background:"linear-gradient(135deg,#7c3aed,#9333ea)",boxShadow:"0 0 15px rgba(124,58,237,0.35)"}}>
                    + Add
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom fade into stats bar */}
        <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
          style={{background:"linear-gradient(to bottom,transparent,#050412)"}} />
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

      {/* ── GAME OF THE DAY ──────────────────────────────────────────── */}
      {gameOfTheDay && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4">
          <div className="relative overflow-hidden rounded-2xl p-5 sm:p-7 flex flex-col sm:flex-row items-center gap-6"
            style={{background:"linear-gradient(135deg,#1a0f3d 0%,#2d1b69 40%,#1a0845 100%)",border:"1px solid rgba(245,158,11,0.4)",boxShadow:"0 0 40px rgba(245,158,11,0.12)"}}>
            <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(circle at 80% 50%,rgba(245,158,11,0.07),transparent 60%)"}} />
            <div className="shrink-0 flex flex-col items-center sm:items-start gap-1 relative z-10">
              <span className="text-yellow-400 text-xs font-black tracking-[0.3em] uppercase">⭐ Game of the Day</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-bold">Live Now</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 relative z-10 text-center sm:text-left">
              <h2 className="text-white font-black text-2xl leading-tight truncate">{gameOfTheDay.name}</h2>
              <p className="text-yellow-300/80 text-sm mt-0.5">{gameOfTheDay.prize} — worth ${gameOfTheDay.prizeValue}</p>
              {gameOfTheDay.tokenThreshold > 0 && (
                <div className="mt-3 max-w-xs">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{Math.round((gameOfTheDay.tokensCollected / gameOfTheDay.tokenThreshold) * 100)}% full</span>
                    <span>{gameOfTheDay.numbersLeft} spots left</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.1)"}}>
                    <div className="h-full rounded-full transition-all"
                      style={{width:`${Math.min(100, (gameOfTheDay.tokensCollected / gameOfTheDay.tokenThreshold)*100)}%`,background:"linear-gradient(90deg,#f59e0b,#f97316)"}} />
                  </div>
                </div>
              )}
            </div>
            {gameOfTheDay.prizeImageUrl && (
              <img src={gameOfTheDay.prizeImageUrl} alt={gameOfTheDay.name}
                className="w-20 h-20 object-contain rounded-xl shrink-0 relative z-10" />
            )}
            <button onClick={() => setLocation(`/game/${gameOfTheDay.id}`)}
              className="shrink-0 font-black text-black px-7 py-3.5 rounded-xl transition-all hover:scale-105 relative z-10"
              style={{background:"linear-gradient(135deg,#f59e0b,#f97316)",boxShadow:"0 0 20px rgba(245,158,11,0.4)"}}>
              PLAY NOW
            </button>
          </div>
        </section>
      )}

      {/* ── CLOSING SOON ─────────────────────────────────────────────── */}
      {closingSoonGames && closingSoonGames.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl" style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)"}}>
              <Timer className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-black text-xl leading-none">Closing Soon</h2>
              <p className="text-gray-600 text-xs mt-0.5">These games are almost full — get in now</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {closingSoonGames.map(g => {
              const pct = Math.round(g.pct * 100);
              const barColor = pct >= 95 ? "#ef4444" : pct >= 80 ? "#f97316" : "#f59e0b";
              return (
                <div key={g.id} onClick={() => setLocation(`/game/${g.id}`)}
                  className="relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
                  style={{background:"linear-gradient(145deg,#120e2a,#1c1340)",border:"1px solid rgba(239,68,68,0.2)",boxShadow:"0 0 20px rgba(239,68,68,0.06)"}}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-black text-sm truncate">{g.name}</p>
                      <p className="text-gray-500 text-xs">{g.prize}</p>
                    </div>
                    <span className="ml-2 text-xs font-black px-2 py-0.5 rounded-full shrink-0"
                      style={{background:`${barColor}20`,color:barColor,border:`1px solid ${barColor}40`}}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-2" style={{background:"rgba(255,255,255,0.07)"}}>
                    <div className="h-full rounded-full transition-all"
                      style={{width:`${pct}%`,background:`linear-gradient(90deg,${barColor},${barColor}cc)`}} />
                  </div>
                  <p className="text-gray-600 text-xs">{g.numbersLeft} spots left · {g.tokenCostPerEntry} tokens/play</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
            ? <div className="relative overflow-hidden flex flex-col items-center justify-center py-16 rounded-2xl border border-white/5" style={{background:"linear-gradient(145deg,#0d0b22,#110e2a)"}}>
                <img src={imgHero} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none scale-110" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden mb-5 glow-violet">
                    <img src={imgVip} alt="prizes" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-white font-black text-xl mb-2">No Live Games Right Now</h3>
                  <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">New games launch regularly. Get your tokens ready and be first to play!</p>
                  <button onClick={() => setLocation("/tokens")} className="flex items-center gap-2 font-bold text-white px-7 py-3 rounded-xl glow-violet" style={{background:"linear-gradient(135deg,#7c3aed,#9333ea)"}}>
                    <img src={imgToken} alt="" className="w-5 h-5 object-contain rounded-full" />Get Tokens
                  </button>
                </div>
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
              className="prize-card" style={{background:p.grad,border:`1px solid ${p.border}55`,boxShadow:`0 0 25px ${p.glow},0 8px 30px rgba(0,0,0,0.5)`}}>
              <div className="card-shine pointer-events-none" />
              <div className="relative h-32 overflow-hidden bg-black/20">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black" style={{background:`${p.border}30`,border:`1px solid ${p.border}60`,color:p.border}}>{p.tag}</div>
              </div>
              <div className="p-3" style={{background:"rgba(0,0,0,0.4)"}}>
                <p className="text-white font-black text-sm leading-tight">{p.title}</p>
                <p className="text-gray-500 text-xs mb-2">{p.sub}</p>
                <div className="w-full py-2 rounded-xl font-black text-[11px] text-black text-center" style={{background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>ENTER NOW</div>
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
              {displayWinners.map((w,i) => (
                <div key={i} className={`flex items-center gap-4 px-5 py-4 transition-colors ${i===winnerIdx?"":"hover:bg-white/2"}`}
                     style={i===winnerIdx?{background:"rgba(16,185,129,0.05)"}:{}}>
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
      <MobileNav />
    </div>
  );
}
