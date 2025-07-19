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
      <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/30 text-white max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Authentication Required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300 text-base leading-relaxed">
            To spin the wheel and win real prizes, you need to:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 my-6">
          <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
            <UserPlus className="h-5 w-5 text-green-400" />
            <span className="text-gray-200">Create your account or login</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
            <CreditCard className="h-5 w-5 text-blue-400" />
            <span className="text-gray-200">Add a payment method for prize winnings</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
            <Shield className="h-5 w-5 text-purple-400" />
            <span className="text-gray-200">Secure & verified gaming experience</span>
          </div>
        </div>

        <AlertDialogFooter className="flex-col space-y-2 sm:flex-col sm:space-x-0">
          <Button 
            onClick={onSignup}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up Now
          </Button>
          <Button 
            onClick={onLogin}
            variant="outline" 
            className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10 py-3"
          >
            <LogIn className="h-4 w-4 mr-2" />
            I Have an Account
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}