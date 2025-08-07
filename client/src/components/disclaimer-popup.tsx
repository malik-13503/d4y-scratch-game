import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DisclaimerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gameTitle?: string;
  isFreePlay?: boolean;
}

export function DisclaimerPopup({
  isOpen,
  onClose,
  onConfirm,
  gameTitle,
  isFreePlay = false,
}: DisclaimerPopupProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 text-4xl">🎯</div>
          <DialogTitle className="text-2xl font-bold text-white">
            {isFreePlay ? "No Purchase Necessary!" : "Play Responsibly!"}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base leading-relaxed mt-4">
            {isFreePlay
              ? "You get one free spin per game to enter this game. This lets you experience the game mechanics and see how the wheel works without any charge."
              : "Just a heads up — once you spin the wheel, your card will be instantly charged based on your pull. There are no refunds, so spin wisely and have fun!"
            }
          </DialogDescription>
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-sm text-gray-400">
              {isFreePlay
                ? "After your entry, sign up to play for real prizes! No purchase necessary - you get one free spin per game to enter this game."
                : `By continuing, you agree to these terms${gameTitle ? ` for ${gameTitle}` : ""}`
              }
            </p>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-slate-600 text-black-300 hover:bg-slate-700"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto ${
              isFreePlay 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            } text-white font-semibold`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Starting Game...
              </div>
            ) : (
              isFreePlay ? "Use Free Entry!" : "Let's Play!"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
