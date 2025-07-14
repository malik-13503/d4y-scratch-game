import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Trophy, 
  Gift, 
  Truck, 
  Shield, 
  CheckCircle, 
  Star, 
  Crown, 
  Gem, 
  Smartphone,
  Laptop,
  Coffee,
  DollarSign
} from "lucide-react";
import logoPath from "@assets/logo_1751956932645.png";

export default function RealPrizes() {
  const prizeCategories = [
    {
      icon: Smartphone,
      title: "Electronics",
      description: "Latest gadgets and tech accessories",
      prizes: ["Smartphones", "Headphones", "Smart Watches", "Tablets"]
    },
    {
      icon: Gift,
      title: "Gift Cards",
      description: "Popular retailers and services",
      prizes: ["Amazon", "Apple Store", "Google Play", "Steam"]
    },
    {
      icon: Coffee,
      title: "Lifestyle",
      description: "Everyday essentials and luxuries",
      prizes: ["Premium Coffee", "Fashion Items", "Home Decor", "Beauty Products"]
    },
    {
      icon: Gem,
      title: "Exclusive Items",
      description: "Limited edition and special prizes",
      prizes: ["Collectibles", "Signed Merchandise", "VIP Experiences", "Custom Items"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Floating prize elements */}
        <div className="absolute top-40 left-20 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="absolute top-60 right-40 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-40 left-1/3 w-5 h-5 bg-purple-400 rounded-full animate-bounce delay-1000"></div>
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
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-full px-6 py-3 border border-yellow-500/30 mb-6">
            <Trophy className="h-5 w-5 text-yellow-300" />
            <span className="text-yellow-200 font-medium">Real Rewards</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
            Authentic Prizes
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Every prize is real, verified, and shipped directly to your door. No fake rewards, no empty promises.
          </p>
        </div>

        {/* Prize Guarantee */}
        <Card className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 backdrop-blur-xl border-green-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Shield className="h-6 w-6 mr-2 text-green-400" />
              Our Prize Guarantee
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-600/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">100% Authentic</h3>
                <p className="text-white/70">All prizes are genuine products from authorized retailers and manufacturers.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Free Shipping</h3>
                <p className="text-white/70">All prizes are shipped to you completely free of charge, anywhere in the world.</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Guaranteed Delivery</h3>
                <p className="text-white/70">We guarantee your prize will arrive within 7-14 business days or we'll make it right.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prize Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {prizeCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card key={index} className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-xl border-purple-500/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <IconComponent className="h-6 w-6 mr-2 text-purple-400" />
                    {category.title}
                  </CardTitle>
                  <p className="text-white/70">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {category.prizes.map((prize, prizeIndex) => (
                      <Badge key={prizeIndex} variant="secondary" className="bg-purple-600/20 text-purple-200 border-purple-500/30">
                        {prize}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Prize Values */}
        <Card className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-xl border-blue-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-blue-400" />
              Prize Values
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">$10-50</div>
                <div className="text-white/70">Entry Level</div>
                <div className="text-sm text-white/50">Gift cards, accessories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">$50-200</div>
                <div className="text-white/70">Standard</div>
                <div className="text-sm text-white/50">Electronics, gadgets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">$200-500</div>
                <div className="text-white/70">Premium</div>
                <div className="text-sm text-white/50">High-end electronics</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">$500+</div>
                <div className="text-white/70">Jackpot</div>
                <div className="text-sm text-white/50">Luxury items, experiences</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-xl border-purple-500/30 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Gift className="h-6 w-6 mr-2 text-purple-400" />
              How Prize Delivery Works
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-600/20 rounded-full p-2 w-10 h-10 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Win Your Prize</h3>
                  <p className="text-white/70">Spin the wheel and land on a winning number to claim your prize.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600/20 rounded-full p-2 w-10 h-10 flex items-center justify-center">
                  <span className="text-blue-400 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Instant Verification</h3>
                  <p className="text-white/70">Your win is automatically verified and recorded in our system.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-pink-600/20 rounded-full p-2 w-10 h-10 flex items-center justify-center">
                  <span className="text-pink-400 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Shipping Details</h3>
                  <p className="text-white/70">Provide your shipping address and contact information securely.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-green-600/20 rounded-full p-2 w-10 h-10 flex items-center justify-center">
                  <span className="text-green-400 font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Enjoy Your Prize</h3>
                  <p className="text-white/70">Receive your authentic prize within 7-14 business days.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ready to Win */}
        <Card className="bg-gradient-to-r from-purple-900/60 to-pink-900/60 backdrop-blur-xl border-purple-500/30 shadow-2xl">
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Win Real Prizes?</h3>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Don't miss out on your chance to win authentic prizes from top brands. 
              Every spin could be your ticket to something amazing!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg">
                  <Star className="h-5 w-5 mr-2" />
                  Start Playing
                </Button>
              </Link>
              <Link href="/prize-rules">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 py-3 px-8 rounded-xl text-lg">
                  View Prize Rules
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}