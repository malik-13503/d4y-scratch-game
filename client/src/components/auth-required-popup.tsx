import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, CreditCard, Shield } from "lucide-react";

interface AuthRequiredPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: () => void;
  onLogin: () => void;
}

export function AuthRequiredPopup({ isOpen, onClose, onSignup, onLogin }: AuthRequiredPopupProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-2 border-yellow-400/40 text-white max-w-md shadow-2xl">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-xl ring-4 ring-yellow-400/30">
            <Shield className="h-10 w-10 text-white drop-shadow-lg" />
          </div>
          <AlertDialogTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-sm">
            Authentication Required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-100 text-lg leading-relaxed font-medium">
            To spin the wheel and win real prizes, you need to:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 my-6">
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-xl border-l-4 border-green-400 shadow-lg">
            <UserPlus className="h-6 w-6 text-green-400 drop-shadow-sm" />
            <span className="text-white font-medium text-base">Create your account or login</span>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-xl border-l-4 border-blue-400 shadow-lg">
            <CreditCard className="h-6 w-6 text-blue-400 drop-shadow-sm" />
            <span className="text-white font-medium text-base">Add a payment method for prize winnings</span>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-xl border-l-4 border-yellow-400 shadow-lg">
            <Shield className="h-6 w-6 text-yellow-400 drop-shadow-sm" />
            <span className="text-white font-medium text-base">Secure & verified gaming experience</span>
          </div>
        </div>

        <AlertDialogFooter className="flex-col space-y-3 sm:flex-col sm:space-x-0">
          <Button 
            onClick={onSignup}
            className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-4 text-lg shadow-xl ring-2 ring-yellow-400/30 hover:ring-yellow-400/50 transition-all duration-300"
          >
            <UserPlus className="h-5 w-5 mr-3" />
            Sign Up Now
          </Button>
          <Button 
            onClick={onLogin}
            variant="outline" 
            className="w-full border-2 border-yellow-400/60 text-yellow-300 hover:bg-yellow-400/20 hover:text-white font-semibold py-4 text-lg shadow-lg transition-all duration-300"
          >
            <LogIn className="h-5 w-5 mr-3" />
            I Have an Account
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}