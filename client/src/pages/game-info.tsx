import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Info, 
  Target, 
  Trophy, 
  Gamepad2, 
  Zap, 
  Clock, 
  Users, 
  Star, 
  Crown,
  Gift,
  Sparkles
} from "lucide-react";
import logoPath from "@assets/logo_1777237644041.png";

export default function GameInfo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden informational-page">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Floating gaming elements */}
        <div className="absolute top-40 left-20 w-4 h-4 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute top-60 right-40 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-40 left-1/3 w-5 h-5 bg-pink-400 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-60 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-1500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-purple-700/20 hover:text-purple-200">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="flex items-center space-x-4">
              <img src={logoPath} alt="Prize Plugz" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">Prize Plugz</h1>
                <p className="text-sm text-purple-200">Win Big, Play Smart</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-500/30 mb-6">
            <Info className="h-5 w-5 text-purple-300" />
            <span className="text-purple-200 font-medium">Game Information</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            How Our Game Works
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover the exciting world of spinning wheel games and learn about all the features that make our platform special.
          </p>
        </div>

        {/* Game Overview */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Gamepad2 className="h-6 w-6 mr-2 text-purple-400" />
              Game Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-800/30 rounded-lg p-6 border border-purple-500/20">
                <Target className="h-8 w-8 text-purple-400 mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Spinning Wheel Mechanics</h3>
                <p className="text-white/70">
                  Our professional spinning wheel uses advanced physics to ensure fair and exciting gameplay. Each spin is completely random and verified.
                </p>
              </div>
              <div className="bg-blue-800/30 rounded-lg p-6 border border-blue-500/20">
                <Trophy className="h-8 w-8 text-blue-400 mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Real Prizes</h3>
                <p className="text-white/70">
                  Win actual prizes including gift cards, electronics, and exclusive merchandise. All prizes are guaranteed and shipped directly to you.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Star className="h-6 w-6 mr-2 text-blue-400" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-purple-600/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Instant Play</h3>
                <p className="text-white/70">No downloads or registrations required. Jump right into the action with just one click.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Real-time Updates</h3>
                <p className="text-white/70">Live player counts, game status, and instant result notifications keep you engaged.</p>
              </div>
              <div className="text-center">
                <div className="bg-pink-600/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Community</h3>
                <p className="text-white/70">Join thousands of players from around the world in our exciting gaming community.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Statistics */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Crown className="h-6 w-6 mr-2 text-purple-400" />
              Game Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">50,000+</div>
                <div className="text-white/70">Total Spins</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">2,500+</div>
                <div className="text-white/70">Prizes Won</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400 mb-2">99.9%</div>
                <div className="text-white/70">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
                <div className="text-white/70">Support</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ready to Play */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl">
          <CardContent className="text-center py-12">
            <Gift className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Experience the Thrill?</h3>
            <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
              Join the excitement and try your luck on our spinning wheel. With fair gameplay and amazing prizes, 
              your next big win could be just one spin away!
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg hover:scale-105 transition-all duration-200">
                <Sparkles className="h-5 w-5 mr-2" />
                Start Playing Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}