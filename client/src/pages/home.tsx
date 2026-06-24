import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Trophy, Users, Bell, LogOut,
  ChevronRight, Home, Wallet, User,
  Copy, CheckCircle, Timer, Share2,
  ShoppingBag, Play, BadgeCheck, Sparkles,
  Gift, Flame, Clock, TrendingUp, Eye,
  Star, Hash, Send,
} from "lucide-react";
import { logout } from "@/lib/auth";
import type { Game } from "@shared/schema";
import logoPath          from "@assets/logo_1777237644041.png";
import imgCash           from "@assets/prize-cash.png";
import imgPs5            from "@assets/prize-ps5.png";
import imgTv             from "@assets/prize-tv.png";
import imgVip            from "@assets/prize-vip.png";
import imgPrizeBox       from "@assets/hero_prizebox.png";
import imgWinnerJames    from "@assets/winner_james.png";
import imgWinnerSarah    from "@assets/winner_sarah.png";
import imgWinnerMike     from "@assets/winner_mike.png";
import imgWinnerAshley   from "@assets/winner_ashley.png";
import imgHeroWinner     from "@assets/hero_winner_banner.png";
import imgCreatorAddy    from "@assets/creator_addy.png";
import imgCreatorTaylor  from "@assets/creator_taylor.png";
import imgCreatorJay     from "@assets/creator_jay.png";
import imgCreatorMaya    from "@assets/creator_maya.png";

/* ─── STYLES ─────────────────────────────────────────────────────────────── */
const CSS = `
  *, body { font-family: 'Outfit', 'Space Grotesk', system-ui, sans-serif; }

  @keyframes ticker  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.2} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
  @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
  @keyframes shimmer { 0%{background-position:-400% center} 100%{background-position:400% center} }
  @keyframes ring    { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
  @keyframes floatY  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes gradPan { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes countUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  .ticker-wrap  { overflow:hidden; }
  .ticker-inner { animation:ticker 42s linear infinite; display:flex; width:max-content; white-space:nowrap; }

  .game-card { transition:all .22s cubic-bezier(.25,.46,.45,.94); cursor:pointer; }
  .game-card:hover { transform:translateY(-5px); box-shadow:0 20px 50px rgba(0,0,0,.55),0 0 0 1px rgba(124,58,237,.3) !important; }
  .game-card:hover img { transform:scale(1.06); }
  .game-card img { transition:transform .4s ease; }

  .enter-btn {
    background:linear-gradient(135deg,#7c3aed,#6d28d9);
    box-shadow:0 4px 18px rgba(124,58,237,.4);
    transition:all .18s ease;
  }
  .enter-btn:hover { transform:translateY(-1px) scale(1.04); box-shadow:0 8px 28px rgba(124,58,237,.6); }
  .enter-btn:active { transform:scale(.97); }

  .winner-card { transition:all .2s ease; cursor:pointer; }
  .winner-card:hover { transform:translateY(-4px); }

  .fomo-badge { animation:pulse 2s ease-in-out infinite; }

  .ring-live::after {
    content:''; position:absolute; inset:-3px; border-radius:50%;
    border:2px solid #4ade80; animation:ring 1.6s ease-out infinite;
  }

  .grad-red {
    background:linear-gradient(135deg,#ff6b35,#ff3c3c);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
  }

  .shimmer-btn {
    background:linear-gradient(90deg,#7c3aed 0%,#a78bfa 45%,#7c3aed 100%);
    background-size:200% auto; animation:shimmer 2.5s linear infinite;
  }

  .stat-num { animation:countUp .6s ease both; }

  .activity-item { animation:slideIn .4s ease both; }

  .float { animation:floatY 5s ease-in-out infinite; }

  .section-in { animation:fadeUp .55s ease both; }

  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(124,58,237,.4); border-radius:2px; }

  .nav-item { position:relative; transition:color .15s ease; }
  .nav-item.active { color:#fff; }
  .nav-item.active::after {
    content:''; position:absolute; bottom:-4px; left:50%; transform:translateX(-50%);
    width:20px; height:2px; border-radius:2px; background:#7c3aed;
  }

  .token-pill { transition:all .18s ease; }
  .token-pill:hover { transform:scale(1.05); background:rgba(124,58,237,.25) !important; }

  .progress-bar { transition:width 1.2s ease; }
  .progress-bar-glow { box-shadow:0 0 10px currentColor; }
`;

