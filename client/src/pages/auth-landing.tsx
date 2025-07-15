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
            
            <div className="relative inline-block mb-8">
              <div className="absolute -inset-12 bg-gradient-to-r from-yellow-400/30 via-red-500/30 to-purple-600/30 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative">
                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 leading-tight drop-shadow-2xl">
                  HIT THE ROAD
                </h1>
                <div className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 mt-2 drop-shadow-2xl">
                  JACKPOT
                </div>
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-yellow-400/20 via-red-500/20 to-purple-600/20 blur-xl rounded-full -z-10"></div>
              </div>
            </div>

            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl rounded-full"></div>
              <p className="relative text-2xl md:text-3xl text-white font-bold mb-4 max-w-4xl mx-auto leading-relaxed text-center drop-shadow-lg">
                Spin the wheel of fortune and win amazing prizes! 
              </p>
              <p className="text-xl md:text-2xl text-yellow-300 font-black max-w-3xl mx-auto leading-relaxed text-center drop-shadow-lg">
                Real games, real winners, real excitement!
              </p>
            </div>

            {/* Enhanced Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-6 mb-16">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-green-500/50 to-emerald-500/50 blur-lg rounded-2xl group-hover:blur-xl transition-all duration-300"></div>
                <Badge className="relative bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-100 border-2 border-green-400/60 px-6 py-3 text-lg font-black backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                  <Zap className="h-5 w-5 mr-2 animate-pulse" />
                  INSTANT PLAY
                </Badge>
              </div>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/50 to-cyan-500/50 blur-lg rounded-2xl group-hover:blur-xl transition-all duration-300"></div>
                <Badge className="relative bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-100 border-2 border-blue-400/60 px-6 py-3 text-lg font-black backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                  <Trophy className="h-5 w-5 mr-2 animate-bounce" />
                  BIG PRIZES
                </Badge>
              </div>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/50 to-pink-500/50 blur-lg rounded-2xl group-hover:blur-xl transition-all duration-300"></div>
                <Badge className="relative bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-100 border-2 border-purple-400/60 px-6 py-3 text-lg font-black backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                  <Crown className="h-5 w-5 mr-2 animate-pulse" />
                  FREE SPINS
                </Badge>
              </div>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-red-500/50 to-orange-500/50 blur-lg rounded-2xl group-hover:blur-xl transition-all duration-300"></div>
                <Badge className="relative bg-gradient-to-r from-red-500/30 to-orange-500/30 text-red-100 border-2 border-red-400/60 px-6 py-3 text-lg font-black backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                  <Shield className="h-5 w-5 mr-2 animate-pulse" />
                  SECURE PAYMENTS
                </Badge>
              </div>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Enhanced Authentication Flow */}
            <div className="order-2 lg:order-1">
              {currentStep === "auth" && (
                <div className="relative">
                  {/* Glowing background effect */}
                  <div className="absolute -inset-6 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-cyan-500/30 blur-2xl rounded-3xl animate-pulse"></div>
                  
                  <Card className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl border-2 border-white/30 shadow-2xl shadow-purple-500/25 rounded-3xl overflow-hidden">
                    {/* Animated border effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 animate-pulse rounded-3xl"></div>
                    
                    <CardContent className="relative p-10">
                      <div className="text-center mb-10">
                        <div className="relative inline-block">
                          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/50 to-blue-500/50 blur-xl rounded-full animate-pulse"></div>
                          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-full mb-6 shadow-2xl shadow-purple-500/50">
                            <Users className="h-10 w-10 text-white drop-shadow-lg" />
                          </div>
                        </div>
                        <h2 className="text-4xl font-black text-white mb-3 drop-shadow-lg">Join the Game</h2>
                        <p className="text-gray-300 text-lg font-medium">Create your account or sign in to start winning!</p>
                      </div>

                      <Tabs defaultValue="signup" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-800/80 border-2 border-white/20 rounded-2xl p-2 backdrop-blur-sm">
                          <TabsTrigger value="signup" className="text-white font-bold text-lg py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:shadow-lg transition-all duration-300">
                            Sign Up
                          </TabsTrigger>
                          <TabsTrigger value="login" className="text-white font-bold text-lg py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:shadow-lg transition-all duration-300">
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
                </div>
              )}

              {currentStep === "card-setup" && (
                <div className="relative">
                  <div className="absolute -inset-6 bg-gradient-to-r from-green-500/30 via-blue-500/30 to-cyan-500/30 blur-2xl rounded-3xl animate-pulse"></div>
                  
                  <Card className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl border-2 border-white/30 shadow-2xl shadow-green-500/25 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-cyan-500/20 animate-pulse rounded-3xl"></div>
                    
                    <CardContent className="relative p-10">
                      <div className="text-center mb-10">
                        <div className="relative inline-block">
                          <div className="absolute -inset-4 bg-gradient-to-r from-green-500/50 to-blue-500/50 blur-xl rounded-full animate-pulse"></div>
                          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 via-blue-500 to-cyan-500 rounded-full mb-6 shadow-2xl shadow-green-500/50">
                            <CreditCard className="h-10 w-10 text-white drop-shadow-lg" />
                          </div>
                        </div>
                        <h2 className="text-4xl font-black text-white mb-3 drop-shadow-lg">Payment Setup</h2>
                        <p className="text-gray-300 text-lg font-medium">Add your payment method to start playing!</p>
                      </div>
                      <CardSetup onSuccess={handleCardSetupSuccess} />
                    </CardContent>
                  </Card>
                </div>
              )}

              {currentStep === "complete" && (
                <div className="relative">
                  <div className="absolute -inset-6 bg-gradient-to-r from-green-500/40 via-emerald-500/40 to-cyan-500/40 blur-2xl rounded-3xl animate-pulse"></div>
                  
                  <Card className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl border-2 border-white/30 shadow-2xl shadow-green-500/30 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-cyan-500/20 animate-pulse rounded-3xl"></div>
                    
                    <CardContent className="relative p-10 text-center">
                      <div className="relative inline-block mb-8">
                        <div className="absolute -inset-4 bg-gradient-to-r from-green-500/50 to-emerald-500/50 blur-xl rounded-full animate-pulse"></div>
                        <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-cyan-500 rounded-full shadow-2xl shadow-green-500/50">
                          <CheckCircle className="h-12 w-12 text-white drop-shadow-lg" />
                        </div>
                      </div>
                      <h2 className="text-4xl font-black text-white mb-6 drop-shadow-lg">You're All Set!</h2>
                      <p className="text-gray-300 text-xl font-medium mb-10">
                        Welcome, {user?.firstName}! Your account is ready to play.
                      </p>
                      <Button
                        onClick={handleContinueToGames}
                        size="lg"
                        className="w-full bg-gradient-to-r from-green-600 via-blue-600 to-cyan-600 hover:from-green-700 hover:via-blue-700 hover:to-cyan-700 text-white font-black py-6 px-10 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 text-xl"
                      >
                        <Trophy className="h-6 w-6 mr-3 animate-bounce" />
                        Enter the Games
                        <Sparkles className="h-6 w-6 ml-3 animate-pulse" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Right Column - Enhanced Features & Benefits */}
            <div className="order-1 lg:order-2">
              <div className="space-y-8">
                {/* Game Features */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl rounded-3xl"></div>
                  <Card className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl border-2 border-white/30 shadow-2xl shadow-purple-500/20 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse rounded-3xl"></div>
                    <CardContent className="relative p-8">
                      <div className="flex items-center space-x-6 mb-6">
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/50 to-pink-500/50 blur-lg rounded-full"></div>
                          <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                            <Target className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-white drop-shadow-lg">Spin to Win</h3>
                          <p className="text-gray-300 text-lg font-medium">Numbers 1-200, pay what you land on</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 blur-lg rounded-2xl"></div>
                          <div className="relative bg-green-500/30 p-4 rounded-2xl border-2 border-green-400/50 backdrop-blur-sm">
                            <div className="text-green-200 font-black text-lg">Free Play Zone</div>
                            <div className="text-green-100 text-base">Numbers 151-200</div>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-lg rounded-2xl"></div>
                          <div className="relative bg-blue-500/30 p-4 rounded-2xl border-2 border-blue-400/50 backdrop-blur-sm">
                            <div className="text-blue-200 font-black text-lg">Paid Range</div>
                            <div className="text-blue-100 text-base">Numbers 1-150</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Security Features */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-2xl rounded-3xl"></div>
                  <Card className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl border-2 border-white/30 shadow-2xl shadow-green-500/20 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 animate-pulse rounded-3xl"></div>
                    <CardContent className="relative p-8">
                      <div className="flex items-center space-x-6 mb-6">
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-green-500/50 to-blue-500/50 blur-lg rounded-full"></div>
                          <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                            <Shield className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-white drop-shadow-lg">Safe & Secure</h3>
                          <p className="text-gray-300 text-lg font-medium">Your payments are protected</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <CheckCircle className="h-6 w-6 text-green-400" />
                          <span className="text-gray-200 text-lg font-medium">Square payment processing</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <CheckCircle className="h-6 w-6 text-green-400" />
                          <span className="text-gray-200 text-lg font-medium">Encrypted transactions</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <CheckCircle className="h-6 w-6 text-green-400" />
                          <span className="text-gray-200 text-lg font-medium">Instant charge system</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Prizes Preview */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-2xl rounded-3xl"></div>
                  <Card className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl border-2 border-white/30 shadow-2xl shadow-yellow-500/20 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 animate-pulse rounded-3xl"></div>
                    <CardContent className="relative p-8">
                      <div className="flex items-center space-x-6 mb-6">
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500/50 to-orange-500/50 blur-lg rounded-full"></div>
                          <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                            <Gift className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-white drop-shadow-lg">Amazing Prizes</h3>
                          <p className="text-gray-300 text-lg font-medium">Real rewards waiting for you</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-lg rounded-2xl"></div>
                          <div className="relative bg-purple-500/30 p-4 rounded-2xl border-2 border-purple-400/50 backdrop-blur-sm text-center">
                            <Trophy className="h-8 w-8 text-purple-200 mx-auto mb-2" />
                            <div className="text-purple-100 font-black text-xl">$500</div>
                            <div className="text-purple-200 text-sm">Travel Mug</div>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-lg rounded-2xl"></div>
                          <div className="relative bg-blue-500/30 p-4 rounded-2xl border-2 border-blue-400/50 backdrop-blur-sm text-center">
                            <Star className="h-8 w-8 text-blue-200 mx-auto mb-2" />
                            <div className="text-blue-100 font-black text-xl">More</div>
                            <div className="text-blue-200 text-sm">Coming Soon</div>
                          </div>
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
    </div>
  );
}