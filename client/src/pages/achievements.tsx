import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  Trophy,
  Star,
  Award,
  Target,
  Zap,
  Crown,
  Medal,
  Gift,
  TrendingUp,
  Lock,
  CheckCircle2
} from "lucide-react";
import logoPath from "@assets/logo_1751918412862.png";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'spins' | 'spending' | 'wins' | 'special';
  target: number;
  current: number;
  completed: boolean;
  reward?: string;
  color: string;
}

export default function Achievements() {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
    refetchInterval: 10000,
  });

  // Calculate achievements based on user stats
  const achievements: Achievement[] = [
    // Spins Category
    {
      id: 'first_spin',
      title: 'First Spin',
      description: 'Complete your very first spin',
      icon: Target,
      category: 'spins',
      target: 1,
      current: userStats?.totalSpins || 0,
      completed: (userStats?.totalSpins || 0) >= 1,
      reward: 'Unlock daily bonuses',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'spin_master',
      title: 'Spin Master',
      description: 'Complete 10 spins',
      icon: Zap,
      category: 'spins',
      target: 10,
      current: userStats?.totalSpins || 0,
      completed: (userStats?.totalSpins || 0) >= 10,
      reward: '$5 bonus credit',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'spin_legend',
      title: 'Spin Legend',
      description: 'Complete 50 spins',
      icon: Crown,
      category: 'spins',
      target: 50,
      current: userStats?.totalSpins || 0,
      completed: (userStats?.totalSpins || 0) >= 50,
      reward: 'VIP status upgrade',
      color: 'from-yellow-500 to-orange-500'
    },
    // Spending Category
    {
      id: 'first_purchase',
      title: 'First Purchase',
      description: 'Make your first paid spin',
      icon: Medal,
      category: 'spending',
      target: 1,
      current: (userStats?.totalSpent || 0) > 0 ? 1 : 0,
      completed: (userStats?.totalSpent || 0) > 0,
      reward: '10% discount on next spin',
      color: 'from-emerald-500 to-green-500'
    },
    {
      id: 'big_spender',
      title: 'Big Spender',
      description: 'Spend $100 total',
      icon: Gift,
      category: 'spending',
      target: 100,
      current: userStats?.totalSpent || 0,
      completed: (userStats?.totalSpent || 0) >= 100,
      reward: 'Free spin voucher',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'high_roller',
      title: 'High Roller',
      description: 'Spend $500 total',
      icon: Trophy,
      category: 'spending',
      target: 500,
      current: userStats?.totalSpent || 0,
      completed: (userStats?.totalSpent || 0) >= 500,
      reward: 'Exclusive game access',
      color: 'from-red-500 to-pink-500'
    },
    // Wins Category
    {
      id: 'first_win',
      title: 'Lucky Beginner',
      description: 'Get your first win',
      icon: Star,
      category: 'wins',
      target: 1,
      current: userStats?.totalWins || 0,
      completed: (userStats?.totalWins || 0) >= 1,
      reward: 'Winner badge',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 'winning_streak',
      title: 'Winner',
      description: 'Get 5 wins total',
      icon: Award,
      category: 'wins',
      target: 5,
      current: userStats?.totalWins || 0,
      completed: (userStats?.totalWins || 0) >= 5,
      reward: 'Special prize category access',
      color: 'from-orange-500 to-red-500'
    },
    // Special Category
    {
      id: 'free_spin_user',
      title: 'Free Spirit',
      description: 'Use 3 free spins',
      icon: TrendingUp,
      category: 'special',
      target: 3,
      current: userStats?.freeSpins || 0,
      completed: (userStats?.freeSpins || 0) >= 3,
      reward: '2x free spin multiplier',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    setLocation('/');
    return null;
  }

  const completedAchievements = achievements.filter(a => a.completed);
  const progressAchievements = achievements.filter(a => !a.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <img src={logoPath} alt="Hit The Road Jackpot" className="h-8 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-white">Achievements</h1>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Achievement Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-900/70 to-orange-900/70 border-yellow-400/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-800/30 to-orange-800/30 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                  <Trophy className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Completed</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {completedAchievements.length}/{achievements.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/70 to-pink-900/70 border-purple-400/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-800/30 to-pink-800/30 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Star className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Progress</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {Math.round((completedAchievements.length / achievements.length) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900/70 to-cyan-900/70 border-blue-400/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 to-cyan-800/30 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <Award className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Next Goal</p>
                  <p className="text-lg font-black text-white drop-shadow-lg">
                    {progressAchievements.length > 0 ? progressAchievements[0].title : 'All Complete!'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Achievements */}
        {completedAchievements.length > 0 && (
          <Card className="mb-8 relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-green-600/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 blur-2xl"></div>
            <CardHeader className="relative">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent flex items-center">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mr-3 shadow-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                Completed Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedAchievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div 
                      key={achievement.id}
                      className={`p-6 bg-gradient-to-r ${achievement.color}/20 border border-green-400/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`p-3 bg-gradient-to-r ${achievement.color} rounded-xl shadow-lg`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 font-bold">
                          COMPLETED
                        </Badge>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">{achievement.title}</h3>
                      <p className="text-gray-200 text-sm mb-3">{achievement.description}</p>
                      {achievement.reward && (
                        <p className="text-green-400 text-sm font-medium">🎁 {achievement.reward}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* In Progress Achievements */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-600/40 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 blur-2xl"></div>
          <CardHeader className="relative">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mr-3 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {progressAchievements.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 blur-2xl rounded-full"></div>
                  <Trophy className="relative h-20 w-20 text-yellow-400 mx-auto drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">All Achievements Complete!</h3>
                <p className="text-gray-200 text-lg mb-8">Congratulations! You've unlocked everything!</p>
                <Button 
                  onClick={() => setLocation('/games')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  Keep Playing
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressAchievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  const progress = Math.min((achievement.current / achievement.target) * 100, 100);
                  return (
                    <div 
                      key={achievement.id}
                      className={`p-6 bg-gradient-to-r ${achievement.color}/10 border border-slate-600/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`p-3 bg-gradient-to-r ${achievement.color} opacity-70 rounded-xl shadow-lg`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <Badge className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 font-bold">
                          IN PROGRESS
                        </Badge>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">{achievement.title}</h3>
                      <p className="text-gray-200 text-sm mb-4">{achievement.description}</p>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">{achievement.current}/{achievement.target}</span>
                          <span className="text-gray-300">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-3 bg-slate-700" />
                      </div>
                      {achievement.reward && (
                        <p className="text-gray-400 text-sm font-medium">🎁 {achievement.reward}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}