/* ─── CONSTANTS ───────────────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  { avatar: imgCreatorAddy,   text: "Mike won", prize: "$100",    time: "2 min ago" },
  { avatar: imgCreatorTaylor, text: "Sarah won", prize: "PS5",    time: "15 min ago" },
  { avatar: imgWinnerJames,   text: "James won", prize: "$250",   time: "30 min ago" },
  { avatar: imgCreatorMaya,   text: "Ashley just entered", prize: "LV Bag Game", time: "1 min ago" },
  { avatar: imgCreatorJay,    text: "David won", prize: "$500",   time: "45 min ago" },
  { avatar: imgWinnerSarah,   text: "Emma won", prize: "AirPods", time: "1 hr ago" },
];

const LIVE_ACTIVITY = [
  { avatar: imgCreatorAddy,   text: "Mike joined", prize: "$500 Cash Game",  time: "30 sec ago" },
  { avatar: imgCreatorTaylor, text: "Sarah purchased", prize: "50 tokens",   time: "1 min ago" },
  { avatar: imgWinnerJames,   text: "James won", prize: "$100",              time: "2 min ago", isWin: true },
  { avatar: imgCreatorMaya,   text: "Ashley entered", prize: "PS5 Bundle",   time: "2 min ago" },
  { avatar: imgCreatorJay,    text: "David joined", prize: "LV Bag Game",    time: "3 min ago" },
];

// Fallback winners shown when no admin-curated entries exist yet
const FALLBACK_WINNERS = [
  { imageUrl: imgWinnerMike,   name: "Mike T.",   prize: "Won $500 Cash",   prizeColor: "#10b981", createdAt: "2024-05-12" },
  { imageUrl: imgWinnerSarah,  name: "Sarah L.",  prize: "Won PS5 Bundle",  prizeColor: "#7c3aed", createdAt: "2024-05-12" },
  { imageUrl: imgWinnerJames,  name: "James R.",  prize: "Won $250 Cash",   prizeColor: "#10b981", createdAt: "2024-05-11" },
  { imageUrl: imgWinnerAshley, name: "Ashley M.", prize: "Won LV Bag",      prizeColor: "#7c3aed", createdAt: "2024-05-11" },
];

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
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

function useAnimatedCount(target: number, duration = 1600) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          const e = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(e * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { val, ref };
}

/* ─── GAME CARD ───────────────────────────────────────────────────────────── */
function GameCard({ game, onPlay, rank }: { game: Game; onPlay: () => void; rank?: number }) {
  const countdown = useCountdown(game.endTime as string);
  const pct = game.tokenThreshold > 0 ? Math.min((game.tokensCollected / game.tokenThreshold) * 100, 100) : 0;
  const filled  = game.tokenThreshold - game.numbersLeft;
  const total   = game.tokenThreshold;
  const spotsLeft = game.numbersLeft;

  const spotsColor = spotsLeft <= 1 ? "#ef4444" : spotsLeft <= 3 ? "#f97316" : "#7c3aed";
  const spotsLabel = spotsLeft <= 1 ? `🔥 ${spotsLeft} SPOT LEFT` : `🔥 ${spotsLeft} SPOTS LEFT`;
  const barColor   = pct >= 95 ? "#ef4444" : pct >= 80 ? "#f97316" : "#10b981";

  const FALLBACK_IMGS = [imgCash, imgPs5, imgVip, imgTv];
  const fallback = FALLBACK_IMGS[(rank ?? 0) % FALLBACK_IMGS.length];

  return (
    <div className="game-card rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "#131124", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,.4)", minWidth: 220 }}
      onClick={onPlay}>

      {/* Spots left badge */}
      <div className="fomo-badge flex items-center gap-1.5 px-3 py-2 text-white font-black text-xs"
        style={{ background: spotsColor, letterSpacing: "0.04em" }}>
        {spotsLabel}
      </div>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 170, background: "#1a1535", flexShrink: 0 }}>
        <img
          src={game.prizeImageUrl || fallback}
          alt={game.name}
          className="w-full h-full object-cover"
          style={{ objectPosition: "center" }}
        />

        {/* Timer badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
          style={{ background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)", color: "#a78bfa", border: "1px solid rgba(124,58,237,.3)" }}>
          <Timer className="h-3 w-3" style={{ flexShrink: 0 }} />{countdown}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-white font-black text-base uppercase tracking-wide leading-snug">{game.name}</h3>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 font-medium">{filled} / {total} Spots Filled</span>
            <span className="font-black" style={{ color: barColor }}>{Math.round(pct)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.07)" }}>
            <div className="h-full rounded-full progress-bar" style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 8px ${barColor}` }} />
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 mt-auto">
          <button onClick={e => { e.stopPropagation(); onPlay(); }}
            className="enter-btn flex-1 py-2.5 rounded-xl font-black text-sm text-white text-center">
            ENTER NOW
          </button>
          <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl font-black text-xs text-white"
            style={{ background: "rgba(124,58,237,.2)", border: "1px solid rgba(124,58,237,.4)", whiteSpace: "nowrap" }}>
            <Zap className="h-3 w-3 text-yellow-400" fill="currentColor" />
            {game.tokenCostPerEntry} TOKENS
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── STAT NUMBER ─────────────────────────────────────────────────────────── */
function StatNum({ target, prefix = "", suffix = "", label }: { target: number; prefix?: string; suffix?: string; label: string }) {
  const { val, ref } = useAnimatedCount(target);
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span ref={ref} className="stat-num font-black text-2xl text-white">{prefix}{val.toLocaleString()}{suffix}</span>
      <span className="text-gray-500 text-xs">{label}</span>
    </div>
  );
}

