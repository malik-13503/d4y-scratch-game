import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Trophy, Users, Bell, LogOut,
  ChevronRight, Home, Wallet, User,
  Copy, CheckCircle, Timer, Star,
  ShoppingBag, Play, BadgeCheck, Sparkles,
} from "lucide-react";
import { logout } from "@/lib/auth";
import type { Game } from "@shared/schema";
import logoPath       from "@assets/logo_1777237644041.png";
import imgTreasure    from "@assets/hero-treasure.png";
import imgCash        from "@assets/prize-cash.png";
import imgPs5         from "@assets/prize-ps5.png";
import imgTv          from "@assets/prize-tv.png";
import imgVip         from "@assets/prize-vip.png";
import imgPrizeBox    from "@assets/hero_prizebox.png";
import imgBgSpace     from "@assets/hero_bg_space.png";
import imgCreatorAddy   from "@assets/creator_addy.png";
import imgCreatorTaylor from "@assets/creator_taylor.png";
import imgCreatorJay    from "@assets/creator_jay.png";
import imgCreatorMaya   from "@assets/creator_maya.png";

/* ── GLOBAL STYLES ─────────────────────────────────────────────────────── */
const CSS = `
  *, body { font-family: 'Outfit', 'Space Grotesk', system-ui, sans-serif; }

  @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.25} }
  @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes floatY2  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes pulseGlow { 0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.4)} 50%{box-shadow:0 0 45px rgba(124,58,237,0.8)} }
  @keyframes shimmer  { 0%{background-position:-400% center} 100%{background-position:400% center} }
  @keyframes orbMove1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.08)} 66%{transform:translate(-20px,20px) scale(0.95)} }
  @keyframes orbMove2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,25px) scale(1.05)} 66%{transform:translate(30px,-15px) scale(0.97)} }
  @keyframes orbMove3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(25px,35px)} }
  @keyframes scaleIn  { from{transform:scale(0.85);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes slideRight { from{transform:translateX(-20px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes countUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ringPulse { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }
  @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .outfit     { font-family:'Outfit','Space Grotesk',system-ui,sans-serif; }
  .ticker-wrap{ overflow:hidden; }
  .ticker-inner{ animation:ticker 38s linear infinite; display:flex; width:max-content; white-space:nowrap; }

  .drop-card  { transition:all 0.25s cubic-bezier(.25,.46,.45,.94); cursor:pointer; will-change:transform; }
  .drop-card:hover { transform:translateY(-6px) scale(1.01); }
  .drop-card:hover .card-glow { opacity:1; }

  .card-glow  { position:absolute; inset:0; border-radius:inherit; pointer-events:none; opacity:0;
    background:linear-gradient(135deg,rgba(124,58,237,0.15),transparent);
    transition:opacity 0.3s ease; z-index:1; }

  .join-btn   { background:linear-gradient(135deg,#7c3aed,#6d28d9);
    transition:all 0.2s cubic-bezier(.25,.46,.45,.94);
    box-shadow:0 4px 20px rgba(124,58,237,0.35); }
  .join-btn:hover { transform:translateY(-2px) scale(1.05);
    box-shadow:0 8px 30px rgba(124,58,237,0.55);
    background:linear-gradient(135deg,#8b5cf6,#7c3aed); }
  .join-btn:active { transform:scale(0.97); }

  .creator-card { transition:all 0.25s ease; cursor:pointer; position:relative; overflow:hidden; }
  .creator-card:hover { transform:translateY(-5px); }
  .creator-card:hover .creator-img { transform:scale(1.08); }
  .creator-img { transition:transform 0.4s ease; }

  .follow-btn { transition:all 0.2s ease; }
  .follow-btn:hover { transform:scale(1.05); }

  .stat-chip  { transition:all 0.2s ease; }
  .stat-chip:hover { transform:scale(1.05); background:rgba(124,58,237,0.2) !important; }

  .nav-link   { position:relative; transition:color 0.2s ease; }
  .nav-link.active::after {
    content:''; position:absolute; bottom:-18px; left:50%; transform:translateX(-50%);
    width:28px; height:2.5px; border-radius:2px;
    background:linear-gradient(90deg,#7c3aed,#a78bfa); }

  .hero-text-anim { animation:fadeUp 0.7s ease both; }
  .hero-text-anim:nth-child(1) { animation-delay:0.05s; }
  .hero-text-anim:nth-child(2) { animation-delay:0.15s; }
  .hero-text-anim:nth-child(3) { animation-delay:0.25s; }
  .hero-text-anim:nth-child(4) { animation-delay:0.35s; }

  .ring-pulse::after {
    content:''; position:absolute; inset:-3px; border-radius:50%;
    border:2px solid #4ade80; animation:ringPulse 1.6s ease-out infinite; }

  .shimmer-bar {
    background:linear-gradient(90deg,#7c3aed 0%,#a78bfa 40%,#7c3aed 80%);
    background-size:200% auto;
    animation:shimmer 2.5s linear infinite; }

  .orb1 { animation:orbMove1 14s ease-in-out infinite; }
  .orb2 { animation:orbMove2 18s ease-in-out infinite; }
  .orb3 { animation:orbMove3 10s ease-in-out infinite; }

  .float1 { animation:floatY 5.5s ease-in-out infinite; }
  .float2 { animation:floatY2 4.2s ease-in-out infinite; animation-delay:1s; }

  .grad-text {
    background:linear-gradient(135deg,#c4b5fd,#a78bfa,#7c3aed);
    background-size:200% 200%; animation:gradShift 4s ease infinite;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

  .section-fade { animation:fadeUp 0.6s ease both; }

  .prize-chip { transition:all 0.2s ease; }
  .prize-chip:hover { transform:scale(1.08) rotate(-2deg); border-color:rgba(124,58,237,0.5) !important; }

  ::-webkit-scrollbar { width:5px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(124,58,237,.4); border-radius:3px; }

  .glass-card {
    background:rgba(19,19,31,0.8);
    backdrop-filter:blur(12px);
    border:1px solid rgba(255,255,255,0.07);
  }
  .glass-card-hover { transition:all 0.25s ease; }
  .glass-card-hover:hover { border-color:rgba(124,58,237,0.35) !important; background:rgba(26,26,48,0.9) !important; }
`;

