import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap,
  Trophy,
  Users,
  Bell,
  LogOut,
  ChevronRight,
  Home,
  Wallet,
  User,
  Copy,
  CheckCircle,
  Timer,
  Share2,
  ShoppingBag,
  Play,
  BadgeCheck,
  Sparkles,
  Gift,
  Flame,
  Clock,
  TrendingUp,
  Eye,
  Star,
  Hash,
  Send,
} from "lucide-react";
import { logout } from "@/lib/auth";
import type { Game } from "@shared/schema";
import logoPath from "@assets/logo_1777237644041.png";
import imgCash from "@assets/prize-cash.png";
import imgPs5 from "@assets/prize-ps5.png";
import imgTv from "@assets/prize-tv.png";
import imgVip from "@assets/prize-vip.png";
import imgPrizeBox from "@assets/hero_prizebox.png";
import imgWinnerJames from "@assets/winner_james.png";
import imgWinnerSarah from "@assets/winner_sarah.png";
import imgWinnerMike from "@assets/winner_mike.png";
import imgWinnerAshley from "@assets/winner_ashley.png";
import imgHeroWinner from "@assets/hero_winner_banner.png";
import imgCreatorAddy from "@assets/creator_addy.png";
import imgCreatorTaylor from "@assets/creator_taylor.png";
import imgCreatorJay from "@assets/creator_jay.png";
import imgCreatorMaya from "@assets/creator_maya.png";

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

  @keyframes winnerSlide { from{opacity:0;transform:scale(.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .winner-spotlight { animation:winnerSlide .4s cubic-bezier(.25,.46,.45,.94) both; }

  @keyframes goldPulse { 0%,100%{box-shadow:0 0 20px rgba(245,158,11,.3)} 50%{box-shadow:0 0 40px rgba(245,158,11,.6),0 0 80px rgba(245,158,11,.2)} }
  .gold-glow { animation:goldPulse 2.5s ease-in-out infinite; }

  @keyframes confettiFall {
    0%  { transform:translateY(-20px) rotate(0deg); opacity:1; }
    100%{ transform:translateY(60px) rotate(360deg); opacity:0; }
  }
  .confetti-piece { animation:confettiFall 1.4s ease-in both; position:absolute; font-size:14px; pointer-events:none; }

  @keyframes verifiedPop { 0%{transform:scale(0)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }
  .verified-pop { animation:verifiedPop .5s cubic-bezier(.25,.46,.45,.94) .15s both; }

  @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.08)} 66%{transform:translate(-15px,25px) scale(.95)} }
  @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-25px,15px) scale(1.05)} 70%{transform:translate(20px,-30px) scale(.97)} }
  @keyframes heroShimmer { 0%,100%{opacity:.7} 50%{opacity:1} }
  @keyframes crownBob   { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-6px) rotate(5deg)} }
  @keyframes badgePulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)} 50%{box-shadow:0 0 0 8px rgba(239,68,68,0)} }
  @keyframes statGlow   { 0%,100%{box-shadow:0 0 12px rgba(124,58,237,.15)} 50%{box-shadow:0 0 28px rgba(124,58,237,.35)} }
  @keyframes prizeFlash { 0%,100%{text-shadow:0 0 20px rgba(16,185,129,.4)} 50%{text-shadow:0 0 40px rgba(16,185,129,.8),0 0 80px rgba(16,185,129,.3)} }

  .orb-1 { animation:orbFloat1 9s ease-in-out infinite; }
  .orb-2 { animation:orbFloat2 12s ease-in-out infinite; }
  .crown-bob { animation:crownBob 2.5s ease-in-out infinite; }
  .live-badge { animation:badgePulse 2s ease-in-out infinite; }
  .stat-card { animation:statGlow 3s ease-in-out infinite; }
  .prize-flash { animation:prizeFlash 2s ease-in-out infinite; }

  .hero-btn-primary {
    background: linear-gradient(135deg,#7c3aed 0%,#a78bfa 50%,#7c3aed 100%);
    background-size: 200% auto;
    animation: shimmer 2.5s linear infinite;
    box-shadow: 0 8px 32px rgba(124,58,237,.55), 0 0 0 1px rgba(167,139,250,.3);
    transition: all .2s ease;
  }
  .hero-btn-primary:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 14px 44px rgba(124,58,237,.7),0 0 0 1px rgba(167,139,250,.5); }
  .hero-btn-secondary { transition:all .2s ease; }
  .hero-btn-secondary:hover { transform:translateY(-2px); background:rgba(255,255,255,.08) !important; border-color:rgba(255,255,255,.35) !important; }

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
  @keyframes activityIn { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
  .activity-row { animation:activityIn .38s cubic-bezier(.25,.46,.45,.94) both; }
  .activity-row:hover { background:rgba(255,255,255,.03) !important; }
  @keyframes liveDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:.5} }
  .live-dot { animation:liveDot 1.4s ease-in-out infinite; }

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
  {
    avatar: imgCreatorAddy,
    text: "Mike won",
    prize: "$100",
    time: "2 min ago",
  },
  {
    avatar: imgCreatorTaylor,
    text: "Sarah won",
    prize: "PS5",
    time: "15 min ago",
  },
  {
    avatar: imgWinnerJames,
    text: "James won",
    prize: "$250",
    time: "30 min ago",
  },
  {
    avatar: imgCreatorMaya,
    text: "Ashley just entered",
    prize: "LV Bag Game",
    time: "1 min ago",
  },
  {
    avatar: imgCreatorJay,
    text: "David won",
    prize: "$500",
    time: "45 min ago",
  },
  {
    avatar: imgWinnerSarah,
    text: "Emma won",
    prize: "AirPods",
    time: "1 hr ago",
  },
];

const LIVE_ACTIVITY = [
  {
    avatar: imgCreatorAddy,
    text: "Mike joined",
    prize: "$500 Cash Game",
    time: "30 sec ago",
  },
  {
    avatar: imgCreatorTaylor,
    text: "Sarah purchased",
    prize: "50 tokens",
    time: "1 min ago",
  },
  {
    avatar: imgWinnerJames,
    text: "James won",
    prize: "$100",
    time: "2 min ago",
    isWin: true,
  },
  {
    avatar: imgCreatorMaya,
    text: "Ashley entered",
    prize: "PS5 Bundle",
    time: "2 min ago",
  },
  {
    avatar: imgCreatorJay,
    text: "David joined",
    prize: "LV Bag Game",
    time: "3 min ago",
  },
];

