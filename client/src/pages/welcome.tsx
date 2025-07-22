import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { SignupForm } from "@/components/auth/signup-form";
import { LoginForm } from "@/components/auth/login-form";
import { CardSetup } from "@/components/payment/card-setup";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getQueryFn } from "@/lib/queryClient";

type FlowStep = "auth" | "card-setup" | "complete";

export default function WelcomePage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("auth");
  const [, setLocation] = useLocation();

  // Get the game ID from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("gameId");

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
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
    if (gameId) {
      setLocation(`/game/${gameId}`);
    } else {
      setLocation("/");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user && typeof user === 'object' && (user as any).cardOnFile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-2xl font-bold mb-2">You're All Set!</h1>
                <p className="text-gray-600 mb-6">
                  Welcome back, {(user as any)?.firstName || "Player"}! Your account is ready to play.
                </p>
                <Button
                  onClick={handleContinueToGames}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  Continue to Games
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Hit the Road Jackpot
          </h1>
          <p className="text-white/80 text-lg">Your adventure starts here!</p>
        </div>

        <div className="flex flex-col items-center justify-center">
          {currentStep === "auth" && (
            <Tabs defaultValue="signup" className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/80 border-2 border-white/20 rounded-2xl p-2 backdrop-blur-sm">
                <TabsTrigger 
                  value="signup"
                  className="text-white font-bold text-base sm:text-lg py-3 px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:shadow-lg transition-all duration-300 flex items-center justify-center min-h-[48px]"
                >
                  Sign Up
                </TabsTrigger>
                <TabsTrigger 
                  value="login"
                  className="text-white font-bold text-base sm:text-lg py-3 px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:shadow-lg transition-all duration-300 flex items-center justify-center min-h-[48px]"
                >
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
          )}

          {currentStep === "card-setup" && user ? (
            <div>
              <CardSetup user={user as any} onSuccess={handleCardSetupSuccess} />
            </div>
          ) : null}

          {currentStep === "complete" && (
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-2xl font-bold mb-2">
                  Welcome to the Game!
                </h1>
                <p className="text-gray-600 mb-6">
                  Your account is set up and ready to play. Time to win some
                  prizes!
                </p>
                <Button
                  onClick={handleContinueToGames}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  Start Playing Now!
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
