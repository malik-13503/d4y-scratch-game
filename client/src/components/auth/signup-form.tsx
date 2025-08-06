import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { saveAuthToStorage } from "@/lib/auth";
import { AlertCircle, User, Mail, Phone, Lock, Eye, EyeOff, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorDialog } from "@/components/error-dialog";
import { EmailErrorDialog } from "@/components/email-error-dialog";
import { EmailAlreadyExistsPopup } from "@/components/email-already-exists-popup";

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    state: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [optOutPublicity, setOptOutPublicity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [showEmailErrorDialog, setShowEmailErrorDialog] = useState(false);
  const [showEmailExistsPopup, setShowEmailExistsPopup] = useState(false);
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

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid Gmail address (e.g., user@gmail.com)");
      setIsLoading(false);
      return;
    }

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

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.state) {
      setError("All fields are required including state");
      setIsLoading(false);
      return;
    }

    // Check for excluded states
    const excludedStates = ['NY', 'FL', 'RI', 'HI'];
    if (excludedStates.includes(formData.state)) {
      setError(`Sorry, residents of ${formData.state} are not eligible to participate in paid games due to state regulations.`);
      setIsLoading(false);
      return;
    }

    // Validate age confirmation
    if (!ageConfirmed) {
      setError("You must be 18 years or older to participate");
      setIsLoading(false);
      return;
    }

    // Validate terms acceptance
    if (!acceptTerms) {
      setError("Please accept the Terms & Conditions and Privacy Policy");
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      const fullRegistrationData = {
        ...registrationData,
        optOutPublicity,
        acceptedTermsAt: new Date().toISOString(),
      };
      const response = await apiRequest("POST", "/api/register", fullRegistrationData);
      const result = await response.json();
      
      // DO NOT save to localStorage or call onSuccess yet
      // User needs to complete card setup and then login
      toast({
        title: "🎉 Account Created Successfully!",
        description: "Please login with your credentials to continue",
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400",
      });
      
      // Reset form and show success message
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        state: "",
      });
      setAcceptTerms(false);
      setAgeConfirmed(false);
      setOptOutPublicity(false);
      
      // Show message to login
      setError("Account created! Please use the Login tab to access your account.");
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed";
      
      // Check if it's the "Email already registered" error
      if (errorMessage.includes("Email already registered")) {
        setShowEmailExistsPopup(true);
      } else {
        setDialogError(errorMessage);
        setShowErrorDialog(true);
      }
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
      
      {/* State Selection Field */}
      <div className="space-y-2">
        <Label htmlFor="state" className="text-white font-medium text-sm">State *</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
          <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
            <SelectTrigger className="bg-slate-800/50 border-2 border-white/20 text-white focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-10 pr-4 text-base sm:text-lg backdrop-blur-sm transition-all duration-300 w-full">
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-purple-500/30 text-white max-h-48">
              <SelectItem value="AL">Alabama</SelectItem>
              <SelectItem value="AK">Alaska</SelectItem>
              <SelectItem value="AZ">Arizona</SelectItem>
              <SelectItem value="AR">Arkansas</SelectItem>
              <SelectItem value="CA">California</SelectItem>
              <SelectItem value="CO">Colorado</SelectItem>
              <SelectItem value="CT">Connecticut</SelectItem>
              <SelectItem value="DE">Delaware</SelectItem>
              <SelectItem value="GA">Georgia</SelectItem>
              <SelectItem value="ID">Idaho</SelectItem>
              <SelectItem value="IL">Illinois</SelectItem>
              <SelectItem value="IN">Indiana</SelectItem>
              <SelectItem value="IA">Iowa</SelectItem>
              <SelectItem value="KS">Kansas</SelectItem>
              <SelectItem value="KY">Kentucky</SelectItem>
              <SelectItem value="LA">Louisiana</SelectItem>
              <SelectItem value="ME">Maine</SelectItem>
              <SelectItem value="MD">Maryland</SelectItem>
              <SelectItem value="MA">Massachusetts</SelectItem>
              <SelectItem value="MI">Michigan</SelectItem>
              <SelectItem value="MN">Minnesota</SelectItem>
              <SelectItem value="MS">Mississippi</SelectItem>
              <SelectItem value="MO">Missouri</SelectItem>
              <SelectItem value="MT">Montana</SelectItem>
              <SelectItem value="NE">Nebraska</SelectItem>
              <SelectItem value="NV">Nevada</SelectItem>
              <SelectItem value="NH">New Hampshire</SelectItem>
              <SelectItem value="NJ">New Jersey</SelectItem>
              <SelectItem value="NM">New Mexico</SelectItem>
              <SelectItem value="NC">North Carolina</SelectItem>
              <SelectItem value="ND">North Dakota</SelectItem>
              <SelectItem value="OH">Ohio</SelectItem>
              <SelectItem value="OK">Oklahoma</SelectItem>
              <SelectItem value="OR">Oregon</SelectItem>
              <SelectItem value="PA">Pennsylvania</SelectItem>
              <SelectItem value="SC">South Carolina</SelectItem>
              <SelectItem value="SD">South Dakota</SelectItem>
              <SelectItem value="TN">Tennessee</SelectItem>
              <SelectItem value="TX">Texas</SelectItem>
              <SelectItem value="UT">Utah</SelectItem>
              <SelectItem value="VT">Vermont</SelectItem>
              <SelectItem value="VA">Virginia</SelectItem>
              <SelectItem value="WA">Washington</SelectItem>
              <SelectItem value="WV">West Virginia</SelectItem>
              <SelectItem value="WI">Wisconsin</SelectItem>
              <SelectItem value="WY">Wyoming</SelectItem>
              <SelectItem value="DC">Washington DC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.state && ['NY', 'FL', 'RI', 'HI'].includes(formData.state) && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
            <p className="text-red-200 text-sm font-medium">
              ⚠️ Sorry, residents of {formData.state} cannot participate in paid games due to state regulations. 
              You may still use free entry options where available.
            </p>
          </div>
        )}
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

      {/* Tennessee Publicity Rights Opt-out */}
      {formData.state === 'TN' && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="optOutPublicity"
              checked={optOutPublicity}
              onCheckedChange={(checked) => setOptOutPublicity(checked === true)}
              className="border-blue-400/60 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 mt-1"
            />
            <div className="flex-1">
              <label htmlFor="optOutPublicity" className="text-blue-200 text-sm font-medium cursor-pointer">
                Tennessee Residents: Opt out of publicity rights
              </label>
              <p className="text-blue-300/80 text-xs mt-1">
                As a Tennessee resident, you can choose to opt out of any publicity, advertising, or promotional use of your name, likeness, or prize information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Age Verification Checkbox - Required for Legal Compliance */}
      <div className="flex items-start space-x-3 p-4 bg-orange-900/20 rounded-xl border-2 border-orange-500/40 backdrop-blur-sm">
        <input
          type="checkbox"
          id="ageConfirmed"
          checked={ageConfirmed}
          onChange={(e) => setAgeConfirmed(e.target.checked)}
          className="mt-1 w-5 h-5 text-orange-600 bg-slate-700 border-orange-400 rounded focus:ring-orange-500 focus:ring-2"
          required
        />
        <label htmlFor="ageConfirmed" className="text-sm text-orange-100 leading-tight font-medium cursor-pointer">
          🔞 I confirm that I am 18 years of age or older (Required)
        </label>
      </div>

      {/* Terms and Conditions Checkbox */}
      <div className="flex items-start space-x-3 p-4 bg-slate-800/50 rounded-xl border border-white/20 backdrop-blur-sm">
        <input
          type="checkbox"
          id="acceptTerms"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 w-4 h-4 text-purple-600 bg-slate-700 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
        />
        <label htmlFor="acceptTerms" className="text-sm text-gray-300 leading-tight">
          I agree to the{" "}
          <a href="/terms" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
            Terms & Conditions
          </a>,{" "}
          <a href="/privacy" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
            Privacy Policy
          </a>, and{" "}
          <a href="/official-rules" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
            Official Rules
          </a>
        </label>
      </div>

      <div className="relative mt-6">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/50 to-blue-500/50 blur-lg rounded-2xl opacity-75"></div>
        <Button
          type="submit"
          disabled={isLoading || !formData.email || !formData.firstName || !formData.lastName || !formData.password || !formData.confirmPassword || !acceptTerms || !ageConfirmed}
          className="relative w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-800 text-white font-black py-3 sm:py-4 lg:py-5 px-4 sm:px-6 lg:px-8 rounded-xl shadow-2xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 text-xs sm:text-sm md:text-base lg:text-lg border-2 border-white/20 min-h-[48px] sm:min-h-[56px] md:min-h-[64px] lg:min-h-[72px] flex items-center justify-center touch-manipulation active:scale-95"
        >
          {isLoading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
              <span className="text-xs sm:text-sm md:text-base font-bold">Creating Account...</span>
            </>
          ) : (
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-wide">
              {isMobile ? "CREATE ACCOUNT" : "CREATE ACCOUNT & CONTINUE"}
            </span>
          )}
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Already have an account? Switch to Sign In tab above
        </p>
      </div>
      
      {/* Professional Error Dialog */}
      <ErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        error={dialogError}
        onRetry={() => {
          // Clear form errors and allow retry
          setError("");
          setDialogError("");
        }}
      />

      {/* Email Error Dialog */}
      <EmailErrorDialog
        open={showEmailErrorDialog}
        onClose={() => setShowEmailErrorDialog(false)}
        onSwitchToLogin={onSwitchToLogin}
        email={formData.email}
      />

      {/* Email Already Exists Popup */}
      <EmailAlreadyExistsPopup
        isOpen={showEmailExistsPopup}
        onClose={() => setShowEmailExistsPopup(false)}
        onSwitchToLogin={onSwitchToLogin}
        email={formData.email}
      />
    </form>
  );
}