// Fallback winners shown when no admin-curated entries exist yet
const FALLBACK_WINNERS = [
  {
    imageUrl: imgWinnerMike,
    name: "Mike T.",
    prize: "Won $500 Cash",
    prizeColor: "#10b981",
    createdAt: "2024-05-12",
  },
  {
    imageUrl: imgWinnerSarah,
    name: "Sarah L.",
    prize: "Won PS5 Bundle",
    prizeColor: "#7c3aed",
    createdAt: "2024-05-12",
  },
  {
    imageUrl: imgWinnerJames,
    name: "James R.",
    prize: "Won $250 Cash",
    prizeColor: "#10b981",
    createdAt: "2024-05-11",
  },
  {
    imageUrl: imgWinnerAshley,
    name: "Ashley M.",
    prize: "Won LV Bag",
    prizeColor: "#7c3aed",
    createdAt: "2024-05-11",
  },
];

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
function useCountdown(endTime: string) {
  const [label, setLabel] = useState("–");
  useEffect(() => {
    function tick() {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setLabel("Ended");
        return;
      }
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
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
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
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { val, ref };
}

/* ─── GAME CARD ───────────────────────────────────────────────────────────── */
function GameCard({
  game,
  onPlay,
  rank,
}: {
  game: Game;
  onPlay: () => void;
  rank?: number;
}) {
  const countdown = useCountdown(game.endTime as string);
  const pct =
    game.tokenThreshold > 0
      ? Math.min((game.tokensCollected / game.tokenThreshold) * 100, 100)
      : 0;
  const filled = game.tokenThreshold - game.numbersLeft;
  const total = game.tokenThreshold;
  const spotsLeft = game.numbersLeft;

  // Urgency tiers
  const isCritical = pct >= 95 || spotsLeft <= 1;
  const isHot      = pct >= 80 || spotsLeft <= 3;
  const barColor   = isCritical ? "#ef4444" : isHot ? "#f97316" : "#10b981";
  const borderGlow = isCritical ? "rgba(239,68,68,.45)"  : isHot ? "rgba(249,115,22,.35)" : "rgba(124,58,237,.3)";
  const borderCol  = isCritical ? "rgba(239,68,68,.5)"   : isHot ? "rgba(249,115,22,.45)" : "rgba(124,58,237,.25)";
  const topGlow    = isCritical ? "rgba(239,68,68,.18)"  : isHot ? "rgba(249,115,22,.14)" : "rgba(124,58,237,.12)";

  const RANK_LABELS: Record<number, string> = { 0: "🥇 #1 HOT", 1: "🥈 #2", 2: "🥉 #3" };
  const FALLBACK_IMGS = [imgCash, imgPs5, imgVip, imgTv];
  const fallback = FALLBACK_IMGS[(rank ?? 0) % FALLBACK_IMGS.length];

  return (
    <div
      className="game-card rounded-3xl overflow-hidden flex flex-col relative group cursor-pointer"
      style={{
        background: "linear-gradient(175deg,#13102e,#0f0c24,#080614)",
        border: `1.5px solid ${borderCol}`,
        boxShadow: `0 8px 40px rgba(0,0,0,.65), 0 0 30px ${borderGlow.replace('.3)', '.08)').replace('.45)', '.1)').replace('.35)', '.08)')}`,
        minWidth: 220,
      }}
      onClick={onPlay}
    >
      {/* Top ambient bloom */}
      <div className="absolute top-0 inset-x-0 h-32 pointer-events-none z-10"
        style={{ background: `radial-gradient(ellipse 100% 100% at 50% 0%,${topGlow},transparent 75%)` }} />

      {/* ── IMAGE ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden h-80 sm:h-96" style={{ background: "#1a1535", flexShrink: 0 }}>
        <img
          src={game.prizeImageUrl || fallback}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition: "center center" }}
        />

        {/* Minimal scrim — only at very bottom for text, image stays fully visible */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top,rgba(8,6,20,.95) 0%,rgba(8,6,20,.6) 20%,rgba(8,6,20,.1) 40%,transparent 60%)" }} />

        {/* ── TOP ROW: LIVE badge (left) + Rank badge (right) ── */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
          {/* LIVE badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(10px)", border: "1px solid rgba(52,211,153,.3)" }}>
            <div className="relative w-2 h-2 shrink-0">
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-70" style={{ animationDuration: "1.6s" }} />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <span className="text-green-300 font-black text-[9px] uppercase tracking-widest">Live</span>
          </div>

          {/* Rank badge */}
          {rank !== undefined && rank < 3 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[10px] text-white"
              style={{
                background: rank === 0 ? "linear-gradient(135deg,#f59e0b,#d97706)" : "rgba(0,0,0,.6)",
                border: rank === 0 ? "1px solid rgba(245,158,11,.6)" : "1px solid rgba(255,255,255,.18)",
                backdropFilter: "blur(8px)",
                boxShadow: rank === 0 ? "0 0 14px rgba(245,158,11,.4)" : "none",
              }}>
              {RANK_LABELS[rank]}
            </div>
          )}
        </div>

        {/* ── BOTTOM ROW: Title (left) + Countdown (right) ── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-3 flex items-end justify-between gap-2">
          {/* Game title */}
          <h3 className="text-white font-black text-sm sm:text-base uppercase tracking-wide leading-tight line-clamp-2 flex-1"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,1)" }}>
            {game.name}
          </h3>
          {/* Countdown — pinned bottom-right, never floating in middle */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full shrink-0"
            style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(10px)", border: `1px solid ${borderCol}` }}>
            <Timer className="h-2.5 w-2.5 shrink-0" style={{ color: barColor }} />
            <span className="text-white font-black text-[10px] whitespace-nowrap">{countdown}</span>
          </div>
        </div>
      </div>

      {/* ── INFO BODY ───────────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Spots + token cost row */}
        <div className="flex items-center justify-between gap-2">
          {/* Spots urgency pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-1"
            style={{ background: `${barColor}15`, border: `1px solid ${barColor}35` }}>
            <span className="text-sm leading-none">{isCritical ? "🔥" : isHot ? "⚡" : "🎮"}</span>
            <span className="font-black text-xs uppercase tracking-wide" style={{ color: barColor }}>
              {isCritical ? `Only ${spotsLeft} left!` : isHot ? `${spotsLeft} spots left` : `${spotsLeft} open`}
            </span>
          </div>
          {/* Token cost */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0"
            style={{ background: "rgba(124,58,237,.18)", border: "1px solid rgba(124,58,237,.4)" }}>
            <Zap className="h-3.5 w-3.5 text-yellow-400 shrink-0" fill="currentColor" />
            <span className="text-yellow-300 font-black text-xs">{game.tokenCostPerEntry} TKN</span>
          </div>
        </div>

        {/* Progress bar block */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 font-semibold text-xs">{filled} of {total} spots filled</span>
            <span className="font-black text-xs px-1.5 py-0.5 rounded" style={{ color: barColor, background: `${barColor}15` }}>
              {Math.round(pct)}% full
            </span>
          </div>
          {/* Track */}
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.07)" }}>
            <div className="h-full rounded-full transition-all progress-bar"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg,${barColor}88,${barColor})`, boxShadow: `0 0 12px ${barColor}99` }} />
          </div>
          {/* Sub-label */}
          <p className="text-gray-400 text-xs">
            <span className="text-white font-bold">{spotsLeft}</span> spots remaining — enter before it fills up!
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
          className="mt-auto w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:brightness-110"
          style={{
            background: `linear-gradient(135deg,#7c3aed,#6d28d9,#5b21b6)`,
            boxShadow: `0 6px 28px rgba(124,58,237,.55), inset 0 1px 0 rgba(255,255,255,.1)`,
            letterSpacing: "0.05em",
          }}>
          <Zap className="h-4 w-4 text-yellow-300" fill="currentColor" />
          ENTER NOW
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── STAT NUMBER ─────────────────────────────────────────────────────────── */
function StatNum({
  target,
  prefix = "",
  suffix = "",
  label,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  const { val, ref } = useAnimatedCount(target);
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span ref={ref} className="stat-num font-black text-2xl text-white">
        {prefix}
        {val.toLocaleString()}
        {suffix}
      </span>
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
  const [activeWinner, setActiveWinner] = useState(0);
  const [wallPaused, setWallPaused] = useState(false);

  const { data: user } = useQuery<any>({ queryKey: ["/api/user"] });
  const { data: tokenData } = useQuery<{ tokenBalance: number }>({
    queryKey: ["/api/user/token-balance"],
    refetchInterval: 15000,
  });
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    refetchInterval: 20000,
  });
  const { data: winnersData } = useQuery<
    { winnerName: string; prize: string; completedAt: string }[]
  >({ queryKey: ["/api/winners"], refetchInterval: 60000 });
  const { data: winnerWallData } = useQuery<
    {
      id: number;
      name: string;
      prize: string;
      prizeColor: string;
      imageUrl: string | null;
      createdAt: string;
    }[]
  >({ queryKey: ["/api/winner-wall"], refetchInterval: 120000 });
  const { data: notifsData, refetch: refetchNotifs } = useQuery<{
    notifications: any[];
    unreadCount: number;
  }>({ queryKey: ["/api/notifications"], refetchInterval: 30000 });
  const { data: referralData } = useQuery<{ referralCode: string | null }>({
    queryKey: ["/api/user/referral-code"],
  });

  const activeGames = games?.filter((g) => g.isActive) ?? [];
  const tokenBalance = tokenData?.tokenBalance ?? 0;
  const unreadCount = notifsData?.unreadCount ?? 0;
  const notifsList = notifsData?.notifications ?? [];
  const username =
    (user as any)?.firstName ?? (user as any)?.email?.split("@")[0] ?? "Player";
  const avatarLetter = username[0]?.toUpperCase() ?? "P";
  const referralCode = referralData?.referralCode ?? "PLUGZ5";

  // Ticker items from real winners or fallback
  const tickerWinners =
    winnersData && winnersData.length > 0
      ? winnersData.map((w, i) => ({
          avatar: TICKER_ITEMS[i % TICKER_ITEMS.length].avatar,
          text: `${w.winnerName} won`,
          prize: w.prize,
          time: new Date(w.completedAt).toLocaleDateString(),
        }))
      : TICKER_ITEMS;

  async function markAllRead() {
    try {
      await fetch("/api/notifications/read-all", {
        method: "POST",
        credentials: "include",
      });
      refetchNotifs();
    } catch {}
  }

  function copyReferral() {
    const text = `${window.location.origin}/?ref=${referralCode}`;
    try {
      navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Winner Wall auto-rotation */
  useEffect(() => {
    if (wallPaused) return;
    const winners =
      winnerWallData && winnerWallData.length > 0
        ? winnerWallData
        : FALLBACK_WINNERS;
    const total = Math.min(winners.length, 6);
    if (total <= 1) return;
    const t = setInterval(() => setActiveWinner((p) => (p + 1) % total), 3500);
    return () => clearInterval(t);
  }, [wallPaused, winnerWallData]);

  /* Today's top winner from real data */
  const topWinner = winnersData?.[0];

  const NAV = [
    { label: "Home", path: "/", icon: Home },
    { label: "Games", path: "/games", icon: ShoppingBag },
    { label: "Prizes", path: "/how-to-play", icon: Gift },
    { label: "My Entries", path: "/dashboard", icon: Hash },
    { label: "Referrals", path: "/dashboard", icon: Share2 },
    { label: "Account", path: "/dashboard", icon: User },
  ];

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "#08080f", overflowX: "hidden" }}
    >
      <style>{CSS}</style>

      {/* ── WINNER TICKER ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-2.5"
        style={{
          background: "linear-gradient(90deg,#0a0918,#100d24,#0a0918)",
          borderBottom: "1px solid rgba(124,58,237,.18)",
        }}
      >
        <div
          className="absolute left-0 inset-y-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(90deg,#0a0918,transparent)" }}
        />
        <div
          className="absolute right-0 inset-y-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(270deg,#0a0918,transparent)" }}
        />

        {/* LIVE badge */}
        <div className="absolute left-4 inset-y-0 z-20 flex items-center">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-black text-white text-xs"
            style={{
              background: "#10b981",
              fontSize: "10px",
              letterSpacing: ".06em",
            }}
          >
            <span className="relative ring-live">
              <span className="block w-1.5 h-1.5 bg-white rounded-full" />
            </span>
            LIVE
          </div>
        </div>

        <div className="ticker-wrap pl-20">
          <div className="ticker-inner">
            {[...tickerWinners, ...tickerWinners].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 mx-10 text-sm font-semibold"
              >
                <img
                  src={item.avatar}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover object-top border border-violet-500/30"
                />
                <span className="text-gray-300">{item.text}</span>
                <span className="font-black" style={{ color: "#f59e0b" }}>
                  {item.prize}
                </span>
                <span className="text-gray-600 text-xs">{item.time}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "rgba(8,8,15,.97)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(124,58,237,.1)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center gap-4">
          {/* Logo */}
          <button onClick={() => setLocation("/")} className="shrink-0">
            <img
              src={logoPath}
              alt="Prize Plugz"
              className="h-9 w-auto object-contain"
            />
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {NAV.map(({ label, path, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setLocation(path)}
                className={`nav-item flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:text-white hover:bg-white/5 ${label === "Home" ? "active text-white" : "text-gray-500"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Token pill */}
            <button
              onClick={() => setLocation("/add-credits")}
              className="token-pill flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full font-black text-sm"
              style={{
                background: "rgba(124,58,237,.15)",
                border: "1px solid rgba(124,58,237,.4)",
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                }}
              >
                🪙
              </div>
              <span className="text-white">{tokenBalance}</span>
              <span className="text-gray-400 text-xs">Tokens</span>
            </button>

            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifs((p) => !p);
                  markAllRead();
                }}
                className="relative w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-white/8"
                style={{
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.08)",
                }}
              >
                <Bell className="h-4 w-4 text-gray-400" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                    style={{ background: "#f97316" }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div
                  className="absolute right-0 top-10 w-72 rounded-2xl z-50 overflow-hidden shadow-2xl"
                  style={{
                    background: "#13112a",
                    border: "1px solid rgba(124,58,237,.2)",
                  }}
                >
                  <div
                    className="px-4 py-2.5 flex justify-between items-center"
                    style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
                  >
                    <span className="text-white font-bold text-sm">
                      Notifications
                    </span>
                    <button
                      onClick={() => setShowNotifs(false)}
                      className="text-gray-600 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  {notifsList.length === 0 ? (
                    <p className="px-4 py-6 text-center text-gray-600 text-sm">
                      No notifications yet
                    </p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {notifsList.map((n: any) => (
                        <div
                          key={n.id}
                          className="px-4 py-3 hover:bg-white/3"
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,.04)",
                            background: !n.isRead ? "rgba(124,58,237,.06)" : "",
                          }}
                        >
                          <p className="text-white text-sm font-semibold">
                            {n.title}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {n.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Avatar + logout */}
            <button
              onClick={() => setLocation("/dashboard")}
              className="w-8 h-8 rounded-full font-black text-sm text-white ring-2 ring-violet-500/20 flex items-center justify-center transition hover:scale-110"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
            >
              {avatarLetter}
            </button>
            <button
              onClick={() => logout()}
              className="hidden sm:flex w-7 h-7 items-center justify-center rounded-full text-gray-700 hover:text-red-400 transition hover:bg-red-500/10"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          HERO — PREMIUM
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 overflow-hidden">
        {/* Floating ambient orbs */}
        <div
          className="orb-1 absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle,rgba(124,58,237,.18),transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="orb-2 absolute -top-10 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle,rgba(99,102,241,.14),transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-28 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse,rgba(124,58,237,.07),transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* ── LEFT: COPY ───────────────────────────────────── */}
          <div style={{ animation: "fadeUp .6s ease both" }}>
            {/* Live players pulse badge */}
            <div
              className="live-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 font-black text-xs uppercase tracking-widest"
              style={{
                background: "rgba(239,68,68,.12)",
                border: "1px solid rgba(239,68,68,.35)",
                color: "#f87171",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              🔴 Live Now · 12,458 Players Online
            </div>

            {/* Headline */}
            <h1
              className="font-black leading-[.93] uppercase mb-5"
              style={{ fontSize: "clamp(2.8rem,6.5vw,5rem)" }}
            >
              <span className="text-white block">REAL PRIZES.</span>
              <span
                className="block"
                style={{
                  background: "linear-gradient(90deg,#ff6b35,#ff3c3c,#f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                REAL WINNERS.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-gray-400 text-base leading-relaxed max-w-md mb-7">
              Buy tokens, join games, and win{" "}
              <span className="text-white font-bold">
                cash, gadgets & luxury prizes
              </span>
              .{" "}
              <span className="text-violet-400 font-semibold">
                100% transparent
              </span>{" "}
              — auto winner every time.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mb-7">
              <button
                onClick={() => setLocation("/add-credits")}
                className="hero-btn-primary flex items-center gap-2.5 px-9 py-4 rounded-2xl font-black text-base text-white"
              >
                <Zap className="h-5 w-5" fill="currentColor" />
                GET TOKENS
              </button>
              <button
                onClick={() => setLocation("/games")}
                className="hero-btn-secondary flex items-center gap-2.5 px-7 py-4 rounded-2xl font-black text-base text-gray-200"
                style={{
                  border: "2px solid rgba(255,255,255,.16)",
                  background: "rgba(255,255,255,.04)",
                }}
              >
                <Play className="h-4 w-4 fill-current" />
                PLAY NOW
              </button>
            </div>

            {/* Trust pill badges */}
            <div className="flex flex-wrap gap-2">
              {[
                {
                  icon: "🔒",
                  text: "100% Transparent",
                  bg: "rgba(16,185,129,.1)",
                  border: "rgba(16,185,129,.28)",
                  fg: "#34d399",
                },
                {
                  icon: "⚡",
                  text: "Instant Results",
                  bg: "rgba(245,158,11,.1)",
                  border: "rgba(245,158,11,.28)",
                  fg: "#fbbf24",
                },
                {
                  icon: "🏆",
                  text: "Auto Winner",
                  bg: "rgba(124,58,237,.12)",
                  border: "rgba(124,58,237,.3)",
                  fg: "#a78bfa",
                },
                {
                  icon: "🆓",
                  text: "Free Spin",
                  bg: "rgba(239,68,68,.1)",
                  border: "rgba(239,68,68,.28)",
                  fg: "#f87171",
                },
              ].map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: b.bg,
                    border: `1px solid ${b.border}`,
                    color: b.fg,
                  }}
                >
                  {b.icon} {b.text}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: WINNER CARD + STATS ───────────────────── */}
          <div
            className="space-y-4"
            style={{ animation: "scaleIn .7s ease both" }}
          >
            {/* Premium Winner Spotlight */}
            <div
              className="relative overflow-hidden rounded-3xl"
              style={{
                background: "linear-gradient(135deg,#0f0a22,#1b1145,#0c0820)",
                border: "1px solid rgba(124,58,237,.32)",
                boxShadow:
                  "0 24px 70px rgba(0,0,0,.65), 0 0 0 1px rgba(124,58,237,.08), inset 0 1px 0 rgba(255,255,255,.04)",
              }}
            >
              {/* BG glows */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 60% at 80% 20%,rgba(124,58,237,.22),transparent 70%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 50% at 15% 80%,rgba(16,185,129,.09),transparent 60%)",
                }}
              />

              {/* Floating sparkle dots */}
              <div
                className="absolute top-4 left-20 w-1 h-1 rounded-full bg-violet-400 pointer-events-none"
                style={{
                  opacity: 0.6,
                  animation: "blink 1.5s ease-in-out infinite",
                }}
              />
              <div
                className="absolute top-10 right-20 w-1.5 h-1.5 rounded-full bg-yellow-400 pointer-events-none"
                style={{
                  opacity: 0.5,
                  animation: "blink 2s ease-in-out infinite",
                }}
              />
              <div
                className="absolute bottom-16 left-8 w-1 h-1 rounded-full bg-green-400 pointer-events-none"
                style={{
                  opacity: 0.5,
                  animation: "blink 1.8s ease-in-out infinite",
                }}
              />

              <div className="flex items-stretch" style={{ minHeight: 180 }}>
                {/* Info */}
                <div className="flex-1 p-5 sm:p-6 z-10 flex flex-col justify-between">
                  <div>
                    {/* Live badge */}
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                      style={{
                        background: "rgba(16,185,129,.12)",
                        border: "1px solid rgba(16,185,129,.3)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"
                        style={{ animation: "blink 1.4s ease-in-out infinite" }}
                      />
                      <span className="text-green-400 text-[10px] font-black uppercase tracking-widest">
                        Today's Big Winner
                      </span>
                    </div>

                    {/* Crown + name */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="crown-bob text-2xl inline-block leading-none">
                        👑
                      </span>
                      <p className="text-white font-black text-xl leading-tight">
                        {topWinner ? topWinner.winnerName : "James R."}
                      </p>
                    </div>

                    {/* Prize amount — big glowing */}
                    <p
                      className="prize-flash font-black leading-none mt-1"
                      style={{
                        fontSize: "clamp(2.2rem,5vw,3.2rem)",
                        color: "#10b981",
                      }}
                    >
                      {topWinner ? topWinner.prize : "$250"}
                    </p>

                    {/* Verified */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                      <span className="text-green-400 text-xs font-bold">
                        Verified · Auto-Selected Winner
                      </span>
                    </div>
                  </div>

                  {/* CTA button */}
                  <button
                    onClick={() => setLocation("/dashboard")}
                    className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-black text-sm transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(124,58,237,.28),rgba(99,102,241,.18))",
                      border: "1.5px solid rgba(124,58,237,.45)",
                    }}
                  >
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <span className="text-white">VIEW WINNER HALL</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                </div>

                {/* Photo panel */}
                <div className="w-40 sm:w-44 relative overflow-hidden rounded-r-3xl shrink-0">
                  <img
                    src={imgHeroWinner}
                    alt="Winner"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Left fade */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to right,rgba(15,10,34,.9),transparent 45%)",
                    }}
                  />
                  {/* Stars */}
                  <div className="absolute top-3 right-3 text-yellow-400 text-xs leading-none">
                    ⭐⭐⭐
                  </div>
                  {/* Bottom ribbon */}
                  <div
                    className="absolute bottom-0 inset-x-0 py-2 text-center font-black text-[10px] uppercase tracking-widest text-white"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(124,58,237,.95),rgba(79,70,229,.95))",
                    }}
                  >
                    🏆 WINNER
                  </div>
                </div>
              </div>
            </div>

            {/* Stats — 3 premium cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  Icon: Users,
                  color: "#7c3aed",
                  glow: "rgba(124,58,237,.3)",
                  bg: "linear-gradient(135deg,#130f28,#1a1040,#0d0a20)",
                  target: 12458,
                  prefix: "",
                  suffix: "K",
                  divisor: 1000,
                  label: "Online Now",
                  badge: "🔴 LIVE",
                  badgeBg: "rgba(239,68,68,.15)",
                  badgeFg: "#f87171",
                  trend: "+284 today",
                  trendColor: "#a78bfa",
                },
                {
                  Icon: Trophy,
                  color: "#f59e0b",
                  glow: "rgba(245,158,11,.3)",
                  bg: "linear-gradient(135deg,#1a1308,#241a0a,#130f04)",
                  target: 127250,
                  prefix: "$",
                  suffix: "K+",
                  divisor: 1000,
                  label: "Prizes Paid",
                  badge: "💰 TOTAL",
                  badgeBg: "rgba(245,158,11,.12)",
                  badgeFg: "#fbbf24",
                  trend: "↑ Growing",
                  trendColor: "#f59e0b",
                },
                {
                  Icon: Sparkles,
                  color: "#10b981",
                  glow: "rgba(16,185,129,.3)",
                  bg: "linear-gradient(135deg,#071a12,#0c2418,#05140e)",
                  target: 583,
                  prefix: "",
                  suffix: "",
                  divisor: 1,
                  label: "Winners",
                  badge: "🏆 TODAY",
                  badgeBg: "rgba(16,185,129,.12)",
                  badgeFg: "#34d399",
                  trend: "+47 this hr",
                  trendColor: "#10b981",
                },
              ].map(
                (
                  {
                    Icon,
                    color,
                    glow,
                    bg,
                    target,
                    prefix,
                    suffix,
                    divisor,
                    label,
                    badge,
                    badgeBg,
                    badgeFg,
                    trend,
                    trendColor,
                  },
                  si,
                ) => (
                  <div
                    key={si}
                    className="stat-card relative overflow-hidden rounded-2xl flex flex-col items-center justify-between text-center"
                    style={{
                      background: bg,
                      border: `1px solid ${color}35`,
                      animationDelay: `${si * 0.5}s`,
                      padding: "14px 10px 12px",
                    }}
                  >
                    {/* Top glow bloom */}
                    <div
                      className="absolute inset-x-0 top-0 h-20 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse 120% 100% at 50% -10%,${glow},transparent 70%)`,
                      }}
                    />

                    {/* Bottom shimmer bar */}
                    <div
                      className="absolute bottom-0 inset-x-0 h-0.5 pointer-events-none"
                      style={{
                        background: `linear-gradient(90deg,transparent,${color},transparent)`,
                        opacity: 0.6,
                      }}
                    />

                    {/* Badge pill */}
                    <div
                      className="relative z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-2"
                      style={{
                        background: badgeBg,
                        border: `1px solid ${color}30`,
                        color: badgeFg,
                      }}
                    >
                      {badge}
                    </div>

                    {/* Icon orb */}
                    <div className="relative z-10 mb-1">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: `radial-gradient(circle,${color}30,${color}10)`,
                          border: `1.5px solid ${color}50`,
                          boxShadow: `0 0 18px ${color}40`,
                        }}
                      >
                        <Icon className="h-4.5 w-4.5" style={{ color }} />
                      </div>
                    </div>

                    {/* Big number */}
                    <div
                      className="relative z-10 font-black leading-none mt-1"
                      style={{
                        fontSize: "clamp(1.4rem,3.5vw,1.9rem)",
                        background: `linear-gradient(135deg,#fff 30%,${color})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {prefix}
                      {divisor > 1
                        ? (target / divisor).toFixed(divisor === 1000 ? 1 : 0)
                        : target.toLocaleString()}
                      {suffix}
                    </div>

                    {/* Label */}
                    <p
                      className="relative z-10 text-gray-400 font-bold uppercase tracking-widest mt-0.5"
                      style={{ fontSize: "9px" }}
                    >
                      {label}
                    </p>

                    {/* Trend tag */}
                    <div
                      className="relative z-10 mt-2 text-[9px] font-bold"
                      style={{ color: trendColor, opacity: 0.85 }}
                    >
                      {trend}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LIVE GAMES
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2 section-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Animated fire icon */}
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,rgba(249,115,22,.25),rgba(239,68,68,.15))", border: "1px solid rgba(249,115,22,.35)", boxShadow: "0 0 20px rgba(249,115,22,.2)" }}>
              <span className="text-xl" style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,.8))" }}>🔥</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-white font-black text-xl uppercase tracking-wide">Live Games</h2>
                {activeGames.length > 0 && (
                  <span className="relative flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black text-white"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 12px rgba(124,58,237,.5)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping absolute left-2" style={{ animationDuration: "1.8s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    {activeGames.length} Active
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-xs mt-0.5">Spin to win — new games launching daily</p>
            </div>
          </div>
          <button
            onClick={() => setLocation("/games")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-sm text-white transition-all hover:scale-105"
            style={{ background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.3)" }}
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ background: "#131124" }}
              >
                <div
                  className="h-6 animate-pulse"
                  style={{ background: "#7c3aed40" }}
                />
                <div
                  className="h-40 animate-pulse"
                  style={{ background: "#1a1535" }}
                />
                <div className="p-4 space-y-2">
                  <div
                    className="h-4 rounded animate-pulse w-3/4"
                    style={{ background: "#1a1535" }}
                  />
                  <div
                    className="h-2 rounded animate-pulse"
                    style={{ background: "#1a1535" }}
                  />
                  <div
                    className="h-9 rounded-xl animate-pulse"
                    style={{ background: "#1a1535" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : activeGames.length === 0 ? (
          <div
            className="rounded-2xl p-16 flex flex-col items-center text-center"
            style={{
              background: "#131124",
              border: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <span className="text-5xl mb-4">🎮</span>
            <h3 className="text-white font-black text-lg mb-2">
              No Live Games Right Now
            </h3>
            <p className="text-gray-600 text-sm mb-5">
              New games launch daily — get your tokens ready!
            </p>
            <button
              onClick={() => setLocation("/add-credits")}
              className="enter-btn px-8 py-2.5 rounded-xl font-black text-sm text-white"
            >
              Buy Tokens
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeGames.slice(0, 8).map((g, i) => (
              <GameCard
                key={g.id}
                game={g}
                onPlay={() => setLocation(`/game/${g.id}`)}
                rank={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LIVE ACTIVITY + WINNER WALL
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-5 section-in">
        {/* ── LIVE ACTIVITY ───────────────────────────────────────────── */}
        {(() => {
          const getType = (text: string, isWin?: boolean) => {
            if (isWin || text.toLowerCase().includes("won")) return "win";
            if (
              text.toLowerCase().includes("purchased") ||
              text.toLowerCase().includes("bought")
            )
              return "buy";
            return "join";
          };
          const TYPE_META = {
            win: {
              label: "🏆 WON",
              color: "#10b981",
              glow: "rgba(16,185,129,.35)",
              ring: "rgba(16,185,129,.5)",
              bg: "rgba(16,185,129,.08)",
              stripe: "#10b981",
            },
            buy: {
              label: "💰 BOUGHT",
              color: "#f59e0b",
              glow: "rgba(245,158,11,.35)",
              ring: "rgba(245,158,11,.5)",
              bg: "rgba(245,158,11,.06)",
              stripe: "#f59e0b",
            },
            join: {
              label: "🎮 JOINED",
              color: "#7c3aed",
              glow: "rgba(124,58,237,.35)",
              ring: "rgba(124,58,237,.5)",
              bg: "rgba(124,58,237,.06)",
              stripe: "#7c3aed",
            },
          };
          return (
            <div
              className="relative rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: "linear-gradient(160deg,#0c0a1e,#111028,#08060f)",
                border: "1px solid rgba(124,58,237,.2)",
                boxShadow: "0 0 60px rgba(124,58,237,.06)",
              }}
            >
              {/* BG ambient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 50% at 0% 0%,rgba(124,58,237,.08),transparent 60%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 40% at 100% 100%,rgba(16,185,129,.05),transparent 60%)",
                }}
              />

              {/* Header */}
              <div
                className="relative flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
              >
                <div className="flex items-center gap-2.5">
                  {/* Animated live orb */}
                  <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                    <div
                      className="absolute inset-0 rounded-full bg-green-500 opacity-25 animate-ping"
                      style={{ animationDuration: "1.8s" }}
                    />
                    <div className="live-dot w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <h3 className="text-white font-black text-sm uppercase tracking-wider">
                    Live Activity
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                    style={{
                      background: "rgba(16,185,129,.12)",
                      border: "1px solid rgba(16,185,129,.25)",
                      color: "#34d399",
                    }}
                  >
                    Real-Time
                  </span>
                </div>
                {/* Mini event count */}
                <div className="text-right">
                  <p className="text-white font-black text-sm">247</p>
                  <p className="text-gray-600 text-[10px]">events/hr</p>
                </div>
              </div>

              {/* Mini summary strip */}
              <div
                className="flex items-center gap-4 px-5 py-2.5"
                style={{
                  background: "rgba(255,255,255,.02)",
                  borderBottom: "1px solid rgba(255,255,255,.04)",
                }}
              >
                {[
                  { icon: "🏆", label: "12 wins", color: "#10b981" },
                  { icon: "🎮", label: "89 entries", color: "#7c3aed" },
                  { icon: "💰", label: "31 purchases", color: "#f59e0b" },
                ].map((s, si) => (
                  <div key={si} className="flex items-center gap-1.5">
                    <span className="text-xs">{s.icon}</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: s.color }}
                    >
                      {s.label}
                    </span>
                    <span className="text-gray-700 text-xs">today</span>
                  </div>
                ))}
              </div>

              {/* Activity rows */}
              <div className="flex-1 overflow-hidden">
                {LIVE_ACTIVITY.map((item, i) => {
                  const type = getType(
                    item.text,
                    item.isWin,
                  ) as keyof typeof TYPE_META;
                  const meta = TYPE_META[type];
                  return (
                    <div
                      key={i}
                      className="activity-row relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                      style={{
                        animationDelay: `${i * 0.07}s`,
                        borderBottom:
                          i < LIVE_ACTIVITY.length - 1
                            ? "1px solid rgba(255,255,255,.04)"
                            : "none",
                      }}
                    >
                      {/* Left accent stripe */}
                      <div
                        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                        style={{
                          background: meta.stripe,
                          boxShadow: `0 0 8px ${meta.stripe}`,
                        }}
                      />

                      {/* Avatar with colored ring */}
                      <div className="relative shrink-0">
                        <div
                          className="w-10 h-10 rounded-full overflow-hidden"
                          style={{
                            border: `2px solid ${meta.ring}`,
                            boxShadow: `0 0 12px ${meta.glow}`,
                          }}
                        >
                          <img
                            src={item.avatar}
                            alt=""
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        {/* Type icon badge */}
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                          style={{
                            background: meta.color,
                            border: "1.5px solid #0c0a1e",
                          }}
                        >
                          {type === "win" ? "🏆" : type === "buy" ? "💰" : "🎮"}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Type badge */}
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                          <span className="text-gray-600 text-[10px]">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-sm leading-snug truncate">
                          <span className="text-white font-bold">
                            {item.text.split(" ").slice(0, 1).join(" ")}
                          </span>
                          <span className="text-gray-400">
                            {" "}
                            {item.text.split(" ").slice(1).join(" ")}{" "}
                          </span>
                          <span
                            className="font-black"
                            style={{ color: meta.color }}
                          >
                            {item.prize}
                          </span>
                        </p>
                      </div>

                      {/* Right arrow hint */}
                      <ChevronRight className="h-3.5 w-3.5 text-gray-700 shrink-0" />
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div
                className="relative px-5 py-3 flex items-center justify-between"
                style={{
                  borderTop: "1px solid rgba(255,255,255,.05)",
                  background: "rgba(255,255,255,.01)",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-green-400"
                    style={{ animation: "blink 1.4s ease-in-out infinite" }}
                  />
                  <span className="text-gray-600 text-xs">
                    Powered by real data
                  </span>
                </div>
                <button
                  onClick={() => setLocation("/games")}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-black text-xs text-white transition-all hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(124,58,237,.4),rgba(99,102,241,.3))",
                    border: "1px solid rgba(124,58,237,.4)",
                  }}
                >
                  Join a Game <Zap className="h-3 w-3" fill="currentColor" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── WINNER WALL ─────────────────────────────────────────────── */}
        {(() => {
          const wallWinners = (
            winnerWallData && winnerWallData.length > 0
              ? winnerWallData
              : FALLBACK_WINNERS
          ).slice(0, 6);
          const aw = wallWinners[activeWinner] ?? wallWinners[0];
          const CONFETTI = ["🎊", "✨", "🎉", "⭐", "🌟", "💫"];
          return (
            <div
              className="relative rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: "linear-gradient(160deg,#0f0b1f,#13102a,#0a0714)",
                border: "1px solid rgba(245,158,11,.18)",
                boxShadow: "0 0 60px rgba(245,158,11,.06)",
              }}
              onMouseEnter={() => setWallPaused(true)}
              onMouseLeave={() => setWallPaused(false)}
            >
              {/* Background glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 50% at 50% 0%,rgba(245,158,11,.08),transparent 70%)",
                }}
              />

              {/* Header */}
              <div
                className="relative flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid rgba(245,158,11,.1)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Trophy
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                    />
                    <div
                      className="absolute inset-0 blur-sm"
                      style={{ background: "rgba(245,158,11,.5)" }}
                    />
                  </div>
                  <h3 className="text-white font-black text-sm uppercase tracking-wider">
                    Winner Wall
                  </h3>
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                    style={{
                      background: "rgba(16,185,129,.15)",
                      border: "1px solid rgba(16,185,129,.3)",
                      color: "#34d399",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"
                      style={{ animation: "blink 1.4s ease-in-out infinite" }}
                    />
                    Live
                  </span>
                </div>
                <button
                  onClick={() => setLocation("/dashboard")}
                  className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 text-xs font-bold transition-colors"
                >
                  Hall of Fame <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Spotlight Card */}
              <div
                className="relative flex-1 overflow-hidden"
                style={{ minHeight: 0 }}
              >
                {/* Confetti burst when slide changes */}
                <div
                  className="absolute inset-x-0 top-0 pointer-events-none overflow-hidden"
                  style={{ height: 60 }}
                >
                  {CONFETTI.map((c, ci) => (
                    <span
                      key={`${activeWinner}-${ci}`}
                      className="confetti-piece"
                      style={{
                        left: `${15 + ci * 14}%`,
                        animationDelay: `${ci * 0.1}s`,
                        animationDuration: `${1.2 + ci * 0.1}s`,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <div
                  key={activeWinner}
                  className="winner-spotlight flex gap-0"
                  style={{ height: "100%" }}
                >
                  {/* Big image panel */}
                  <div
                    className="relative shrink-0 overflow-hidden"
                    style={{ width: "42%", minHeight: 210 }}
                  >
                    {aw.imageUrl ? (
                      <img
                        src={aw.imageUrl}
                        alt={aw.name}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: "center top" }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-5xl"
                        style={{
                          background: "linear-gradient(135deg,#1c1435,#2d1f6e)",
                        }}
                      >
                        🏆
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(90deg,transparent 60%,rgba(13,10,26,.9))",
                      }}
                    />
                    {/* Prize badge on image */}
                    <div
                      className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg font-black text-xs text-black"
                      style={{
                        background: aw.prizeColor || "#f59e0b",
                        boxShadow: `0 4px 14px ${aw.prizeColor || "#f59e0b"}60`,
                      }}
                    >
                      {aw.prize}
                    </div>
                  </div>

                  {/* Info panel */}
                  <div className="flex-1 flex flex-col justify-between p-4">
                    {/* Verified badge */}
                    <div
                      className="verified-pop inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit"
                      style={{
                        background: "rgba(16,185,129,.12)",
                        border: "1px solid rgba(16,185,129,.3)",
                      }}
                    >
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
                        Verified Winner
                      </span>
                    </div>

                    {/* Name & prize */}
                    <div className="mt-3">
                      <p className="text-white font-black text-base leading-tight">
                        {aw.name}
                      </p>
                      <p
                        className="font-black text-xl mt-1"
                        style={{
                          color: aw.prizeColor || "#f59e0b",
                          textShadow: `0 0 20px ${aw.prizeColor || "#f59e0b"}80`,
                        }}
                      >
                        {aw.prize}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(aw.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Progress dots & arrows */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        {wallWinners.map((_, di) => (
                          <button
                            key={di}
                            onClick={() => {
                              setActiveWinner(di);
                              setWallPaused(true);
                              setTimeout(() => setWallPaused(false), 6000);
                            }}
                            className="rounded-full transition-all duration-300"
                            style={{
                              width: di === activeWinner ? 18 : 6,
                              height: 6,
                              background:
                                di === activeWinner
                                  ? aw.prizeColor || "#f59e0b"
                                  : "rgba(255,255,255,.15)",
                              boxShadow:
                                di === activeWinner
                                  ? `0 0 8px ${aw.prizeColor || "#f59e0b"}`
                                  : "none",
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setActiveWinner(
                              (p) =>
                                (p - 1 + wallWinners.length) %
                                wallWinners.length,
                            );
                            setWallPaused(true);
                            setTimeout(() => setWallPaused(false), 6000);
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            background: "rgba(255,255,255,.07)",
                            border: "1px solid rgba(255,255,255,.1)",
                          }}
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-gray-400 rotate-180" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveWinner(
                              (p) => (p + 1) % wallWinners.length,
                            );
                            setWallPaused(true);
                            setTimeout(() => setWallPaused(false), 6000);
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            background: "rgba(255,255,255,.07)",
                            border: "1px solid rgba(255,255,255,.1)",
                          }}
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnail strip */}
              <div
                className="flex gap-2 px-4 py-3 overflow-x-auto"
                style={{ borderTop: "1px solid rgba(245,158,11,.08)" }}
              >
                {wallWinners.map((w, ti) => (
                  <button
                    key={ti}
                    onClick={() => {
                      setActiveWinner(ti);
                      setWallPaused(true);
                      setTimeout(() => setWallPaused(false), 6000);
                    }}
                    className="shrink-0 relative rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      width: 48,
                      height: 48,
                      border:
                        ti === activeWinner
                          ? `2px solid ${w.prizeColor || "#f59e0b"}`
                          : "2px solid rgba(255,255,255,.08)",
                      boxShadow:
                        ti === activeWinner
                          ? `0 0 12px ${w.prizeColor || "#f59e0b"}60`
                          : "none",
                      transform:
                        ti === activeWinner ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {w.imageUrl ? (
                      <img
                        src={w.imageUrl}
                        alt={w.name}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-lg"
                        style={{
                          background: "linear-gradient(135deg,#1c1435,#2d1f6e)",
                        }}
                      >
                        🏆
                      </div>
                    )}
                    {ti === activeWinner && (
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{ background: `${w.prizeColor || "#f59e0b"}20` }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Bottom stat bar */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{
                  background: "rgba(245,158,11,.04)",
                  borderTop: "1px solid rgba(245,158,11,.08)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-yellow-400 font-black text-xs">
                    {wallWinners.length}+ Recent Winners
                  </span>
                </div>
                <button
                  onClick={() => setLocation("/games")}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-black text-xs text-black transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#d97706)",
                    boxShadow: "0 4px 14px rgba(245,158,11,.4)",
                  }}
                >
                  Play Now <Zap className="h-3 w-3" fill="currentColor" />
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS — PREMIUM
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 section-in">
        {/* Outer container with layered glow */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#0d0b1e,#130f2e,#0a0818)",
            border: "1px solid rgba(124,58,237,.2)",
            boxShadow:
              "0 0 80px rgba(124,58,237,.08), inset 0 1px 0 rgba(255,255,255,.04)",
          }}
        >
          {/* Background radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(124,58,237,.12),transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 40% 40% at 50% 100%,rgba(99,102,241,.06),transparent 70%)",
            }}
          />

          <div className="relative z-10 p-6 sm:p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-black uppercase tracking-widest"
                style={{
                  background: "rgba(124,58,237,.15)",
                  border: "1px solid rgba(124,58,237,.3)",
                  color: "#a78bfa",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Simple. Fair. Exciting.
              </div>
              <h2 className="text-white font-black text-2xl sm:text-3xl uppercase tracking-tight">
                How It{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(90deg,#a78bfa,#7c3aed,#6d28d9)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Works
                </span>
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Get started in 3 easy steps — no experience needed
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 relative">
              {/* Connector line (desktop only) */}
              <div
                className="hidden sm:block absolute top-14 left-[calc(33%+16px)] right-[calc(33%+16px)] pointer-events-none"
                style={{ zIndex: 0 }}
              >
                <div className="flex items-center gap-0">
                  <div
                    className="flex-1 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg,rgba(124,58,237,.5),rgba(124,58,237,.2))",
                    }}
                  />
                  <ChevronRight
                    className="h-5 w-5 shrink-0"
                    style={{ color: "rgba(124,58,237,.5)" }}
                  />
                  <div
                    className="flex-1 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg,rgba(124,58,237,.2),rgba(124,58,237,.5))",
                    }}
                  />
                  <ChevronRight
                    className="h-5 w-5 shrink-0"
                    style={{ color: "rgba(124,58,237,.5)" }}
                  />
                </div>
              </div>

              {[
                {
                  num: "01",
                  emoji: "🪙",
                  title: "Buy Tokens",
                  tagline: "Fuel your entries",
                  desc: "Choose a token package that fits you. Starting from just $5 — the more you buy, the better the value.",
                  bullets: [
                    "5 packages from $5–$100",
                    "Instant credit to account",
                    "Bonus tokens on bigger packs",
                  ],
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
                  bullets: [
                    "Cash, gadgets & luxury prizes",
                    "Real-time progress tracking",
                    "One free spin per new game",
                  ],
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
                  bullets: [
                    "Auto-selected winner",
                    "Email notification sent",
                    "Prize shipped or delivered",
                  ],
                  color: "#10b981",
                  glow: "rgba(16,185,129,.25)",
                  border: "rgba(16,185,129,.35)",
                  bg: "rgba(16,185,129,.06)",
                },
              ].map((step, i) => (
                <div key={step.num} className="relative z-10 group">
                  <div
                    className="rounded-2xl p-5 flex flex-col gap-4 h-full transition-all duration-300 group-hover:-translate-y-1"
                    style={{
                      background: `linear-gradient(135deg,${step.bg},rgba(13,11,30,.8))`,
                      border: `1px solid ${step.border}`,
                      boxShadow: `0 4px 30px ${step.glow}, inset 0 1px 0 rgba(255,255,255,.04)`,
                    }}
                  >
                    {/* Step number background watermark */}
                    <div
                      className="absolute top-3 right-4 font-black text-6xl select-none pointer-events-none"
                      style={{
                        color: step.color,
                        opacity: 0.07,
                        lineHeight: 1,
                      }}
                    >
                      {step.num}
                    </div>

                    {/* Icon with pulse rings */}
                    <div className="relative w-16 h-16 shrink-0">
                      {/* Pulse ring */}
                      <div
                        className="absolute inset-0 rounded-full animate-ping opacity-20"
                        style={{
                          background: step.color,
                          animationDuration: "2.5s",
                          animationDelay: `${i * 0.4}s`,
                        }}
                      />
                      {/* Glow ring */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `radial-gradient(circle,${step.glow},transparent 70%)`,
                        }}
                      />
                      {/* Icon circle */}
                      <div
                        className="absolute inset-1.5 rounded-full flex items-center justify-center text-2xl"
                        style={{
                          background: `linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03))`,
                          border: `2px solid ${step.border}`,
                          boxShadow: `0 0 20px ${step.glow}`,
                        }}
                      >
                        {step.emoji}
                      </div>
                      {/* Step badge */}
                      <span
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                        style={{ background: step.color }}
                      >
                        {i + 1}
                      </span>
                    </div>

                    {/* Text */}
                    <div>
                      <p
                        className="text-xs font-bold uppercase tracking-widest mb-0.5"
                        style={{ color: step.color }}
                      >
                        {step.tagline}
                      </p>
                      <h3 className="text-white font-black text-lg leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    {/* Bullets */}
                    <ul className="space-y-1.5 mt-auto">
                      {step.bullets.map((b, bi) => (
                        <li
                          key={bi}
                          className="flex items-center gap-2 text-xs text-gray-400"
                        >
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                            style={{ background: step.color, color: "#000" }}
                          >
                            ✓
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust bar */}
            <div
              className="mt-8 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3"
              style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}
            >
              {[
                {
                  icon: "🔒",
                  label: "100% Transparent",
                  sub: "Every entry logged",
                },
                {
                  icon: "⚡",
                  label: "Instant Winners",
                  sub: "Auto-selected on fill",
                },
                {
                  icon: "🎯",
                  label: "Real Prizes",
                  sub: "Cash, tech & luxury",
                },
                {
                  icon: "🆓",
                  label: "Free Spin Included",
                  sub: "One per game for new players",
                },
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.05)",
                  }}
                >
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
        {/* ── REFER & EARN ──────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg,#0e0a22,#180f35,#0c0820)",
            border: "1px solid rgba(124,58,237,.35)",
            boxShadow:
              "0 0 60px rgba(124,58,237,.1), inset 0 1px 0 rgba(255,255,255,.04)",
          }}
        >
          {/* BG glows */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 0% 50%,rgba(124,58,237,.14),transparent 65%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 40% 60% at 100% 20%,rgba(245,158,11,.07),transparent 60%)",
            }}
          />

          {/* Floating token coins (decorative) */}
          <div
            className="absolute right-4 top-3 text-2xl opacity-10 pointer-events-none float"
            style={{ animationDuration: "5s" }}
          >
            🪙
          </div>
          <div
            className="absolute right-10 bottom-3 text-xl opacity-10 pointer-events-none float"
            style={{ animationDuration: "7s", animationDelay: "1s" }}
          >
            🪙
          </div>

          <div className="relative z-10 p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(124,58,237,.4),rgba(99,102,241,.25))",
                  border: "1px solid rgba(124,58,237,.5)",
                  boxShadow: "0 0 18px rgba(124,58,237,.35)",
                }}
              >
                <Send className="h-4 w-4 text-violet-300" />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-wide">
                  Refer & Earn Tokens!
                </p>
                <p className="text-gray-500 text-xs">
                  You earn{" "}
                  <span className="text-yellow-400 font-bold">+5 tokens</span>{" "}
                  per friend who joins
                </p>
              </div>
            </div>

            {/* Referral code box */}
            <div
              className="flex items-center gap-2 mb-4 p-3 rounded-2xl"
              style={{
                background: "rgba(0,0,0,.35)",
                border: "1px solid rgba(124,58,237,.25)",
              }}
            >
              <div className="flex-1">
                <p className="text-yellowLive Games-800 text-[10px] uppercase tracking-widest mb-0.5">
                  Your Code
                </p>
                <p className="text-yellow-400 font-black text-lg tracking-[.2em] font-mono">
                  {referralCode}
                </p>
              </div>
              <button
                onClick={copyReferral}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all hover:scale-105"
                style={{
                  background: copied
                    ? "rgba(16,185,129,.2)"
                    : "rgba(124,58,237,.2)",
                  border: `1px solid ${copied ? "rgba(16,185,129,.4)" : "rgba(124,58,237,.45)"}`,
                  color: copied ? "#34d399" : "#c4b5fd",
                }}
              >
                {copied ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <Hash className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Reward tiers */}
            <div className="flex items-center gap-2 mb-4">
              {[
                ["1 friend", "5 🪙"],
                ["3 friends", "20 🪙"],
                ["10 friends", "75 🪙"],
              ].map(([tier, reward], ti) => (
                <div
                  key={ti}
                  className="flex-1 text-center py-2 rounded-xl"
                  style={{
                    background: "rgba(124,58,237,.1)",
                    border: "1px solid rgba(124,58,237,.22)",
                  }}
                >
                  <p className="text-yellow-400 font-black text-xs">{reward}</p>
                  <p className="text-gray-600 text-[9px] mt-0.5">{tier}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={copyReferral}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#6d28d9,#5b21b6)",
                boxShadow: "0 6px 24px rgba(124,58,237,.5)",
              }}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {copied ? "LINK COPIED — SHARE IT!" : "COPY & START EARNING"}
              <Zap className="h-3.5 w-3.5" fill="currentColor" />
            </button>
          </div>
        </div>

        {/* ── DAILY FREE BONUS ──────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg,#061a0e,#0e2b18,#041208)",
            border: "1px solid rgba(16,185,129,.3)",
            boxShadow:
              "0 0 60px rgba(16,185,129,.07), inset 0 1px 0 rgba(255,255,255,.04)",
          }}
        >
          {/* BG glows */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 100% 50%,rgba(16,185,129,.12),transparent 65%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 40% 60% at 0% 20%,rgba(124,58,237,.06),transparent 60%)",
            }}
          />

          {/* Floating gift (decorative) */}
          <div
            className="absolute left-4 top-3 text-2xl opacity-10 pointer-events-none float"
            style={{ animationDuration: "6s" }}
          >
            🎁
          </div>
          <div
            className="absolute left-12 bottom-4 text-xl opacity-10 pointer-events-none float"
            style={{ animationDuration: "8s", animationDelay: "2s" }}
          >
            ✨
          </div>

          <div className="relative z-10 p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(16,185,129,.3),rgba(16,185,129,.15))",
                  border: "1px solid rgba(16,185,129,.4)",
                  boxShadow: "0 0 16px rgba(16,185,129,.3)",
                }}
              >
                🎁
                <div
                  className="absolute inset-0 rounded-xl animate-ping opacity-20"
                  style={{ background: "#10b981", animationDuration: "2s" }}
                />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-wide">
                  Daily Free Bonus
                </p>
                <p className="text-gray-500 text-xs">
                  Free tokens reset every{" "}
                  <span className="text-green-400 font-bold">24 hours</span>
                </p>
              </div>
            </div>

            {/* Token reward display */}
            <div
              className="flex items-center gap-3 mb-4 p-3 rounded-2xl"
              style={{
                background: "rgba(0,0,0,.3)",
                border: "1px solid rgba(16,185,129,.2)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(16,185,129,.25),rgba(16,185,129,.1))",
                  border: "1px solid rgba(16,185,129,.3)",
                }}
              >
                🪙
              </div>
              <div>
                <p className="text-green-400 font-black text-2xl leading-none">
                  +3 Tokens
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Free · No purchase needed
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                  Resets in
                </p>
                <p className="text-white font-black text-sm">24:00:00</p>
              </div>
            </div>

            {/* Streak indicator */}
            <div className="flex items-center gap-1.5 mb-4">
              <p className="text-gray-600 text-xs mr-1">Streak:</p>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <div
                  key={d}
                  className="flex-1 h-1.5 rounded-full"
                  style={{
                    background: d <= 3 ? "#10b981" : "rgba(255,255,255,.08)",
                    boxShadow: d <= 3 ? "0 0 6px rgba(16,185,129,.6)" : "none",
                  }}
                />
              ))}
              <p className="text-green-400 font-black text-xs ml-1">3🔥</p>
            </div>

            {/* CTA */}
            <button
              onClick={() => setLocation("/dashboard")}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg,#10b981,#059669,#047857)",
                boxShadow: "0 6px 24px rgba(16,185,129,.45)",
              }}
            >
              <Sparkles className="h-4 w-4" />
              CLAIM FREE TOKENS
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER STATS BAR — PREMIUM
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="mb-20 md:mb-0 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#09071a,#0e0b26,#06050f)",
          borderTop: "1px solid rgba(124,58,237,.18)",
          borderBottom: "1px solid rgba(124,58,237,.1)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 100% at 50% 50%,rgba(124,58,237,.06),transparent 70%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-0">
          {[
            {
              val: 127250,
              prefix: "$",
              suffix: "+",
              label: "Total Prizes Paid",
              icon: Trophy,
              color: "#f59e0b",
              glow: "rgba(245,158,11,.3)",
              trend: "↑ All time",
            },
            {
              val: 12458,
              prefix: "",
              suffix: "",
              label: "Active Players",
              icon: Users,
              color: "#a78bfa",
              glow: "rgba(167,139,250,.3)",
              trend: "🔴 Live now",
            },
            {
              val: 98623,
              prefix: "",
              suffix: "",
              label: "Games Completed",
              icon: Sparkles,
              color: "#10b981",
              glow: "rgba(16,185,129,.3)",
              trend: "↑ Growing",
            },
            {
              val: 583,
              prefix: "",
              suffix: "",
              label: "Winners Today",
              icon: Gift,
              color: "#f472b6",
              glow: "rgba(244,114,182,.3)",
              trend: "🎉 Today",
            },
          ].map((s, si) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="relative flex flex-col items-center justify-center py-5 px-4 text-center group"
                style={{
                  borderRight:
                    si < 3 ? "1px solid rgba(255,255,255,.05)" : "none",
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 80% 80% at 50% 50%,${s.glow.replace(".3)", ".06)")},transparent 70%)`,
                  }}
                />

                {/* Icon orb */}
                <div
                  className="relative mb-2 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle,${s.color}25,${s.color}08)`,
                    border: `1px solid ${s.color}40`,
                    boxShadow: `0 0 20px ${s.color}25`,
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: s.color }} />
                </div>

                {/* Number */}
                <div
                  className="font-black leading-none mb-1"
                  style={{
                    fontSize: "clamp(1.5rem,3vw,2rem)",
                    background: `linear-gradient(135deg,#fff 20%,${s.color})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.prefix}
                  {si === 0
                    ? "127K"
                    : si === 2
                      ? "98.6K"
                      : s.val.toLocaleString()}
                  {s.suffix}
                </div>

                {/* Label */}
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1.5">
                  {s.label}
                </p>

                {/* Trend tag */}
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase"
                  style={{
                    background: `${s.color}12`,
                    border: `1px solid ${s.color}25`,
                    color: s.color,
                  }}
                >
                  {s.trend}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM NAV (mobile) ─────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 md:hidden"
        style={{
          background: "rgba(8,8,15,.98)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(124,58,237,.12)",
        }}
      >
        <div className="grid grid-cols-6 h-[58px]">
          {NAV.map(({ label, path, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setLocation(path)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${path === "/" ? "text-violet-400" : "text-gray-600 hover:text-gray-400"}`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[9px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
