import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatTimeRemaining } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Game } from "@shared/schema";

export default function Home() {
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  if (isLoading) {
    return (
      <div className="phone-container">
        <div className="phone-screen flex items-center justify-center">
          <div className="text-center">Loading games...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-container">
      <div className="phone-screen">
        {/* Header */}
        <div className="bg-brand-red text-white px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">HIT THE ROAD JACKPOT</h1>
          <span className="text-sm">$478</span>
        </div>
        
        {/* User Info */}
        <div className="px-4 py-3 bg-white border-b">
          <div className="flex items-center">
            <span className="text-sm text-gray-600">👤 Free Game</span>
            <span className="ml-auto text-sm text-gray-500">personally</span>
          </div>
        </div>
        
        {/* Game List */}
        <div className="flex-1 px-4 py-4 space-y-4">
          {games?.map((game) => (
            <Card key={game.id} className="p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-red rounded flex items-center justify-center">
                    <span className="text-white text-xl">{game.emoji}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{game.name}</h3>
                    <p className="text-sm text-gray-500">{game.code}</p>
                    <p className="text-xs text-gray-400">
                      <span>{game.numbersLeft} Numbers Left</span>{" "}
                      <span>{formatTimeRemaining(new Date(game.endTime))}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${game.isFreePlay ? 'text-brand-green' : 'text-gray-800'}`}>
                    {game.prize}
                  </div>
                  <Link href={`/game/${game.id}`}>
                    <Button 
                      className="bg-brand-yellow hover:bg-yellow-400 text-black px-4 py-1 text-sm font-semibold mt-1"
                      disabled={game.numbersLeft <= 0}
                    >
                      {game.isFreePlay ? "Free Play" : "Join"}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Referral Message */}
        <div className="px-4 py-3 bg-gray-50 border-t">
          <p className="text-xs text-gray-600 text-center">
            Get 5 free spins when you refer a friend!
          </p>
        </div>
        
        {/* Navigation */}
        <div className="px-4 py-2 bg-white border-t flex justify-center">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Admin Panel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
