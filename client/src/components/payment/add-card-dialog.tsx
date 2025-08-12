import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, CreditCard, Lock, Shield } from "lucide-react";

interface AddCardDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCardDialog({ onClose, onSuccess }: AddCardDialogProps) {
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
    zipCode: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const addCardMutation = useMutation({
    mutationFn: async (data: any) => {
      // In a real implementation, this would integrate with Square Web SDK
      // For now, we'll simulate the card creation process
      await apiRequest("POST", "/api/payment-cards", {
        cardLast4: data.cardNumber.slice(-4),
        cardBrand: getCardBrand(data.cardNumber),
        expiryMonth: parseInt(data.expiryMonth),
        expiryYear: parseInt(data.expiryYear),
        cardholderName: data.cardholderName,
        squareCardId: `sq-card-${Date.now()}`, // Would be from Square
        cardNonce: `cnon-${Date.now()}`, // Would be from Square
        isActive: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment card added successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment card",
        variant: "destructive",
      });
    },
  });

  const getCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s+/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    if (number.startsWith('6')) return 'Discover';
    return 'Unknown';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = "Please enter a valid card number";
    }
    
    if (!cardData.expiryMonth || parseInt(cardData.expiryMonth) < 1 || parseInt(cardData.expiryMonth) > 12) {
      newErrors.expiryMonth = "Invalid month";
    }
    
    if (!cardData.expiryYear || parseInt(cardData.expiryYear) < new Date().getFullYear()) {
      newErrors.expiryYear = "Invalid year";
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = "Invalid CVV";
    }
    
    if (!cardData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required";
    }
    
    if (!cardData.zipCode || cardData.zipCode.length < 5) {
      newErrors.zipCode = "Valid ZIP code required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      addCardMutation.mutate(cardData);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData(prev => ({ ...prev, cardNumber: formatted }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white/95 backdrop-blur-md border-white/20 w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Add Payment Card
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-gray-700">Card Number</Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                className={`${errors.cardNumber ? 'border-red-500' : ''}`}
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-sm">{errors.cardNumber}</p>
              )}
            </div>

            {/* Expiry Date and CVV */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth" className="text-gray-700">Month</Label>
                <Input
                  id="expiryMonth"
                  type="text"
                  placeholder="MM"
                  value={cardData.expiryMonth}
                  onChange={(e) => setCardData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                  maxLength={2}
                  className={`${errors.expiryMonth ? 'border-red-500' : ''}`}
                />
                {errors.expiryMonth && (
                  <p className="text-red-500 text-xs">{errors.expiryMonth}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear" className="text-gray-700">Year</Label>
                <Input
                  id="expiryYear"
                  type="text"
                  placeholder="YYYY"
                  value={cardData.expiryYear}
                  onChange={(e) => setCardData(prev => ({ ...prev, expiryYear: e.target.value }))}
                  maxLength={4}
                  className={`${errors.expiryYear ? 'border-red-500' : ''}`}
                />
                {errors.expiryYear && (
                  <p className="text-red-500 text-xs">{errors.expiryYear}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-gray-700">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                  maxLength={4}
                  className={`${errors.cvv ? 'border-red-500' : ''}`}
                />
                {errors.cvv && (
                  <p className="text-red-500 text-xs">{errors.cvv}</p>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardholderName" className="text-gray-700">Cardholder Name</Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder="John Doe"
                value={cardData.cardholderName}
                onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value }))}
                className={`${errors.cardholderName ? 'border-red-500' : ''}`}
              />
              {errors.cardholderName && (
                <p className="text-red-500 text-sm">{errors.cardholderName}</p>
              )}
            </div>

            {/* ZIP Code */}
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-gray-700">ZIP Code</Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="12345"
                value={cardData.zipCode}
                onChange={(e) => setCardData(prev => ({ ...prev, zipCode: e.target.value }))}
                maxLength={10}
                className={`${errors.zipCode ? 'border-red-500' : ''}`}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-sm">{errors.zipCode}</p>
              )}
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-blue-800 text-sm font-medium">Secure Payment</p>
                  <p className="text-blue-600 text-xs">
                    Your card information is encrypted and processed securely through Square.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={addCardMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={addCardMutation.isPending}
              >
                {addCardMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Adding...
                  </div>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Add Card
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}