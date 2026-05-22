import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock, X, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthorizeNetFormProps {
  packageName: string;
  packagePrice: number;
  packageTokens: number;
  onSuccess: (opaqueDataDescriptor: string, opaqueDataValue: string) => void;
  onClose: () => void;
  isProcessing: boolean;
}

declare global {
  interface Window {
    Accept: {
      dispatchData: (
        secureData: {
          authData: { clientKey: string; apiLoginID: string };
          cardData: {
            cardNumber: string;
            month: string;
            year: string;
            cardCode: string;
          };
        },
        responseHandler: (response: {
          opaqueData?: { dataDescriptor: string; dataValue: string };
          messages: { resultCode: string; message: Array<{ text: string }> };
        }) => void
      ) => void;
    };
  }
}

export function AuthorizeNetForm({
  packageName,
  packagePrice,
  packageTokens,
  onSuccess,
  onClose,
  isProcessing,
}: AuthorizeNetFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [formError, setFormError] = useState("");
  const { toast } = useToast();
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const apiLoginId = import.meta.env.VITE_AUTHORIZE_NET_API_LOGIN_ID || "";
  const clientKey = import.meta.env.VITE_AUTHORIZE_NET_CLIENT_KEY || "";

  useEffect(() => {
    const existingScript = document.getElementById("authorize-net-accept");
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const isSandbox = import.meta.env.VITE_AUTHORIZE_NET_ENV !== "production";
    const scriptSrc = isSandbox
      ? "https://jstest.authorize.net/v1/Accept.js"
      : "https://js.authorize.net/v1/Accept.js";

    const script = document.createElement("script");
    script.id = "authorize-net-accept";
    script.src = scriptSrc;
    script.charset = "utf-8";
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      toast({ title: "Error", description: "Failed to load payment form. Please refresh.", variant: "destructive" });
    };
    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {};
  }, []);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!scriptLoaded || !window.Accept) {
      setFormError("Payment form is still loading. Please wait a moment.");
      return;
    }

    const rawCard = cardNumber.replace(/\s/g, "");
    if (rawCard.length < 13) { setFormError("Please enter a valid card number."); return; }
    if (!expiryMonth || !expiryYear) { setFormError("Please enter the expiry date."); return; }
    if (cvv.length < 3) { setFormError("Please enter a valid CVV."); return; }

    const secureData = {
      authData: { clientKey, apiLoginID: apiLoginId },
      cardData: {
        cardNumber: rawCard,
        month: expiryMonth.padStart(2, "0"),
        year: expiryYear.length === 2 ? `20${expiryYear}` : expiryYear,
        cardCode: cvv,
        ...(cardholderName ? { fullName: cardholderName } : {}),
      },
    };

    window.Accept.dispatchData(secureData as any, (response) => {
      if (response.messages.resultCode === "Error") {
        const errMsg = response.messages.message?.[0]?.text || "Card tokenization failed.";
        setFormError(errMsg);
        return;
      }
      if (response.opaqueData) {
        onSuccess(response.opaqueData.dataDescriptor, response.opaqueData.dataValue);
      } else {
        setFormError("Could not tokenize card. Please try again.");
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/40 shadow-2xl">
        <CardHeader className="relative pb-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/30 rounded-xl border border-purple-500/40">
              <CreditCard className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Secure Payment</CardTitle>
              <p className="text-gray-400 text-sm mt-0.5">
                {packageTokens} tokens — <span className="text-white font-bold">${packagePrice.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cardholder Name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Cardholder Name</label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full bg-slate-700/60 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-500"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Card Number</label>
              <input
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full bg-slate-700/60 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-500 font-mono"
              />
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Month</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  placeholder="MM"
                  maxLength={2}
                  className="w-full bg-slate-700/60 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-500 text-center font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Year</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="YY"
                  maxLength={4}
                  className="w-full bg-slate-700/60 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-500 text-center font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">CVV</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="•••"
                  maxLength={4}
                  className="w-full bg-slate-700/60 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-500 text-center font-mono"
                />
              </div>
            </div>

            {/* Error */}
            {formError && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                <p className="text-red-300 text-sm">{formError}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isProcessing || !scriptLoaded}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-200"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Processing Payment...</span>
                </div>
              ) : !scriptLoaded ? (
                <span>Loading payment form...</span>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Pay ${packagePrice.toFixed(2)} — Get {packageTokens} Tokens</span>
                </div>
              )}
            </Button>

            {/* Security badge */}
            <div className="flex items-center justify-center space-x-2 pt-1">
              <Shield className="h-3.5 w-3.5 text-green-400" />
              <p className="text-gray-500 text-xs">
                Secured by Authorize.net — your card data never touches our servers
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
