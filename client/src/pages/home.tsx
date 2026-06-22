import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import {
  Zap, Trophy, Gift, Users, Shield, Bell, LogOut, Coins,
  ChevronRight, Home, Gamepad2, Wallet, User, Copy,
  CheckCircle, Timer, Flame, Star, Play,
} from "lucide-react";
import { logout } from "@/lib/auth";
import type { Game } from "@shared/schema";
import logoPath from "@assets/logo_1777237644041.png";
import imgCash     from "@assets/prize-cash.png";
import imgPs5      from "@assets/prize-ps5.png";
import imgTv       from "@assets/prize-tv.png";
import imgVip      from "@assets/prize-vip.png";
import imgTreasure from "@assets/hero-treasure.png";
import imgToken    from "@assets/prize-token.png";

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes pulse2   { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes fadeIn   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer  { 0%{background-position:-400% center} 100%{background-position:400% center} }
  @keyframes ripple   { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }

  .ticker-wrap  { overflow:hidden; }
  .ticker-inner { animation:ticker 32s linear infinite; display:flex; width:max-content; white-space:nowrap; }
  .float-anim   { animation:floatY 5s ease-in-out infinite; }
  .fade-in      { animation:fadeIn 0.6s ease both; }

  .drop-card { transition:transform .22s ease, box-shadow .22s ease; }
  .drop-card:hover { transform:translateY(-5px); box-shadow:0 20px 50px rgba(124,58,237,.25)!important; }

  .live-dot::after {
    content:'';
    position:absolute; inset:-4px;
    border-radius:50%;
    border:2px solid #4ade80;
    animation:ripple 1.4s ease-out infinite;
  }

  .join-btn {
    background:linear-gradient(135deg,#7c3aed,#6d28d9);
    transition:all .2s ease;
  }
  .join-btn:hover {
    background:linear-gradient(135deg,#8b5cf6,#7c3aed);
    transform:scale(1.03);
    box-shadow:0 6px 24px rgba(124,58,237,.5);
  }

  .step-arrow { color:rgba(255,255,255,0.15); font-size:20px; }

  .shimmer-text {
    background: linear-gradient(90deg,#fff 0%,#a78bfa 40%,#7c3aed 60%,#fff 100%);
    background-size:300% auto;
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
    animation:shimmer 5s linear infinite;
  }

  ::-webkit-scrollbar { height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(124,58,237,.4); border-radius:2px; }
`;

/* ── FAKE DATA (fallbacks when DB empty) ────────────────────────────────── */
const FAKE_WINNERS = [
  { name:"PlugzKing",   prize:"$750 Cash",    ago:"just now",   icon:"💵" },
  { name:"SpinMaster",  prize:"PS5 Console",  ago:"4 min ago",  icon:"🎮" },
  { name:"LuckyAce",   prize:"$1,000 Cash",  ago:"9 min ago",  icon:"💵" },
  { name:"WinnerBoss",  prize:"65\" Smart TV",ago:"18 min ago", icon:"📺" },
];

const TICKER_FALLBACK = [
  "🏆 PlugzKing just won $750 Cash!",
  "🎮 SpinMaster claimed a PS5!",
  "💵 LuckyAce hit the $1,000 jackpot!",
  "📺 WinnerBoss won a 65\" 4K TV!",
  "🎁 TokenPro snagged the VIP Gift Pack!",
];

/* ── COUNTDOWN HOOK ─────────────────────────────────────────────────────── */
function useCountdown(endTime: string) {
  const [label, setLabel] = useState("");
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
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endTime]);
  return label;
}

/* ── GAME CARD ──────────────────────────────────────────────────────────── */
function DropCard({ game, onPlay }: { game: Game; onPlay: () => void }) {
  const countdown = useCountdown(game.endTime as string);
  const pct = game.tokenThreshold > 0
    ? Math.min((game.tokensCollected / game.tokenThreshold) * 100, 100) : 0;
  const isHot = pct >= 80;
  const isAlmost = pct >= 95;
  const barColor = isAlmost ? "#ef4444" : isHot ? "#f97316" : "#7c3aed";

  return (
    <div onClick={onPlay}
      className="drop-card rounded-2xl overflow-hidden cursor-pointer flex flex-col"
      style={{background:"#13131f",border:"1px solid rgba(255,255,255,0.07)",boxShadow:"0 4px 24px rgba(0,0,0,.5)"}}>

      {/* Image area */}
      <div className="relative h-48 sm:h-52 overflow-hidden" style={{background:"#1a1a2e"}}>
        {game.prizeImageUrl
          ? <img src={game.prizeImageUrl} alt={game.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          : <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl opacity-60">🎁</span>
            </div>
        }

        {/* Bottom gradient */}
        <div className="absolute bottom-0 inset-x-0 h-20 pointer-events-none"
          style={{background:"linear-gradient(to top,#13131f,transparent)"}} />

        {/* LIVE badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black text-white"
          style={{background:"rgba(16,185,129,0.9)",backdropFilter:"blur(8px)"}}>
          <span className="relative w-1.5 h-1.5 live-dot">
            <span className="block w-1.5 h-1.5 bg-white rounded-full" />
          </span>
          LIVE
        </div>

        {/* Countdown badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white"
          style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.1)"}}>
          <Timer className="h-3 w-3 text-violet-400" />
          {countdown}
        </div>

        {/* Hot badge */}
        {isAlmost && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse"
            style={{background:"rgba(239,68,68,0.9)",color:"white"}}>
            🔥 ALMOST FULL
          </div>
        )}
        {isHot && !isAlmost && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-black"
            style={{background:"rgba(249,115,22,0.85)",color:"white"}}>
            ⚡ HOT
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="text-white font-black text-base leading-tight line-clamp-1">{game.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
            {game.prize || "Amazing Prize"} — worth ${game.prizeValue}
          </p>
        </div>

        {/* Progress */}
        {game.tokenThreshold > 0 && (
          <div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.07)"}}>
              <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:barColor}} />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-600">
              <span>{Math.round(pct)}% filled</span>
              <span>{game.numbersLeft} spots left</span>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3 text-violet-400" />
            {(game.tokenThreshold - game.numbersLeft).toLocaleString()} joined
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-400" />
            {game.tokenCostPerEntry} Tokens
          </span>
        </div>

        {/* CTA */}
        <button onClick={e => { e.stopPropagation(); onPlay(); }}
          className="join-btn w-full py-2.5 rounded-xl font-black text-sm text-white">
          Join Drop
        </button>
      </div>
    </div>
  );
}

/* ── PAGE ───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [, setLocation] = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [copied, setCopied] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

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
  const referralCode = referralData?.referralCode;
  const referralLink = referralCode ? `${window.location.origin}/?ref=${referralCode}` : null;

  const displayWinners = (winnersData && winnersData.length > 0)
    ? winnersData.slice(0, 4).map(w => ({
        name: w.winnerName, prize: w.prize,
        icon: w.prize?.toLowerCase().includes("cash") || w.prize?.startsWith("$") ? "💵" : "🏆",
        ago: new Date(w.completedAt).toLocaleDateString(),
      }))
    : FAKE_WINNERS;

  const tickerItems = winnersData && winnersData.length > 0
    ? winnersData.map(w => `🏆 ${w.winnerName} won ${w.prize}!`)
    : TICKER_FALLBACK;

  async function markAllRead() {
    try {
      await fetch("/api/notifications/read-all", { method: "POST", credentials: "include" });
      refetchNotifs();
    } catch (_) {}
  }

  // Close notifs on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function copyReferral() {
    if (!referralLink) return;
    try { navigator.clipboard.writeText(referralLink); } catch (_) {
      const el = document.createElement("textarea");
      el.value = referralLink; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen text-white" style={{background:"#0d0d14"}}>
      <style>{CSS}</style>

      {/* ── TICKER ──────────────────────────────────────────────────────── */}
      <div className="relative border-b border-white/5 py-2 overflow-hidden" style={{background:"#0a0a12"}}>
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10" style={{background:"linear-gradient(90deg,#0a0a12,transparent)"}} />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10" style={{background:"linear-gradient(270deg,#0a0a12,transparent)"}} />
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...tickerItems,...tickerItems].map((item,i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-10 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{animation:"pulse2 1.4s ease-in-out infinite"}} />
                <span className="text-gray-400">{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50" style={{background:"rgba(13,13,20,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <img src={logoPath} alt="Prize Plugz" className="h-9 w-auto object-contain shrink-0 cursor-pointer"
            onClick={() => setLocation("/")} />

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label:"Home",      path:"/" },
              { label:"Drops",     path:"/games" },
              { label:"Winners",   path:"/dashboard" },
              { label:"How It Works", path:"/how-to-play" },
            ].map(({ label, path }) => (
              <button key={label} onClick={() => setLocation(path)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${path==="/" ? "text-white" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
                style={path==="/" ? {color:"#a78bfa",borderBottom:"2px solid #7c3aed"} : {}}>
                {label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Token balance */}
            <button onClick={() => setLocation("/add-credits")}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-black transition-all hover:scale-105"
              style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.35)",color:"#c4b5fd"}}>
              <Zap className="h-4 w-4 text-yellow-400" fill="currentColor" />
              <span className="text-white">{tokenBalance}</span>
              <span className="hidden sm:inline text-violet-400">Tokens</span>
              <span className="hidden sm:inline text-gray-600">▾</span>
            </button>

            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setShowNotifs(p => !p); if (!showNotifs) markAllRead(); }}
                className="relative p-2.5 rounded-full transition hover:bg-white/8"
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <Bell className="h-4 w-4 text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  style={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.1)"}}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <span className="text-white font-bold text-sm">Notifications</span>
                    <button onClick={() => setShowNotifs(false)} className="text-gray-600 hover:text-white text-xs">✕</button>
                  </div>
                  {notifsList.length === 0
                    ? <p className="px-4 py-6 text-center text-gray-600 text-sm">No notifications yet</p>
                    : <div className="max-h-72 overflow-y-auto">
                        {notifsList.map((n: any) => (
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
            <button onClick={() => setLocation("/dashboard")} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)"}}>
                {avatarLetter}
              </div>
            </button>

            {/* Logout */}
            <button onClick={() => logout()} className="hidden sm:block p-2 text-gray-600 hover:text-red-400 transition">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{background:"linear-gradient(135deg,#0d0d14 0%,#130d28 50%,#0d0d14 100%)"}}>
        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{backgroundImage:"linear-gradient(rgba(124,58,237,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.05) 1px,transparent 1px)",backgroundSize:"60px 60px"}} />
        {/* Glow blob */}
        <div className="absolute pointer-events-none" style={{width:"600px",height:"600px",top:"-100px",right:"-100px",background:"radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 60%)"}} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center">

          {/* Left text */}
          <div className="fade-in space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{background:"rgba(124,58,237,0.12)",border:"1px solid rgba(124,58,237,0.3)",color:"#a78bfa"}}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{animation:"pulse2 1.4s ease-in-out infinite"}} />
              LIVE DROPS HAPPENING NOW
            </div>

            <div>
              <h1 className="font-black leading-tight text-white"
                style={{fontSize:"clamp(2.4rem,6vw,3.8rem)"}}>
                Join Creator Drops.{" "}
                <br className="hidden sm:block" />
                <span style={{color:"#a78bfa"}}>Win Epic Rewards.</span>
              </h1>
              <p className="text-gray-500 text-base mt-4 max-w-md leading-relaxed">
                Use tokens to join interactive drops and win real cash, gadgets, and luxury prizes. 100% transparent — auto winner every time.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setLocation("/add-credits")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-base text-white transition-all hover:scale-105"
                style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",boxShadow:"0 0 30px rgba(124,58,237,0.4)"}}>
                <Zap className="h-5 w-5" />Buy Tokens
              </button>
              <button onClick={() => setLocation("/how-to-play")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-base text-gray-300 transition-all hover:text-white hover:bg-white/8"
                style={{border:"2px solid rgba(255,255,255,0.12)"}}>
                <Play className="h-4 w-4 fill-current" />How It Works
              </button>
            </div>

            {/* Micro stats */}
            <div className="flex items-center gap-6 pt-2">
              {[
                { val:"$127K+", label:"Total Paid Out", color:"#f59e0b" },
                { val:"12K+",   label:"Active Players", color:"#10b981" },
                { val:"98K+",   label:"Games Completed",color:"#a78bfa" },
              ].map(({ val, label, color }) => (
                <div key={label} className="text-center sm:text-left">
                  <p className="font-black text-xl leading-none" style={{color}}>{val}</p>
                  <p className="text-gray-600 text-[11px] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* Glow behind */}
              <div className="absolute inset-0 rounded-3xl" style={{background:"radial-gradient(ellipse,rgba(124,58,237,0.35) 0%,transparent 70%)",filter:"blur(30px)",transform:"scale(1.1)"}} />
              <div className="relative rounded-3xl overflow-hidden float-anim"
                style={{background:"#1a1a2e",border:"1px solid rgba(124,58,237,0.25)",boxShadow:"0 30px 80px rgba(0,0,0,0.6)"}}>
                <img src={imgTreasure} alt="Prize Box" className="w-full h-64 object-cover" style={{filter:"saturate(1.2)"}} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
                {/* Live badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
                  style={{background:"rgba(16,185,129,0.85)",color:"white",backdropFilter:"blur(8px)"}}>
                  <span className="w-1.5 h-1.5 bg-white rounded-full" style={{animation:"pulse2 1s ease-in-out infinite"}} />
                  LIVE JACKPOT
                </div>
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-black text-yellow-300"
                  style={{background:"rgba(245,158,11,0.2)",border:"1px solid rgba(245,158,11,0.4)"}}>
                  🏆 BIG PRIZES
                </div>
                <div className="p-5">
                  <h3 className="text-white font-black text-lg">Win Real Prizes</h3>
                  <p className="text-gray-500 text-sm mt-1">Tokens fill the pot — last one in triggers the draw!</p>
                  <button onClick={() => activeGames[0] ? setLocation(`/game/${activeGames[0].id}`) : setLocation("/games")}
                    className="join-btn mt-4 w-full py-3 rounded-xl font-black text-sm text-white">
                    Enter Now — {activeGames[0]?.tokenCostPerEntry ?? 5} Tokens
                  </button>
                </div>
              </div>

              {/* Floating prize chips */}
              <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-2">
                {[imgCash, imgPs5, imgTv, imgVip].map((img, i) => (
                  <div key={i} className="w-10 h-10 rounded-xl overflow-hidden border-2"
                    style={{borderColor:"rgba(124,58,237,0.4)",background:"#0d0d14",boxShadow:"0 4px 12px rgba(0,0,0,0.5)"}}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GAME OF THE DAY ─────────────────────────────────────────────── */}
      {gameOfTheDay && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
          <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6"
            style={{background:"linear-gradient(135deg,#1a0f3d,#2d1b69,#1a0845)",border:"1px solid rgba(245,158,11,0.4)",boxShadow:"0 0 40px rgba(245,158,11,0.1)"}}>
            <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(circle at 80% 50%,rgba(245,158,11,0.08),transparent 60%)"}} />
            <div className="shrink-0 relative z-10 text-center sm:text-left">
              <span className="text-yellow-400 text-xs font-black tracking-[0.25em] uppercase">⭐ Game of the Day</span>
              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <span className="w-2 h-2 rounded-full bg-green-400" style={{animation:"pulse2 1.4s ease-in-out infinite"}} />
                <span className="text-green-400 text-xs font-bold">Live Now</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 relative z-10 text-center sm:text-left">
              <h2 className="text-white font-black text-xl leading-tight truncate">{gameOfTheDay.name}</h2>
              <p className="text-yellow-300/70 text-sm mt-0.5">{gameOfTheDay.prize} — ${gameOfTheDay.prizeValue}</p>
            </div>
            {gameOfTheDay.prizeImageUrl && (
              <img src={gameOfTheDay.prizeImageUrl} alt="" className="w-16 h-16 object-contain rounded-xl shrink-0 relative z-10" />
            )}
            <button onClick={() => setLocation(`/game/${gameOfTheDay.id}`)}
              className="join-btn shrink-0 relative z-10 px-7 py-3 rounded-xl font-black text-sm text-white">
              PLAY NOW
            </button>
          </div>
        </div>
      )}

      {/* ── LIVE DROPS ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Zap className="h-5 w-5 text-yellow-400" fill="currentColor" />
            <h2 className="text-white font-black text-xl tracking-wide uppercase">Live Drops</h2>
          </div>
          <button onClick={() => setLocation("/games")}
            className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
            View All Drops <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-96 rounded-2xl animate-pulse" style={{background:"#13131f"}} />
            ))}
          </div>
        ) : activeGames.length === 0 ? (
          <div className="rounded-2xl flex flex-col items-center justify-center py-16 text-center"
            style={{background:"#13131f",border:"1px solid rgba(255,255,255,0.06)"}}>
            <span className="text-5xl mb-4">🎮</span>
            <h3 className="text-white font-black text-lg mb-2">No Live Drops Right Now</h3>
            <p className="text-gray-600 text-sm mb-5">New drops launch regularly. Get your tokens ready!</p>
            <button onClick={() => setLocation("/add-credits")} className="join-btn px-6 py-2.5 rounded-xl font-bold text-sm text-white">
              Buy Tokens
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGames.map(g => (
              <DropCard key={g.id} game={g} onPlay={() => setLocation(`/game/${g.id}`)} />
            ))}
          </div>
        )}
      </section>

      {/* ── CLOSING SOON ────────────────────────────────────────────────── */}
      {closingSoonGames && closingSoonGames.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Flame className="h-5 w-5 text-red-400" />
            <h2 className="text-white font-black text-xl uppercase tracking-wide">Closing Soon</h2>
            <span className="text-gray-600 text-sm font-medium">— get in before it's too late</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {closingSoonGames.map(g => {
              const pct = Math.round(g.pct * 100);
              const color = pct >= 95 ? "#ef4444" : pct >= 80 ? "#f97316" : "#f59e0b";
              return (
                <div key={g.id} onClick={() => setLocation(`/game/${g.id}`)}
                  className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
                  style={{background:"#13131f",border:`1px solid rgba(239,68,68,0.2)`}}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-black text-sm truncate">{g.name}</p>
                      <p className="text-gray-600 text-xs">{g.prize}</p>
                    </div>
                    <span className="ml-2 text-xs font-black px-2 py-0.5 rounded-full shrink-0"
                      style={{background:`${color}20`,color,border:`1px solid ${color}40`}}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{background:"rgba(255,255,255,0.07)"}}>
                    <div className="h-full rounded-full" style={{width:`${pct}%`,background:color}} />
                  </div>
                  <p className="text-gray-600 text-xs">{g.numbersLeft} spots left</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="py-12" style={{background:"rgba(124,58,237,0.04)",borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2.5 mb-8">
            <Zap className="h-5 w-5 text-yellow-400" fill="currentColor" />
            <h2 className="text-white font-black text-xl tracking-wide uppercase">How PrizePlugz Works</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-2">
            {[
              { num:"1", icon:"🪙", title:"Buy Tokens",      desc:"Get tokens to use across all drops." },
              { num:"2", icon:"🎟️", title:"Join Drops",      desc:"Use tokens to enter creator drops." },
              { num:"3", icon:"⏳", title:"Drop Closes",     desc:"When the timer hits zero, entries close." },
              { num:"4", icon:"🏆", title:"Winner Selected", desc:"A winner is selected automatically." },
              { num:"5", icon:"🎁", title:"Prize Delivered", desc:"Winner receives their epic reward!" },
            ].map((step, i, arr) => (
              <div key={step.num} className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-3 flex-1 sm:text-center">
                {/* Step circle */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                    style={{background:"rgba(124,58,237,0.15)",border:"2px solid rgba(124,58,237,0.35)"}}>
                    {step.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                    style={{background:"#7c3aed"}}>
                    {step.num}
                  </span>
                </div>
                <div className="sm:text-center">
                  <p className="text-white font-black text-sm">{step.title}</p>
                  <p className="text-gray-600 text-xs mt-0.5 leading-relaxed max-w-[120px]">{step.desc}</p>
                </div>
                {/* Arrow between steps */}
                {i < arr.length - 1 && (
                  <div className="hidden sm:flex items-center self-start mt-5 flex-1 justify-center">
                    <span className="step-arrow">→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT WINNERS ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <h2 className="text-white font-black text-xl uppercase tracking-wide">Recent Winners</h2>
          </div>
          <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{animation:"pulse2 1.4s ease-in-out infinite"}} />
            Live Feed
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{background:"#13131f",border:"1px solid rgba(255,255,255,0.06)"}}>
          {displayWinners.map((w, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/2"
              style={{borderBottom: i < displayWinners.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"}}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)"}}>
                {w.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm">{w.name}</p>
                  {i === 0 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{background:"rgba(16,185,129,0.2)",color:"#34d399",border:"1px solid rgba(16,185,129,0.3)"}}>NEW</span>}
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
            <button onClick={() => setLocation("/dashboard")}
              className="w-full text-center text-violet-400 hover:text-violet-300 text-sm font-semibold py-1 transition-colors flex items-center justify-center gap-1">
              View All Winners <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── INVITE FRIENDS BANNER ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 md:pb-10">
        <div className="relative overflow-hidden rounded-2xl"
          style={{background:"linear-gradient(135deg,#0f0a28,#1a1040,#0f0a28)",border:"1px solid rgba(124,58,237,0.3)"}}>
          <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(circle at 70% 50%,rgba(124,58,237,0.12),transparent 60%)"}} />
          <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
            {/* Text */}
            <div className="flex-1 text-center sm:text-left">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-white font-black text-xl leading-tight">
                Invite Friends.<br />
                <span style={{color:"#a78bfa"}}>Earn Bonus Tokens.</span>
              </h3>
              <p className="text-gray-500 text-sm mt-2">Give 10, Get 10 tokens when they sign up!</p>
            </div>

            {/* Referral code box */}
            {referralLink ? (
              <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
                <div className="text-center">
                  <p className="text-gray-500 text-xs mb-1 font-semibold uppercase tracking-wide">Your Invite Code</p>
                  <p className="text-violet-300 font-black text-2xl tracking-widest">{referralCode}</p>
                </div>
                <button onClick={copyReferral}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{background:"rgba(124,58,237,0.3)",border:"1px solid rgba(124,58,237,0.5)"}}>
                  {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            ) : (
              <button onClick={() => setLocation("/dashboard")}
                className="join-btn px-8 py-3 rounded-xl font-black text-sm text-white">
                Get Your Code
              </button>
            )}

            {/* Invite friends button */}
            <button
              onClick={async () => {
                if (typeof (navigator as any).share === "function" && referralLink) {
                  try { await (navigator as any).share({ title:"Join Prize Plugz!", text:"Sign up & we both get 10 free tokens!", url: referralLink }); } catch (_) {}
                } else { copyReferral(); }
              }}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-105"
              style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",boxShadow:"0 0 24px rgba(124,58,237,0.4)"}}>
              <Gift className="h-4 w-4" />
              Invite Friends
            </button>
          </div>
        </div>
      </section>

      {/* ── BOTTOM NAV (mobile) ─────────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden flex items-end"
        style={{background:"rgba(13,13,20,0.98)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
        <div className="w-full grid grid-cols-5">
          {[
            { icon:Home,    label:"Home",    path:"/" },
            { icon:Gamepad2,label:"Drops",   path:"/games" },
            { icon:null,    label:"Buy",     path:"/add-credits", center:true },
            { icon:Wallet,  label:"Wallet",  path:"/wallet" },
            { icon:User,    label:"Profile", path:"/dashboard" },
          ].map(({ icon:Icon, label, path, center }) => (
            center
              ? <div key={label} className="flex flex-col items-center pb-3 pt-1 -mt-5">
                  <button onClick={() => setLocation(path)}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
                    style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",boxShadow:"0 0 24px rgba(124,58,237,0.6)"}}>
                    <Zap className="h-6 w-6 text-white" fill="currentColor" />
                  </button>
                  <span className="text-[10px] text-gray-500 font-semibold mt-1">{label}</span>
                </div>
              : <button key={label} onClick={() => setLocation(path)}
                  className={`flex flex-col items-center gap-1 py-3 transition-colors ${path==="/" ? "text-violet-400" : "text-gray-600 hover:text-gray-400"}`}>
                  {Icon && <Icon className="h-5 w-5" />}
                  <span className="text-[10px] font-semibold">{label}</span>
                </button>
          ))}
        </div>
      </nav>

      {/* Spacer for mobile nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