/* ── CONSTANTS ──────────────────────────────────────────────────────────── */
const TICKER_FALLBACK = [
  "🏆 PlugzKing just won $750 Cash!",
  "🎮 SpinMaster claimed a PS5 Slim!",
  "💵 LuckyAce hit the $1,000 jackpot!",
  "📺 WinnerBoss won a 65\" 4K TV!",
  "🎁 TokenPro snagged the VIP Gift Pack!",
  "👜 StyleQueen won a Designer Handbag!",
  "💰 JackAce cashed out $500!",
];

const FAKE_WINNERS = [
  { name:"Anonymous",  prize:"$25 cash game",   ago:"just now",   icon:"💵" },
  { name:"Jarrad L.",  prize:"$300 Cash Game",   ago:"4 min ago",  icon:"💵" },
  { name:"Anonymous",  prize:"$25 cash game",   ago:"10 min ago", icon:"💵" },
  { name:"Anonymous",  prize:"$50 cash game",   ago:"18 min ago", icon:"💵" },
];

const CREATORS = [
  { name:"Addy",   followers:"12.4K", img:imgCreatorAddy,   color:"#f472b6", tag:"Lifestyle" },
  { name:"Taylor", followers:"8.7K",  img:imgCreatorTaylor, color:"#a78bfa", tag:"Beauty" },
  { name:"Jay",    followers:"15.2K", img:imgCreatorJay,    color:"#34d399", tag:"Gaming" },
  { name:"Maya",   followers:"6.1K",  img:imgCreatorMaya,   color:"#fb923c", tag:"Luxury" },
];

const HOW_STEPS = [
  { num:"1", emoji:"🪙", title:"Buy Tokens",      desc:"Get tokens to use across all creator drops." },
  { num:"2", emoji:"🎟️", title:"Join Drops",      desc:"Use tokens to enter your favorite creator drops." },
  { num:"3", emoji:"⏳", title:"Drop Closes",     desc:"When the timer hits zero, entries lock in." },
  { num:"4", emoji:"🏆", title:"Winner Selected", desc:"One lucky participant wins at random." },
  { num:"5", emoji:"🎁", title:"Prize Delivered", desc:"Winner receives their epic reward!" },
];

/* ── HOOKS ──────────────────────────────────────────────────────────────── */
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

