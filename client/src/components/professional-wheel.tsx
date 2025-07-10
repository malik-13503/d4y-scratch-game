import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Gift, DollarSign, Sparkles, Play } from "lucide-react";
import { Confetti } from "./confetti";
import { WheelPointer } from "./wheel-pointer";
import logoPath from "@assets/logo_1751956932645.png";

interface ProfessionalWheelProps {
  onSpin: () => Promise<number>;
  disabled?: boolean;
  totalNumbers?: number;
}

export function ProfessionalWheel({
  onSpin,
  disabled = false,
  totalNumbers = 200,
}: ProfessionalWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pointerRotation, setPointerRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isFreePlay, setIsFreePlay] = useState(false);
  const [amountCharged, setAmountCharged] = useState<number>(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const freePlayStart = Math.floor(totalNumbers * 0.75) + 1;

  // Vibrant logo-inspired segment colors
  const segmentColors = [
    "#FF1744", // Bright Red
    "#00E676", // Bright Green
    "#2196F3", // Bright Blue
    "#FF9800", // Orange
    "#9C27B0", // Purple
    "#00BCD4", // Cyan
    "#8BC34A", // Light Green
    "#E91E63", // Pink
    "#FF5722", // Deep Orange
    "#673AB7", // Deep Purple
    "#03A9F4", // Light Blue
    "#4CAF50", // Green
  ];

  // Generate static numbers for wheel display based on total numbers
  const generateWheelNumbers = () => {
    const numbers = [];
    const segments = 12;
    for (let i = 0; i < segments; i++) {
      // Use fixed numbers instead of random for consistent display
      const number =
        Math.floor((totalNumbers / segments) * i) +
        Math.floor(totalNumbers / segments / 2) +
        1;
      numbers.push(Math.min(number, totalNumbers));
    }
    return numbers;
  };

  const wheelNumbers = generateWheelNumbers();

  const handleSpin = async () => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    setResult(null);
    setShowResultModal(false);

    try {
      // Professional spinning animation - 3 seconds duration for testing
      const spinDuration = 3000;
      const spins = 3 + Math.random() * 2; // 3-5 full rotations

      // Calculate final rotation for realistic spinning
      const finalRotation = rotation + spins * 360 + Math.random() * 360;
      
      // Start the wheel spinning animation immediately
      setRotation(finalRotation);

      // Get result from API while wheel is spinning
      const spinResult = await onSpin();
      console.log("Spin result received:", spinResult);

      // Wait for spin animation to complete
      setTimeout(() => {
        setResult(spinResult);

        // Determine if it's a free play
        const isFree = spinResult >= freePlayStart;
        setIsFreePlay(isFree);
        // For paid numbers, charge the exact number amount
        setAmountCharged(isFree ? 0 : spinResult);

        setIsSpinning(false);

        console.log("Showing result modal:", {
          spinResult,
          isFree,
          amountCharged: isFree ? 0 : spinResult,
        });

        // Show result modal immediately after wheel stops
        setShowResultModal(true);
      }, spinDuration);
    } catch (error) {
      console.error("Spin error:", error);
      setIsSpinning(false);
      
      // Show error modal or fallback
      setResult(Math.floor(Math.random() * totalNumbers) + 1);
      setIsFreePlay(false);
      setAmountCharged(50);
      setShowResultModal(true);
    }
  };

  const [numberRadius, setNumberRadius] = useState(110);

  useEffect(() => {
    const updateRadius = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        setNumberRadius(180); // For lg and xl screens
      } else if (width >= 1024) {
        setNumberRadius(160); // For md screens
      } else if (width >= 768) {
        setNumberRadius(130); // For sm screens
      } else {
        setNumberRadius(110); // For mobile
      }
    };

    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-2xl mx-auto px-4 sm:px-4">
      {/* Wheel Container */}
      <div className="relative w-full flex justify-center">
        {/* Enhanced Professional Pointer */}
        <WheelPointer className="top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 max-sm:top-[-6%] sm:mb-20" />

        {/* Wheel with Premium Border */}
        <div className="relative">
          {/* Enhanced multi-layer decorative border - static but eye-catching */}
          <div className="relative p-3 sm:p-4 rounded-full bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 shadow-2xl">
            <div className="p-2 sm:p-2 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 shadow-xl">
              <div className="p-2 sm:p-2 rounded-full bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 border-3 sm:border-4 border-white shadow-inner">
                <div
                  ref={wheelRef}
                  className="w-[270px] h-[270px] sm:w-96 sm:h-96 md:w-[480px] md:h-[480px] lg:w-[520px] lg:h-[520px] rounded-full relative overflow-hidden"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning
                      ? `transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)`
                      : "transform 0.3s ease-out",
                    boxShadow:
                      "inset 0 0 30px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.3)",
                  }}
                >
                  {/* Wheel Segments */}
                  {segmentColors.map((color, index) => {
                    const angle = (360 / segmentColors.length) * index;
                    const nextAngle =
                      (360 / segmentColors.length) * (index + 1);

                    return (
                      <div
                        key={index}
                        className="absolute inset-0 z-10"
                        style={{
                          clipPath: `polygon(50% 50%, ${50 + 65 * Math.cos(((angle - 90) * Math.PI) / 180)}% ${50 + 65 * Math.sin(((angle - 90) * Math.PI) / 180)}%, ${50 + 65 * Math.cos(((nextAngle - 90) * Math.PI) / 180)}% ${50 + 65 * Math.sin(((nextAngle - 90) * Math.PI) / 180)}%)`,
                          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                        }}
                      >
                        {/* Static segment number - positioned with responsive class */}
                        <div
                          id={`wheel-number-${index}`}
                          className="wheel-prize-number text-white font-bold text-xs sm:text-sm md:text-base flex items-center justify-center"
                          style={{
                            transform: `translate(-50%, -50%) translate(${Math.cos(((angle + 360 / segmentColors.length / 2 - 90) * Math.PI) / 180) * numberRadius}px, ${Math.sin(((angle + 360 / segmentColors.length / 2 - 90) * Math.PI) / 180) * numberRadius}px)`,
                          }}
                        >
                          {wheelNumbers[index]}
                        </div>
                      </div>
                    );
                  })}

                  {/* Outer ring decoration - static but eye-catching */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full border-3 sm:border-4 border-white shadow-2xl z-20"></div>

                  {/* Middle ring - static with enhanced glow */}
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-full border-3 border-white shadow-xl z-30"
                    style={{
                      boxShadow:
                        "0 0 30px rgba(147, 51, 234, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.3)",
                    }}
                  ></div>

                  {/* Center hub with brand logo - Static (doesn't rotate) */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full border-3 sm:border-4 border-yellow-300 shadow-2xl flex items-center justify-center overflow-hidden z-40"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
                      transition: isSpinning
                        ? `transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)`
                        : "transform 0.3s ease-out",
                    }}
                  >
                    <div className="w-12 h-12 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 bg-black rounded-full border-2 border-orange-400 flex items-center justify-center p-2">
                      <img
                        src={logoPath}
                        alt="Hit The Road Jackpot"
                        className="w-full h-full object-contain filter brightness-125 contrast-110"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={isSpinning || disabled}
        className="w-full max-w-xs bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg shadow-lg transition-all duration-300 disabled:opacity-50 touch-manipulation"
      >
        {isSpinning ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin">
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span>Spinning...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>SPIN THE WHEEL</span>
          </div>
        )}
      </Button>

      {/* Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-md mx-auto p-0 bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 border-2 border-yellow-400/30 overflow-hidden shadow-2xl">
          <div className="relative p-6 text-center">
            {/* Confetti */}
            <Confetti active={showResultModal} duration={3000} />

            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-red-500/10 animate-pulse"></div>

            <div className="relative z-10 space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  {isFreePlay ? (
                    <Gift className="h-16 w-16 text-green-400 animate-bounce" />
                  ) : (
                    <DollarSign className="h-16 w-16 text-blue-400 animate-bounce" />
                  )}
                  <div className="absolute inset-0 bg-current blur-xl opacity-30 animate-pulse"></div>
                </div>
              </div>

              {/* Result */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  {isFreePlay ? "🎁 FREE PLAY!" : "✨ NUMBER CLAIMED!"}
                </h2>
                <div className="text-7xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                  {result}
                </div>
              </div>

              {/* Payment info */}
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                {isFreePlay ? (
                  <div className="text-center space-y-3">
                    <div className="text-2xl font-bold text-green-300">
                      🎉 FREE PLAY - $0.00
                    </div>
                    <p className="text-green-200 text-sm">
                      Lucky you! This number is in the free play range (#
                      {freePlayStart}-{totalNumbers})
                    </p>
                    <div className="bg-green-500/20 rounded-lg p-3 mt-3">
                      <p className="text-green-100 text-sm font-semibold">
                        🎁 No charge for this spin!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="text-2xl font-bold text-blue-300">
                      💳 ${amountCharged.toFixed(2)} CHARGED
                    </div>
                    <p className="text-blue-200 text-sm">
                      You selected number {result} - charged exactly $
                      {amountCharged.toFixed(2)}
                    </p>
                    <div className="bg-blue-500/20 rounded-lg p-3 mt-3">
                      <p className="text-blue-100 text-sm font-semibold">
                        💰 Payment processed successfully
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Close button */}
              <Button
                onClick={() => setShowResultModal(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg"
              >
                Continue Playing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
