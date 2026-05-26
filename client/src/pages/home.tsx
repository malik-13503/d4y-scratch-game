import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  Gamepad2,
  Hash,
  Trophy,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Coins,
  Plus,
  ChevronRight,
  Users,
  Zap,
  Lock,
  BarChart2,
  CheckCircle,
  User,
  Activity,
  ArrowRight,
  Gift,
  Star,
} from "lucide-react";
import { logout } from "@/lib/auth";
import type { Game } from "@shared/schema";
import logoPath from "@assets/logo_1777237644041.png";

// ── Sidebar nav items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: Home,      label: "Home",         path: "/",            active: true },
  { icon: Gamepad2,  label: "Live Games",   path: "/games" },
  { icon: Hash,      label: "My Entries",   path: "/my-numbers" },
  { icon: Trophy,    label: "My Wins",      path: "/dashboard" },
  { icon: CreditCard,label: "Transactions", path: "/transactions" },
  { icon: Settings,  label: "Settings",     path: "/dashboard" },
  { icon: HelpCircle,label: "Support",      path: "/contact" },
];

// ── How It Works steps ────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { icon: Coins,       color: "bg-purple-600", label: "Use Tokens",    desc: "Each spin uses the set amount of tokens." },
  { icon: BarChart2,   color: "bg-green-600",  label: "Progress Bar",  desc: "The bar shows how many tokens are left." },
  { icon: Lock,        color: "bg-orange-600", label: "Game Closes",   desc: "Once the goal is reached, the game closes." },
  { icon: Trophy,      color: "bg-yellow-600", label: "Winner Picked", desc: "A winner is selected automatically!" },
];

