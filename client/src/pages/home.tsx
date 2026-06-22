import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import {
  Zap, Trophy, Users, Bell, LogOut,
  ChevronRight, Home, Wallet, User,
  Copy, CheckCircle, Timer, Star,
  ShoppingBag, Play, BadgeCheck,
} from "lucide-react";
import { logout } from "@/lib/auth";
import type { Game } from "@shared/schema";
import logoPath    from "@assets/logo_1777237644041.png";
import imgTreasure from "@assets/hero-treasure.png";
import imgCash     from "@assets/prize-cash.png";
import imgPs5      from "@assets/prize-ps5.png";
import imgTv       from "@assets/prize-tv.png";
import imgVip      from "@assets/prize-vip.png";

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes fadeIn   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ripple   { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.4);opacity:0} }
  @keyframes barShine { 0%{background-position:-400% center} 100%{background-position:400% center} }

  .ticker-wrap  { overflow:hidden; }
  .ticker-inner { animation:ticker 34s linear infinite; display:flex; width:max-content; white-space:nowrap; }
  .float-anim   { animation:floatY 5s ease-in-out infinite; }
  .fade-in      { animation:fadeIn 0.55s ease both; }

  .drop-card { transition:transform .2s ease, box-shadow .2s ease; cursor:pointer; }
  .drop-card:hover { transform:translateY(-4px); }

  .live-ring::after {
    content:''; position:absolute; inset:-3px; border-radius:50%;
    border:2px solid #4ade80; animation:ripple 1.5s ease-out infinite;
  }

  .join-btn {
    background:#7c3aed;
    transition:background .18s ease, transform .18s ease;
  }
  .join-btn:hover { background:#8b5cf6; transform:scale(1.04); }

  .creator-card { transition:transform .2s ease; }
  .creator-card:hover { transform:translateY(-3px); }

  .follow-btn {
    border:1.5px solid rgba(124,58,237,0.5);
    color:#a78bfa;
    transition:all .18s ease;
  }
  .follow-btn:hover { background:rgba(124,58,237,0.15); color:#c4b5fd; }

  .underline-active {
    position:relative;
  }
  .underline-active::after {
    content:''; position:absolute; bottom:-4px; left:50%; transform:translateX(-50%);
    width:24px; height:2.5px; border-radius:2px; background:#7c3aed;
  }

  ::-webkit-scrollbar { height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(124,58,237,.4); border-radius:2px; }
`;

/* ── FALLBACK DATA ───────────────────────────────────────────────────────── */
const TICKER_FALLBACK = [
  "🏆 PlugzKing just won $750 Cash!",
  "🎮 SpinMaster claimed a PS5!",
  "💵 LuckyAce hit the $1,000 jackpot!",
  "📺 WinnerBoss won a 65\" 4K TV!",
  "🎁 TokenPro snagged the VIP Gift Pack!",
  "💰 JackAce cashed out $500!",
];

const FAKE_WINNERS = [
  { name:"Anonymous",  prize:"$25 cash game",   ago:"just now",   icon:"💵" },
  { name:"Jarrad L.",  prize:"$300 Cash Game",   ago:"4 min ago",  icon:"💵" },
  { name:"Anonymous",  prize:"$25 cash game",   ago:"10 min ago", icon:"💵" },
  { name:"Anonymous",  prize:"$50 cash game",   ago:"18 min ago", icon:"💵" },
];

const CREATORS = [
  { name:"Addy",   followers:"12.4K", letter:"A", color:"#f472b6" },
  { name:"Taylor", followers:"8.7K",  letter:"T", color:"#a78bfa" },
  { name:"Jay",    followers:"15.2K", letter:"J", color:"#34d399" },
  { name:"Maya",   followers:"6.1K",  letter:"M", color:"#fb923c" },
];

/* ── COUNTDOWN HOOK ─────────────────────────────────────────────────────── */
function useCountdown(endTime: string) {
  const [label, setLabel] = useState("–");
  useEffect(() => {
    function tick() {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setLabel("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 48) setLabel(`${Math.floor(h / 24)}d ${h % 24}h`);
      else if (h > 0) setLabel(`${h}h ${m}m ${s}s`);
      else setLabel(`${m}m ${s}s`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return label;
}

/* ── DROP CARD ──────────────────────────────────────────────────────────── */
function DropCard({ game, onPlay }: { game: Game; onPlay: () => void }) {
  const countdown = useCountdown(game.endTime as string);
  const pct = game.tokenThreshold > 0
    ? Math.min((game.tokensCollected / game.tokenThreshold) * 100, 100) : 0;
  const joined = game.tokenThreshold - game.numbersLeft;

  return (
    <div onClick={onPlay} className="drop-card rounded-2xl overflow-hidden flex flex-col"
      style={{background:"#13131f", border:"1px solid rgba(255,255,255,0.07)"}}>

      {/* ── Image ── */}
      <div className="relative overflow-hidden" style={{height:200, background:"#1a1a2e", flexShrink:0}}>
        {game.prizeImageUrl
          ? <img src={game.prizeImageUrl} alt={game.name}
              className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl opacity-40">🎁</span>
            </div>
        }
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
          style={{background:"linear-gradient(to top,rgba(19,19,31,0.95),transparent)"}} />

        {/* LIVE badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full font-black text-xs text-white"
          style={{background:"#10b981", fontSize:"11px"}}>
          <span className="relative w-1.5 h-1.5 live-ring">
            <span className="block w-1.5 h-1.5 bg-white rounded-full" />
          </span>
          LIVE
        </div>

        {/* Countdown badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-white font-bold"
          style={{background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", fontSize:"11px", border:"1px solid rgba(255,255,255,0.1)"}}>
          <Timer className="h-3 w-3 text-violet-400" style={{flexShrink:0}} />
          {countdown}
        </div>

        {/* Host avatar at bottom of image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white border-2 border-white/20"
            style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)", flexShrink:0}}>
            {game.name[0]?.toUpperCase()}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white font-bold text-xs">{game.name.split(" ")[0]}</span>
            <BadgeCheck className="h-3.5 w-3.5 text-violet-400" />
          </div>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Prize name */}
        <div>
          <h3 className="text-white font-black text-base leading-snug">{game.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{game.prize || "Amazing Prize"} — ${game.prizeValue}</p>
        </div>

        {/* Progress bar */}
        {game.tokenThreshold > 0 && (
          <div className="h-1 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.08)"}}>
            <div className="h-full rounded-full"
              style={{width:`${pct}%`, background: pct>=95?"#ef4444":pct>=80?"#f97316":"#7c3aed"}} />
          </div>
        )}

        {/* Bottom row: joined | tokens | Join Drop */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-violet-400" />
              <span>{joined.toLocaleString()}</span>
              <span className="text-gray-600">Joined</span>
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-400" />
              <span>{game.tokenCostPerEntry}</span>
              <span className="text-gray-600">Tokens</span>
            </span>
          </div>
          <button onClick={e=>{e.stopPropagation();onPlay();}}
            className="join-btn px-4 py-2 rounded-xl font-black text-sm text-white shrink-0"
            style={{fontSize:"13px"}}>
            Join Drop
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── CLOSING SOON MINI CARD ─────────────────────────────────────────────── */
function MiniCard({ game, onPlay }: { game: Game & { pct: number }; onPlay: () => void }) {
  const pct = Math.round(game.pct * 100);
  const c = pct>=95?"#ef4444":pct>=80?"#f97316":"#f59e0b";
  return (
    <div onClick={onPlay} className="drop-card rounded-xl p-3 cursor-pointer"
      style={{background:"#13131f", border:`1px solid ${c}28`}}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-white font-bold text-sm truncate flex-1">{game.name}</p>
        <span className="ml-2 text-xs font-black shrink-0 px-2 py-0.5 rounded-full"
          style={{background:`${c}18`, color:c}}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{background:"rgba(255,255,255,0.07)"}}>
        <div className="h-full rounded-full" style={{width:`${pct}%`, background:c}} />
      </div>
      <p className="text-gray-600 text-xs">{game.numbersLeft} spots left</p>
    </div>
  );
}

/* ── PAGE ───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [, setLocation] = useLocation();
  const [showNotifs, setShowNotifs]   = useState(false);
  const [copied, setCopied]           = useState(false);
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);

  /* ── Queries ── */
  const { data: user }      = useQuery<any>({ queryKey: ["/api/user"] });
  const { data: tokenData } = useQuery<{ tokenBalance: number }>({ queryKey: ["/api/user/token-balance"], refetchInterval: 15000 });
  const { data: games, isLoading } = useQuery<Game[]>({ queryKey: ["/api/games"], refetchInterval: 20000 });
  const { data: winnersData } = useQuery<{ winnerName: string; prize: string; completedAt: string }[]>({
    queryKey: ["/api/winners"], refetchInterval: 60000,
  });
  const { data: closingSoonGames } = useQuery<(Game & { pct: number })[]>({
    queryKey: ["/api/games/closing-soon"], refetchInterval: 30000,
  });
  const { data: gameOfTheDay } = useQuery<Game | null>({
    queryKey: ["/api/games/game-of-the-day"], refetchInterval: 60000,
  });
  const { data: notifsData, refetch: refetchNotifs } = useQuery<{ notifications: any[]; unreadCount: number }>({
    queryKey: ["/api/notifications"], refetchInterval: 30000,
  });
  const { data: referralData } = useQuery<{ referralCode: string | null }>({
    queryKey: ["/api/user/referral-code"],
  });

  const activeGames  = games?.filter(g => g.isActive) ?? [];
  const tokenBalance = tokenData?.tokenBalance ?? 0;
  const unreadCount  = notifsData?.unreadCount ?? 0;
  const notifsList   = notifsData?.notifications ?? [];
  const username     = (user as any)?.firstName ?? (user as any)?.email?.split("@")[0] ?? "Player";
  const avatarLetter = username[0]?.toUpperCase() ?? "P";
  const referralCode = referralData?.referralCode ?? "–";
  const referralLink = referralData?.referralCode ? `${window.location.origin}/?ref=${referralData.referralCode}` : null;

  const displayWinners = (winnersData && winnersData.length > 0)
    ? winnersData.slice(0, 4).map(w => ({
        name: w.winnerName,
        prize: w.prize,
        icon: w.prize?.toLowerCase().includes("cash")||w.prize?.startsWith("$") ? "💵" : "🏆",
        ago: new Date(w.completedAt).toLocaleDateString(),
      }))
    : FAKE_WINNERS;

  const tickerItems = winnersData && winnersData.length > 0
    ? winnersData.map(w => `🏆 ${w.winnerName} won ${w.prize}!`)
    : TICKER_FALLBACK;

  async function markAllRead() {
    try { await fetch("/api/notifications/read-all",{method:"POST",credentials:"include"}); refetchNotifs(); } catch{}
  }

  function copyReferral() {
    const text = referralLink || referralCode;
    try { navigator.clipboard.writeText(text); } catch {
      const el=document.createElement("textarea"); el.value=text;
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── NAV LINKS ── */
  const NAV = [
    { label:"Home",         path:"/" },
    { label:"Drops",        path:"/games" },
    { label:"Winners",      path:"/dashboard" },
    { label:"How It Works", path:"/how-to-play" },
  ];

  return (
    <div className="min-h-screen text-white" style={{background:"#0d0d14"}}>
      <style>{CSS}</style>

      {/* ── TICKER ────────────────────────────────────────────────────── */}
      <div className="relative border-b border-white/5 py-2 overflow-hidden" style={{background:"#0a0a12"}}>
        <div className="absolute left-0 inset-y-0 w-12 z-10 pointer-events-none" style={{background:"linear-gradient(90deg,#0a0a12,transparent)"}} />
        <div className="absolute right-0 inset-y-0 w-12 z-10 pointer-events-none" style={{background:"linear-gradient(270deg,#0a0a12,transparent)"}} />
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...tickerItems,...tickerItems].map((item,i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-10 text-xs font-medium text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"
                  style={{animation:"blink 1.5s ease-in-out infinite"}} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50"
        style={{background:"rgba(13,13,20,0.97)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">

          {/* Logo */}
          <button onClick={()=>setLocation("/")} className="shrink-0">
            <img src={logoPath} alt="Prize Plugz" className="h-10 w-auto object-contain" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV.map(({ label, path }) => {
              const active = path === "/";
              return (
                <button key={label} onClick={()=>setLocation(path)}
                  className={`px-4 py-2 text-sm font-semibold transition-colors rounded-lg ${
                    active ? "underline-active text-white" : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                  }`}
                  style={active ? {color:"white"} : {}}>
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Right: token + bell + avatar */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">

            {/* Token balance */}
            <button onClick={()=>setLocation("/add-credits")}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-black transition hover:scale-105"
              style={{background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.4)", color:"#c4b5fd"}}>
              <Zap className="h-4 w-4 text-yellow-400" fill="currentColor" />
              <span className="text-white font-black">{tokenBalance}</span>
              <span className="hidden sm:inline text-violet-400">Tokens</span>
              <ChevronRight className="hidden sm:block h-3.5 w-3.5 text-gray-600" />
            </button>

            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button onClick={()=>{setShowNotifs(p=>!p); if(!showNotifs) markAllRead();}}
                className="relative w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-white/8"
                style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)"}}>
                <Bell className="h-4 w-4 text-gray-400" />
                {unreadCount>0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-black flex items-center justify-center text-white">
                    {unreadCount>9?"9+":unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  style={{background:"#1a1a2e", border:"1px solid rgba(255,255,255,0.1)"}}>
                  <div className="px-4 py-3 flex items-center justify-between"
                    style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <span className="text-white font-bold text-sm">Notifications</span>
                    <button onClick={()=>setShowNotifs(false)} className="text-gray-600 hover:text-white text-xs">✕</button>
                  </div>
                  {notifsList.length===0
                    ? <p className="px-4 py-6 text-center text-gray-600 text-sm">No notifications yet</p>
                    : <div className="max-h-72 overflow-y-auto">
                        {notifsList.map((n:any) => (
                          <div key={n.id} className="px-4 py-3 hover:bg-white/3 transition-colors"
                            style={{borderBottom:"1px solid rgba(255,255,255,0.04)", background:!n.isRead?"rgba(124,58,237,0.05)":"transparent"}}>
                            <p className="text-white text-sm font-semibold">{n.title}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              )}
            </div>

            {/* Avatar */}
            <button onClick={()=>setLocation("/dashboard")}
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white ring-2 ring-violet-500/30"
              style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)"}}>
              {avatarLetter}
            </button>

            <button onClick={()=>logout()} className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full text-gray-600 hover:text-red-400 transition hover:bg-red-500/8">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{background:"#0d0d14"}}>
        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{backgroundImage:"linear-gradient(rgba(124,58,237,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.05) 1px,transparent 1px)",backgroundSize:"60px 60px"}} />
        {/* Right glow */}
        <div className="absolute pointer-events-none"
          style={{width:"500px",height:"500px",top:"-80px",right:"-80px",background:"radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 65%)"}} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left */}
          <div className="fade-in space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.3)", color:"#a78bfa"}}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"
                style={{animation:"blink 1.4s ease-in-out infinite"}} />
              LIVE DROPS HAPPENING NOW
            </div>

            <div>
              <h1 className="font-black leading-tight"
                style={{fontSize:"clamp(2.2rem,5vw,3.6rem)"}}>
                <span className="text-white">Join </span>
                <span style={{color:"#a78bfa"}}>Creator Drops.</span>
                <br />
                <span className="text-white">Win Epic Rewards.</span>
              </h1>
              <p className="text-gray-500 text-base mt-4 leading-relaxed max-w-md">
                Use tokens to join interactive drops hosted by your favorite creators.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={()=>setLocation("/add-credits")}
                className="join-btn flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-base text-white"
                style={{boxShadow:"0 4px 24px rgba(124,58,237,0.4)"}}>
                <Zap className="h-5 w-5" fill="currentColor" />Buy Tokens
              </button>
              <button onClick={()=>setLocation("/how-to-play")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-base text-gray-300 hover:text-white hover:bg-white/8 transition-all"
                style={{border:"2px solid rgba(255,255,255,0.12)"}}>
                <Play className="h-4 w-4 fill-current" />How It Works
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-1">
              {[
                { val:"$127K+", label:"Total Paid Out",   color:"#f59e0b" },
                { val:"12K+",   label:"Active Players",   color:"#10b981" },
                { val:"98K+",   label:"Games Completed",  color:"#a78bfa" },
              ].map(({ val, label, color }) => (
                <div key={label}>
                  <p className="font-black text-xl leading-none" style={{color}}>{val}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — prize box */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px]">
              {/* Glow behind card */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{background:"radial-gradient(ellipse,rgba(124,58,237,0.4) 0%,transparent 70%)", filter:"blur(35px)", transform:"scale(1.15)"}} />

              <div className="relative rounded-3xl overflow-hidden float-anim"
                style={{background:"#1a1a2e", border:"1px solid rgba(124,58,237,0.25)", boxShadow:"0 24px 70px rgba(0,0,0,0.65)"}}>

                {/* Prize image */}
                <img src={imgTreasure} alt="Prize Box" className="w-full h-56 object-cover"
                  style={{filter:"saturate(1.3) brightness(1.05)"}} />
                <div className="absolute inset-0 h-56 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent pointer-events-none" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-white"
                  style={{background:"rgba(16,185,129,0.85)", backdropFilter:"blur(8px)"}}>
                  <span className="w-1.5 h-1.5 bg-white rounded-full" style={{animation:"blink 1s ease-in-out infinite"}} />
                  LIVE JACKPOT
                </div>
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-black"
                  style={{background:"rgba(245,158,11,0.2)", border:"1px solid rgba(245,158,11,0.4)", color:"#fbbf24"}}>
                  🏆 BIG PRIZES
                </div>

                {/* Card body */}
                <div className="p-5">
                  <h3 className="text-white font-black text-lg">Win Real Prizes</h3>
                  <p className="text-gray-500 text-sm mt-1">Tokens fill the pot — last one triggers the draw!</p>
                  <button
                    onClick={()=>activeGames[0] ? setLocation(`/game/${activeGames[0].id}`) : setLocation("/games")}
                    className="join-btn mt-4 w-full py-3 rounded-xl font-black text-sm text-white"
                    style={{boxShadow:"0 4px 18px rgba(124,58,237,0.4)"}}>
                    Enter Now — {activeGames[0]?.tokenCostPerEntry ?? 5} Tokens
                  </button>

                  {/* Prize mini chips */}
                  <div className="flex gap-2 mt-3">
                    {[imgCash,imgPs5,imgTv,imgVip].map((img,i)=>(
                      <div key={i} className="flex-1 h-10 rounded-lg overflow-hidden border"
                        style={{borderColor:"rgba(124,58,237,0.2)"}}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GAME OF THE DAY ───────────────────────────────────────────── */}
      {gameOfTheDay && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
          <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5"
            style={{background:"linear-gradient(135deg,#1a0f3d,#2d1b69,#1a0845)", border:"1px solid rgba(245,158,11,0.35)"}}>
            <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(circle at 80% 50%,rgba(245,158,11,0.07),transparent 60%)"}} />
            <div className="shrink-0 relative z-10">
              <span className="text-yellow-400 text-xs font-black tracking-widest uppercase">⭐ Game of the Day</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-400" style={{animation:"blink 1.4s ease-in-out infinite"}} />
                <span className="text-green-400 text-xs font-bold">Live Now</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 relative z-10 text-center sm:text-left">
              <h2 className="text-white font-black text-xl truncate">{gameOfTheDay.name}</h2>
              <p className="text-yellow-300/70 text-sm">{gameOfTheDay.prize} — ${gameOfTheDay.prizeValue}</p>
            </div>
            {gameOfTheDay.prizeImageUrl && (
              <img src={gameOfTheDay.prizeImageUrl} alt="" className="w-14 h-14 object-contain rounded-xl shrink-0 relative z-10" />
            )}
            <button onClick={()=>setLocation(`/game/${gameOfTheDay.id}`)}
              className="join-btn shrink-0 relative z-10 px-7 py-2.5 rounded-xl font-black text-sm text-white">
              PLAY NOW
            </button>
          </div>
        </div>
      )}

      {/* ── LIVE DROPS ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" fill="currentColor" />
            <h2 className="text-white font-black text-lg uppercase tracking-wide">Live Drops</h2>
          </div>
          <button onClick={()=>setLocation("/games")}
            className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
            View All Drops <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i=>(
              <div key={i} className="h-80 rounded-2xl animate-pulse" style={{background:"#13131f"}} />
            ))}
          </div>
        ) : activeGames.length===0 ? (
          <div className="rounded-2xl flex flex-col items-center py-16 text-center"
            style={{background:"#13131f", border:"1px solid rgba(255,255,255,0.06)"}}>
            <span className="text-5xl mb-4">🎮</span>
            <h3 className="text-white font-black text-lg mb-2">No Live Drops Right Now</h3>
            <p className="text-gray-600 text-sm mb-5">New drops launch regularly — get tokens ready!</p>
            <button onClick={()=>setLocation("/add-credits")}
              className="join-btn px-6 py-2.5 rounded-xl font-bold text-sm text-white">
              Buy Tokens
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGames.map(g=>(
              <DropCard key={g.id} game={g} onPlay={()=>setLocation(`/game/${g.id}`)} />
            ))}
          </div>
        )}
      </section>

      {/* ── CLOSING SOON ──────────────────────────────────────────────── */}
      {closingSoonGames && closingSoonGames.length>0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🔥</span>
            <h2 className="text-white font-black text-lg uppercase tracking-wide">Closing Soon</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {closingSoonGames.map(g=>(
              <MiniCard key={g.id} game={g} onPlay={()=>setLocation(`/game/${g.id}`)} />
            ))}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-12 mt-4"
        style={{background:"rgba(255,255,255,0.015)", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-8">
            <Zap className="h-5 w-5 text-yellow-400" fill="currentColor" />
            <h2 className="text-white font-black text-lg uppercase tracking-wide">How PrizePlugz Works</h2>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { num:"1", emoji:"🪙", title:"Buy Tokens",      desc:"Get tokens to use across all drops." },
              { num:"2", emoji:"🎟️", title:"Join Drops",      desc:"Use tokens to join creator drops." },
              { num:"3", emoji:"⏳", title:"Drop Closes",     desc:"When the timer hits zero, entries close." },
              { num:"4", emoji:"🏆", title:"Winner Selected", desc:"A winner is selected at random." },
              { num:"5", emoji:"🎁", title:"Prize Delivered", desc:"Winner receives their epic reward!" },
            ].map((step, i, arr) => (
              <div key={step.num} className="relative flex flex-col items-center text-center gap-3">
                {/* Arrow */}
                {i < arr.length - 1 && (
                  <div className="absolute top-7 left-[60%] w-[80%] flex items-center justify-center pointer-events-none z-10">
                    <div className="flex-1 border-t border-dashed" style={{borderColor:"rgba(255,255,255,0.12)"}} />
                    <span className="text-gray-700 text-xs mx-1">›</span>
                  </div>
                )}

                {/* Circle */}
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl z-20"
                  style={{background:"rgba(124,58,237,0.15)", border:"2px solid rgba(124,58,237,0.3)"}}>
                  {step.emoji}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                    style={{background:"#7c3aed"}}>
                    {step.num}
                  </span>
                </div>

                {/* Text */}
                <div>
                  <p className="text-white font-black text-xs leading-tight">{step.title}</p>
                  <p className="text-gray-600 text-[10px] mt-0.5 leading-snug">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CREATORS ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
            <h2 className="text-white font-black text-lg uppercase tracking-wide">Featured Creators</h2>
          </div>
          <button className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
            View All Creators <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CREATORS.map(c => {
            const isFollowed = followedCreators.has(c.name);
            return (
              <div key={c.name} className="creator-card rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
                style={{background:"#13131f", border:"1px solid rgba(255,255,255,0.07)"}}>
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white ring-2"
                  style={{background:`linear-gradient(135deg,${c.color}40,${c.color}20)`, ringColor:c.color, border:`2px solid ${c.color}50`}}>
                  {c.letter}
                </div>
                {/* Name */}
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-white font-black text-sm">{c.name}</p>
                    <BadgeCheck className="h-3.5 w-3.5" style={{color:c.color}} />
                  </div>
                  <p className="text-gray-600 text-xs mt-0.5">{c.followers} Followers</p>
                </div>
                {/* Follow button */}
                <button
                  onClick={()=>{
                    setFollowedCreators(prev => {
                      const next = new Set(prev);
                      if (next.has(c.name)) next.delete(c.name); else next.add(c.name);
                      return next;
                    });
                  }}
                  className={`follow-btn w-full py-2 rounded-xl text-xs font-bold transition-all ${isFollowed ? "" : ""}`}
                  style={isFollowed
                    ? {background:"rgba(124,58,237,0.2)", color:"#a78bfa", border:"1.5px solid rgba(124,58,237,0.5)"}
                    : {}}>
                  {isFollowed ? "✓ Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── RECENT WINNERS ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <h2 className="text-white font-black text-lg uppercase tracking-wide">Recent Winners</h2>
          </div>
          <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"
              style={{animation:"blink 1.4s ease-in-out infinite"}} />
            Live Feed
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{background:"#13131f", border:"1px solid rgba(255,255,255,0.06)"}}>
          {displayWinners.map((w, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors"
              style={{borderBottom: i<displayWinners.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none"}}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                style={{background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.25)"}}>
                {w.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm">{w.name}</p>
                  {i===0 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                    style={{background:"rgba(16,185,129,0.18)", color:"#34d399", border:"1px solid rgba(16,185,129,0.3)"}}>NEW</span>}
                </div>
                <p className="text-gray-600 text-xs">{w.ago}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-violet-400 font-black text-sm">{w.prize}</p>
                <p className="text-gray-700 text-xs">Just won</p>
              </div>
            </div>
          ))}
          <div className="px-5 py-3" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
            <button onClick={()=>setLocation("/dashboard")}
              className="w-full text-center text-violet-400 hover:text-violet-300 text-sm font-semibold py-1 flex items-center justify-center gap-1 transition-colors">
              View All Winners <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── INVITE FRIENDS ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 md:pb-12">
        <div className="relative overflow-hidden rounded-2xl"
          style={{background:"linear-gradient(135deg,#0f0a28,#1a1040,#0f0a28)", border:"1px solid rgba(124,58,237,0.28)"}}>
          <div className="absolute inset-0 pointer-events-none"
            style={{background:"radial-gradient(circle at 60% 50%,rgba(124,58,237,0.1),transparent 60%)"}} />

          <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
            {/* Left text + emoji */}
            <div className="flex items-center gap-5 flex-1">
              <div className="text-5xl shrink-0">🎉</div>
              <div>
                <h3 className="text-white font-black text-xl leading-snug">
                  Invite Friends.<br />
                  <span style={{color:"#a78bfa"}}>Earn Bonus Tokens.</span>
                </h3>
                <p className="text-gray-500 text-sm mt-1">Give 10, Get 10 tokens when they sign up!</p>
              </div>
            </div>

            {/* Center: invite code */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Your Invite Code</p>
              <div className="flex items-center gap-3">
                <p className="text-violet-300 font-black text-2xl tracking-widest">{referralCode}</p>
                <button onClick={copyReferral}
                  className="p-2 rounded-lg transition hover:bg-white/8"
                  style={{border:"1px solid rgba(124,58,237,0.4)"}}>
                  {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-violet-400" />}
                </button>
              </div>
            </div>

            {/* Right: CTA button */}
            <button
              onClick={async ()=>{
                if (typeof (navigator as any).share === "function" && referralLink) {
                  try { await (navigator as any).share({title:"Join Prize Plugz!",url:referralLink}); return; } catch{}
                }
                copyReferral();
              }}
              className="join-btn flex items-center gap-2 px-7 py-3 rounded-xl font-black text-sm text-white shrink-0"
              style={{boxShadow:"0 4px 20px rgba(124,58,237,0.4)"}}>
              <span style={{fontSize:"16px"}}>→</span>
              Invite Friends
            </button>
          </div>
        </div>
      </section>

      {/* ── BOTTOM NAV (mobile) ───────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden"
        style={{background:"rgba(13,13,20,0.98)", backdropFilter:"blur(20px)", borderTop:"1px solid rgba(255,255,255,0.07)"}}>
        <div className="grid grid-cols-5 h-16">
          {[
            { icon:Home,    label:"Home",  path:"/" },
            { icon:ShoppingBag, label:"Drops",  path:"/games" },
            { icon:null,    label:"Buy",   path:"/add-credits", center:true },
            { icon:Wallet,  label:"Wallet",path:"/wallet" },
            { icon:User,    label:"Profile",path:"/dashboard" },
          ].map(({ icon:Icon, label, path, center }) =>
            center
              ? <div key={label} className="flex flex-col items-center justify-end pb-1 -mt-6">
                  <button onClick={()=>setLocation(path)}
                    className="w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 text-white shadow-2xl"
                    style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow:"0 0 20px rgba(124,58,237,0.7)"}}>
                    <Zap className="h-5 w-5" fill="currentColor" />
                  </button>
                  <span className="text-[10px] font-semibold text-gray-500 mt-1">{label}</span>
                </div>
              : <button key={label} onClick={()=>setLocation(path)}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${path==="/"?"text-violet-400":"text-gray-600 hover:text-gray-400"}`}>
                  {Icon && <Icon className="h-5 w-5" />}
                  <span className="text-[10px] font-semibold">{label}</span>
                </button>
          )}
        </div>
      </nav>
    </div>
  );
}
