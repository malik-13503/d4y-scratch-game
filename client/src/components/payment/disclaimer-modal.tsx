import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, CreditCard, Shield } from "lucide-react";

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  gameInfo?: {
    name: string;
    prizeValue: number;
    chargeAmount: number;
  };
}

export function DisclaimerModal({ isOpen, onClose, onAgree, gameInfo }: DisclaimerModalProps) {
  const [agreed, setAgreed] = useState(false);

  const handleAgree = () => {
    if (agreed) {
      onAgree();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            🎯 Play Responsibly!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-2">Important Notice:</p>
                <p>
                  Just a heads up — once you spin the wheel, your card will be 
                  instantly charged based on your pull. There are no refunds, 
                  so spin wisely and have fun!
                </p>
              </div>
            </div>
          </div>

          {gameInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CreditCard className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Game Details:</p>
                  <p>Game: {gameInfo.name}</p>
                  <p>Prize Value: ${gameInfo.prizeValue}</p>
                  <p>Charge Amount: ${gameInfo.chargeAmount}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Your Security:</p>
                <p>
                  All payments are processed securely through Square. 
                  Your card information is encrypted and protected.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agree" className="text-sm font-medium text-gray-700">
              I understand and agree to these terms
            </label>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAgree}
            disabled={!agreed}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Let's Play! 🎮
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}