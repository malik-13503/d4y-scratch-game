import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, ArrowRight } from 'lucide-react';

interface QuickCardUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateComplete: () => void;
}

export function QuickCardUpdate({ isOpen, onClose, onUpdateComplete }: QuickCardUpdateProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoToDashboard = () => {
    // Navigate to dashboard payment cards section
    window.location.href = '/dashboard?tab=cards';
  };

  const handleUpdateLater = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Payment Method Update Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-gray-600 mb-4">
              To complete your purchase and continue playing, please update your payment card with the latest security features.
            </p>
            <p className="text-sm text-gray-500">
              This ensures secure processing of your payments and helps protect your account.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleGoToDashboard}
              className="w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              Update Payment Card
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleUpdateLater}
              className="w-full"
            >
              Update Later
            </Button>
          </div>
          
          <div className="text-xs text-gray-400 text-center">
            You'll be redirected to your dashboard where you can securely update your payment information.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}