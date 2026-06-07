import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft, ChevronRight, CheckCircle, Clock, Copy,
  Shield, AlertCircle, Wallet, Star, Zap, Crown, Trophy,
  Flame, Rocket, Diamond,
} from "lucide-react";
import { Input } from "@/components/ui/input";

// ── Static data (matches server) ────────────────────────────────────────────
const PACKAGES = [
  { id: 1, dollars: 5,   credits: 10,   popular: false, bonus: "",             label: "Starter",     icon: Zap,     color: "#6366f1", glow: "rgba(99,102,241,0.35)",  bg: "from-indigo-950/80 to-slate-900/90"  },
  { id: 2, dollars: 10,  credits: 25,   popular: false, bonus: "",             label: "Player",      icon: Flame,   color: "#3b82f6", glow: "rgba(59,130,246,0.35)",   bg: "from-blue-950/80 to-slate-900/90"    },
  { id: 3, dollars: 20,  credits: 60,   popular: false, bonus: "",             label: "Power",       icon: Rocket,  color: "#8b5cf6", glow: "rgba(139,92,246,0.35)",   bg: "from-violet-950/80 to-slate-900/90"  },
  { id: 4, dollars: 50,  credits: 175,  popular: false, bonus: "",             label: "Winner",      icon: Trophy,  color: "#f97316", glow: "rgba(249,115,22,0.35)",   bg: "from-orange-950/80 to-slate-900/90"  },
  { id: 5, dollars: 100, credits: 400,  popular: false, bonus: "",             label: "VIP",         icon: Crown,   color: "#eab308", glow: "rgba(234,179,8,0.35)",    bg: "from-yellow-950/80 to-slate-900/90"  },
  { id: 6, dollars: 250, credits: 1200, popular: false, bonus: "🔥 Hot Deal",  label: "High Roller", icon: Diamond, color: "#10b981", glow: "rgba(16,185,129,0.35)",   bg: "from-emerald-950/80 to-slate-900/90" },
  { id: 7, dollars: 500, credits: 3000, popular: true,  bonus: "⭐ Best Value", label: "Best Value",  icon: Star,    color: "#f59e0b", glow: "rgba(245,158,11,0.5)",    bg: "from-amber-900/80 to-yellow-950/90"  },
];

// Static method metadata (colors/icons) — destination comes from API
const METHOD_META: Record<string, { label: string; color: string; bgColor: string; icon: string; hint: string }> = {
  cashapp:  { label: "Cash App",      color: "#00c244", bgColor: "rgba(0,194,68,0.12)",    icon: "💵", hint: "Instant transfer" },
  venmo:    { label: "Venmo",         color: "#3d95ce", bgColor: "rgba(61,149,206,0.12)",  icon: "💳", hint: "Fast & easy"      },
  chime:    { label: "Chime",         color: "#00c6a0", bgColor: "rgba(0,198,160,0.12)",   icon: "🏦", hint: "Bank transfer"    },
  applepay: { label: "Apple Pay/Cash",color: "#aaaaaa", bgColor: "rgba(170,170,170,0.12)", icon: "🍎", hint: "Apple devices"    },
};

type Step = "package" | "method" | "send" | "confirm" | "done";

