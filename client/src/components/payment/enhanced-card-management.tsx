import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star, 
  Shield, 
  Lock,
  CheckCircle,
  AlertCircle,
  Zap,
  Globe,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  RefreshCw,
  Edit,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { AddCardDialog } from "./add-card-dialog";

interface PaymentCard {
  id: number;
  userId: number;
  squareCardId?: string;
  cardNonce?: string;
  cardLast4: string;
  cardBrand: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EnhancedCardManagement() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cards, isLoading, error } = useQuery<PaymentCard[]>({
    queryKey: ["/api/payment-cards"],
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (cardId: number) => {
      await apiRequest("PUT", `/api/payment-cards/${cardId}/set-default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-cards"] });
      toast({
        title: "Success",
        description: "Default payment card updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update default card",
        variant: "destructive",
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      await apiRequest("DELETE", `/api/payment-cards/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-cards"] });
      toast({
        title: "Success",
        description: "Payment card deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment card",
        variant: "destructive",
      });
    },
  });

  const refreshCardsMutation = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/payment-cards"] });
    },
    onSuccess: () => {
      toast({
        title: "Refreshed",
        description: "Payment cards updated successfully",
      });
    },
  });

  const getCardBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa': return 'from-blue-600 to-blue-800';
      case 'mastercard': return 'from-red-600 to-orange-600';
      case 'amex': return 'from-green-600 to-teal-600';
      case 'discover': return 'from-orange-600 to-yellow-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  const formatCardNumber = (last4: string, showFull: boolean = false) => {
    if (showFull) {
      return `**** **** **** ${last4}`;
    }
    return `****${last4}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 text-purple-400 animate-spin" />
            <p className="text-gray-400 text-lg">Loading your payment methods...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl"></div>
        <Card className="relative bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-purple-500/30">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Payment Center</h2>
                    <p className="text-sm sm:text-base text-gray-300 hidden sm:block">Manage your payment methods with enterprise-grade security</p>
                    <p className="text-xs text-gray-300 sm:hidden">Secure payment management</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <Badge className="bg-green-600/20 text-green-300 border-green-500/30 text-xs sm:text-sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {cards?.length || 0} Active Card{cards?.length !== 1 ? 's' : ''}
                  </Badge>
                  <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30 text-xs sm:text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    PCI Compliant
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => refreshCardsMutation.mutate()}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-600/20 w-full sm:w-auto"
                  disabled={refreshCardsMutation.isPending}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshCardsMutation.isPending ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setShowAddCard(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 sm:px-6 py-3 text-base sm:text-lg font-semibold shadow-lg w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="sm:hidden">Add Card</span>
                  <span className="hidden sm:inline">Add New Card</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-green-900/70 to-emerald-900/70 border-green-500/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-600/40 rounded-xl flex-shrink-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white">Bank-Level Security</h3>
                <p className="text-green-100 text-xs sm:text-sm font-medium">256-bit SSL encryption</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/70 to-cyan-900/70 border-blue-500/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-600/40 rounded-xl flex-shrink-0">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white">Instant Processing</h3>
                <p className="text-blue-100 text-xs sm:text-sm font-medium">Under 3 seconds</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/70 to-pink-900/70 border-purple-500/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-purple-600/40 rounded-xl flex-shrink-0">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white">Global Support</h3>
                <p className="text-purple-100 text-xs sm:text-sm font-medium">Worldwide accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/70 to-red-900/70 border-orange-500/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-orange-600/40 rounded-xl flex-shrink-0">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-orange-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white">Premium Support</h3>
                <p className="text-orange-100 text-xs sm:text-sm font-medium">24/7 assistance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Cards Display */}
      {error && (
        <Alert className="border-red-500/50 bg-red-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            Failed to load payment cards. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      )}

      {!cards || cards.length === 0 ? (
        <Card className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 border-gray-600/30">
          <CardContent className="p-12 text-center">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full">
                  <CreditCard className="h-12 w-12 text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">No Payment Methods Yet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Add your first payment method to start playing games and winning prizes. Your information is completely secure and encrypted.
                </p>
                <Button
                  onClick={() => setShowAddCard(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-3 text-lg font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Card
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white">Your Payment Methods</h3>
            <p className="text-sm sm:text-base text-gray-400">{cards.length} card{cards.length !== 1 ? 's' : ''} on file</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {cards.map((card) => (
              <Card 
                key={card.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
                  card.isDefault 
                    ? 'bg-gradient-to-br from-green-900/80 to-emerald-900/80 border-green-500/60 ring-2 ring-green-500/40' 
                    : 'bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-gray-500/50 hover:border-purple-500/60'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${getCardBrandColor(card.cardBrand)} opacity-5`}></div>
                
                <CardContent className="relative p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
                        <span className="text-base sm:text-lg font-bold text-white uppercase">{card.cardBrand}</span>
                      </div>
                      {card.isDefault && (
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30 text-xs">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Default
                        </Badge>
                      )}
                    </div>

                    {/* Card Number */}
                    <div className="space-y-2">
                      <p className="text-lg sm:text-2xl font-mono text-white tracking-widest font-bold">
                        {formatCardNumber(card.cardLast4, showCardDetails === card.id)}
                      </p>
                      {card.cardholderName && (
                        <p className="text-xs sm:text-sm text-gray-100 uppercase tracking-wider font-medium">
                          {card.cardholderName}
                        </p>
                      )}
                    </div>

                    {/* Card Status & Actions */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-500/40">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                        <span className="text-xs sm:text-sm text-green-200 font-semibold">Verified</span>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          onClick={() => setShowCardDetails(showCardDetails === card.id ? null : card.id)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white h-8 w-8 p-0"
                        >
                          {showCardDetails === card.id ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </Button>
                        
                        {!card.isDefault && (
                          <Button
                            onClick={() => setDefaultMutation.mutate(card.id)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-yellow-400 h-8 w-8 p-0"
                            disabled={setDefaultMutation.isPending}
                          >
                            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => deleteCardMutation.mutate(card.id)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
                          disabled={deleteCardMutation.isPending || cards.length === 1}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Extended Details */}
                    {showCardDetails === card.id && (
                      <div className="mt-4 p-4 bg-slate-900/80 rounded-xl border border-gray-500/40">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Added:</span>
                            <span className="text-white">{new Date(card.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Status:</span>
                            <span className="text-green-300 font-semibold">Active & Verified</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Square ID:</span>
                            <span className="text-white font-mono text-xs">{card.squareCardId?.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Additional Security Information */}
      <Card className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-blue-500/40">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-2 sm:p-3 bg-blue-600/30 rounded-xl flex-shrink-0">
              <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300" />
            </div>
            <div className="space-y-3 sm:space-y-2 w-full">
              <h3 className="text-lg sm:text-xl font-bold text-white">Your Security is Our Priority</h3>
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                All payment information is encrypted using industry-standard 256-bit SSL encryption and processed through Square's secure payment infrastructure. 
                We never store your complete card information on our servers, only secure tokens that cannot be used elsewhere.
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4">
                <Badge className="bg-green-600/30 text-green-200 border-green-500/40 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  PCI DSS Level 1
                </Badge>
                <Badge className="bg-blue-600/30 text-blue-200 border-blue-500/40 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  <Lock className="h-3 w-3 mr-1" />
                  256-bit SSL
                </Badge>
                <Badge className="bg-purple-600/30 text-purple-200 border-purple-500/40 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  SOC 2 Compliant
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Card Dialog */}
      {showAddCard && (
        <AddCardDialog 
          onClose={() => setShowAddCard(false)}
          onSuccess={() => {
            setShowAddCard(false);
            queryClient.invalidateQueries({ queryKey: ["/api/payment-cards"] });
          }}
        />
      )}
    </div>
  );
}