/* ─── PAGE ────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [, setLocation] = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [copied, setCopied] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: user }      = useQuery<any>({ queryKey: ["/api/user"] });
  const { data: tokenData } = useQuery<{ tokenBalance: number }>({ queryKey: ["/api/user/token-balance"], refetchInterval: 15000 });
  const { data: games, isLoading } = useQuery<Game[]>({ queryKey: ["/api/games"], refetchInterval: 20000 });
  const { data: winnersData } = useQuery<{ winnerName: string; prize: string; completedAt: string }[]>({ queryKey: ["/api/winners"], refetchInterval: 60000 });
  const { data: winnerWallData } = useQuery<{ id: number; name: string; prize: string; prizeColor: string; imageUrl: string | null; createdAt: string }[]>({ queryKey: ["/api/winner-wall"], refetchInterval: 120000 });
  const { data: notifsData, refetch: refetchNotifs } = useQuery<{ notifications: any[]; unreadCount: number }>({ queryKey: ["/api/notifications"], refetchInterval: 30000 });
  const { data: referralData } = useQuery<{ referralCode: string | null }>({ queryKey: ["/api/user/referral-code"] });

  const activeGames  = games?.filter(g => g.isActive) ?? [];
  const tokenBalance = tokenData?.tokenBalance ?? 0;
  const unreadCount  = notifsData?.unreadCount ?? 0;
  const notifsList   = notifsData?.notifications ?? [];
  const username     = (user as any)?.firstName ?? (user as any)?.email?.split("@")[0] ?? "Player";
  const avatarLetter = username[0]?.toUpperCase() ?? "P";
  const referralCode = referralData?.referralCode ?? "PLUGZ5";

  // Ticker items from real winners or fallback
  const tickerWinners = (winnersData && winnersData.length > 0)
    ? winnersData.map((w, i) => ({
        avatar: TICKER_ITEMS[i % TICKER_ITEMS.length].avatar,
        text: `${w.winnerName} won`,
        prize: w.prize,
        time: new Date(w.completedAt).toLocaleDateString(),
      }))
    : TICKER_ITEMS;

  async function markAllRead() {
    try { await fetch("/api/notifications/read-all", { method: "POST", credentials: "include" }); refetchNotifs(); } catch {}
  }

  function copyReferral() {
    const text = `${window.location.origin}/?ref=${referralCode}`;
    try { navigator.clipboard.writeText(text); } catch {
      const el = document.createElement("textarea"); el.value = text;
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Today's top winner from real data */
  const topWinner = winnersData?.[0];

  const NAV = [
    { label: "Home",       path: "/",           icon: Home },
    { label: "Games",      path: "/games",       icon: ShoppingBag },
    { label: "Prizes",     path: "/how-to-play", icon: Gift },
    { label: "My Entries", path: "/dashboard",   icon: Hash },
    { label: "Referrals",  path: "/dashboard",   icon: Share2 },
    { label: "Account",    path: "/dashboard",   icon: User },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: "#08080f", overflowX: "hidden" }}>
      <style>{CSS}</style>

      {/* ── WINNER TICKER ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden py-2.5"
        style={{ background: "linear-gradient(90deg,#0a0918,#100d24,#0a0918)", borderBottom: "1px solid rgba(124,58,237,.18)" }}>
        <div className="absolute left-0 inset-y-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg,#0a0918,transparent)" }} />
        <div className="absolute right-0 inset-y-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg,#0a0918,transparent)" }} />

        {/* LIVE badge */}
        <div className="absolute left-4 inset-y-0 z-20 flex items-center">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-black text-white text-xs"
            style={{ background: "#10b981", fontSize: "10px", letterSpacing: ".06em" }}>
            <span className="relative ring-live">
              <span className="block w-1.5 h-1.5 bg-white rounded-full" />
            </span>
            LIVE
          </div>
        </div>

        <div className="ticker-wrap pl-20">
          <div className="ticker-inner">
            {[...tickerWinners, ...tickerWinners].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-10 text-sm font-semibold">
                <img src={item.avatar} alt="" className="w-6 h-6 rounded-full object-cover object-top border border-violet-500/30" />
                <span className="text-gray-300">{item.text}</span>
                <span className="font-black" style={{ color: "#f59e0b" }}>{item.prize}</span>
                <span className="text-gray-600 text-xs">{item.time}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50"
        style={{ background: "rgba(8,8,15,.97)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(124,58,237,.1)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center gap-4">

          {/* Logo */}
          <button onClick={() => setLocation("/")} className="shrink-0">
            <img src={logoPath} alt="Prize Plugz" className="h-9 w-auto object-contain" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {NAV.map(({ label, path, icon: Icon }) => (
              <button key={label} onClick={() => setLocation(path)}
                className={`nav-item flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:text-white hover:bg-white/5 ${label === "Home" ? "active text-white" : "text-gray-500"}`}>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Token pill */}
            <button onClick={() => setLocation("/add-credits")}
              className="token-pill flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full font-black text-sm"
              style={{ background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.4)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                🪙
              </div>
              <span className="text-white">{tokenBalance}</span>
              <span className="text-gray-400 text-xs">Tokens</span>
            </button>

            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setShowNotifs(p => !p); markAllRead(); }}
                className="relative w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-white/8"
                style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
                <Bell className="h-4 w-4 text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                    style={{ background: "#f97316" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-10 w-72 rounded-2xl z-50 overflow-hidden shadow-2xl"
                  style={{ background: "#13112a", border: "1px solid rgba(124,58,237,.2)" }}>
                  <div className="px-4 py-2.5 flex justify-between items-center" style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    <span className="text-white font-bold text-sm">Notifications</span>
                    <button onClick={() => setShowNotifs(false)} className="text-gray-600 hover:text-white text-xs">✕</button>
                  </div>
                  {notifsList.length === 0
                    ? <p className="px-4 py-6 text-center text-gray-600 text-sm">No notifications yet</p>
                    : <div className="max-h-64 overflow-y-auto">
                      {notifsList.map((n: any) => (
                        <div key={n.id} className="px-4 py-3 hover:bg-white/3"
                          style={{ borderBottom: "1px solid rgba(255,255,255,.04)", background: !n.isRead ? "rgba(124,58,237,.06)" : "" }}>
                          <p className="text-white text-sm font-semibold">{n.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  }
                </div>
              )}
            </div>

            {/* Avatar + logout */}
            <button onClick={() => setLocation("/dashboard")}
              className="w-8 h-8 rounded-full font-black text-sm text-white ring-2 ring-violet-500/20 flex items-center justify-center transition hover:scale-110"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
              {avatarLetter}
            </button>
            <button onClick={() => logout()} className="hidden sm:flex w-7 h-7 items-center justify-center rounded-full text-gray-700 hover:text-red-400 transition hover:bg-red-500/10">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left: Headline + CTAs */}
        <div className="space-y-5" style={{ animation: "fadeUp .6s ease both" }}>
          <div>
            <h1 className="font-black leading-[1.0] uppercase" style={{ fontSize: "clamp(2.6rem,6vw,4.4rem)" }}>
              <span className="text-white block">REAL PRIZES.</span>
              <span className="grad-red block">REAL WINNERS.</span>
            </h1>
            <p className="text-gray-400 mt-4 text-base leading-relaxed max-w-md"
              style={{ fontWeight: 400 }}>
              Buy tokens, join games, and win amazing prizes. 100% Transparent. Auto Winner.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => setLocation("/add-credits")}
              className="shimmer-btn flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-black text-base text-white"
              style={{ boxShadow: "0 6px 28px rgba(124,58,237,.55)" }}>
              <Zap className="h-5 w-5" fill="currentColor" />GET TOKENS
            </button>
            <button onClick={() => setLocation("/how-to-play")}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-black text-base text-gray-200 transition hover:bg-white/8"
              style={{ border: "2px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.03)" }}>
              <Play className="h-4 w-4 fill-current" />HOW IT WORKS
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: "🔒", text: "100% Transparent" },
              { icon: "⚡", text: "Instant Results" },
              { icon: "🏆", text: "Auto Winner" },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
                <span>{b.icon}</span>{b.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Today's Big Winner + Stats */}
        <div className="space-y-3" style={{ animation: "scaleIn .65s ease both" }}>
          {/* Winner Card */}
          <div className="relative overflow-hidden rounded-2xl"
            style={{ background: "linear-gradient(135deg,#1a1535,#0f0c22)", border: "1px solid rgba(124,58,237,.25)", boxShadow: "0 10px 40px rgba(0,0,0,.5)" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at 70% 30%,rgba(124,58,237,.12),transparent 60%)" }} />

            <div className="flex items-stretch">
              <div className="flex-1 p-5 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" style={{ animation: "blink 1.4s ease-in-out infinite" }} />
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Today's Big Winner</span>
                </div>
                <p className="font-black text-4xl leading-none" style={{ color: "#10b981" }}>
                  {topWinner ? topWinner.prize : "$250"}
                </p>
                <p className="text-white font-bold text-lg mt-1">{topWinner ? topWinner.winnerName : "James R."}</p>
                <button onClick={() => setLocation("/dashboard")}
                  className="mt-4 w-full py-2.5 rounded-xl font-black text-sm text-white transition hover:bg-white/15"
                  style={{ border: "1.5px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.06)" }}>
                  VIEW ALL WINNERS
                </button>
              </div>
              <div className="w-36 relative overflow-hidden rounded-r-2xl shrink-0">
                <img src={imgHeroWinner} alt="Winner" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right,rgba(26,21,53,.8),transparent 50%)" }} />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="rounded-2xl p-4 grid grid-cols-3 gap-4"
            style={{ background: "#131124", border: "1px solid rgba(255,255,255,.06)" }}>
            <div className="flex flex-col items-center gap-1 border-r text-center" style={{ borderColor: "rgba(255,255,255,.07)" }}>
              <Users className="h-5 w-5 text-violet-400 mb-0.5" />
              <StatNum target={12458} suffix="" label="Players Online" />
            </div>
            <div className="flex flex-col items-center gap-1 border-r text-center" style={{ borderColor: "rgba(255,255,255,.07)" }}>
              <Trophy className="h-5 w-5 text-yellow-400 mb-0.5" />
              <StatNum target={127250} prefix="$" suffix="+" label="Prizes Paid" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Gift className="h-5 w-5 text-emerald-400 mb-0.5" />
              <StatNum target={583} suffix="" label="Winners Today" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LIVE GAMES
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2 section-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔥</span>
            <h2 className="text-white font-black text-xl uppercase tracking-wide">Live Games</h2>
            {activeGames.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black text-white"
                style={{ background: "#7c3aed" }}>{activeGames.length}</span>
            )}
          </div>
          <button onClick={() => setLocation("/games")}
            className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
            View All Games <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#131124" }}>
                <div className="h-6 animate-pulse" style={{ background: "#7c3aed40" }} />
                <div className="h-40 animate-pulse" style={{ background: "#1a1535" }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded animate-pulse w-3/4" style={{ background: "#1a1535" }} />
                  <div className="h-2 rounded animate-pulse" style={{ background: "#1a1535" }} />
                  <div className="h-9 rounded-xl animate-pulse" style={{ background: "#1a1535" }} />
                </div>
              </div>
            ))}
          </div>
        ) : activeGames.length === 0 ? (
          <div className="rounded-2xl p-16 flex flex-col items-center text-center"
            style={{ background: "#131124", border: "1px solid rgba(255,255,255,.06)" }}>
            <span className="text-5xl mb-4">🎮</span>
            <h3 className="text-white font-black text-lg mb-2">No Live Games Right Now</h3>
            <p className="text-gray-600 text-sm mb-5">New games launch daily — get your tokens ready!</p>
            <button onClick={() => setLocation("/add-credits")}
              className="enter-btn px-8 py-2.5 rounded-xl font-black text-sm text-white">
              Buy Tokens
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeGames.slice(0, 8).map((g, i) => (
              <GameCard key={g.id} game={g} onPlay={() => setLocation(`/game/${g.id}`)} rank={i} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LIVE ACTIVITY + WINNER WALL
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-5 section-in">

        {/* Live Activity */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#131124", border: "1px solid rgba(255,255,255,.06)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" fill="currentColor" />
              <h3 className="text-white font-black text-sm uppercase tracking-wide">Live Activity</h3>
              <div className="w-2 h-2 rounded-full bg-green-400" style={{ animation: "blink 1.4s ease-in-out infinite" }} />
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,.05)" }}>
            {LIVE_ACTIVITY.map((item, i) => (
              <div key={i} className="activity-item flex items-center gap-3 px-5 py-3.5"
                style={{ animationDelay: `${i * 0.08}s` }}>
                <img src={item.avatar} alt="" className="w-8 h-8 rounded-full object-cover object-top shrink-0"
                  style={{ border: "1.5px solid rgba(124,58,237,.4)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 text-sm truncate">
                    <span className="text-white font-bold">{item.text}</span>{" "}
                    <span className={item.isWin ? "font-black" : "text-violet-400 font-semibold"}
                      style={item.isWin ? { color: "#10b981" } : {}}>
                      {item.prize}
                    </span>
                  </p>
                </div>
                <span className="text-gray-600 text-xs shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
            <button className="w-full text-center text-violet-400 hover:text-violet-300 text-sm font-bold py-1 transition-colors">
              VIEW ALL ACTIVITY
            </button>
          </div>
        </div>

        {/* Winner Wall */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#131124", border: "1px solid rgba(255,255,255,.06)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <h3 className="text-white font-black text-sm uppercase tracking-wide">Winner Wall</h3>
            </div>
            <button onClick={() => setLocation("/dashboard")}
              className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors">
              View All Winners <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            {(winnerWallData && winnerWallData.length > 0 ? winnerWallData : FALLBACK_WINNERS).slice(0, 4).map((w, i) => (
              <div key={i} className="winner-card rounded-xl overflow-hidden"
                style={{ background: "#1a1535", border: "1px solid rgba(255,255,255,.07)" }}>
                <div className="overflow-hidden" style={{ height: 130 }}>
                  {w.imageUrl ? (
                    <img src={w.imageUrl} alt={w.name} className="w-full h-full object-cover" style={{ objectPosition: "center top" }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: "linear-gradient(135deg,#1a1535,#2d1b69)" }}>🏆</div>
                  )}
                </div>
                <div className="p-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle className="h-2.5 w-2.5 shrink-0" style={{ color: w.prizeColor }} />
                    <span className="text-[9px] font-black uppercase tracking-wide" style={{ color: w.prizeColor }}>Verified Winner</span>
                  </div>
                  <p className="text-white font-black text-xs">{w.name}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: w.prizeColor }}>{w.prize}</p>
                  <p className="text-gray-600 text-[10px] mt-0.5">{new Date(w.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS — PREMIUM
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 section-in">
        {/* Outer container with layered glow */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg,#0d0b1e,#130f2e,#0a0818)", border: "1px solid rgba(124,58,237,.2)", boxShadow: "0 0 80px rgba(124,58,237,.08), inset 0 1px 0 rgba(255,255,255,.04)" }}>

          {/* Background radial glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(124,58,237,.12),transparent 70%)" }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 40% at 50% 100%,rgba(99,102,241,.06),transparent 70%)" }} />

          <div className="relative z-10 p-6 sm:p-10">

            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-black uppercase tracking-widest"
                style={{ background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.3)", color: "#a78bfa" }}>
                <Sparkles className="h-3.5 w-3.5" />Simple. Fair. Exciting.
              </div>
              <h2 className="text-white font-black text-2xl sm:text-3xl uppercase tracking-tight">
                How It <span style={{ background: "linear-gradient(90deg,#a78bfa,#7c3aed,#6d28d9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Works</span>
              </h2>
              <p className="text-gray-500 text-sm mt-2">Get started in 3 easy steps — no experience needed</p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 relative">

              {/* Connector line (desktop only) */}
              <div className="hidden sm:block absolute top-14 left-[calc(33%+16px)] right-[calc(33%+16px)] pointer-events-none" style={{ zIndex: 0 }}>
                <div className="flex items-center gap-0">
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(124,58,237,.5),rgba(124,58,237,.2))" }} />
                  <ChevronRight className="h-5 w-5 shrink-0" style={{ color: "rgba(124,58,237,.5)" }} />
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(124,58,237,.2),rgba(124,58,237,.5))" }} />
                  <ChevronRight className="h-5 w-5 shrink-0" style={{ color: "rgba(124,58,237,.5)" }} />
                </div>
              </div>

              {[
                {
                  num: "01",
                  emoji: "🪙",
                  title: "Buy Tokens",
                  tagline: "Fuel your entries",
                  desc: "Choose a token package that fits you. Starting from just $5 — the more you buy, the better the value.",
                  bullets: ["5 packages from $5–$100", "Instant credit to account", "Bonus tokens on bigger packs"],
                  color: "#f59e0b",
                  glow: "rgba(245,158,11,.25)",
                  border: "rgba(245,158,11,.3)",
                  bg: "rgba(245,158,11,.06)",
                },
                {
                  num: "02",
                  emoji: "🎮",
                  title: "Enter Games",
                  tagline: "Pick your prize",
                  desc: "Browse live games and spend tokens to claim your spot. Every entry is recorded on our system — fully transparent.",
                  bullets: ["Cash, gadgets & luxury prizes", "Real-time progress tracking", "One free spin per new game"],
                  color: "#7c3aed",
                  glow: "rgba(124,58,237,.3)",
                  border: "rgba(124,58,237,.4)",
                  bg: "rgba(124,58,237,.06)",
                },
                {
                  num: "03",
                  emoji: "🏆",
                  title: "Win Prizes",
                  tagline: "Random. Fair. Instant.",
                  desc: "When all spots fill, our system automatically picks a random winner — no delays, no human bias, no tricks.",
                  bullets: ["Auto-selected winner", "Email notification sent", "Prize shipped or delivered"],
                  color: "#10b981",
                  glow: "rgba(16,185,129,.25)",
                  border: "rgba(16,185,129,.35)",
                  bg: "rgba(16,185,129,.06)",
                },
              ].map((step, i) => (
                <div key={step.num} className="relative z-10 group">
                  <div className="rounded-2xl p-5 flex flex-col gap-4 h-full transition-all duration-300 group-hover:-translate-y-1"
                    style={{ background: `linear-gradient(135deg,${step.bg},rgba(13,11,30,.8))`, border: `1px solid ${step.border}`, boxShadow: `0 4px 30px ${step.glow}, inset 0 1px 0 rgba(255,255,255,.04)` }}>

                    {/* Step number background watermark */}
                    <div className="absolute top-3 right-4 font-black text-6xl select-none pointer-events-none"
                      style={{ color: step.color, opacity: 0.07, lineHeight: 1 }}>{step.num}</div>

                    {/* Icon with pulse rings */}
                    <div className="relative w-16 h-16 shrink-0">
                      {/* Pulse ring */}
                      <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                        style={{ background: step.color, animationDuration: "2.5s", animationDelay: `${i * 0.4}s` }} />
                      {/* Glow ring */}
                      <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle,${step.glow},transparent 70%)` }} />
                      {/* Icon circle */}
                      <div className="absolute inset-1.5 rounded-full flex items-center justify-center text-2xl"
                        style={{ background: `linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03))`, border: `2px solid ${step.border}`, boxShadow: `0 0 20px ${step.glow}` }}>
                        {step.emoji}
                      </div>
                      {/* Step badge */}
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                        style={{ background: step.color }}>{i + 1}</span>
                    </div>

                    {/* Text */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: step.color }}>{step.tagline}</p>
                      <h3 className="text-white font-black text-lg leading-tight">{step.title}</h3>
                      <p className="text-gray-400 text-sm mt-2 leading-relaxed">{step.desc}</p>
                    </div>

                    {/* Bullets */}
                    <ul className="space-y-1.5 mt-auto">
                      {step.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                            style={{ background: step.color, color: "#000" }}>✓</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust bar */}
            <div className="mt-8 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3"
              style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
              {[
                { icon: "🔒", label: "100% Transparent", sub: "Every entry logged" },
                { icon: "⚡", label: "Instant Winners", sub: "Auto-selected on fill" },
                { icon: "🎯", label: "Real Prizes", sub: "Cash, tech & luxury" },
                { icon: "🆓", label: "Free Spin Included", sub: "One per game for new players" },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)" }}>
                  <span className="text-xl shrink-0">{t.icon}</span>
                  <div>
                    <p className="text-white font-bold text-xs">{t.label}</p>
                    <p className="text-gray-600 text-[10px]">{t.sub}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          REFER & EARN + DAILY FREE BONUS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 section-in">

        {/* Refer & Earn */}
        <div className="relative overflow-hidden rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{ background: "linear-gradient(135deg,#1a0a0a,#2d1010,#1a0a0a)", border: "1px solid rgba(239,68,68,.25)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 20% 50%,rgba(239,68,68,.08),transparent 60%)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="h-4 w-4 text-yellow-400" fill="currentColor" />
              <p className="text-white font-black text-sm uppercase">Refer & Earn More Tokens!</p>
            </div>
            <p className="text-gray-500 text-xs">Invite your friends and earn free tokens.</p>
            <p className="text-gray-600 text-xs mt-0.5 font-mono">Code: <span className="text-yellow-400 font-black">{referralCode}</span></p>
          </div>
          <button onClick={copyReferral}
            className="enter-btn shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-white"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 18px rgba(239,68,68,.4)" }}>
            {copied ? <CheckCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {copied ? "COPIED!" : "START EARNING"}
          </button>
        </div>

        {/* Daily Free Bonus */}
        <div className="relative overflow-hidden rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{ background: "linear-gradient(135deg,#0a1a0a,#102d10,#0a1a0a)", border: "1px solid rgba(16,185,129,.25)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 20% 50%,rgba(16,185,129,.08),transparent 60%)" }} />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: "rgba(16,185,129,.2)", border: "1px solid rgba(16,185,129,.3)" }}>
              🎁
            </div>
            <div>
              <p className="text-white font-black text-sm uppercase">Daily Free Bonus</p>
              <p className="text-gray-500 text-xs">Claim your free tokens every day!</p>
            </div>
          </div>
          <button onClick={() => setLocation("/dashboard")}
            className="shrink-0 px-5 py-2.5 rounded-xl font-black text-sm text-white"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 18px rgba(16,185,129,.4)" }}>
            CLAIM NOW
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER STATS BAR
      ═══════════════════════════════════════════════════════════════ */}
      <div className="border-t border-b mb-20 md:mb-0" style={{ borderColor: "rgba(124,58,237,.12)", background: "#0d0b1e" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-4 gap-4 text-center">
          {[
            { val: 127250, prefix: "$", suffix: "+", label: "Total Prizes Paid",  color: "#f59e0b" },
            { val: 12458,  prefix: "",  suffix: "",  label: "Active Players",     color: "#a78bfa" },
            { val: 98623,  prefix: "",  suffix: "",  label: "Games Completed",    color: "#10b981" },
            { val: 583,    prefix: "",  suffix: "",  label: "Winners Today",      color: "#f472b6" },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-0.5">
              <StatNum target={s.val} prefix={s.prefix} suffix={s.suffix} label={s.label} />
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM NAV (mobile) ─────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden"
        style={{ background: "rgba(8,8,15,.98)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(124,58,237,.12)" }}>
        <div className="grid grid-cols-6 h-[58px]">
          {NAV.map(({ label, path, icon: Icon }) => (
            <button key={label} onClick={() => setLocation(path)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${path === "/" ? "text-violet-400" : "text-gray-600 hover:text-gray-400"}`}>
              <Icon className="h-4 w-4" />
              <span className="text-[9px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
