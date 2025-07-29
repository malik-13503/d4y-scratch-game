import { AlertTriangle, Mail, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EmailErrorDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  email: string;
}

export function EmailErrorDialog({ open, onClose, onSwitchToLogin, email }: EmailErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-2 border-red-500/30 backdrop-blur-xl">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border-2 border-red-500/30">
            <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
          </div>
          
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Email Already Registered
          </DialogTitle>
          
          <DialogDescription className="text-gray-300 text-base leading-relaxed">
            An account with this email address already exists in our system.
          </DialogDescription>
        </DialogHeader>

        {/* Email Display */}
        <div className="bg-slate-800/50 border border-red-500/20 rounded-xl p-4 my-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Registered Email</p>
              <p className="text-white font-semibold break-all">{email}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onSwitchToLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
          >
            <span>Sign In Instead</span>
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-2 border-gray-600 text-gray-300 hover:bg-slate-800/50 hover:text-white py-3 rounded-xl transition-all duration-300"
          >
            Try Different Email
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <p className="text-sm text-gray-400">
            If you forgot your password, you can reset it on the login page.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}