import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coffee, Camera, Gift } from "lucide-react";

// Featured games from design reference
const featuredGames = [
  {
    id: "travel-mug",
    name: "Travel Mug",
    prize: "$10",
    prizeValue: 10,
    code: "G8-694",
    numbersLeft: 73,
    totalNumbers: 125,
    timeLeft: "01:23:14",
    icon: Coffee,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30"
  },
  {
    id: "free-play",
    name: "Free Play",
    prize: "Free Play",
    prizeValue: 0,
    code: "G2-853",
    numbersLeft: 122,
    totalNumbers: 125,
    timeLeft: "60:45:32",
    icon: Gift,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    isFreePlay: true
  },
  {
    id: "camera",
    name: "Camera",
    prize: "$5",
    prizeValue: 5,
    code: "G4G-159",
    numbersLeft: 36,
    totalNumbers: 125,
    timeLeft: "03:07:56",
    icon: Camera,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  }
];

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white text-red-600 px-6 py-3 rounded-xl font-bold text-2xl shadow-lg">
                HIT THE ROAD JACKPOT
              </div>
              <div className="text-white/90 text-sm bg-white/10 px-3 py-1 rounded-full">
                A7T6
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-white/90 text-sm bg-white/10 px-4 py-2 rounded-lg">
                💎 Free coins | <span className="text-yellow-300 font-semibold">personalty</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="space-y-6">
          {featuredGames.map((game) => {
            const Icon = game.icon;
            const progress = ((game.totalNumbers - game.numbersLeft) / game.totalNumbers) * 100;
            
            return (
              <Card
                key={game.id}
                className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 overflow-hidden"
                onClick={() => setLocation(`/game/${game.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${game.color} text-white shadow-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{game.name}</h3>
                        <div className="text-gray-500 text-sm font-mono">{game.code}</div>
                      </div>
                    </div>
                    {game.isFreePlay ? (
                      <Badge className="bg-green-500 text-white font-bold px-3 py-1">
                        Free Play
                      </Badge>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900">{game.prize}</div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>{game.numbersLeft} Numbers Left</span>
                      <span className="font-mono text-sm">{game.timeLeft}</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="bg-gray-200 h-2"
                    />
                  </div>

                  <Button className={`w-full bg-gradient-to-r ${game.color} hover:shadow-lg text-white font-bold py-3 text-lg transition-all duration-300`}>
                    {game.isFreePlay ? "Free Play" : "Join"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Referral Section */}
        <div className="mt-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white">
            <div className="text-2xl mb-2">🎁</div>
            <p className="text-sm">Get 5 free spins when you refer a friend!</p>
          </div>
        </div>
      </main>
    </div>
  );
}