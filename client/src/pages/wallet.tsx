import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Coins,
  History,
  ChevronLeft,
  Zap,
  Gift,
} from "lucide-react";

const METHOD_LABELS: Record<string, string> = {
  cashapp: "Cash App",
  venmo: "Venmo",
  chime: "Chime",
  applepay: "Apple Pay/Cash",
};

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  pending:  { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",  icon: Clock,         label: "Pending Review" },
  approved: { color: "bg-green-500/20  text-green-300  border-green-500/30",   icon: CheckCircle,   label: "Approved"       },
  rejected: { color: "bg-red-500/20    text-red-300    border-red-500/30",     icon: XCircle,       label: "Rejected"       },
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

  const balance = wallet?.balance ?? 0;
  const payments = wallet?.payments ?? [];
  const txs = wallet?.transactions ?? [];

  const pendingCount = payments.filter(p => p.status === "pending").length;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#0f0621 0%,#110933 50%,#0a0518 100%)" }}>
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/")}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl" style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-none">My Wallet</h1>
              <p className="text-gray-500 text-xs mt-0.5">PrizePlugz Tokens</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Balance card */}
        <div className="relative rounded-3xl overflow-hidden p-6"
          style={{ background: "linear-gradient(135deg,#7c3aed 0%,#2563eb 50%,#7c3aed 100%)" }}>
          {/* Glow blobs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20"
            style={{ background: "radial-gradient(#a855f7,transparent 70%)" }} />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-20"
            style={{ background: "radial-gradient(#3b82f6,transparent 70%)" }} />

          <div className="relative">
            <p className="text-purple-200 text-sm font-medium mb-1">Available Tokens</p>
            {isLoading ? (
              <div className="h-12 w-32 rounded-lg bg-white/20 animate-pulse" />
            ) : (
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-white">{balance.toLocaleString()}</span>
                <span className="text-purple-200 text-lg mb-2">tokens</span>
              </div>
            )}

            <p className="text-purple-200/70 text-xs mt-2">Use tokens to enter PrizePlugz games</p>

            {pendingCount > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                <Clock className="h-3 w-3" />
                {pendingCount} payment{pendingCount > 1 ? "s" : ""} pending review
              </div>
            )}
          </div>

          <div className="relative mt-5">
            <button
              onClick={() => setLocation("/add-credits")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}>
              <Plus className="h-4 w-4" />
              Add Tokens
            </button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Added", value: txs.filter(t => t.transactionType === "purchase").reduce((s: number, t: any) => s + t.amount, 0).toLocaleString(), icon: ArrowDownLeft, color: "#10b981" },
            { label: "Used in Games", value: txs.filter(t => t.transactionType === "game_entry").reduce((s: number, t: any) => s + Math.abs(t.amount), 0).toLocaleString(), icon: Zap, color: "#8b5cf6" },
            { label: "Pending",       value: pendingCount.toString(), icon: Clock, color: "#f59e0b" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-4 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Icon className="h-4 w-4 mx-auto mb-1.5" style={{ color }} />
              <p className="text-xl font-black text-white">{value}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Payment history */}
        {payments.length > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <History className="h-4 w-4 text-purple-400" />
              <h2 className="font-semibold text-white text-sm">Payment Submissions</h2>
            </div>
            <div className="divide-y divide-white/5">
              {payments.slice(0, 10).map((p: any) => {
                const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                return (
                  <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${cfg.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">
                        ${Number(p.dollarAmount).toFixed(2)} via {METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod}
                      </p>
                      <p className="text-gray-500 text-xs">{p.creditsAmount} tokens · {timeAgo(p.submittedAt)}</p>
                    </div>
                    <Badge className={`text-xs border ${cfg.color}`}>{cfg.label}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Credit transaction history */}
        {txs.length > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-400" />
              <h2 className="font-semibold text-white text-sm">Token History</h2>
            </div>
            <div className="divide-y divide-white/5">
              {txs.slice(0, 20).map((t: any) => {
                const isAdd = t.amount > 0;
                return (
                  <div key={t.id} className="px-4 py-3 flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isAdd ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {isAdd ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{t.description}</p>
                      <p className="text-gray-500 text-xs">{timeAgo(t.createdAt)}</p>
                    </div>
                    <span className={`font-bold text-sm ${isAdd ? "text-green-400" : "text-red-400"}`}>
                      {isAdd ? "+" : ""}{t.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && txs.length === 0 && payments.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
              <Gift className="h-8 w-8 text-white" />
            </div>
            <p className="text-white font-bold text-lg">No activity yet</p>
            <p className="text-gray-500 text-sm">Add tokens to start playing!</p>
            <button onClick={() => setLocation("/add-credits")}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
              Add Your First Tokens
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-xl p-4 text-xs text-gray-600 space-y-1"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="font-semibold text-gray-500">About PrizePlugz Tokens</p>
          <p>Tokens are used solely for participation in PrizePlugz games. Tokens have no cash value and are non-transferable. Purchases are final — no refunds except where required by law. A free alternative method of entry (AMOE) is available — no purchase necessary. See <Link href="/official-rules" className="text-purple-400 hover:underline">Official Rules</Link> and <Link href="/terms" className="text-purple-400 hover:underline">Terms</Link>.</p>
        </div>
      </div>
    </div>
  );
}