function useCounterAnim(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const elRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        function step(now: number) {
          const t = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          setVal(Math.round(ease * target));
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { val, elRef };
}

/* ── TILT CARD WRAPPER ──────────────────────────────────────────────────── */
function TiltCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-5px) scale(1.01)`;
  }, []);
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, []);
  return (
    <div ref={ref} className={className} style={{ transition: "transform 0.35s cubic-bezier(.25,.46,.45,.94)", willChange:"transform", ...style }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}

/* ── DROP CARD ──────────────────────────────────────────────────────────── */
function DropCard({ game, onPlay }: { game: Game; onPlay: () => void }) {
  const countdown = useCountdown(game.endTime as string);
  const pct = game.tokenThreshold > 0 ? Math.min((game.tokensCollected / game.tokenThreshold) * 100, 100) : 0;
  const joined = game.tokenThreshold - game.numbersLeft;
  const barColor = pct >= 95 ? "#ef4444" : pct >= 80 ? "#f97316" : "#7c3aed";
  const [hovered, setHovered] = useState(false);

  return (
    <TiltCard className="drop-card rounded-2xl overflow-hidden flex flex-col relative"
      style={{ background: "#13131f", border: `1px solid ${hovered ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.07)"}`, boxShadow: hovered ? "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.2)" : "0 4px 20px rgba(0,0,0,0.3)" }}>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="flex flex-col flex-1" onClick={onPlay}>
        <div className="card-glow" />

        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: 210, background: "linear-gradient(135deg,#1a1a2e,#0f0a28)", flexShrink: 0 }}>
          {game.prizeImageUrl
            ? <img src={game.prizeImageUrl} alt={game.name} className="w-full h-full object-cover" style={{ transition: "transform 0.4s ease", transform: hovered ? "scale(1.05)" : "scale(1)" }} />
            : <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <span className="text-6xl" style={{ filter: "drop-shadow(0 0 20px rgba(124,58,237,0.5))" }}>🎁</span>
                <span className="text-gray-600 text-xs font-semibold uppercase tracking-widest">Prize Drop</span>
              </div>
          }

          {/* Gradient overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top,rgba(19,19,31,1) 0%,rgba(19,19,31,0.4) 50%,transparent 100%)" }} />

          {/* LIVE badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-black text-white"
            style={{ background: "rgba(16,185,129,0.9)", backdropFilter: "blur(8px)", fontSize: "10px", letterSpacing: "0.08em" }}>
            <span className="relative ring-pulse">
              <span className="block w-1.5 h-1.5 bg-white rounded-full" />
            </span>
            LIVE
          </div>

          {/* Countdown */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-bold text-white"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", fontSize: "11px", border: "1px solid rgba(255,255,255,0.12)" }}>
            <Timer className="h-3 w-3 text-violet-400" style={{ flexShrink: 0 }} />
            {countdown}
          </div>

          {/* Host avatar at bottom */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "2px solid rgba(255,255,255,0.25)", boxShadow: "0 2px 10px rgba(0,0,0,0.4)", flexShrink: 0 }}>
              {game.name[0]?.toUpperCase()}
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
              <span className="text-white font-bold text-xs">{game.name.split(" ")[0]}</span>
              <BadgeCheck className="h-3.5 w-3.5 text-violet-400" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          <div>
            <h3 className="text-white font-black text-base leading-snug outfit">{game.name}</h3>
            <p className="text-gray-500 text-xs mt-0.5 outfit">{game.prize || "Amazing Prize"} — <span className="text-violet-400 font-semibold">${game.prizeValue}</span></p>
          </div>

          {/* Progress bar */}
          {game.tokenThreshold > 0 && (
            <div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor, transition: "width 1s ease", boxShadow: pct >= 80 ? `0 0 8px ${barColor}` : "none" }} />
              </div>
              {pct >= 80 && (
                <p className="text-xs mt-1 font-bold" style={{ color: barColor }}>
                  {pct >= 95 ? "🔥 Almost gone!" : "⚡ Almost full!"}
                </p>
              )}
            </div>
          )}

          {/* Bottom row */}
          <div className="flex items-center gap-2 mt-auto">
            <div className="flex items-center gap-3 text-xs text-gray-400 flex-1">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3 text-violet-400" />
                <span className="text-white font-semibold">{joined.toLocaleString()}</span>
                <span className="text-gray-600">Joined</span>
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-400" fill="currentColor" />
                <span className="text-white font-semibold">{game.tokenCostPerEntry}</span>
                <span className="text-gray-600">Tokens</span>
              </span>
            </div>
            <button onClick={e => { e.stopPropagation(); onPlay(); }}
              className="join-btn px-4 py-2 rounded-xl font-black text-sm text-white shrink-0 outfit">
              Join Drop
            </button>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

/* ── MINI CARD ──────────────────────────────────────────────────────────── */
function MiniCard({ game, onPlay }: { game: Game & { pct: number }; onPlay: () => void }) {
  const pct = Math.round(game.pct * 100);
  const c = pct >= 95 ? "#ef4444" : pct >= 80 ? "#f97316" : "#f59e0b";
  return (
    <div onClick={onPlay} className="drop-card glass-card glass-card-hover rounded-xl p-4 cursor-pointer"
      style={{ border: `1px solid ${c}22` }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-white font-bold text-sm truncate flex-1 outfit">{game.name}</p>
        <span className="ml-2 text-xs font-black shrink-0 px-2 py-0.5 rounded-full"
          style={{ background: `${c}18`, color: c }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c, boxShadow: `0 0 8px ${c}` }} />
      </div>
      <p className="text-gray-600 text-xs outfit">{game.numbersLeft} spots left</p>
    </div>
  );
}