export default function AddCreditsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch live payment destinations from server (admin can change them anytime)
  const { data: destinationsData } = useQuery<Record<string, { label: string; destination: string; hint: string }>>({
    queryKey: ["/api/wallet/destinations"],
  });

  // Merge API destinations with static metadata
  const METHODS = Object.entries(METHOD_META).map(([id, meta]) => ({
    id,
    ...meta,
    destination: destinationsData?.[id]?.destination ?? "",
  }));

  const [step, setStep]               = useState<Step>("package");
  const [pkg, setPkg]                 = useState<typeof PACKAGES[0] | null>(null);
  const [method, setMethod]           = useState<(typeof METHODS)[0] | null>(null);
  const [paymentName, setPaymentName] = useState("");
  const [paymentHandle, setPaymentHandle] = useState("");
  const [copied, setCopied]           = useState(false);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!pkg || !method) throw new Error("Missing selection");
      return apiRequest("POST", "/api/wallet/submit-payment", {
        dollarAmount:   pkg.dollars,
        creditsAmount:  pkg.credits,
        paymentMethod:  method.id,
        paymentName:    paymentName.trim(),
        paymentHandle:  paymentHandle.trim(),
      });
    },
    onSuccess: () => setStep("done"),
    onError: (err: any) => {
      toast({ title: "Submission failed", description: err.message || "Please try again.", variant: "destructive" });
    },
  });

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── STEP: Package ─────────────────────────────────────────────────────────
  if (step === "package") return (
    <Shell onBack={() => setLocation("/wallet")}>
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl mb-6 p-6 text-center"
        style={{ background: "linear-gradient(135deg,#1e0a4a 0%,#0f1a5c 50%,#1a0836 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(circle at 50% 0%,#7c3aed 0%,transparent 70%)" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
            style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
            <Star className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" />
            <span className="text-yellow-300 text-xs font-bold tracking-wide">CHOOSE YOUR PACK</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Add Tokens</h1>
          <p className="text-purple-300/70 text-sm">More tokens = more plays = more chances to WIN</p>
        </div>
      </div>

      {/* Package grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {PACKAGES.map(p => {
          const Icon = p.icon;
          const pct  = Math.round((p.credits / 3000) * 100);
          return (
            <button key={p.id}
              onClick={() => { setPkg(p); setStep("method"); }}
              className={`relative rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] group bg-gradient-to-br ${p.bg} ${p.popular ? "col-span-2" : ""}`}
              style={{
                border: `1px solid ${p.color}50`,
                boxShadow: `0 0 20px ${p.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}>

              {/* Badge */}
              {(p.popular || p.bonus) && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide whitespace-nowrap"
                    style={{
                      background: p.popular
                        ? "linear-gradient(90deg,#f59e0b,#f97316)"
                        : "linear-gradient(90deg,#10b981,#059669)",
                      color: "white",
                      boxShadow: p.popular ? "0 0 12px rgba(245,158,11,0.6)" : "0 0 12px rgba(16,185,129,0.5)",
                    }}>
                    {p.popular ? "⭐ BEST VALUE" : p.bonus}
                  </span>
                </div>
              )}

              <div className={`flex ${p.popular ? "items-center gap-6" : "flex-col gap-3"}`}>
                {/* Icon + label */}
                <div className={`flex items-center gap-2 ${p.popular ? "" : "justify-between"}`}>
                  <div className="p-2 rounded-xl"
                    style={{ background: `${p.color}22`, border: `1px solid ${p.color}40` }}>
                    <Icon className="h-4 w-4" style={{ color: p.color }} />
                  </div>
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{p.label}</span>
                  {!p.popular && (
                    <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  )}
                </div>

                {/* Token count + price */}
                <div className={p.popular ? "flex-1" : ""}>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-3xl font-black text-white leading-none">{p.credits.toLocaleString()}</span>
                    <span className="text-gray-500 text-xs">tokens</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-black" style={{ color: p.color }}>${p.dollars}</span>
                    <span className="text-gray-600 text-xs">${(p.dollars / p.credits).toFixed(2)}/tkn</span>
                  </div>
                  {/* Value bar */}
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg,${p.color}99,${p.color})` }} />
                  </div>
                </div>

                {p.popular && (
                  <div className="text-right shrink-0">
                    <ChevronRight className="h-6 w-6" style={{ color: p.color }} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Trust strip */}
      <div className="flex items-center justify-center gap-6 py-3">
        {[["🔒", "Secure"], ["⚡", "Fast Approval"], ["🎯", "Real Prizes"]].map(([icon, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-base">{icon}</span>
            <span className="text-gray-500 text-xs">{label}</span>
          </div>
        ))}
      </div>

      <DisclaimerBox />
    </Shell>
  );

  // ── STEP: Payment method ──────────────────────────────────────────────────
  if (step === "method") return (
    <Shell onBack={() => setStep("package")}>
      {/* Selected package recap */}
      {pkg && (
        <div className="relative rounded-2xl p-4 mb-5 overflow-hidden"
          style={{ background: `linear-gradient(135deg,${pkg.color}18,transparent)`, border: `1px solid ${pkg.color}40` }}>
          <div className="absolute inset-0 opacity-10"
            style={{ background: `radial-gradient(circle at 0% 50%,${pkg.color},transparent 60%)` }} />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-0.5">Selected Pack</p>
              <p className="text-white font-black text-lg">{pkg.credits.toLocaleString()} Tokens</p>
              <p className="text-gray-400 text-sm">{pkg.label} Pack</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black" style={{ color: pkg.color }}>${pkg.dollars}</p>
              <p className="text-gray-500 text-xs">one-time payment</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-white font-bold text-lg mb-3">How do you want to pay?</p>

      <div className="space-y-3">
        {METHODS.map(m => (
          <button key={m.id} onClick={() => { setMethod(m); setStep("send"); }}
            className="w-full rounded-2xl p-4 text-left flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
            style={{
              background: m.bgColor,
              border: `1px solid ${m.color}40`,
              boxShadow: `0 4px 20px ${m.color}15`,
            }}>
            <span className="text-4xl">{m.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-white text-base">{m.label}</p>
              <p className="text-xs mt-0.5" style={{ color: m.color }}>{m.hint}</p>
              <p className="text-gray-500 text-xs mt-0.5">{m.destination}</p>
            </div>
            <div className="p-2 rounded-xl transition-all group-hover:translate-x-1"
              style={{ background: `${m.color}20` }}>
              <ChevronRight className="h-4 w-4" style={{ color: m.color }} />
            </div>
          </button>
        ))}
      </div>

      <DisclaimerBox />
    </Shell>
  );

  // ── STEP: Send instructions ───────────────────────────────────────────────
  if (step === "send" && pkg && method) return (
    <Shell onBack={() => setStep("method")}>
      <div className="space-y-4">
        {/* Big amount card */}
        <div className="rounded-3xl p-6 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#1a0545,#0e1d6b)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(circle at 50% 0%,#7c3aed,transparent 60%)" }} />
          <div className="relative">
            <p className="text-gray-400 text-sm mb-2 font-semibold uppercase tracking-wider">Send Exactly</p>
            <p className="text-6xl font-black text-white mb-1">${pkg.dollars}<span className="text-3xl">.00</span></p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mt-2"
              style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.4)" }}>
              <span className="text-purple-300 text-sm font-semibold">→ {pkg.credits.toLocaleString()} tokens added after approval</span>
            </div>
          </div>
        </div>

        {/* Send-to card */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${method.color}40` }}>
          <div className="px-4 py-2 flex items-center gap-2"
            style={{ background: `${method.color}18` }}>
            <span className="text-lg">{method.icon}</span>
            <span className="text-sm font-bold" style={{ color: method.color }}>{method.label}</span>
          </div>
          <div className="p-4 flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Send to</p>
              <p className="text-white font-black text-xl">{method.destination}</p>
            </div>
            <button onClick={() => copy(method.destination)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
              style={{
                background: copied ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.1)",
                border:     copied ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.15)",
                color:      copied ? "#10b981" : "#d1d5db",
              }}>
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl p-4"
          style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.25)" }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0" />
            <p className="text-yellow-300 text-sm font-bold">Before You Send</p>
          </div>
          <div className="space-y-2">
            {[
              "Send the EXACT amount shown above",
              "Do NOT include a note or memo",
              "Click \"I Sent Payment\" after sending",
              "Tokens are added within 1–4 hours after verification",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-black"
                  style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24" }}>
                  {i + 1}
                </div>
                <p className="text-yellow-200/75 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => setStep("confirm")}
          className="w-full py-4 rounded-2xl font-black text-white text-lg transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)", boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}>
          I Sent the Payment →
        </button>
      </div>

      <DisclaimerBox />
    </Shell>
  );

  // ── STEP: Confirm ─────────────────────────────────────────────────────────
  if (step === "confirm" && pkg && method) return (
    <Shell onBack={() => setStep("send")}>
      <div className="space-y-5">
        {/* Summary */}
        <div className="rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
          style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.35)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ background: "radial-gradient(circle at 0% 50%,#7c3aed,transparent 60%)" }} />
          <span className="text-4xl relative">{method.icon}</span>
          <div className="relative">
            <p className="text-white font-black">${pkg.dollars} via {method.label}</p>
            <p className="text-purple-300 text-sm">{pkg.credits.toLocaleString()} tokens after approval</p>
          </div>
          <CheckCircle className="h-6 w-6 text-purple-400 ml-auto relative" />
        </div>

        {/* Form */}
        <div>
          <p className="text-white font-bold text-base mb-4">Confirm your payment details</p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-gray-300 text-sm font-semibold">Your Name on Payment</label>
              <Input
                placeholder="e.g. John Smith"
                value={paymentName}
                onChange={e => setPaymentName(e.target.value)}
                className="bg-white/8 border-white/20 text-white placeholder-gray-500 focus:border-purple-400 h-12 rounded-xl text-base"
              />
              <p className="text-gray-600 text-xs">Name shown on your {method.label} profile</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-300 text-sm font-semibold">
                Your {method.id === "cashapp" ? "Cash App $cashtag" : method.id === "venmo" ? "Venmo @handle" : "Email / Phone"}
              </label>
              <Input
                placeholder={method.id === "cashapp" ? "$YourCashtag" : method.id === "venmo" ? "@YourHandle" : "your@email.com"}
                value={paymentHandle}
                onChange={e => setPaymentHandle(e.target.value)}
                className="bg-white/8 border-white/20 text-white placeholder-gray-500 focus:border-purple-400 h-12 rounded-xl text-base"
              />
              <p className="text-gray-600 text-xs">So our team can match the payment to your account</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => submitMutation.mutate()}
          disabled={!paymentName.trim() || !paymentHandle.trim() || submitMutation.isPending}
          className="w-full py-4 rounded-2xl font-black text-white text-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)", boxShadow: "0 0 30px rgba(124,58,237,0.35)" }}>
          {submitMutation.isPending ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
          ) : (
            <><CheckCircle className="h-5 w-5" />Submit Payment Confirmation</>
          )}
        </button>

        <p className="text-gray-600 text-xs text-center">
          By submitting you confirm you sent the payment and agree to the{" "}
          <a href="/terms" className="text-purple-400 hover:underline">Terms</a>.
        </p>
      </div>
    </Shell>
  );

  // ── STEP: Done ────────────────────────────────────────────────────────────
  return (
    <Shell onBack={undefined}>
      <div className="text-center py-6 space-y-6">
        {/* Success animation */}
        <div className="relative inline-flex">
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 0 50px rgba(16,185,129,0.5)" }}>
            <CheckCircle className="h-14 w-14 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#f59e0b", boxShadow: "0 0 15px rgba(245,158,11,0.6)" }}>
            <Star className="h-4 w-4 text-white" fill="currentColor" />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-white">Payment Submitted!</h2>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-sm mx-auto">
            Our team is reviewing your payment. Tokens will appear in your wallet — usually within <strong className="text-white">1–4 hours</strong>.
          </p>
        </div>

        {/* Receipt */}
        <div className="rounded-2xl p-4 text-left space-y-3 mx-auto max-w-xs"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
          {[
            ["Package", `$${pkg?.dollars} → ${pkg?.credits?.toLocaleString()} tokens`],
            ["Method",  method?.label ?? ""],
            ["Status",  null],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{label}</span>
              {label === "Status" ? (
                <span className="text-yellow-400 text-sm font-semibold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />Pending Review
                </span>
              ) : (
                <span className="text-white text-sm font-semibold">{value}</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => setLocation("/wallet")}
            className="w-full py-3.5 rounded-2xl font-black text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)", boxShadow: "0 0 25px rgba(124,58,237,0.35)" }}>
            View My Wallet
          </button>
          <button onClick={() => setLocation("/")}
            className="w-full py-3.5 rounded-2xl font-semibold text-gray-400 transition-all hover:text-white"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            Back to Games
          </button>
        </div>
      </div>
    </Shell>
  );
}

