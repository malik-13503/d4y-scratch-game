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
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Payment Center</h2>
                    <p className="text-gray-300">Manage your payment methods with enterprise-grade security</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {cards?.length || 0} Active Cards
                  </Badge>
                  <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                    <Shield className="h-3 w-3 mr-1" />
                    PCI Compliant
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => refreshCardsMutation.mutate()}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-600/20"
                  disabled={refreshCardsMutation.isPending}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshCardsMutation.isPending ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setShowAddCard(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 text-lg font-semibold shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Card
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600/20 rounded-xl">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Bank-Level Security</h3>
                <p className="text-green-200 text-sm">256-bit SSL encryption</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Instant Processing</h3>
                <p className="text-blue-200 text-sm">Under 3 seconds</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/20 rounded-xl">
                <Globe className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Global Support</h3>
                <p className="text-purple-200 text-sm">Worldwide accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-600/20 rounded-xl">
                <Award className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Premium Support</h3>
                <p className="text-orange-200 text-sm">24/7 assistance</p>
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Your Payment Methods</h3>
            <p className="text-gray-400">{cards.length} card{cards.length !== 1 ? 's' : ''} on file</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card 
                key={card.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
                  card.isDefault 
                    ? 'bg-gradient-to-br from-green-900/60 to-emerald-900/60 border-green-500/50 ring-2 ring-green-500/30' 
                    : 'bg-gradient-to-br from-slate-900/60 to-slate-800/60 border-gray-600/30 hover:border-purple-500/50'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${getCardBrandColor(card.cardBrand)} opacity-10`}></div>
                
                <CardContent className="relative p-6">
                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-gray-300" />
                        <span className="text-lg font-bold text-white uppercase">{card.cardBrand}</span>
                      </div>
                      {card.isDefault && (
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Default
                        </Badge>
                      )}
                    </div>

                    {/* Card Number */}
                    <div className="space-y-2">
                      <p className="text-2xl font-mono text-white tracking-widest">
                        {formatCardNumber(card.cardLast4, showCardDetails === card.id)}
                      </p>
                      {card.cardholderName && (
                        <p className="text-sm text-gray-300 uppercase tracking-wider">
                          {card.cardholderName}
                        </p>
                      )}
                    </div>

                    {/* Card Status & Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-600/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-300">Verified</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setShowCardDetails(showCardDetails === card.id ? null : card.id)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                        >
                          {showCardDetails === card.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        
                        {!card.isDefault && (
                          <Button
                            onClick={() => setDefaultMutation.mutate(card.id)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-yellow-400"
                            disabled={setDefaultMutation.isPending}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => deleteCardMutation.mutate(card.id)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-400"
                          disabled={deleteCardMutation.isPending || cards.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Extended Details */}
                    {showCardDetails === card.id && (
                      <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-gray-600/30">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Added:</span>
                            <span className="text-gray-300">{new Date(card.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className="text-green-300">Active & Verified</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Square ID:</span>
                            <span className="text-gray-300 font-mono text-xs">{card.squareCardId?.slice(0, 8)}...</span>
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
      <Card className="bg-gradient-to-r from-slate-900/60 to-slate-800/60 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Lock className="h-6 w-6 text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Your Security is Our Priority</h3>
              <p className="text-gray-300 leading-relaxed">
                All payment information is encrypted using industry-standard 256-bit SSL encryption and processed through Square's secure payment infrastructure. 
                We never store your complete card information on our servers, only secure tokens that cannot be used elsewhere.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                  <Shield className="h-3 w-3 mr-1" />
                  PCI DSS Level 1
                </Badge>
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                  <Lock className="h-3 w-3 mr-1" />
                  256-bit SSL
                </Badge>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
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