import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user && user.cardOnFile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-2xl font-bold mb-2">You're All Set!</h1>
                <p className="text-gray-600 mb-6">
                  Welcome back, {user.firstName}! Your account is ready to play.
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
          <p className="text-white/80 text-lg">
            Your adventure starts here!
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          {currentStep === "auth" && (
            <Tabs defaultValue="signup" className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="login">Login</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signup">
                <SignupForm onSuccess={handleAuthSuccess} />
              </TabsContent>
              
              <TabsContent value="login">
                <LoginForm onSuccess={handleAuthSuccess} />
              </TabsContent>
            </Tabs>
          )}

          {currentStep === "card-setup" && user && (
            <CardSetup 
              onSuccess={handleCardSetupSuccess}
              user={user}
            />
          )}

          {currentStep === "complete" && (
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-2xl font-bold mb-2">Welcome to the Game!</h1>
                <p className="text-gray-600 mb-6">
                  Your account is set up and ready to play. Time to win some prizes!
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