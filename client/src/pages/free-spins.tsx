import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Crown, 
  Gift, 
  Zap, 
  Star, 
  Clock, 
  Users, 
  Target, 
  Sparkles, 
  CheckCircle,
  Calendar,
  RefreshCw,
  Trophy
} from "lucide-react";
import logoPath from "@assets/logo_1751956932645.png";

export default function FreeSpins() {
  const freeSpinRewards = [
    {
      icon: Gift,
      title: "Daily Bonus",
      description: "Get free spins every day just for logging in",
      reward: "1-3 Free Spins",
      color: "text-blue-400"
    },
    {
      icon: Users,
      title: "Friend Referral",
      description: "Invite friends and earn bonus spins",
      reward: "5 Free Spins",
      color: "text-green-400"
    },
    {
      icon: Trophy,
      title: "Achievement Bonus",
      description: "Complete challenges to unlock free spins",
      reward: "2-10 Free Spins",
      color: "text-purple-400"
    },
    {
      icon: Calendar,
      title: "Weekly Streak",
      description: "Play consecutive days for increasing rewards",
      reward: "Up to 15 Free Spins",
      color: "text-yellow-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden informational-page">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Floating crown elements */}
        <div className="absolute top-40 left-20 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="absolute top-60 right-40 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-40 left-1/3 w-5 h-5 bg-blue-400 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-60 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-1500"></div>
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
              <img src={logoPath} alt="Hit The Road Jackpot" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">Hit The Road Jackpot</h1>
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
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-500/30 mb-6">
            <Crown className="h-5 w-5 text-purple-300" />
            <span className="text-purple-200 font-medium">Free Rewards</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Free Spins Galore
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Enjoy free spins every day! Win real prizes without spending a dime through our generous free spin program.
          </p>
        </div>

        {/* What Are Free Spins */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-purple-400" />
              What Are Free Spins?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-800/30 rounded-lg p-6 border border-purple-500/20">
                <Target className="h-8 w-8 text-purple-400 mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Same Great Prizes</h3>
                <p className="text-white/70">
                  Free spins give you the same chances to win real prizes as paid spins. No difference in prize quality or odds.
                </p>
              </div>
              <div className="bg-blue-800/30 rounded-lg p-6 border border-blue-500/20">
                <Zap className="h-8 w-8 text-blue-400 mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">No Cost to You</h3>
                <p className="text-white/70">
                  Completely free to use - no hidden fees, no catches, no payment required. Just pure fun and real prizes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Get Free Spins */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Gift className="h-6 w-6 mr-2 text-blue-400" />
              How to Get Free Spins
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {freeSpinRewards.map((reward, index) => {
                const IconComponent = reward.icon;
                return (
                  <div key={index} className="bg-gradient-to-r from-purple-800/20 to-blue-800/20 rounded-lg p-6 border border-purple-500/20">
                    <div className="flex items-center mb-3">
                      <IconComponent className={`h-6 w-6 mr-3 ${reward.color}`} />
                      <h3 className="text-lg font-bold text-white">{reward.title}</h3>
                    </div>
                    <p className="text-white/70 mb-3">{reward.description}</p>
                    <Badge className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-200 border-purple-500/30">
                      {reward.reward}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Free Spin Rules */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-400" />
              Free Spin Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">Daily Limit</h3>
                  <p className="text-white/70">Each player can earn up to 20 free spins per day through various activities.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">No Expiration</h3>
                  <p className="text-white/70">Free spins don't expire - use them whenever you want!</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">Same Prize Pool</h3>
                  <p className="text-white/70">Free spins access the same prize pool as paid spins - no separate rewards.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">Instant Delivery</h3>
                  <p className="text-white/70">Prizes won with free spins are delivered just like any other prize.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Free Spin Promotions */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <RefreshCw className="h-6 w-6 mr-2 text-purple-400" />
              Current Promotions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 rounded-lg p-6 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">Welcome Bonus</h3>
                  <Badge className="bg-green-600/20 text-green-200 border-green-500/30">Active</Badge>
                </div>
                <p className="text-white/70 mb-3">
                  New players receive 10 free spins just for visiting our site! No registration required.
                </p>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">10 Free Spins</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-800/30 to-purple-800/30 rounded-lg p-6 border border-blue-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">Weekend Special</h3>
                  <Badge className="bg-blue-600/20 text-blue-200 border-blue-500/30">Weekends Only</Badge>
                </div>
                <p className="text-white/70 mb-3">
                  Double free spins on weekends! All daily activities give you twice the normal reward.
                </p>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 font-bold">Saturday & Sunday</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Playing */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl">
          <CardContent className="text-center py-12">
            <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-4">Claim Your Free Spins</h3>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Start playing today and claim your free spins! Win real prizes without spending anything. 
              The more you play, the more free spins you'll earn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg">
                  <Crown className="h-5 w-5 mr-2" />
                  Claim Free Spins
                </Button>
              </Link>
              <Link href="/how-to-play">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 py-3 px-8 rounded-xl text-lg">
                  Learn How to Play
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}