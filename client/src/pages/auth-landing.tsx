import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SignupForm } from "@/components/auth/signup-form";
import { LoginForm } from "@/components/auth/login-form";
import { CardSetup } from "@/components/payment/card-setup";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getQueryFn } from "@/lib/queryClient";
import logoPath from "@assets/logo_1751918412862.png";
import { 
  Trophy, 
  Star, 
  Zap, 
  Crown, 
  Sparkles, 
  Gift, 
  Target,
  Users,
  Shield,
  CreditCard,
  CheckCircle
} from "lucide-react";

type FlowStep = "auth" | "card-setup" | "complete";

export default function AuthLandingPage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("auth");
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const handleAuthSuccess = () => {
    refetch();
    setCurrentStep("card-setup");
  };

  const handleCardSetupSuccess = () => {
    refetch();
    setCurrentStep("complete");
  };

  const handleContinueToGames = () => {
    setLocation("/games");
  };

  // If user is already authenticated and has card on file, redirect to games
  if (user && user.cardOnFile) {
    setLocation("/games");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-5 w-96 h-96 bg-gradient-to-br from-red-500/25 to-purple-600/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-5 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-yellow-500/15 to-orange-500/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Rotating gradient */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-conic from-purple-500/8 via-blue-500/8 to-red-500/8 rounded-full blur-3xl animate-spin" style={{animationDuration: '30s'}}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-30"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(147, 51, 234, 0.15) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(147, 51, 234, 0.15) 1px, transparent 1px)
               `,
               backgroundSize: '60px 60px'
             }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Logo and Branding */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-red-500/30 blur-2xl rounded-full"></div>
                <img 
                  src={logoPath} 
                  alt="Hit The Road Jackpot" 
                  className="relative h-20 w-auto mx-auto drop-shadow-2xl"
                />
              </div>
            </div>
            
            <div className="relative inline-block mb-6">
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 leading-tight">
                HIT THE ROAD
              </h1>
              <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 mt-2">
                JACKPOT
              </div>
              <div className="absolute -inset-8 bg-gradient-to-r from-yellow-400/20 via-red-500/20 to-purple-600/20 blur-3xl rounded-full"></div>
            </div>

            <p className="text-xl md:text-2xl text-gray-300 font-medium mb-8 max-w-3xl mx-auto leading-relaxed">
              Spin the wheel of fortune and win amazing prizes! 
              <span className="text-yellow-400 font-bold"> Real games, real winners, real excitement!</span>
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-400/40 px-4 py-2 text-sm font-bold">
                <Zap className="h-4 w-4 mr-2" />
                INSTANT PLAY
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/40 px-4 py-2 text-sm font-bold">
                <Trophy className="h-4 w-4 mr-2" />
                BIG PRIZES
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-400/40 px-4 py-2 text-sm font-bold">
                <Crown className="h-4 w-4 mr-2" />
                FREE SPINS
              </Badge>
              <Badge className="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border-red-400/40 px-4 py-2 text-sm font-bold">
                <Shield className="h-4 w-4 mr-2" />
                SECURE PAYMENTS
              </Badge>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Authentication Flow */}
            <div className="order-2 lg:order-1">
              {currentStep === "auth" && (
                <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-4 shadow-lg">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Join the Game</h2>
                      <p className="text-gray-400">Create your account or sign in to start winning!</p>
                    </div>

                    <Tabs defaultValue="signup" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-800/50 border border-white/10">
                        <TabsTrigger value="signup" className="text-white data-[state=active]:bg-purple-600">
                          Sign Up
                        </TabsTrigger>
                        <TabsTrigger value="login" className="text-white data-[state=active]:bg-purple-600">
                          Login
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="signup">
                        <SignupForm onSuccess={handleAuthSuccess} />
                      </TabsContent>
                      
                      <TabsContent value="login">
                        <LoginForm onSuccess={handleAuthSuccess} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {currentStep === "card-setup" && (
                <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mb-4 shadow-lg">
                        <CreditCard className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Payment Setup</h2>
                      <p className="text-gray-400">Add your payment method to start playing!</p>
                    </div>
                    <CardSetup onSuccess={handleCardSetupSuccess} />
                  </CardContent>
                </Card>
              )}

              {currentStep === "complete" && (
                <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">You're All Set!</h2>
                    <p className="text-gray-400 mb-8">
                      Welcome, {user?.firstName}! Your account is ready to play.
                    </p>
                    <Button
                      onClick={handleContinueToGames}
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      <Trophy className="h-5 w-5 mr-2" />
                      Enter the Games
                      <Sparkles className="h-5 w-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Features & Benefits */}
            <div className="order-1 lg:order-2">
              <div className="space-y-6">
                {/* Game Features */}
                <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Spin to Win</h3>
                        <p className="text-gray-400 text-sm">Numbers 1-200, pay what you land on</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                        <div className="text-green-300 font-bold">Free Play Zone</div>
                        <div className="text-green-200">Numbers 151-200</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="text-blue-300 font-bold">Paid Range</div>
                        <div className="text-blue-200">Numbers 1-150</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Features */}
                <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Safe & Secure</h3>
                        <p className="text-gray-400 text-sm">Your payments are protected</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">Square payment processing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">Encrypted transactions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">Instant charge system</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Prizes Preview */}
                <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Gift className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Amazing Prizes</h3>
                        <p className="text-gray-400 text-sm">Real rewards waiting for you</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-400/30 text-center">
                        <Trophy className="h-6 w-6 text-purple-300 mx-auto mb-1" />
                        <div className="text-purple-200 font-bold">$500</div>
                        <div className="text-purple-300 text-xs">Travel Mug</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30 text-center">
                        <Star className="h-6 w-6 text-blue-300 mx-auto mb-1" />
                        <div className="text-blue-200 font-bold">More</div>
                        <div className="text-blue-300 text-xs">Coming Soon</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}