// ── Shell layout ─────────────────────────────────────────────────────────────
function Shell({ children, onBack }: { children: React.ReactNode; onBack?: () => void }) {
  return (
    <div className="min-h-screen pb-24"
      style={{ background: "linear-gradient(160deg,#07040f 0%,#0d0b1e 40%,#07060f 100%)" }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#7c3aed,transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#2563eb,transparent 70%)", filter: "blur(50px)" }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/8 px-4 py-3.5 flex items-center gap-3"
        style={{ background: "rgba(7,4,15,0.85)", backdropFilter: "blur(20px)" }}>
        {onBack && (
          <button onClick={onBack}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl"
            style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)", boxShadow: "0 0 15px rgba(124,58,237,0.4)" }}>
            <Wallet className="h-4.5 w-4.5 text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="font-black text-white text-base leading-none">Add Tokens</h1>
            <p className="text-gray-500 text-xs mt-0.5">PrizePlugz Token Store</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-lg mx-auto px-4 py-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function DisclaimerBox() {
  return (
    <div className="rounded-xl p-3 text-xs text-gray-600"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-start gap-1.5">
        <Shield className="h-3 w-3 text-gray-600 mt-0.5 shrink-0" />
        <p>PrizePlugz Tokens are used solely for game participation. Tokens have no cash value and are non-refundable except as required by law. No purchase necessary — see{" "}
          <a href="/official-rules" className="text-purple-500 hover:underline">Official Rules</a> for free entry.
        </p>
      </div>
    </div>
  );
}
