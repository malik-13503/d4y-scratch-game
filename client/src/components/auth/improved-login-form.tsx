import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { saveAuthToStorage } from "@/lib/auth";
import { AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImprovedLoginFormProps {
  onSuccess: () => void;
}

export function ImprovedLoginForm({ onSuccess }: ImprovedLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/login", { email, password });
      const result = await response.json();
      
      if (result.user) {
        saveAuthToStorage(result.user);
      }
      
      toast({
        title: "Welcome Back!",
        description: "Successfully logged in to your account",
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400",
      });
      
      onSuccess();
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/30 backdrop-blur-sm rounded-xl">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200 font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <div className="space-y-3">
          <Label htmlFor="email" className="text-white font-medium text-sm">
            Email Address
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(""); // Clear error when user types
              }}
              placeholder="your@email.com"
              className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-4 pl-12 pr-4 text-base sm:text-lg backdrop-blur-sm transition-all duration-300 w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-white font-medium text-sm">
              Password
            </Label>
            <a 
              href="/forgot-password" 
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(""); // Clear error when user types
              }}
              placeholder="Enter your password"
              className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-4 pl-12 pr-12 text-base sm:text-lg backdrop-blur-sm transition-all duration-300 w-full"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 hover:text-white transition-colors p-1"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold py-4 text-base sm:text-lg rounded-xl shadow-xl ring-2 ring-blue-400/30 hover:ring-blue-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              "Sign In to My Account"
            )}
          </Button>
        </div>

        {/* Additional Options */}
        <div className="text-center pt-2 space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-full"></div>
            <span className="text-gray-400 text-sm px-3 bg-slate-800/50 rounded-full py-1">or</span>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-full"></div>
          </div>
          
          <p className="text-sm text-gray-300">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-purple-400 hover:text-purple-300 font-semibold underline transition-colors"
              onClick={() => {
                // This will be handled by the parent component
                const signupTab = document.querySelector('[data-state="inactive"]') as HTMLElement;
                if (signupTab) signupTab.click();
              }}
            >
              Sign up here
            </button>
          </p>
        </div>

        {/* Demo Credentials (for testing) */}
        <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-white/10">
          <p className="text-xs text-gray-400 text-center mb-2">Demo Credentials (for testing):</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <span className="text-gray-300">Email:</span>
              <div className="font-mono text-purple-300">demo@example.com</div>
            </div>
            <div className="text-center">
              <span className="text-gray-300">Password:</span>
              <div className="font-mono text-purple-300">demo123</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}