// ── Activity fake-names pool ──────────────────────────────────────────────────
const ANON_NAMES = [
  "Player_2487","Player_1035","Player_7429","Player_8841","Player_1923",
  "Player_5502","Player_3371","Player_9944","Player_0062","Player_6618",
];

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [liveActivity, setLiveActivity] = useState<{ name: string; tokens: number; ago: string }[]>([]);
  const activityRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Data queries ──────────────────────────────────────────────────────────
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
  const featured: Game | undefined = activeGames[featuredIndex] ?? activeGames[0];

  const { data: recentNums } = useQuery<{ number: number; timestamp: string }[]>({
    queryKey: ["/api/games", featured?.id, "recent-numbers"],
    queryFn: async () => {
      if (!featured) return [];
      const r = await fetch(`/api/games/${featured.id}/recent-numbers`);
      return r.ok ? r.json() : [];
    },
    enabled: !!featured,
    refetchInterval: 10000,
  });

  const tokenBalance = tokenData?.tokenBalance ?? 0;
  const tokensCollected = featured?.tokensCollected ?? 0;
  const tokenThreshold = featured?.tokenThreshold ?? 1000;
  const tokensPerPlay = featured?.tokensPerPlay ?? 10;
  const progress = tokenThreshold > 0 ? Math.min((tokensCollected / tokenThreshold) * 100, 100) : 0;
  const tokensRemaining = Math.max(tokenThreshold - tokensCollected, 0);

  // ── Build live-activity feed ──────────────────────────────────────────────
  useEffect(() => {
    if (!featured) return;
    const base = (recentNums ?? []).slice(0, 5).map((n, i) => ({
      name: ANON_NAMES[i % ANON_NAMES.length],
      tokens: tokensPerPlay,
      ago: i === 0 ? "Just now" : `${(i * 12)}s ago`,
    }));
    setLiveActivity(base.length ? base : ANON_NAMES.slice(0, 5).map((name, i) => ({
      name, tokens: tokensPerPlay, ago: i === 0 ? "Just now" : `${i * 15}s ago`,
    })));

    activityRef.current = setInterval(() => {
      setLiveActivity((prev) => {
        const newEntry = {
          name: ANON_NAMES[Math.floor(Math.random() * ANON_NAMES.length)],
          tokens: tokensPerPlay,
          ago: "Just now",
        };
        return [newEntry, ...prev.slice(0, 4)].map((e, i) => ({
          ...e,
          ago: i === 0 ? "Just now" : `${i * 12 + Math.floor(Math.random() * 8)}s ago`,
        }));
      });
    }, 8000);
    return () => { if (activityRef.current) clearInterval(activityRef.current); };
  }, [featured?.id, recentNums, tokensPerPlay]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const username = (user as any)?.username ?? (user as any)?.email?.split("@")[0] ?? "Player";
  const avatarLetter = username[0]?.toUpperCase() ?? "P";

  const progressColor =
    progress >= 95 ? "bg-red-500" :
    progress >= 80 ? "bg-orange-500" :
    "bg-gradient-to-r from-violet-600 to-purple-500";

  return (
    <div className="flex min-h-screen bg-[#0b0b16] text-white">

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 fixed left-0 top-0 bottom-0 bg-[#111120] border-r border-white/5 z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <img src={logoPath} alt="Prize Plugz" className="h-14 w-auto object-contain" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, path, active }) => (
            <button
              key={label}
              onClick={() => setLocation(path)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-violet-600/25 text-violet-300 border border-violet-500/30"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Get More Tokens card */}
        <div className="px-3 pb-3">
          <div className="bg-gradient-to-br from-violet-900/60 to-purple-900/60 border border-violet-500/30 rounded-2xl p-4 text-center">
            <h4 className="text-white font-bold text-sm mb-1">Get More Tokens</h4>
            <p className="text-violet-300 text-xs mb-3 leading-snug">
              Buy tokens to play more games and win bigger prizes!
            </p>
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-yellow-500/20 rounded-full">
                <Coins className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <Button
              onClick={() => setLocation("/tokens")}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg"
            >
              Add Tokens
            </Button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="mx-3 mb-4 flex items-center space-x-2 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-60 xl:ml-64 flex flex-col min-h-screen">

        {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 bg-[#111120]/95 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left: live badge */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="flex items-center space-x-1.5 bg-green-500/15 border border-green-500/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-300 text-xs font-semibold hidden sm:inline">Live Game</span>
            </div>
            {/* Mobile logo */}
            <img src={logoPath} alt="Prize Plugz" className="h-8 w-auto object-contain lg:hidden" />
          </div>

          {/* Right: tokens + add + user */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center space-x-1.5 bg-[#1e1d30] border border-white/10 rounded-full px-3 py-1.5">
              <Coins className="h-4 w-4 text-yellow-400 shrink-0" />
              <span className="text-white font-bold text-sm">{tokenBalance}</span>
            </div>
            <Button
              onClick={() => setLocation("/tokens")}
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-full px-3 sm:px-4 text-xs sm:text-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Add Tokens</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setLocation("/dashboard")}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {avatarLetter}
              </div>
              <span className="text-gray-300 text-sm font-medium hidden sm:inline">Hi, {username}</span>
            </div>
          </div>
        </header>

        {/* ── PAGE BODY ───────────────────────────────────────────────────── */}
        <div className="flex-1 p-4 sm:p-6">

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
              <p className="text-gray-400 font-medium">Loading live games…</p>
            </div>
          ) : activeGames.length === 0 ? (
            /* No active games */
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
              <Gamepad2 className="h-16 w-16 text-gray-600" />
              <h2 className="text-2xl font-bold text-white">No Live Games Right Now</h2>
              <p className="text-gray-400 max-w-md">Check back soon — new games go live regularly. Meanwhile, grab some tokens and get ready!</p>
              <Button onClick={() => setLocation("/tokens")} className="bg-violet-600 hover:bg-violet-700 text-white font-bold">
                <Coins className="h-4 w-4 mr-2" /> Get Tokens
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 xl:gap-6">

              {/* ── LEFT / CENTER COLUMN (featured game) ─────────────────── */}
              <div className="xl:col-span-2 space-y-5">

                {/* Multiple games selector */}
                {activeGames.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {activeGames.map((g, i) => (
                      <button
                        key={g.id}
                        onClick={() => setFeaturedIndex(i)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          featuredIndex === i
                            ? "bg-violet-600 border-violet-500 text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── FEATURED GAME CARD ─────────────────────────────────── */}
                {featured && (
                  <div className="bg-[#13122a] border border-white/8 rounded-2xl overflow-hidden">
                    <div className="p-5 sm:p-6">
                      {/* Live badge + game title */}
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center space-x-1.5 bg-green-500/15 border border-green-500/40 text-green-300 text-xs font-bold px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                              <span>LIVE NOW</span>
                            </span>
                            <Badge className="bg-violet-600/20 text-violet-300 border-violet-500/30 text-xs font-mono">
                              {featured.code}
                            </Badge>
                          </div>
                          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                            {featured.name}
                          </h1>
                          {featured.description && (
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{featured.description}</p>
                          )}
                        </div>
                        {/* Prize value badge */}
                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl px-3 py-2 text-center shrink-0">
                          <Trophy className="h-5 w-5 text-yellow-400 mx-auto mb-0.5" />
                          <p className="text-yellow-300 font-black text-lg leading-none">${featured.prizeValue}</p>
                          <p className="text-yellow-400/60 text-xs">prize</p>
                        </div>
                      </div>

                      {/* Prize image */}
                      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-white/8 mb-5 flex items-center justify-center"
                           style={{ minHeight: "220px" }}>
                        {featured.prizeImageUrl ? (
                          <img
                            src={featured.prizeImageUrl}
                            alt={featured.name}
                            className="w-full max-h-72 object-contain p-4 drop-shadow-2xl"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-12 space-y-3">
                            <div className="p-5 bg-gradient-to-br from-violet-600/30 to-purple-600/30 rounded-2xl border border-violet-500/20">
                              <Gift className="h-16 w-16 text-violet-400" />
                            </div>
                            <p className="text-gray-500 text-sm">Prize Image Coming Soon</p>
                          </div>
                        )}
                        {/* Overlay gradient at bottom */}
                        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#13122a] to-transparent" />
                      </div>

                      {/* Game goal row */}
                      <div className="flex items-center justify-between bg-[#1c1b33] rounded-xl px-4 py-3 mb-5 border border-white/5">
                        <div className="flex items-center space-x-2">
                          <Coins className="h-5 w-5 text-yellow-400" />
                          <span className="text-gray-400 text-sm font-medium">Game Goal</span>
                          <span className="text-white font-black text-base">{tokenThreshold.toLocaleString()} TOKENS</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400 text-xs">Each Spin</span>
                          <p className="text-white font-black text-base">{tokensPerPlay} TOKENS</p>
                        </div>
                      </div>
                    </div>

                    {/* ── TOKENS PROGRESS SECTION ──────────────────────────── */}
                    <div className="mx-5 mb-5 bg-[#0f0e20] border border-white/5 rounded-2xl p-5">
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Tokens Collected</p>
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="text-5xl sm:text-6xl font-black text-violet-400 leading-none">
                          {tokensCollected.toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-lg font-semibold">/ {tokenThreshold.toLocaleString()}</span>
                      </div>
                      <p className="text-gray-500 text-xs mb-4 font-medium">TOKENS COLLECTED</p>

                      {/* Progress bar */}
                      <div className="relative h-4 bg-white/8 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                          style={{ width: `${progress}%` }}
                        />
                        {progress >= 80 && (
                          <div className="absolute inset-0 rounded-full animate-pulse opacity-40"
                               style={{ background: progress >= 95 ? "rgba(239,68,68,0.3)" : "rgba(249,115,22,0.3)" }} />
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-3">
                        <span>{tokensCollected.toLocaleString()} collected</span>
                        <span>{tokenThreshold.toLocaleString()} goal</span>
                      </div>

                      {/* Status message */}
                      {progress >= 95 ? (
                        <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                          <Zap className="h-4 w-4 text-red-400 animate-pulse shrink-0" />
                          <span className="text-red-300 text-sm font-bold">Almost gone! Spin now before the winner is picked!</span>
                        </div>
                      ) : progress >= 80 ? (
                        <div className="flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2">
                          <BarChart2 className="h-4 w-4 text-orange-400 shrink-0" />
                          <span className="text-orange-300 text-sm font-semibold">Almost full! Keep the momentum going.</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                          <Star className="h-4 w-4 text-green-400 shrink-0" />
                          <span className="text-green-300 text-sm font-medium">Every spin brings us closer to the winner pick!</span>
                        </div>
                      )}
                    </div>

                    {/* ── SPIN BUTTON ──────────────────────────────────────── */}
                    <div className="mx-5 mb-5">
                      <div className="bg-[#0f0e20] border border-white/5 rounded-2xl p-5">
                        <h3 className="text-white font-bold text-base mb-1">SPIN THE WHEEL</h3>
                        <p className="text-gray-500 text-sm mb-4">Each spin uses {tokensPerPlay} tokens. You have <span className="text-white font-bold">{tokenBalance}</span> tokens.</p>

                        {tokenBalance >= tokensPerPlay ? (
                          <Button
                            onClick={() => setLocation(`/game/${featured.id}`)}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-black text-lg py-6 rounded-2xl shadow-2xl shadow-violet-500/30 transition-all duration-200 hover:scale-[1.02] border border-violet-400/20"
                          >
                            <span>SPIN NOW</span>
                            <span className="ml-3 flex items-center space-x-1 bg-white/15 rounded-xl px-3 py-1 text-sm font-bold">
                              <Coins className="h-4 w-4 text-yellow-300" />
                              <span>{tokensPerPlay} TOKENS</span>
                            </span>
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
                              <p className="text-red-300 text-sm font-medium">You need {tokensPerPlay - tokenBalance} more tokens to spin</p>
                            </div>
                            <Button
                              onClick={() => setLocation("/tokens")}
                              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-black text-base py-5 rounded-2xl shadow-lg"
                            >
                              <Coins className="h-5 w-5 mr-2" /> Buy Tokens to Play
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── FEATURE HIGHLIGHTS ───────────────────────────────── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mx-5 mb-5">
                      {[
                        { icon: Coins,       color: "text-violet-400", bg: "bg-violet-500/10", label: "TOKEN BASED",    desc: "Use tokens to play. No numbers, no spins." },
                        { icon: BarChart2,   color: "text-green-400",  bg: "bg-green-500/10",  label: "LIVE PROGRESS",  desc: "Progress bar updates in real time." },
                        { icon: Lock,        color: "text-orange-400", bg: "bg-orange-500/10", label: "AUTO CLOSE",     desc: "Game closes when the goal is reached." },
                        { icon: Trophy,      color: "text-yellow-400", bg: "bg-yellow-500/10", label: "AUTO WINNER",    desc: "Winner is selected automatically." },
                      ].map(({ icon: Icon, color, bg, label, desc }) => (
                        <div key={label} className="bg-[#0f0e20] border border-white/5 rounded-xl p-3 text-center">
                          <div className={`${bg} rounded-xl p-2.5 w-fit mx-auto mb-2`}>
                            <Icon className={`h-5 w-5 ${color}`} />
                          </div>
                          <p className={`text-xs font-black mb-1 ${color}`}>{label}</p>
                          <p className="text-gray-500 text-xs leading-snug hidden sm:block">{desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Fair notice */}
                    <div className="mx-5 mb-5 flex items-center justify-between bg-[#0f0e20] border border-white/5 rounded-xl px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-green-500/15 rounded-lg border border-green-500/20">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">FAIR. TRANSPARENT. AUTOMATIC.</p>
                          <p className="text-gray-500 text-xs">Every spin counts. Every token matters. Winner selected automatically and announced publicly.</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation("/how-to-play")}
                        className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs shrink-0 ml-3"
                      >
                        Learn More
                      </Button>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/5 px-5 py-3 text-center">
                      <p className="text-gray-600 text-xs">© 2025 Prize Plugz. All rights reserved.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT COLUMN ──────────────────────────────────────────── */}
              <div className="space-y-5">

                {/* HOW IT WORKS */}
                <div className="bg-[#13122a] border border-white/8 rounded-2xl p-5">
                  <h3 className="text-white font-black text-base mb-4 uppercase tracking-wide">How It Works</h3>
                  <div className="space-y-4">
                    {HOW_IT_WORKS.map(({ icon: Icon, color, label, desc }, i) => (
                      <div key={label} className="flex items-start space-x-3">
                        <div className={`${color} rounded-xl p-2 shrink-0 shadow-lg`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{i + 1}. {label}</p>
                          <p className="text-gray-400 text-xs leading-snug mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LIVE ACTIVITY */}
                <div className="bg-[#13122a] border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-black text-base uppercase tracking-wide">Live Activity</h3>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-xs font-semibold">Live</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    {liveActivity.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">Waiting for activity…</p>
                    ) : (
                      liveActivity.map((entry, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{entry.name}</p>
                            <p className="text-gray-500 text-xs">Played {entry.tokens} tokens</p>
                          </div>
                          <span className="text-gray-600 text-xs shrink-0">{entry.ago}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => setLocation(`/game/${featured?.id}`)}
                    className="w-full mt-4 flex items-center justify-center space-x-2 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors"
                  >
                    <Activity className="h-4 w-4" />
                    <span>View All Activity</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* OTHER GAMES */}
                {activeGames.length > 1 && (
                  <div className="bg-[#13122a] border border-white/8 rounded-2xl p-5">
                    <h3 className="text-white font-black text-base mb-4 uppercase tracking-wide">More Live Games</h3>
                    <div className="space-y-3">
                      {activeGames
                        .filter((_, i) => i !== featuredIndex)
                        .slice(0, 3)
                        .map((g) => {
                          const gProgress = g.tokenThreshold > 0
                            ? Math.min((g.tokensCollected / g.tokenThreshold) * 100, 100)
                            : 0;
                          return (
                            <button
                              key={g.id}
                              onClick={() => setLocation(`/game/${g.id}`)}
                              className="w-full flex items-center space-x-3 p-3 bg-white/3 hover:bg-white/8 border border-white/5 rounded-xl transition-all duration-200 group text-left"
                            >
                              {g.prizeImageUrl ? (
                                <img src={g.prizeImageUrl} alt={g.name} className="w-10 h-10 rounded-lg object-contain bg-slate-800 p-1 shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shrink-0">
                                  <Trophy className="h-5 w-5 text-white" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-bold truncate">{g.name}</p>
                                <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${gProgress}%` }} />
                                </div>
                                <p className="text-gray-500 text-xs mt-0.5">${g.prizeValue} prize</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-violet-400 transition-colors shrink-0" />
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Quick links */}
                <div className="bg-[#13122a] border border-white/8 rounded-2xl p-5">
                  <h3 className="text-white font-black text-sm mb-3 uppercase tracking-wide">Quick Links</h3>
                  <div className="space-y-2">
                    {[
                      { label: "My Numbers",    path: "/my-numbers",    icon: Hash },
                      { label: "Transactions",  path: "/transactions",  icon: CreditCard },
                      { label: "How to Play",   path: "/how-to-play",   icon: HelpCircle },
                    ].map(({ label, path, icon: Icon }) => (
                      <button
                        key={label}
                        onClick={() => setLocation(path)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-all"
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#111120]/95 backdrop-blur-xl border-t border-white/5 z-30 flex items-center justify-around px-2 py-2">
        {[
          { icon: Home,      label: "Home",    path: "/" },
          { icon: Gamepad2,  label: "Games",   path: "/games" },
          { icon: Hash,      label: "Entries", path: "/my-numbers" },
          { icon: Coins,     label: "Tokens",  path: "/tokens" },
          { icon: User,      label: "Profile", path: "/dashboard" },
        ].map(({ icon: Icon, label, path }) => (
          <button
            key={label}
            onClick={() => setLocation(path)}
            className={`flex flex-col items-center space-y-1 px-3 py-1.5 rounded-xl transition-all ${
              path === "/" ? "text-violet-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="lg:hidden h-16" />
    </div>
  );
}
