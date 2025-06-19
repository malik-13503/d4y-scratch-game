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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Main Header */}
      <header className="bg-brand-red text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">HIT THE ROAD JACKPOT</h1>
              <p className="text-red-100 text-sm">Live Prize Games • Real Winners</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">$478</div>
              <div className="text-red-100 text-sm">Total Prize Pool</div>
            </div>
          </div>
        </div>
      </header>

      {/* User Status */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <span className="text-gray-700 font-medium">Playing as Guest</span>
              <span className="text-green-600 text-sm">• Free Games Available</span>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Games</h2>
          <p className="text-gray-600">Join active games and win amazing prizes!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games?.map((game) => (
            <Card key={game.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">{game.emoji}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{game.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{game.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${game.isFreePlay ? 'text-green-600' : 'text-gray-900'}`}>
                      {game.prize}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Numbers Available</span>
                    <span className="font-semibold text-gray-900">{game.numbersLeft} / {game.totalNumbers}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(game.numbersLeft / game.totalNumbers) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time Remaining</span>
                    <span className="font-mono text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                      {formatTimeRemaining(new Date(game.endTime))}
                    </span>
                  </div>
                </div>
                
                <Link href={`/game/${game.id}`} className="block">
                  <Button 
                    className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                      game.isFreePlay 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-brand-yellow hover:bg-yellow-400 text-black hover:shadow-lg'
                    }`}
                    disabled={game.numbersLeft <= 0}
                  >
                    {game.numbersLeft <= 0 ? "Game Full" : game.isFreePlay ? "Play Free" : "Join Game"}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {(!games || games.length === 0) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Games</h3>
            <p className="text-gray-600">Check back soon for new games!</p>
          </div>
        )}
      </main>

      {/* Referral Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">🎁 Referral Bonus Program</h3>
            <p className="text-purple-100">Invite 3 friends and get 5 free spins! Share the excitement!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
