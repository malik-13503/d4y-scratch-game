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
  gameTitle: string;
}

export function DisclaimerPopup({
  isOpen,
  onClose,
  onConfirm,
  gameTitle,
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
            Play Responsibly!
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base leading-relaxed mt-4">
            Just a heads up — once you spin the wheel, your card will be
            instantly charged based on your pull. There are no refunds, so spin
            wisely and have fun!
          </DialogDescription>
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-sm text-gray-400">
              By continuing, you agree to these terms for{" "}
              <strong className="text-white">{gameTitle}</strong>
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
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Starting Game...
              </div>
            ) : (
              "Let's Play!"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
