import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coffee, Camera, Gift, Trophy, Star, Zap, Crown, Sparkles } from "lucide-react";

// Featured games with exact payment mechanics
const featuredGames = [
  {
    id: "travel-mug",
    name: "Premium Travel Mug",
    prize: "$89.99",
    prizeValue: 89.99,
    code: "MUG002",
    numbersLeft: 142,
    totalNumbers: 150,
    freePlayRange: "126-150",
    paidRange: "1-125",
    timeLeft: "01:23:14",
    icon: Coffee,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30"
  },
  {
    id: "camera",
    name: "Premium Camera",
    prize: "$299.99",
    prizeValue: 299.99,
    code: "CAM001",
    numbersLeft: 186,
    totalNumbers: 200,
    freePlayRange: "151-200",
    paidRange: "1-150",
    timeLeft: "03:07:56",
    icon: Camera,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
  {
    id: "gift-card",
    name: "Gift Card Bundle",
    prize: "$250.00",
    prizeValue: 250.00,
    code: "GFT003",
    numbersLeft: 194,
    totalNumbers: 200,
    freePlayRange: "176-200",
    paidRange: "1-175",
    timeLeft: "12:34:18",
    icon: Gift,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30"
  }
];

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <div className="w-2 h-2 bg-yellow-400/60 rounded-full blur-sm"></div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-red-600 via-red-700 to-purple-700 shadow-2xl backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-white to-yellow-100 text-red-600 px-6 py-3 rounded-xl font-bold text-2xl shadow-2xl border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <Crown className="h-6 w-6 text-yellow-600" />
                  <span>HIT THE ROAD JACKPOT</span>
                  <Crown className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="text-white/90 text-sm bg-gradient-to-r from-white/20 to-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-300" />
                  <span>A7T6</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-white/90 text-sm bg-gradient-to-r from-white/20 to-white/10 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span>Free coins | <span className="text-yellow-300 font-semibold">personality</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-md mx-auto px-4 py-8">
        <div className="space-y-8">
          {featuredGames.map((game, index) => {
            const Icon = game.icon;
            const progress = ((game.totalNumbers - game.numbersLeft) / game.totalNumbers) * 100;
            
            return (
              <Card
                key={game.id}
                className="relative bg-gradient-to-br from-white via-white to-gray-50 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer border-0 overflow-hidden transform hover:scale-105 hover:-translate-y-2 group"
                onClick={() => setLocation(`/game/${game.id}`)}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
                
                {/* Top Border Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${game.color}`}></div>
                
                <CardContent className="relative p-6">
                  {/* Prize Highlight */}
                  <div className="absolute top-4 right-4">
                    <div className={`bg-gradient-to-r ${game.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1`}>
                      <Trophy className="h-3 w-3" />
                      <span>{game.prize}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`relative p-4 rounded-2xl bg-gradient-to-r ${game.color} text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8" />
                      <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm group-hover:bg-white/30 transition-all duration-300"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{game.name}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-500 text-sm font-mono bg-gray-100 px-2 py-1 rounded">{game.code}</div>
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-3 py-1 shadow-lg">
                          <Zap className="h-3 w-3 mr-1" />
                          Spin to Win
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">{game.numbersLeft} Numbers Left</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600 font-mono text-sm bg-white px-2 py-1 rounded-lg shadow-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span>{game.timeLeft}</span>
                      </div>
                    </div>
                    
                    {/* Payment Information */}
                    <div className="space-y-2 mb-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-700 font-medium">Paid Numbers:</span>
                          <span className="text-blue-800 font-bold">{game.paidRange}</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Pay exact number amount (e.g., #47 = $47)</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700 font-medium">Free Play Range:</span>
                          <span className="text-green-800 font-bold">{game.freePlayRange}</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">No charge - free numbers!</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Progress 
                        value={progress} 
                        className="bg-gray-300 h-3 shadow-inner"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-80 rounded-full h-3`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {Math.round(progress)}% Complete • {game.totalNumbers} Total Numbers
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button className={`
                    w-full bg-gradient-to-r ${game.color} hover:shadow-2xl text-white font-bold py-4 text-lg 
                    transition-all duration-300 relative overflow-hidden group-hover:scale-105
                    shadow-lg border-0 rounded-xl
                  `}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <span>Spin Wheel</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Referral Section */}
        <div className="mt-12 text-center">
          <div className="relative bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 text-white overflow-hidden group hover:scale-105 transition-all duration-300">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-2 w-4 h-4 border-2 border-white rounded-full"></div>
              <div className="absolute top-6 right-8 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-8 w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-8 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full shadow-xl">
                  <Gift className="h-8 w-8 text-white animate-bounce" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Referral Bonus
              </h3>
              <p className="text-white/90 mb-4">Get 5 free spins when you refer a friend!</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-yellow-300">
                <Star className="h-4 w-4" />
                <span>Limited Time Offer</span>
                <Star className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}