import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Copy,
  Smartphone,
  DollarSign,
  Zap,
  Shield,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { Input } from "@/components/ui/input";

// ── Static data (matches server) ────────────────────────────────────────────
const PACKAGES = [
  { id: 1, dollars: 5,   credits: 10,   popular: false, bonus: "",             label: "Starter Pack"     },
  { id: 2, dollars: 10,  credits: 25,   popular: false, bonus: "",             label: "Player Pack"      },
  { id: 3, dollars: 20,  credits: 60,   popular: false, bonus: "",             label: "Power Pack"       },
  { id: 4, dollars: 50,  credits: 175,  popular: false, bonus: "",             label: "Winner Pack"      },
  { id: 5, dollars: 100, credits: 400,  popular: false, bonus: "",             label: "VIP Pack"         },
  { id: 6, dollars: 250, credits: 1200, popular: false, bonus: "High Roller",  label: "High Roller Pack" },
  { id: 7, dollars: 500, credits: 3000, popular: true,  bonus: "⭐ Best Value", label: "Best Value Pack"  },
];

const METHODS = [
  { id: "cashapp",  label: "Cash App",       color: "#00c244", bgColor: "rgba(0,194,68,0.12)",   destination: "$m2mm",              icon: "💵" },
  { id: "venmo",    label: "Venmo",           color: "#3d95ce", bgColor: "rgba(61,149,206,0.12)", destination: "@Daveon-Mcgary",      icon: "💳" },
  { id: "chime",    label: "Chime",           color: "#00c6a0", bgColor: "rgba(0,198,160,0.12)",  destination: "740-802-4646",        icon: "🏦" },
  { id: "applepay", label: "Apple Pay/Cash",  color: "#888888", bgColor: "rgba(136,136,136,0.12)", destination: "+1 (740) 262-3121",  icon: "🍎" },
];

type Step = "package" | "method" | "send" | "confirm" | "done";

