import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { queryClient } from "@/lib/queryClient";
import { 
  ArrowLeft,
  CreditCard,
  Clock,
  DollarSign,
  Target,
  TrendingUp,
  Calendar,
  RefreshCw,
  Download,
  Filter
} from "lucide-react";
import logoPath from "@assets/logo_1751918412862.png";

export default function Transactions() {
  const [, setLocation] = useLocation();

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
  };
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Responsive Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            
            {/* Top Row: Back Button + Logo + Title */}
            <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/dashboard")}
                  className="text-gray-300 hover:text-white hover:bg-white/10 px-2 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                </Button>
                <img src={logoPath} alt="Hit The Road Jackpot" className="h-6 w-auto sm:h-8" />
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-lg">
                  Transaction History
                </h1>
              </div>
              
              {/* Mobile Refresh Button */}
              <Button
                onClick={refreshData}
                size="sm"
                className="sm:hidden bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg px-3"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Desktop Refresh Button */}
            <div className="hidden sm:flex">
              <Button
                onClick={refreshData}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Transaction Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900/70 to-cyan-900/70 border-blue-400/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 to-cyan-800/30 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <DollarSign className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Total Spent</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    ${transactions ? transactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0).toFixed(2) : '0.00'}
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
                  <Target className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Total Transactions</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {transactions ? transactions.length : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-900/70 to-green-900/70 border-emerald-400/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/30 to-green-800/30 blur-xl"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-lg font-black tracking-wide drop-shadow-lg">Average Spin</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    ${transactions && transactions.length > 0 ? (transactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) / transactions.length).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Transaction History */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-600/40 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 blur-2xl"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mr-3 shadow-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                Detailed Transaction History
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-500 text-white bg-slate-700/50 hover:bg-slate-600 hover:text-white font-medium"
                  disabled
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-500 text-white bg-slate-700/50 hover:bg-slate-600 hover:text-white font-medium"
                  disabled
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
                  <div className="absolute inset-0 animate-ping w-8 h-8 border-4 border-purple-400/30 rounded-full" />
                </div>
                <p className="ml-4 text-gray-200 font-medium">Loading transactions...</p>
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 to-gray-600/20 blur-2xl rounded-full"></div>
                  <CreditCard className="relative h-20 w-20 text-gray-400 mx-auto drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No Transactions Yet</h3>
                <p className="text-gray-200 text-lg mb-8">Start playing games to see your transaction history!</p>
                <Button 
                  onClick={() => setLocation('/games')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  Play Games
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600/30 hover:border-purple-500/30 transition-all duration-300 shadow-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full shadow-lg ${parseFloat(transaction.amount) === 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-cyan-500'}`}></div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <p className="text-white font-bold text-lg">
                            Spin Result: {transaction.spinResult ? transaction.spinResult : 'Processing'}
                          </p>
                          <Badge className={`${parseFloat(transaction.amount) === 0 ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"} text-white border-0 font-bold`}>
                            {parseFloat(transaction.amount) === 0 ? 'Free Spin' : 'Paid Spin'}
                          </Badge>
                        </div>
                        <p className="text-gray-200 flex items-center font-medium mt-1">
                          <Clock className="h-4 w-4 mr-2" />
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-2xl ${parseFloat(transaction.amount) === 0 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                        {parseFloat(transaction.amount) === 0 ? 'FREE' : `$${parseFloat(transaction.amount).toFixed(2)}`}
                      </p>
                      <p className="text-gray-300 text-sm">
                        Transaction ID: {transaction.id || `#${index + 1}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}