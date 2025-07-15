import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/login", { email });
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your email and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white font-medium text-sm">Email Address</Label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 px-4 text-base sm:text-lg backdrop-blur-sm transition-all duration-300 w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/50 to-blue-500/50 blur-lg rounded-2xl opacity-75"></div>
        <Button
          type="submit"
          disabled={isLoading}
          className="relative w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-black py-4 px-4 sm:px-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 text-base sm:text-lg border-2 border-white/20 min-h-[56px] flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              <span className="block sm:hidden">Signing In...</span>
              <span className="hidden sm:block">Signing In...</span>
            </>
          ) : (
            <>
              <span className="block sm:hidden">Sign In</span>
              <span className="hidden sm:block">Sign In & Continue</span>
            </>
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