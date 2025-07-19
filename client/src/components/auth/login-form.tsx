import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { saveAuthToStorage } from "@/lib/auth";
import { AlertCircle, CheckCircle, Mail, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/login", { email, password });
      const result = await response.json();
      
      // Save user to localStorage for persistence
      if (result.user) {
        saveAuthToStorage(result.user);
      }
      
      // Beautiful success popup
      toast({
        title: "🎉 Welcome Back!",
        description: "Successfully logged in to your account",
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400",
      });
      
      onSuccess();
    } catch (error: any) {
      // Beautiful error popup for wrong credentials
      const errorMessage = error.message || "Invalid email or password";
      setError(errorMessage);
      
      toast({
        title: "⚠️ Login Failed",
        description: errorMessage.includes("credentials") || errorMessage.includes("Invalid") 
          ? "The email or password you entered is incorrect. Please double-check and try again."
          : errorMessage,
        variant: "destructive",
        className: "bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-400",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200 font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white font-medium text-sm">Email Address</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-4 text-base sm:text-lg backdrop-blur-sm transition-all duration-300 w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white font-medium text-sm">Password</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-12 text-base sm:text-lg backdrop-blur-sm transition-all duration-300 w-full"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
        </div>
      </div>
      
      <div className="relative mt-6">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/50 to-blue-500/50 blur-lg rounded-2xl opacity-75"></div>
        <Button
          type="submit"
          disabled={isLoading || !email || !password}
          className="relative w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-800 text-white font-black py-3 sm:py-4 lg:py-5 px-4 sm:px-6 lg:px-8 rounded-xl shadow-2xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 text-xs sm:text-sm md:text-base lg:text-lg border-2 border-white/20 min-h-[48px] sm:min-h-[56px] md:min-h-[64px] lg:min-h-[72px] flex items-center justify-center touch-manipulation active:scale-95"
        >
          {isLoading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
              <span className="text-xs sm:text-sm md:text-base font-bold">Signing In...</span>
            </>
          ) : (
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-wide">
              {isMobile ? "SIGN IN" : "SIGN IN & CONTINUE"}
            </span>
          )}
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Don't have an account? Switch to Sign Up tab above
        </p>
      </div>
    </form>
  );
}