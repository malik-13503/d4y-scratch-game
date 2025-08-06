import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Mail, LogIn } from "lucide-react";

interface EmailAlreadyExistsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  email: string;
}

export function EmailAlreadyExistsPopup({ 
  isOpen, 
  onClose, 
  onSwitchToLogin, 
  email 
}: EmailAlreadyExistsPopupProps) {
  const handleSwitchToLogin = () => {
    onSwitchToLogin();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 bg-gradient-to-br from-orange-900 via-red-900 to-orange-900 border-2 border-orange-400/50 overflow-hidden shadow-2xl">
        <DialogTitle className="sr-only">
          Email Already Registered
        </DialogTitle>
        <DialogDescription className="sr-only">
          This email address is already registered. Please use the login form instead.
        </DialogDescription>
        
        <div className="relative p-6 text-center">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-red-500/10 to-orange-400/10 animate-pulse"></div>
          
          <div className="relative z-10 space-y-6">
            {/* Warning Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <AlertTriangle className="h-16 w-16 text-orange-400 animate-bounce" />
                <div className="absolute inset-0 bg-orange-400 blur-xl opacity-30 animate-pulse"></div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-300 via-red-400 to-orange-300 bg-clip-text text-transparent">
                🚨 Email Already Registered!
              </h2>
              <p className="text-white/90 text-sm">
                An account already exists with this email address
              </p>
            </div>

            {/* Email Display */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-orange-400/30">
              <div className="flex items-center justify-center space-x-2">
                <Mail className="h-5 w-5 text-orange-400" />
                <span className="text-orange-200 font-medium text-sm break-all">
                  {email}
                </span>
              </div>
            </div>

            {/* Message */}
            <div className="text-center space-y-2">
              <p className="text-white/80 text-sm">
                This email is already in our system.
              </p>
              <p className="text-orange-200 text-sm font-medium">
                Please use the Login form to access your account.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleSwitchToLogin}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Switch to Login
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full bg-transparent border-orange-400/50 text-orange-200 hover:bg-orange-400/10 hover:border-orange-400 transition-all duration-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}