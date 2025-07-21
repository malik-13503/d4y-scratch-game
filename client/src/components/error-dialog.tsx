import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle, Wifi, Server, CreditCard, User, RefreshCw } from "lucide-react";

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: string;
  title?: string;
  onRetry?: () => void;
}

export function ErrorDialog({ open, onOpenChange, error, title, onRetry }: ErrorDialogProps) {
  // Parse error type and provide appropriate messaging
  const getErrorInfo = (errorMessage: string) => {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('registration failed') || lowerError.includes('500')) {
      return {
        icon: <Server className="h-8 w-8 text-red-400" />,
        title: "Registration Issue",
        message: "We're having trouble creating your account right now. This is usually temporary.",
        suggestion: "Please try again in a moment. If the problem continues, contact support.",
        color: "from-red-500/20 to-orange-500/20",
        borderColor: "border-red-500/30"
      };
    }
    
    if (lowerError.includes('payment') || lowerError.includes('card')) {
      return {
        icon: <CreditCard className="h-8 w-8 text-yellow-400" />,
        title: "Payment Processing Error",
        message: "There was an issue processing your payment information.",
        suggestion: "Please check your card details and try again, or use a different payment method.",
        color: "from-yellow-500/20 to-orange-500/20",
        borderColor: "border-yellow-500/30"
      };
    }
    
    if (lowerError.includes('network') || lowerError.includes('connection')) {
      return {
        icon: <Wifi className="h-8 w-8 text-blue-400" />,
        title: "Connection Problem",
        message: "Unable to connect to our servers.",
        suggestion: "Please check your internet connection and try again.",
        color: "from-blue-500/20 to-cyan-500/20",
        borderColor: "border-blue-500/30"
      };
    }
    
    if (lowerError.includes('unauthorized') || lowerError.includes('login')) {
      return {
        icon: <User className="h-8 w-8 text-purple-400" />,
        title: "Authentication Required",
        message: "You need to log in to access this feature.",
        suggestion: "Please log in to your account and try again.",
        color: "from-purple-500/20 to-blue-500/20",
        borderColor: "border-purple-500/30"
      };
    }
    
    // Generic error
    return {
      icon: <AlertTriangle className="h-8 w-8 text-red-400" />,
      title: "Something Went Wrong",
      message: "An unexpected error occurred.",
      suggestion: "Please try again. If the problem persists, contact our support team.",
      color: "from-red-500/20 to-pink-500/20",
      borderColor: "border-red-500/30"
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <div className="relative overflow-hidden">
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${errorInfo.color} blur-2xl opacity-30`}></div>
          
          <DialogHeader className="relative space-y-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border ${errorInfo.borderColor} shadow-lg`}>
                {errorInfo.icon}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  {title || errorInfo.title}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="relative space-y-4 mt-6">
            <DialogDescription className="text-gray-300 text-base leading-relaxed">
              {errorInfo.message}
            </DialogDescription>
            
            <Alert className={`bg-gradient-to-r ${errorInfo.color} border ${errorInfo.borderColor} backdrop-blur-sm`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-white font-semibold">What You Can Do</AlertTitle>
              <AlertDescription className="text-gray-200 mt-2">
                {errorInfo.suggestion}
              </AlertDescription>
            </Alert>

            {/* Technical details (collapsed) */}
            <details className="mt-4">
              <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <code className="text-xs text-gray-300 break-all">
                  {error}
                </code>
              </div>
            </details>
          </div>

          <DialogFooter className="relative mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-600/50 hover:text-white"
            >
              Close
            </Button>
            {onRetry && (
              <Button
                onClick={() => {
                  onRetry();
                  onOpenChange(false);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}