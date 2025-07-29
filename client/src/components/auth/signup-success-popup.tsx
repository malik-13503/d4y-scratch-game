import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, LogIn, Trophy } from "lucide-react";

interface SignupSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginNow: () => void;
  userName: string;
}

export function SignupSuccessPopup({ 
  isOpen, 
  onClose, 
  onLoginNow, 
  userName 
}: SignupSuccessPopupProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[95vw] sm:max-w-md mx-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-2 border-purple-500/50 shadow-2xl backdrop-blur-sm p-4 sm:p-6">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 rounded-lg animate-pulse"></div>
        <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-6 sm:w-8 h-6 sm:h-8 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
        <div className="absolute -bottom-1 sm:-bottom-2 -left-1 sm:-left-2 w-4 sm:w-6 h-4 sm:h-6 bg-pink-400 rounded-full animate-pulse"></div>
        
        <div className="relative z-10">
          <AlertDialogHeader className="text-center space-y-3 sm:space-y-4">
            {/* Success Icon with Animation */}
            <div className="mx-auto w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle className="h-8 sm:h-10 w-8 sm:w-10 text-white" />
            </div>
            
            {/* Celebration Icons */}
            <div className="flex justify-center space-x-2 animate-pulse">
              <Sparkles className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-400" />
              <Trophy className="h-6 sm:h-7 w-6 sm:w-7 text-yellow-500" />
              <Sparkles className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-400" />
            </div>

            <AlertDialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent px-2">
              Welcome to Hit The Road Jackpot!
            </AlertDialogTitle>
            
            <AlertDialogDescription className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed px-2">
              <div className="space-y-2 sm:space-y-3">
                <p className="font-semibold text-white text-base sm:text-lg">
                  🎉 Congratulations, {userName}!
                </p>
                <p className="text-sm sm:text-base">
                  Your account has been created successfully! You're now part of our exclusive gaming community.
                </p>
                <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-lg p-3 sm:p-4 border border-purple-400/30">
                  <p className="text-xs sm:text-sm text-purple-200">
                    ✨ <strong>What's Next:</strong> Log in to access exciting games, win amazing prizes, and start your jackpot journey!
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col space-y-2 sm:space-y-3 mt-4 sm:mt-6 px-2">
            <Button 
              onClick={onLoginNow}
              className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-3 sm:py-4 text-base sm:text-lg shadow-xl ring-2 ring-green-400/30 hover:ring-green-400/50 transition-all duration-300 transform hover:scale-105"
            >
              <LogIn className="h-4 sm:h-5 w-4 sm:w-5 mr-2 sm:mr-3" />
              Login Now & Start Playing!
            </Button>
            
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full border-2 border-gray-400/40 text-gray-300 hover:bg-gray-400/20 hover:text-white font-semibold py-2 sm:py-3 text-sm sm:text-base shadow-lg transition-all duration-300 hover:border-gray-300/60"
            >
              Maybe Later
            </Button>
          </div>

          {/* Bottom decorative elements */}
          <div className="flex justify-center mt-3 sm:mt-4 space-x-2 opacity-60">
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-purple-400 rounded-full animate-ping"></div>
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-400 rounded-full animate-ping delay-75"></div>
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-pink-400 rounded-full animate-ping delay-150"></div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}