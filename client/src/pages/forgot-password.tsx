import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Something went wrong. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎰</div>
          <h1 className="text-3xl font-bold text-white">Prize Plugz</h1>
        </div>

        <Card className="bg-black/30 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-white text-2xl">
              {sent ? "Check Your Email" : "Forgot Password?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
                <p className="text-gray-300 text-sm leading-relaxed">
                  If <span className="text-purple-300 font-medium">{email}</span> is registered,
                  you'll receive a password reset link shortly. Check your inbox (and spam folder).
                </p>
                <p className="text-gray-500 text-xs">The link expires in 1 hour.</p>
                <Button
                  onClick={() => setLocation("/")}
                  className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-gray-400 text-sm text-center">
                  Enter your email and we'll send you a link to reset your password.
                </p>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/40 rounded-lg px-4 py-3 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-400 h-12 rounded-xl"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl text-base"
                >
                  {isLoading ? "Sending…" : "Send Reset Link"}
                </Button>

                <button
                  type="button"
                  onClick={() => setLocation("/")}
                  className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