export default function AddCreditsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("package");
  const [pkg, setPkg] = useState<typeof PACKAGES[0] | null>(null);
  const [method, setMethod] = useState<typeof METHODS[0] | null>(null);
  const [paymentName, setPaymentName] = useState("");
  const [paymentHandle, setPaymentHandle] = useState("");
  const [copied, setCopied] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!pkg || !method) throw new Error("Missing selection");
      return apiRequest("POST", "/api/wallet/submit-payment", {
        dollarAmount: pkg.dollars,
        creditsAmount: pkg.credits,
        paymentMethod: method.id,
        paymentName: paymentName.trim(),
        paymentHandle: paymentHandle.trim(),
      });
    },
    onSuccess: () => {
      setStep("done");
    },
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

  // ── STEP: Package selection ───────────────────────────────────────────────
  if (step === "package") return (
    <Page onBack={() => setLocation("/wallet")} title="Add Tokens" subtitle="Choose a token package">
      <div className="space-y-3">
        {PACKAGES.map(p => (
          <button key={p.id} onClick={() => { setPkg(p); setStep("method"); }}
            className="w-full relative rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {p.popular && (
              <span className="absolute -top-2 right-4 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "linear-gradient(90deg,#f59e0b,#f97316)", color: "white" }}>
                Most Popular
              </span>
            )}
            {p.bonus && (
              <span className="absolute -top-2 right-4 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(16,185,129,0.3)", color: "#10b981", border: "1px solid rgba(16,185,129,0.5)" }}>
                {p.bonus}
              </span>
            )}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-white">{p.credits}</span>
                <span className="text-gray-400 ml-1 text-sm">PrizePlugz Tokens</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black" style={{ color: "#f59e0b" }}>${p.dollars}</span>
                <div className="text-gray-500 text-xs">{(p.credits / p.dollars).toFixed(1)} tkn/$</div>
              </div>
            </div>
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${(p.credits / 3000) * 100}%`, background: "linear-gradient(90deg,#7c3aed,#2563eb)" }} />
            </div>
          </button>
        ))}
      </div>

      <DisclaimerBox />
    </Page>
  );

  // ── STEP: Payment method ──────────────────────────────────────────────────
  if (step === "method") return (
    <Page onBack={() => setStep("package")} title="Payment Method" subtitle={`Sending $${pkg?.dollars} for ${pkg?.credits} tokens`}>
      <div className="space-y-3">
        {METHODS.map(m => (
          <button key={m.id} onClick={() => { setMethod(m); setStep("send"); }}
            className="w-full rounded-2xl p-4 text-left flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: m.bgColor, border: `1px solid ${m.color}30` }}>
            <span className="text-3xl">{m.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-white">{m.label}</p>
              <p className="text-gray-400 text-sm">{m.destination}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        ))}
      </div>
      <DisclaimerBox />
    </Page>
  );

  // ── STEP: Send payment instructions ──────────────────────────────────────
  if (step === "send" && pkg && method) return (
    <Page onBack={() => setStep("method")} title={`Send via ${method.label}`} subtitle={`Send exactly $${pkg.dollars} to the address below`}>
      <div className="space-y-4">
        {/* Amount to send */}
        <div className="rounded-2xl p-5 text-center"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <p className="text-gray-400 text-sm mb-1">Amount to send</p>
          <p className="text-4xl font-black text-white">${pkg.dollars}.00</p>
          <p className="text-gray-500 text-xs mt-1">Sends {pkg.credits} PrizePlugz Tokens to your account after approval</p>
        </div>

        {/* Send to */}
        <div className="rounded-2xl p-4 space-y-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Send to</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg">{method.destination}</p>
              <p className="text-gray-500 text-xs">{method.label}</p>
            </div>
            <button onClick={() => copy(method.destination)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: copied ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.1)", color: copied ? "#10b981" : "#9ca3af" }}>
              {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Important notes */}
        <div className="rounded-xl p-4 space-y-2"
          style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0" />
            <p className="text-yellow-300 text-sm font-semibold">Important</p>
          </div>
          <ul className="text-yellow-200/70 text-xs space-y-1 ml-6 list-disc">
            <li>Send the <strong className="text-yellow-200">exact amount</strong> shown</li>
            <li>Do not include a note/memo unless instructed</li>
            <li>After sending, click "I Sent Payment" below</li>
            <li>Tokens are added after staff verification (usually within 1–4 hours)</li>
          </ul>
        </div>

        <button onClick={() => setStep("confirm")}
          className="w-full py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
          I Sent the Payment →
        </button>
      </div>
      <DisclaimerBox />
    </Page>
  );

  // ── STEP: Confirm form ────────────────────────────────────────────────────
  if (step === "confirm" && pkg && method) return (
    <Page onBack={() => setStep("send")} title="Confirm Submission" subtitle="Enter your payment details so our team can verify">
      <div className="space-y-4">
        {/* Summary pill */}
        <div className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
          <span className="text-3xl">{method.icon}</span>
          <div>
            <p className="text-white font-bold">${pkg.dollars} via {method.label}</p>
            <p className="text-purple-300 text-sm">{pkg.credits} tokens will be added after approval</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-gray-300 text-sm font-semibold">Your Name on Payment</label>
            <Input
              placeholder="e.g. John Smith"
              value={paymentName}
              onChange={e => setPaymentName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-gray-500 focus:border-purple-400"
            />
            <p className="text-gray-500 text-xs">The name shown on your Cash App / Venmo profile</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-300 text-sm font-semibold">
              Your {method.id === "cashapp" ? "Cash App $cashtag" : method.id === "venmo" ? "Venmo @handle" : "Email / Handle"}
            </label>
            <Input
              placeholder={method.id === "cashapp" ? "$YourCashtag" : method.id === "venmo" ? "@YourHandle" : "your@email.com"}
              value={paymentHandle}
              onChange={e => setPaymentHandle(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-gray-500 focus:border-purple-400"
            />
            <p className="text-gray-500 text-xs">So our staff can match the payment to your account</p>
          </div>
        </div>

        <button
          onClick={() => submitMutation.mutate()}
          disabled={!paymentName.trim() || !paymentHandle.trim() || submitMutation.isPending}
          className="w-full py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
          {submitMutation.isPending ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
          ) : (
            <><CheckCircle className="h-5 w-5" />Submit Payment Confirmation</>
          )}
        </button>

        <p className="text-gray-600 text-xs text-center">
          By submitting you confirm you sent the payment and agree to the <a href="/terms" className="text-purple-400 hover:underline">Terms</a>.
        </p>
      </div>
    </Page>
  );

  // ── STEP: Done ────────────────────────────────────────────────────────────
  return (
    <Page onBack={undefined} title="" subtitle="">
      <div className="text-center py-8 space-y-6">
        <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Payment Submitted!</h2>
          <p className="text-gray-400 mt-2">Your payment is under review. Tokens will appear in your wallet once approved by our team — usually within 1–4 hours.</p>
        </div>

        <div className="rounded-2xl p-4 space-y-2"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Package</span>
            <span className="text-white font-semibold">${pkg?.dollars} → {pkg?.credits} tokens</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Method</span>
            <span className="text-white font-semibold">{method?.label}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Status</span>
            <span className="text-yellow-400 font-semibold flex items-center gap-1"><Clock className="h-3 w-3" />Pending Review</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => setLocation("/wallet")}
            className="w-full py-3 rounded-2xl font-bold text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
            View My Wallet
          </button>
          <button onClick={() => setLocation("/")}
            className="w-full py-3 rounded-2xl font-semibold text-gray-300"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            Back to Games
          </button>
        </div>
      </div>
    </Page>
  );
}

// ── Shared layout wrapper ─────────────────────────────────────────────────
function Page({ children, onBack, title, subtitle }: { children: React.ReactNode; onBack?: () => void; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#0f0621 0%,#110933 50%,#0a0518 100%)" }}>
      <div className="border-b border-white/10 px-4 py-4 flex items-center gap-3"
        style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}>
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl" style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
            <Wallet className="h-5 w-5 text-white" />
          </div>
          {title && (
            <div>
              <h1 className="font-bold text-white text-lg leading-none">{title}</h1>
              {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
            </div>
          )}
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
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
        <p>PrizePlugz Tokens are used solely for game participation. Tokens have no cash value and are non-refundable except as required by law. No purchase necessary — see <a href="/official-rules" className="text-purple-500 hover:underline">Official Rules</a> for free entry.</p>
      </div>
    </div>
  );
}
