import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Play, 
  DollarSign, 
  Gift, 
  Target, 
  Clock, 
  Users,
  Trophy,
  Star,
  Zap
} from "lucide-react";
import logoPath from "@assets/logo_1751956932645.png";

export default function HowToPlay() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden informational-page">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Floating particles */}
        <div className="absolute top-40 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
        <div className="absolute top-60 right-40 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-60 right-1/4 w-4 h-4 bg-green-400 rounded-full animate-bounce delay-1500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:text-purple-300 hover:bg-purple-900/30">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <img 
                src={logoPath} 
                alt="Hit The Road Jackpot" 
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-white">How to Play</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 backdrop-blur-sm rounded-full px-6 py-3 border border-cyan-400/40 mb-6 shadow-lg shadow-cyan-500/25">
            <Play className="h-5 w-5 text-cyan-300 animate-pulse" />
            <span className="text-cyan-200 font-medium">Game Instructions</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Master the Wheel
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Learn how to play our exciting spinning wheel game and maximize your chances of winning amazing prizes!
          </p>
        </div>

        {/* Game Overview */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Target className="h-6 w-6 mr-2 text-purple-400" />
              Game Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-200">
            <p className="text-lg">
              Hit The Road Jackpot is a thrilling spinning wheel game where you spin to win numbers from 1 to 200. 
              Each number has a cost equal to its value, except for our special free play zone!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-700/80 rounded-lg p-4 border border-slate-500/30">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-400" />
                  <h3 className="font-semibold text-blue-300">Regular Numbers</h3>
                </div>
                <p className="text-sm text-gray-200">Numbers 1-150: Pay the exact amount of the number you land on</p>
              </div>
              <div className="bg-slate-700/80 rounded-lg p-4 border border-slate-500/30">
                <div className="flex items-center mb-2">
                  <Gift className="h-5 w-5 mr-2 text-green-400" />
                  <h3 className="font-semibold text-green-300">Free Play Zone</h3>
                </div>
                <p className="text-sm text-gray-200">Higher numbers: Completely free - no charge!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step by Step Guide */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Star className="h-6 w-6 mr-2 text-blue-400" />
              Step-by-Step Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                step: 1,
                title: "Choose Your Game",
                description: "Browse available games on the homepage and select one that catches your interest.",
                icon: <Target className="h-8 w-8 text-purple-400" />,
                tip: "Check the prize value and player count before joining"
              },
              {
                step: 2,
                title: "Join the Game",
                description: "Click 'Play Now' to enter the game room and see the spinning wheel.",
                icon: <Users className="h-8 w-8 text-blue-400" />,
                tip: "Games are live and other players might be spinning too"
              },
              {
                step: 3,
                title: "Spin the Wheel",
                description: "Click the 'SPIN THE WHEEL' button to start your spin. The wheel will rotate for 8 seconds.",
                icon: <Play className="h-8 w-8 text-green-400" />,
                tip: "Each spin is completely random and fair"
              },
              {
                step: 4,
                title: "No Purchase Necessary Option",
                description: "Can't afford to play? Use the 'No Purchase Entry' button for a free chance to win!",
                icon: <Gift className="h-8 w-8 text-emerald-400" />,
                tip: "One free entry per game - no payment required"
              },
              {
                step: 5,
                title: "Wait for Result",
                description: "Watch the wheel slow down and stop. A result popup will appear 1 second after it stops.",
                icon: <Clock className="h-8 w-8 text-yellow-400" />,
                tip: "The wheel will stop exactly on the number you'll receive"
              },
              {
                step: 6,
                title: "Check Your Result",
                description: "See your number and whether you landed in the free play zone or need to pay.",
                icon: <Trophy className="h-8 w-8 text-orange-400" />,
                tip: "Higher numbers are completely free!"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-black/20 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Badge variant="secondary" className="mr-3">Step {item.step}</Badge>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  </div>
                  <p className="text-white/80 mb-2">{item.description}</p>
                  <p className="text-sm text-purple-300 italic">💡 {item.tip}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pro Tips */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Zap className="h-6 w-6 mr-2 text-green-400" />
              Pro Tips & Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Timing Matters",
                  description: "Games have limited numbers available. Join early for better selection.",
                  icon: <Clock className="h-5 w-5 text-blue-400" />
                },
                {
                  title: "Watch Player Count",
                  description: "Higher player counts mean more competition but also more excitement.",
                  icon: <Users className="h-5 w-5 text-purple-400" />
                },
                {
                  title: "Free Play Zone",
                  description: "Numbers 151-200 are completely free - great for practice spins!",
                  icon: <Gift className="h-5 w-5 text-green-400" />
                },
                {
                  title: "Fair & Random",
                  description: "Every spin is completely random. No strategies can influence the outcome.",
                  icon: <Target className="h-5 w-5 text-orange-400" />
                }
              ].map((tip, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    {tip.icon}
                    <h3 className="font-semibold text-white ml-2">{tip.title}</h3>
                  </div>
                  <p className="text-sm text-gray-200">{tip.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ready to Play */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl">
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Spin?</h3>
            <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
              Now that you know how to play, it's time to try your luck! 
              Join a game and experience the thrill of our spinning wheel.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg hover:scale-105 transition-all duration-200">
                <Play className="h-5 w-5 mr-2 animate-sparkle" />
                Start Playing Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}