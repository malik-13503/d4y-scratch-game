import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import {
  Wallet, Plus, ArrowUpRight, ArrowDownLeft, Clock,
  CheckCircle, XCircle, Coins, ChevronLeft, Zap,
  Gift, Star, TrendingUp, Shield, Home, Gamepad2, User,
  Sparkles, Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import logoPath from "@assets/logo_1777237644041.png";

const METHOD_LABELS: Record<string, string> = {
  cashapp:  "Cash App",
  venmo:    "Venmo",
  chime:    "Chime",
  applepay: "Apple Pay/Cash",
};

const METHOD_ICONS: Record<string, string> = {
  cashapp:  "💵",
  venmo:    "💳",
  chime:    "🏦",
  applepay: "🍎",
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  pending:  { color: "#fbbf24", bg: "rgba(251,191,36,0.15)",  icon: Clock,       label: "Pending"  },
  approved: { color: "#4ade80", bg: "rgba(74,222,128,0.15)",  icon: CheckCircle, label: "Approved" },
  rejected: { color: "#f87171", bg: "rgba(248,113,113,0.15)", icon: XCircle,     label: "Rejected" },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function WalletPage() {
  const [, setLocation] = useLocation();

  const { data: wallet, isLoading } = useQuery<{
    balance: number;
    payments: any[];
    transactions: any[];
  }>({
    queryKey: ["/api/wallet"],
    refetchInterval: 10000,
  });

  const balance   = wallet?.balance   ?? 0;
  const payments  = wallet?.payments  ?? [];
  const txs       = wallet?.transactions ?? [];

  const pendingCount    = payments.filter(p => p.status === "pending").length;
  const totalEarned     = txs.filter(t => t.transactionType === "purchase").reduce((s: number, t: any) => s + t.amount, 0);
  const totalSpent      = txs.filter(t => t.transactionType === "game_entry").reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen pb-24 md:pb-10" style={{ background: "#07060f" }}>

      {/* ── CSS ── */}
      <style>{`
        @keyframes float-slow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes float-med  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)}  }
        @keyframes pulse-glow { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes spin-slow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .float-slow { animation: float-slow 5s ease-in-out infinite; }
        .float-med  { animation: float-med  3.5s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 2.5s ease-in-out infinite; }
        .spin-slow  { animation: spin-slow 20s linear infinite; }
        .card-shine::after {
          content:"";position:absolute;inset:0;
          background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.06) 50%,transparent 60%);
          pointer-events:none;
        }
      `}</style>

      {/* ── SITE HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-white/5"
        style={{ background: "rgba(7,6,15,0.97)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-all hover:bg-white/8 rounded-xl px-2 py-1.5 text-sm font-medium">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={() => setLocation("/")} className="shrink-0">
              <img src={logoPath} alt="Prize Plugz" className="h-9 w-auto object-contain" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Wallet className="h-4 w-4 text-violet-400" />
            <span className="text-white font-black text-lg">My Wallet</span>
          </div>
          <button onClick={() => setLocation("/add-credits")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#7c3aed,#9333ea)", border: "1px solid rgba(139,92,246,0.4)" }}>
            <Plus className="h-4 w-4" />
            <span>Add Tokens</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── HERO BALANCE CARD ── */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg,#4c1d95 0%,#1e1b4b 40%,#1a1242 70%,#0f0a2e 100%)", border: "1px solid rgba(139,92,246,0.3)", minHeight: 220 }}>

          {/* Rotating ring decoration */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full spin-slow pointer-events-none"
            style={{ border: "1px solid rgba(139,92,246,0.15)" }} />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full spin-slow pointer-events-none"
            style={{ border: "1px solid rgba(99,102,241,0.1)", animationDirection: "reverse" }} />

          {/* Glow blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(124,58,237,0.35) 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(59,130,246,0.2) 0%,transparent 70%)", transform: "translate(-30%,30%)" }} />

          {/* Floating coins decoration */}
          <div className="absolute top-6 right-8 float-slow pointer-events-none">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 0 20px rgba(245,158,11,0.5)" }}>
              🪙
            </div>
          </div>
          <div className="absolute bottom-10 right-24 float-med pointer-events-none" style={{ animationDelay: "1s" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 0 14px rgba(245,158,11,0.4)", opacity: 0.7 }}>
              🪙
            </div>
          </div>
          <div className="absolute top-14 right-36 float-slow pointer-events-none" style={{ animationDelay: "2s" }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 0 10px rgba(245,158,11,0.3)", opacity: 0.5 }}>
              🪙
            </div>
          </div>

          {/* Stars */}
          {[
            { top: "15%", left: "5%",  size: 4 },
            { top: "70%", left: "8%",  size: 3 },
            { top: "30%", left: "45%", size: 3 },
            { top: "80%", left: "55%", size: 4 },
          ].map((s, i) => (
            <div key={i} className="absolute rounded-full pulse-glow pointer-events-none"
              style={{ top: s.top, left: s.left, width: s.size, height: s.size, background: "#a78bfa", animationDelay: `${i * 0.7}s` }} />
          ))}

          <div className="relative p-7">
            {/* Label row */}
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg" style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <Coins className="h-4 w-4 text-yellow-400" />
              </div>
              <span className="text-purple-300 text-sm font-semibold uppercase tracking-wider">Your Token Balance</span>
            </div>

            {/* Balance */}
            {isLoading ? (
              <div className="h-16 w-48 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.1)" }} />
            ) : (
              <div className="flex items-end gap-3">
                <span className="text-7xl font-black text-white leading-none"
                  style={{ textShadow: "0 0 40px rgba(139,92,246,0.6)", letterSpacing: "-2px" }}>
                  {balance.toLocaleString()}
                </span>
                <div className="mb-2">
                  <span className="text-2xl font-bold text-purple-300">tokens</span>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs font-medium">Live Balance</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pending pill */}
            {pendingCount > 0 && (
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                <Clock className="h-3 w-3" />
                {pendingCount} payment{pendingCount > 1 ? "s" : ""} pending review
              </div>
            )}

            {/* CTA row */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setLocation("/add-credits")}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-black transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 0 24px rgba(245,158,11,0.4)" }}>
                <Plus className="h-4 w-4" />
                Add Tokens
              </button>
              <button onClick={() => setLocation("/")}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <Gamepad2 className="h-4 w-4" />
                Play Now
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Tokens Earned",  value: totalEarned, icon: TrendingUp, color: "#4ade80", glow: "rgba(74,222,128,0.15)",  bg: "rgba(74,222,128,0.08)"  },
            { label: "Tokens Spent",   value: totalSpent,  icon: Zap,        color: "#a78bfa", glow: "rgba(167,139,250,0.15)", bg: "rgba(167,139,250,0.08)" },
            { label: "Pending Review", value: pendingCount,icon: Clock,       color: "#fbbf24", glow: "rgba(251,191,36,0.15)",  bg: "rgba(251,191,36,0.08)"  },
          ].map(({ label, value, icon: Icon, color, glow, bg }) => (
            <div key={label} className="relative rounded-2xl p-4 text-center overflow-hidden"
              style={{ background: bg, border: `1px solid ${color}30` }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%,${glow},transparent 70%)` }} />
              <div className="relative">
                <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
                  style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <p className="text-2xl font-black text-white">{value.toLocaleString()}</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: `${color}cc` }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── HOW TO BUY TOKENS ── */}
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <h2 className="text-white font-bold text-sm">How to Add Tokens</h2>
            </div>
            <button onClick={() => setLocation("/add-credits")}
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              Start →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { step: "1", title: "Pick a Package",  desc: "Choose $5–$100 worth of tokens",           icon: "🎯", color: "#a78bfa" },
              { step: "2", title: "Send Payment",     desc: "Pay via Cash App, Venmo, Chime or Apple Pay", icon: "💸", color: "#4ade80" },
              { step: "3", title: "Tokens Credited",  desc: "Tokens arrive after staff approval",        icon: "⚡", color: "#fbbf24" },
            ].map(({ step, title, desc, icon, color }) => (
              <div key={step} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}>
                  {step}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{icon} {title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Accepted methods row */}
          <div className="mt-2 rounded-xl p-4 flex flex-wrap items-center gap-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Accepted:</span>
            {[
              { icon: "💵", label: "Cash App",       color: "#00c244" },
              { icon: "💳", label: "Venmo",           color: "#3d95ce" },
              { icon: "🏦", label: "Chime",           color: "#00c6a0" },
              { icon: "🍎", label: "Apple Pay",       color: "#888888" },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: `${m.color}15`, border: `1px solid ${m.color}40` }}>
                <span className="text-sm">{m.icon}</span>
                <span className="text-xs font-semibold" style={{ color: m.color }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PAYMENT SUBMISSIONS ── */}
        {payments.length > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: "rgba(124,58,237,0.2)" }}>
                <Wallet className="h-4 w-4 text-violet-400" />
              </div>
              <h2 className="font-bold text-white text-sm">Payment Submissions</h2>
              <span className="ml-auto text-xs text-gray-600">{payments.length} total</span>
            </div>
            <div className="divide-y divide-white/5">
              {payments.slice(0, 10).map((p: any) => {
                const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                return (
                  <div key={p.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg">
                      {METHOD_ICONS[p.paymentMethod] ?? "💳"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold">
                        ${Number(p.dollarAmount).toFixed(2)} via {METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {p.creditsAmount} tokens · {timeAgo(p.submittedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TOKEN HISTORY ── */}
        {txs.length > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: "rgba(245,158,11,0.15)" }}>
                <Coins className="h-4 w-4 text-yellow-400" />
              </div>
              <h2 className="font-bold text-white text-sm">Token History</h2>
              <span className="ml-auto text-xs text-gray-600">{txs.length} transactions</span>
            </div>
            <div className="divide-y divide-white/5">
              {txs.slice(0, 20).map((t: any) => {
                const isAdd = t.amount > 0;
                return (
                  <div key={t.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: isAdd ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)" }}>
                      {isAdd
                        ? <ArrowDownLeft className="h-4 w-4 text-green-400" />
                        : <ArrowUpRight  className="h-4 w-4 text-red-400"   />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{t.description}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{timeAgo(t.createdAt)}</p>
                    </div>
                    <span className="font-black text-base flex-shrink-0"
                      style={{ color: isAdd ? "#4ade80" : "#f87171" }}>
                      {isAdd ? "+" : ""}{t.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!isLoading && txs.length === 0 && payments.length === 0 && (
          <div className="text-center py-20 space-y-5">
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
                style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}>
                <Coins className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-base"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                🪙
              </div>
            </div>
            <div>
              <p className="text-white font-black text-2xl">Ready to Play?</p>
              <p className="text-gray-500 text-sm mt-2">Add tokens and start winning prizes!</p>
            </div>
            <button onClick={() => setLocation("/add-credits")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-black transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 0 24px rgba(245,158,11,0.4)" }}>
              <Plus className="h-5 w-5" />
              Add Your First Tokens
            </button>
          </div>
        )}

        {/* ── SECURITY + DISCLAIMER ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)" }}>
            <Shield className="h-5 w-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-300 text-xs font-bold">Safe & Secure</p>
              <p className="text-gray-600 text-xs mt-0.5">All payments manually verified by our team</p>
            </div>
          </div>
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <Zap className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 text-xs font-bold">Fast Approval</p>
              <p className="text-gray-600 text-xs mt-0.5">Tokens credited usually within minutes</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4 text-xs text-gray-600 space-y-1"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="font-semibold text-gray-500">About PrizePlugz Tokens</p>
          <p>Tokens are used solely for participation in PrizePlugz games. Tokens have no cash value and are non-transferable. Purchases are final — no refunds except where required by law. A free alternative method of entry (AMOE) is available — no purchase necessary. See <Link href="/official-rules" className="text-purple-400 hover:underline">Official Rules</Link> and <Link href="/terms" className="text-purple-400 hover:underline">Terms</Link>.</p>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden z-50 flex items-center justify-around px-1 py-2"
        style={{ background: "rgba(7,6,15,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {[
          { icon: Home,     label: "Home",   path: "/" },
          { icon: Gamepad2, label: "Games",  path: "/games" },
          { icon: Coins,    label: "Tokens", path: "/tokens" },
          { icon: Wallet,   label: "Wallet", path: "/wallet", active: true },
          { icon: User,     label: "Account",path: "/dashboard" },
        ].map(({ icon: Icon, label, path, active }) => (
          <button key={label} onClick={() => setLocation(path)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active ? "text-violet-400" : "text-gray-600 hover:text-gray-400"}`}>
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-semibold">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
