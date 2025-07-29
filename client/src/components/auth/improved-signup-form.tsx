import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { saveAuthToStorage } from "@/lib/auth";
import { AlertCircle, User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImprovedSignupFormProps {
  onSuccess: (userName: string) => void;
}

export function ImprovedSignupForm({ onSuccess }: ImprovedSignupFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
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

    // Check required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'password'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        setIsLoading(false);
        return;
      }
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await apiRequest("POST", "/api/register", registrationData);
      const result = await response.json();
      
      // Don't save auth to storage immediately - let user login manually
      
      toast({
        title: "Account Created Successfully!",
        description: "Welcome to Hit The Road Jackpot! Please log in to continue.",
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400",
      });
      
      // Pass user's first name to show in popup
      const userName = formData.firstName || formData.email.split('@')[0];
      onSuccess(userName);
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/30 backdrop-blur-sm rounded-xl">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200 font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Name Fields - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-white font-medium text-sm">
              First Name
            </Label>
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
                placeholder="First name"
                className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-4 text-base backdrop-blur-sm transition-all duration-300 w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-white font-medium text-sm">
              Last Name
            </Label>
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
                placeholder="Last name"
                className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-4 text-base backdrop-blur-sm transition-all duration-300 w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-medium text-sm">
            Email Address
          </Label>
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
              placeholder="your@email.com"
              className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-4 text-base backdrop-blur-sm transition-all duration-300 w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
          </div>
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white font-medium text-sm">
            Phone Number <span className="text-gray-400 text-xs">(optional)</span>
          </Label>
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
              className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-4 text-base backdrop-blur-sm transition-all duration-300 w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
          </div>
        </div>

        {/* Password Fields - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white font-medium text-sm">
              Password
            </Label>
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
                className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-12 text-base backdrop-blur-sm transition-all duration-300 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white font-medium text-sm">
              Confirm Password
            </Label>
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
                className="bg-slate-800/50 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-12 text-base backdrop-blur-sm transition-all duration-300 w-full"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold py-4 text-base sm:text-lg rounded-xl shadow-xl ring-2 ring-purple-400/30 hover:ring-purple-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              "Create My Account"
            )}
          </Button>
        </div>

        {/* Terms Text */}
        <div className="text-center pt-2">
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-purple-400 hover:text-purple-300 underline transition-colors">
              Terms & Conditions
            </a>
            {" "}and{" "}
            <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}