/* ── STAT COUNTER ───────────────────────────────────────────────────────── */
function StatCounter({ val, prefix = "", suffix = "", label, color }: { val: number; prefix?: string; suffix?: string; label: string; color: string }) {
  const { val: animated, elRef } = useCounterAnim(val);
  return (
    <div ref={elRef} className="stat-chip px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="font-black text-xl leading-none outfit" style={{ color }}>{prefix}{animated.toLocaleString()}{suffix}</p>
      <p className="text-gray-600 text-xs mt-1 outfit">{label}</p>
    </div>
  );
}

/* ── PAGE ───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [, setLocation] = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set());
  const [activeNavPath] = useState("/");
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery<any>({ queryKey: ["/api/user"] });
  const { data: tokenData } = useQuery<{ tokenBalance: number }>({ queryKey: ["/api/user/token-balance"], refetchInterval: 15000 });
  const { data: games, isLoading } = useQuery<Game[]>({ queryKey: ["/api/games"], refetchInterval: 20000 });
  const { data: winnersData } = useQuery<{ winnerName: string; prize: string; completedAt: string }[]>({ queryKey: ["/api/winners"], refetchInterval: 60000 });
  const { data: closingSoonGames } = useQuery<(Game & { pct: number })[]>({ queryKey: ["/api/games/closing-soon"], refetchInterval: 30000 });
  const { data: gameOfTheDay } = useQuery<Game | null>({ queryKey: ["/api/games/game-of-the-day"], refetchInterval: 60000 });
  const { data: notifsData, refetch: refetchNotifs } = useQuery<{ notifications: any[]; unreadCount: number }>({ queryKey: ["/api/notifications"], refetchInterval: 30000 });
  const { data: referralData } = useQuery<{ referralCode: string | null }>({ queryKey: ["/api/user/referral-code"] });

  const activeGames = games?.filter(g => g.isActive) ?? [];
  const tokenBalance = tokenData?.tokenBalance ?? 0;
  const unreadCount = notifsData?.unreadCount ?? 0;
  const notifsList = notifsData?.notifications ?? [];
  const username = (user as any)?.firstName ?? (user as any)?.email?.split("@")[0] ?? "Player";
  const avatarLetter = username[0]?.toUpperCase() ?? "P";
  const referralCode = referralData?.referralCode ?? "–";
  const referralLink = referralData?.referralCode ? `${window.location.origin}/?ref=${referralData.referralCode}` : null;

  const displayWinners = (winnersData && winnersData.length > 0)
    ? winnersData.slice(0, 4).map(w => ({ name: w.winnerName, prize: w.prize, icon: w.prize?.toLowerCase().includes("cash") || w.prize?.startsWith("$") ? "💵" : "🏆", ago: new Date(w.completedAt).toLocaleDateString() }))
    : FAKE_WINNERS;

  const tickerItems = winnersData && winnersData.length > 0
    ? winnersData.map(w => `🏆 ${w.winnerName} won ${w.prize}!`)
    : TICKER_FALLBACK;

  async function markAllRead() {
    try { await fetch("/api/notifications/read-all", { method: "POST", credentials: "include" }); refetchNotifs(); } catch {}
  }

  function copyReferral() {
    const text = referralLink || referralCode;
    try { navigator.clipboard.writeText(text); } catch {
      const el = document.createElement("textarea"); el.value = text;
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const NAV = [
    { label: "Home", path: "/" },
    { label: "Drops", path: "/games" },
    { label: "Winners", path: "/dashboard" },
    { label: "How It Works", path: "/how-to-play" },
  ];

  return (
    <div className="min-h-screen text-white outfit" style={{ background: "#080810", overflowX: "hidden" }}>
      <style>{CSS}</style>

      {/* ── TICKER ─────────────────────────────────────────────────────── */}
      <div className="relative py-2 overflow-hidden" style={{ background: "linear-gradient(90deg,#0a0818,#0d0d20,#0a0818)", borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
        <div className="absolute left-0 inset-y-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,#0a0818,transparent)" }} />
        <div className="absolute right-0 inset-y-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,#0a0818,transparent)" }} />
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2.5 mx-12 text-xs font-semibold text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" style={{ animation: "blink 1.6s ease-in-out infinite", animationDelay: `${(i % 5) * 0.3}s` }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50"
        style={{ background: "rgba(8,8,16,0.95)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(124,58,237,0.1)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-5">

          <button onClick={() => setLocation("/")} className="shrink-0">
            <img src={logoPath} alt="Prize Plugz" className="h-10 w-auto object-contain" />
          </button>

          <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-2">
            {NAV.map(({ label, path }) => {
              const active = path === activeNavPath;
              return (
                <button key={label} onClick={() => setLocation(path)}
                  className={`nav-link px-4 py-2 rounded-lg text-sm font-semibold outfit transition-colors ${active ? "active text-white" : "text-gray-500 hover:text-gray-200 hover:bg-white/5"}`}>
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5 ml-auto shrink-0">
            <button onClick={() => setLocation("/add-credits")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.35)", color: "#c4b5fd" }}>
              <Zap className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" />
              <span className="text-white font-black">{tokenBalance}</span>
              <span className="hidden sm:inline outfit">Tokens</span>
              <ChevronRight className="hidden sm:block h-3 w-3 text-gray-600" />
            </button>

            <div className="relative" ref={notifRef}>
              <button onClick={() => { setShowNotifs(p => !p); if (!showNotifs) markAllRead(); }}
                className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Bell className="h-4 w-4 text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                    style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  style={{ background: "#12121e", border: "1px solid rgba(124,58,237,0.2)", boxShadow: "0 25px 60px rgba(0,0,0,0.7)" }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-white font-bold text-sm outfit">Notifications</span>
                    <button onClick={() => setShowNotifs(false)} className="text-gray-600 hover:text-white text-xs transition-colors">✕</button>
                  </div>
                  {notifsList.length === 0
                    ? <p className="px-4 py-8 text-center text-gray-600 text-sm outfit">No notifications yet</p>
                    : <div className="max-h-72 overflow-y-auto">
                      {notifsList.map((n: any) => (
                        <div key={n.id} className="px-4 py-3 transition-colors"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: !n.isRead ? "rgba(124,58,237,0.07)" : "transparent" }}>
                          <p className="text-white text-sm font-semibold outfit">{n.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5 outfit">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  }
                </div>
              )}
            </div>

            <button onClick={() => setLocation("/dashboard")}
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white ring-2 ring-violet-500/25 transition-transform hover:scale-110"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
              {avatarLetter}
            </button>

            <button onClick={() => logout()} className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full text-gray-700 hover:text-red-400 transition-all hover:bg-red-500/10">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: "520px" }}>
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={imgBgSpace} alt="" className="w-full h-full object-cover" style={{ opacity: 0.35 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(8,8,16,0.3) 0%,rgba(8,8,16,0.6) 60%,#080810 100%)" }} />
        </div>

        {/* Animated orbs */}
        <div className="absolute pointer-events-none orb1" style={{ width: 600, height: 600, top: -200, left: -150, background: "radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 65%)", borderRadius: "50%" }} />
        <div className="absolute pointer-events-none orb2" style={{ width: 500, height: 500, top: -100, right: -100, background: "radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 65%)", borderRadius: "50%" }} />
        <div className="absolute pointer-events-none orb3" style={{ width: 300, height: 300, bottom: 0, left: "40%", background: "radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 65%)", borderRadius: "50%" }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.06) 1px,transparent 1px)", backgroundSize: "64px 64px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div className="space-y-7">
            <div className="hero-text-anim">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.35)", color: "#a78bfa" }}>
                <Sparkles className="h-3.5 w-3.5" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: "blink 1.4s ease-in-out infinite" }} />
                LIVE DROPS HAPPENING NOW
              </div>
            </div>

            <div className="hero-text-anim">
              <h1 className="font-black leading-[1.08] outfit" style={{ fontSize: "clamp(2.4rem,5.5vw,4rem)" }}>
                <span className="text-white">Join </span>
                <span className="grad-text">Creator Drops.</span>
                <br />
                <span className="text-white">Win Epic Rewards.</span>
              </h1>
              <p className="text-gray-400 text-base mt-4 leading-relaxed max-w-lg outfit" style={{ fontWeight: 400 }}>
                Use tokens to join interactive drops hosted by your favorite creators. Transparent, thrilling, real prizes.
              </p>
            </div>

            <div className="hero-text-anim flex flex-wrap gap-3">
              <button onClick={() => setLocation("/add-credits")}
                className="join-btn flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-black text-base text-white outfit">
                <Zap className="h-5 w-5" fill="currentColor" />Buy Tokens
              </button>
              <button onClick={() => setLocation("/how-to-play")}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-black text-base text-gray-300 hover:text-white transition-all outfit"
                style={{ border: "2px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.03)" }}>
                <Play className="h-4 w-4 fill-current" />How It Works
              </button>
            </div>

            <div className="hero-text-anim flex flex-wrap gap-3">
              <StatCounter val={127000} prefix="$" suffix="+" label="Total Paid Out" color="#f59e0b" />
              <StatCounter val={12400} suffix="+" label="Active Players" color="#10b981" />
              <StatCounter val={98000} suffix="+" label="Games Completed" color="#a78bfa" />
            </div>
          </div>

          {/* Right — Prize Box */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[360px] float1">
              {/* Glow */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.5) 0%,transparent 70%)", filter: "blur(40px)", transform: "scale(1.2)", borderRadius: "50%" }} />

              <div className="relative rounded-3xl overflow-hidden"
                style={{ background: "linear-gradient(135deg,#1a1040,#120d30)", border: "1px solid rgba(124,58,237,0.35)", boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.2)" }}>

                <img src={imgPrizeBox} alt="Prize Box" className="w-full object-cover"
                  style={{ height: 240, objectPosition: "center top" }} />
                <div className="absolute top-0 inset-x-0 h-40 pointer-events-none" style={{ background: "linear-gradient(to bottom,rgba(26,16,64,0.6),transparent)" }} />
                <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to top,rgba(18,13,48,1),transparent)" }} />

                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-white"
                  style={{ background: "rgba(16,185,129,0.85)", backdropFilter: "blur(8px)" }}>
                  <span className="w-1.5 h-1.5 bg-white rounded-full" style={{ animation: "blink 1s ease-in-out infinite" }} />
                  LIVE JACKPOT
                </div>
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-black"
                  style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", color: "#fbbf24" }}>
                  🏆 BIG PRIZES
                </div>

                <div className="p-5 relative z-10">
                  <h3 className="text-white font-black text-xl outfit">Win Real Prizes</h3>
                  <p className="text-gray-500 text-sm mt-1 outfit">Tokens fill the pot — last entry triggers the draw!</p>

                  <button onClick={() => activeGames[0] ? setLocation(`/game/${activeGames[0].id}`) : setLocation("/games")}
                    className="join-btn mt-4 w-full py-3 rounded-xl font-black text-sm text-white outfit">
                    Enter Now — {activeGames[0]?.tokenCostPerEntry ?? 5} Tokens
                  </button>

                  <div className="flex gap-2 mt-3">
                    {[imgCash, imgPs5, imgTv, imgVip].map((img, i) => (
                      <div key={i} className="prize-chip flex-1 h-12 rounded-xl overflow-hidden"
                        style={{ border: "1px solid rgba(124,58,237,0.2)" }}>
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

      {/* ── GAME OF THE DAY ─────────────────────────────────────────────── */}
      {gameOfTheDay && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 section-fade">
          <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 cursor-pointer"
            onClick={() => setLocation(`/game/${gameOfTheDay.id}`)}
            style={{ background: "linear-gradient(135deg,#1a0f3d,#2d1b69,#1a0845)", border: "1px solid rgba(245,158,11,0.3)", transition: "all 0.2s ease", boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 80% 50%,rgba(245,158,11,0.08),transparent 60%)" }} />
            <div className="shrink-0 z-10">
              <span className="text-yellow-400 text-xs font-black tracking-widest uppercase outfit">⭐ Game of the Day</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-400" style={{ animation: "blink 1.4s ease-in-out infinite" }} />
                <span className="text-green-400 text-xs font-bold outfit">Live Now</span>
              </div>
            </div>
            <div className="flex-1 z-10">
              <h2 className="text-white font-black text-xl outfit">{gameOfTheDay.name}</h2>
              <p className="text-yellow-300/70 text-sm outfit">{gameOfTheDay.prize} — ${gameOfTheDay.prizeValue}</p>
            </div>
            <button className="join-btn shrink-0 z-10 px-8 py-2.5 rounded-xl font-black text-sm text-white outfit">PLAY NOW</button>
          </div>
        </div>
      )}

      {/* ── LIVE DROPS ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4 section-fade">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)" }}>
              <Zap className="h-4 w-4 text-yellow-400" fill="currentColor" />
            </div>
            <h2 className="text-white font-black text-xl uppercase tracking-wide outfit">Live Drops</h2>
            {activeGames.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black text-white"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>{activeGames.length}</span>
            )}
          </div>
          <button onClick={() => setLocation("/games")}
            className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors outfit">
            View All Drops <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#13131f" }}>
                <div className="h-52 animate-pulse" style={{ background: "linear-gradient(90deg,#1a1a2e,#13131f,#1a1a2e)", backgroundSize: "200% 100%", animation: "shimmer 1.5s ease infinite" }} />
                <div className="p-4 space-y-3">
                  <div className="h-4 rounded animate-pulse" style={{ background: "#1a1a2e", width: "70%" }} />
                  <div className="h-3 rounded animate-pulse" style={{ background: "#1a1a2e", width: "50%" }} />
                  <div className="h-8 rounded-xl animate-pulse" style={{ background: "#1a1a2e" }} />
                </div>
              </div>
            ))}
          </div>
        ) : activeGames.length === 0 ? (
          <div className="rounded-2xl flex flex-col items-center py-20 text-center glass-card">
            <span className="text-6xl mb-5" style={{ filter: "drop-shadow(0 0 20px rgba(124,58,237,0.4))" }}>🎮</span>
            <h3 className="text-white font-black text-xl mb-2 outfit">No Live Drops Right Now</h3>
            <p className="text-gray-600 text-sm mb-6 outfit">New drops launch regularly — get your tokens ready!</p>
            <button onClick={() => setLocation("/add-credits")}
              className="join-btn px-8 py-3 rounded-xl font-bold text-sm text-white outfit">Buy Tokens</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeGames.map(g => (
              <DropCard key={g.id} game={g} onPlay={() => setLocation(`/game/${g.id}`)} />
            ))}
          </div>
        )}
      </section>

      {/* ── CLOSING SOON ────────────────────────────────────────────────── */}
      {closingSoonGames && closingSoonGames.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 section-fade">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔥</span>
            <h2 className="text-white font-black text-xl uppercase tracking-wide outfit">Closing Soon</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {closingSoonGames.map(g => (
              <MiniCard key={g.id} game={g} onPlay={() => setLocation(`/game/${g.id}`)} />
            ))}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="py-14 mt-6 relative overflow-hidden section-fade"
        style={{ background: "linear-gradient(180deg,rgba(124,58,237,0.04) 0%,rgba(8,8,16,0) 100%)", borderTop: "1px solid rgba(124,58,237,0.1)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(124,58,237,0.04) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)" }}>
              <Zap className="h-4 w-4 text-yellow-400" fill="currentColor" />
            </div>
            <h2 className="text-white font-black text-xl uppercase tracking-wide outfit">How PrizePlugz Works</h2>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {HOW_STEPS.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center gap-4" style={{ animation: `fadeUp 0.5s ease ${0.1 * i}s both` }}>
                {i < HOW_STEPS.length - 1 && (
                  <div className="absolute top-8 left-[58%] w-[82%] flex items-center gap-1 pointer-events-none z-10">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.3)", borderTop: "1.5px dashed rgba(124,58,237,0.4)" }} />
                    ))}
                    <ChevronRight className="h-3 w-3 shrink-0 text-violet-700" />
                  </div>
                )}

                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl z-20 transition-all hover:scale-110"
                  style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.25),rgba(99,102,241,0.1))", border: "1.5px solid rgba(124,58,237,0.3)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                  {step.emoji}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white outfit"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 2px 8px rgba(124,58,237,0.5)" }}>
                    {step.num}
                  </span>
                </div>

                <div>
                  <p className="text-white font-black text-xs leading-tight outfit">{step.title}</p>
                  <p className="text-gray-600 text-[10px] mt-1 leading-snug outfit">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CREATORS ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 section-fade">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.2)" }}>
              <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
            </div>
            <h2 className="text-white font-black text-xl uppercase tracking-wide outfit">Featured Creators</h2>
          </div>
          <button className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors outfit">
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CREATORS.map((c, i) => {
            const isFollowed = followedCreators.has(c.name);
            return (
              <TiltCard key={c.name}>
                <div className="creator-card rounded-2xl overflow-hidden"
                  style={{ background: "linear-gradient(175deg,#13131f,#0f0f1e)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", animation: `scaleIn 0.5s ease ${0.08 * i}s both` }}>

                  {/* Avatar image */}
                  <div className="relative overflow-hidden" style={{ height: 160 }}>
                    <img src={c.img} alt={c.name} className="creator-img w-full h-full object-cover object-top" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top,${c.color}20,transparent 60%)` }} />
                    <div className="absolute bottom-0 inset-x-0 h-16" style={{ background: "linear-gradient(to top,rgba(19,19,31,0.95),transparent)" }} />

                    {/* Tag */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide text-white"
                      style={{ background: `${c.color}cc` }}>
                      {c.tag}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white font-black text-sm outfit">{c.name}</p>
                      <BadgeCheck className="h-4 w-4" style={{ color: c.color }} />
                    </div>
                    <p className="text-gray-600 text-xs outfit -mt-2">{c.followers} Followers</p>

                    <button
                      onClick={() => {
                        setFollowedCreators(prev => {
                          const next = new Set(prev);
                          if (next.has(c.name)) next.delete(c.name); else next.add(c.name);
                          return next;
                        });
                      }}
                      className="follow-btn w-full py-2 rounded-xl text-xs font-bold outfit"
                      style={isFollowed
                        ? { background: `${c.color}25`, color: c.color, border: `1.5px solid ${c.color}60`, boxShadow: `0 0 12px ${c.color}20` }
                        : { background: "transparent", color: "#a78bfa", border: "1.5px solid rgba(124,58,237,0.4)" }}>
                      {isFollowed ? "✓ Following" : "+ Follow"}
                    </button>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* ── RECENT WINNERS ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 section-fade">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}>
              <Trophy className="h-4 w-4 text-yellow-400" />
            </div>
            <h2 className="text-white font-black text-xl uppercase tracking-wide outfit">Recent Winners</h2>
          </div>
          <span className="flex items-center gap-2 text-green-400 text-xs font-bold outfit">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: "blink 1.4s ease-in-out infinite" }} />
            Live Feed
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden glass-card" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
          {displayWinners.map((w, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
              style={{ borderBottom: i < displayWinners.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(99,102,241,0.1))", border: "1px solid rgba(124,58,237,0.2)" }}>
                {w.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm outfit">{w.name}</p>
                  {i === 0 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full outfit"
                    style={{ background: "rgba(16,185,129,0.18)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}>NEW</span>}
                </div>
                <p className="text-gray-600 text-xs outfit">{w.ago}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-sm outfit" style={{ color: "#a78bfa" }}>{w.prize}</p>
                <p className="text-gray-700 text-xs outfit">Just won</p>
              </div>
            </div>
          ))}
          <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <button onClick={() => setLocation("/dashboard")}
              className="w-full text-center text-violet-400 hover:text-violet-300 text-sm font-semibold py-1 flex items-center justify-center gap-1.5 transition-colors outfit">
              View All Winners <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── INVITE FRIENDS ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-28 md:pb-14 section-fade">
        <div className="relative overflow-hidden rounded-2xl"
          style={{ background: "linear-gradient(135deg,#0f0a28,#1a1040,#140b35,#0f0a28)", border: "1px solid rgba(124,58,237,0.25)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 60% 50%,rgba(124,58,237,0.12),transparent 65%)" }} />
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(124,58,237,0.05) 1px,transparent 1px)", backgroundSize: "22px 22px" }} />

          <div className="relative flex flex-col sm:flex-row items-center gap-6 p-7 sm:p-9">
            {/* Left */}
            <div className="flex items-center gap-5 flex-1">
              <div className="text-5xl float2">🎉</div>
              <div>
                <h3 className="text-white font-black text-2xl leading-tight outfit">
                  Invite Friends.
                  <br />
                  <span className="grad-text">Earn Bonus Tokens.</span>
                </h3>
                <p className="text-gray-500 text-sm mt-2 outfit">Give 10, Get 10 tokens when they sign up!</p>
              </div>
            </div>

            {/* Center: code */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest outfit">Your Invite Code</p>
              <div className="flex items-center gap-3">
                <p className="font-black text-2xl tracking-[0.18em] outfit" style={{ color: "#c4b5fd", textShadow: "0 0 20px rgba(167,139,250,0.4)" }}>
                  {referralCode}
                </p>
                <button onClick={copyReferral}
                  className="p-2.5 rounded-xl transition-all hover:scale-110"
                  style={{ border: "1px solid rgba(124,58,237,0.4)", background: "rgba(124,58,237,0.1)" }}>
                  {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-violet-400" />}
                </button>
              </div>
              {copied && <p className="text-green-400 text-xs font-semibold outfit animate-pulse">Copied!</p>}
            </div>

            {/* Right: CTA */}
            <button
              onClick={async () => {
                if (typeof (navigator as any).share === "function" && referralLink) {
                  try { await (navigator as any).share({ title: "Join Prize Plugz!", url: referralLink }); return; } catch {}
                }
                copyReferral();
              }}
              className="join-btn flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-black text-sm text-white shrink-0 outfit">
              <Sparkles className="h-4 w-4" />
              Invite Friends
            </button>
          </div>
        </div>
      </section>

      {/* ── BOTTOM NAV (mobile) ─────────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden"
        style={{ background: "rgba(8,8,16,0.98)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(124,58,237,0.12)" }}>
        <div className="grid grid-cols-5 h-16">
          {[
            { icon: Home, label: "Home", path: "/" },
            { icon: ShoppingBag, label: "Drops", path: "/games" },
            { icon: null, label: "Buy", path: "/add-credits", center: true },
            { icon: Wallet, label: "Wallet", path: "/wallet" },
            { icon: User, label: "Profile", path: "/dashboard" },
          ].map(({ icon: Icon, label, path, center }) =>
            center
              ? <div key={label} className="flex flex-col items-center justify-end pb-1 -mt-7">
                <button onClick={() => setLocation(path)}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 25px rgba(124,58,237,0.7), 0 -2px 15px rgba(124,58,237,0.4)" }}>
                  <Zap className="h-6 w-6" fill="currentColor" />
                </button>
                <span className="text-[10px] font-semibold text-gray-500 mt-1 outfit">{label}</span>
              </div>
              : <button key={label} onClick={() => setLocation(path)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${path === "/" ? "text-violet-400" : "text-gray-600 hover:text-gray-400"}`}>
                {Icon && <Icon className="h-5 w-5" />}
                <span className="text-[10px] font-semibold outfit">{label}</span>
              </button>
          )}
        </div>
      </nav>
    </div>
  );
}
