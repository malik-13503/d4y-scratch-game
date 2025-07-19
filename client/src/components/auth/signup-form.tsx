import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { saveAuthToStorage } from "@/lib/auth";
import { AlertCircle, User, Mail, Phone, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SignupFormProps {
  onSuccess: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await apiRequest("POST", "/api/register", registrationData);
      const result = await response.json();
      
      // Save user to localStorage for persistence
      if (result.user) {
        saveAuthToStorage(result.user);
      }
      
      // Beautiful success popup
      toast({
        title: "🎉 Welcome to Hit The Road Jackpot!",
        description: "Your account has been created successfully!",
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400",
      });
      
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.message || "Something went wrong. Please try again.";
      setError(errorMessage);
      
      toast({
        title: "⚠️ Registration Failed", 
        description: errorMessage.includes("email") 
          ? "This email is already registered. Please try logging in or use a different email."
          : errorMessage,
        variant: "destructive",
        className: "bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-400",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-white font-medium text-sm">First Name</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-4 text-base sm:text-lg backdrop-blur-sm transition-all duration-300 w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-white font-medium text-sm">Last Name</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-4 text-base sm:text-lg backdrop-blur-sm transition-all duration-300 w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
          </div>
        </div>
      </div>
      
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
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-4 text-base sm:text-lg backdrop-blur-sm transition-all duration-300 w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-white font-medium text-sm">Phone Number (Optional)</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Phone className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-4 text-base sm:text-lg backdrop-blur-sm transition-all duration-300 w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
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
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white font-medium text-sm">Confirm Password</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-12 text-base sm:text-lg backdrop-blur-sm transition-all duration-300 w-full"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
          </div>
        </div>
      </div>

      <div className="relative mt-6">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/50 to-blue-500/50 blur-lg rounded-2xl opacity-75"></div>
        <Button
          type="submit"
          disabled={isLoading || !formData.email || !formData.firstName || !formData.lastName || !formData.password || !formData.confirmPassword}
          className="relative w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-800 text-white font-black py-4 px-4 sm:px-6 rounded-xl shadow-2xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 text-sm sm:text-base lg:text-lg border-2 border-white/20 min-h-[56px] sm:min-h-[64px] flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              <span className="text-sm sm:text-base">Creating Account...</span>
            </>
          ) : (
            <span className="text-sm sm:text-base lg:text-lg font-bold">
              {isMobile ? "Create Account" : "Create Account & Continue"}
            </span>
          )}
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Already have an account? Switch to Sign In tab above
        </p>
      </div>
    </form>
  );
}