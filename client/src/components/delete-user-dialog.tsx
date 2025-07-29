import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Trash2, User, Mail, Calendar, CreditCard } from "lucide-react";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt?: string;
    cardOnFile?: boolean;
  } | null;
  isDeleting: boolean;
}

export function DeleteUserDialog({
  isOpen,
  onClose,
  onConfirm,
  user,
  isDeleting,
}: DeleteUserDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 border-2 border-red-500/30 text-white max-w-md mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 animate-pulse rounded-lg"></div>
        
        <DialogHeader className="relative text-center pb-4">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-red-500/50 to-orange-500/50 blur-xl rounded-full animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-full shadow-2xl shadow-red-500/50">
                <AlertTriangle className="h-8 w-8 text-white drop-shadow-lg animate-bounce" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-black text-white mb-2 drop-shadow-lg">
            Delete User Account
          </DialogTitle>
          <DialogDescription className="text-red-300 text-base font-medium">
            This action cannot be undone. All user data will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <div className="relative space-y-4">
          {/* User Information Card */}
          <div className="bg-black/40 backdrop-blur-sm border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-gray-300 text-sm flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {user.email}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-end">
                <CreditCard className="h-3 w-3 mr-1" />
                <Badge
                  variant={user.cardOnFile ? "default" : "secondary"}
                  className={`text-xs ${
                    user.cardOnFile
                      ? "bg-green-500/20 text-green-300 border-green-500/30"
                      : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                  }`}
                >
                  {user.cardOnFile ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Warning Information */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Trash2 className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-200">
                <div className="font-semibold mb-2">This will permanently delete:</div>
                <ul className="space-y-1 text-xs">
                  <li>• User account and profile information</li>
                  <li>• All transaction history and payments</li>
                  <li>• Game participation records</li>
                  <li>• Spin results and activity logs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-700 hover:text-white"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg"
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}