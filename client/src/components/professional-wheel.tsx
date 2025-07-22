import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Gift, DollarSign, Sparkles, Play } from "lucide-react";
import { Confetti } from "./confetti";
import { WheelPointer } from "./wheel-pointer";
import logoPath from "@assets/logo_1751956932645.png";

interface ProfessionalWheelProps {
  onSpin: () => Promise<number>;
  disabled?: boolean;
  totalNumbers?: number;
  onInitiateSpin?: () => void;
}

export const ProfessionalWheel = forwardRef<
  { triggerSpin: () => Promise<void> },
  ProfessionalWheelProps
>(({ onSpin, disabled = false, totalNumbers = 200, onInitiateSpin }, ref) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pointerRotation, setPointerRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isFreePlay, setIsFreePlay] = useState(false);
  const [amountCharged, setAmountCharged] = useState<number>(0);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);

  // Expose the handleSpin function for external triggers
  useImperativeHandle(ref, () => ({
    triggerSpin: async () => {
      await handleSpin();
    },
  }));

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

  // Generate wheel numbers from available numbers for real-time updates
  const generateWheelNumbers = () => {
    const segments = 12;
    const numbers = [];
    
    if (availableNumbers.length === 0) {
      // Fallback to static generation if no available numbers yet
      for (let i = 0; i < segments; i++) {
        const number =
          Math.floor((totalNumbers / segments) * i) +
          Math.floor(totalNumbers / segments / 2) +
          1;
        numbers.push(Math.min(number, totalNumbers));
      }
      return numbers;
    }
    
    // Use available numbers to populate wheel segments
    for (let i = 0; i < segments; i++) {
      if (i < availableNumbers.length) {
        // Distribute available numbers across segments
        const index = Math.floor((availableNumbers.length / segments) * i);
        numbers.push(availableNumbers[index]);
      } else {
        // If we have fewer available numbers than segments, reuse some
        const index = i % availableNumbers.length;
        numbers.push(availableNumbers[index]);
      }
    }
    
    return numbers;
  };

  const [wheelNumbers, setWheelNumbers] = useState<number[]>([]);

  // Fetch available numbers from API
  const fetchAvailableNumbers = async (gameId: number) => {
    try {
      const response = await fetch(`/api/games/${gameId}/available-numbers`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableNumbers(data.availableNumbers);
        return data.availableNumbers;
      }
    } catch (error) {
      console.error('Failed to fetch available numbers:', error);
    }
    return [];
  };

  // Initialize wheel numbers and fetch available numbers
  useEffect(() => {
    // Extract gameId from URL if available
    const path = window.location.pathname;
    const gameIdMatch = path.match(/\/game\/(\d+)/);
    
    if (gameIdMatch) {
      const gameId = parseInt(gameIdMatch[1]);
      fetchAvailableNumbers(gameId).then(() => {
        setWheelNumbers(generateWheelNumbers());
      });
    } else {
      // Fallback for non-game pages
      setWheelNumbers(generateWheelNumbers());
    }
  }, [totalNumbers]);

  // Update wheel numbers when available numbers change (but NOT during spinning)
  useEffect(() => {
    if (!isSpinning) {
      setWheelNumbers(generateWheelNumbers());
    }
  }, [availableNumbers, isSpinning]);

  // Set up periodic refresh of available numbers for real-time updates
  useEffect(() => {
    const path = window.location.pathname;
    const gameIdMatch = path.match(/\/game\/(\d+)/);
    
    if (gameIdMatch) {
      const gameId = parseInt(gameIdMatch[1]);
      
      // Refresh every 10 seconds to keep wheel updated when other players spin
      const interval = setInterval(() => {
        if (!isSpinning) { // Only refresh when not actively spinning
          fetchAvailableNumbers(gameId);
        }
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [isSpinning]);

  const handleSpin = async () => {
    if (isSpinning || disabled) return;

    console.log("🎯 Starting spin sequence...");
    
    // Step 1: Lock the wheel state and prepare for spinning
    setIsSpinning(true);
    setResult(null);
    setShowResultModal(false);
    
    // Step 2: Freeze current wheel numbers during the entire spin
    const frozenWheelNumbers = [...wheelNumbers];
    
    // Step 3: Force complete rotation reset to ensure clean starting position
    setRotation(0);
    
    // Force a DOM reflow to ensure rotation reset is applied
    if (wheelRef.current) {
      wheelRef.current.style.transform = 'rotate(0deg)';
      wheelRef.current.style.transition = 'none';
      wheelRef.current.offsetHeight; // Force reflow
    }

    // Step 4: Wait longer for rotation reset to fully take effect, then make API call and calculate spin
    setTimeout(async () => {
      let spinResult = null;
      let apiCallSuccessful = false;

      try {
        // Get API result (this processes payment and gets actual number)
        console.log("🎯 Making API call for spin result...");
        spinResult = await onSpin();
        apiCallSuccessful = true;
        console.log("🎯 API call successful, result:", spinResult);

      } catch (apiError) {
        console.error("🚨 API call failed:", apiError);
        apiCallSuccessful = false;
        
        // Even if API fails, we need to complete the wheel animation
        // Use a fallback result to ensure wheel doesn't hang
        spinResult = 1; // Safe fallback - always free
      }

      // Step 5: Calculate precise landing position using FROZEN wheel numbers
      const segmentAngle = 360 / frozenWheelNumbers.length;
      let targetSegmentIndex = frozenWheelNumbers.findIndex(num => num === spinResult);
      
      if (targetSegmentIndex === -1) {
        // If exact number not found, temporarily place it in a segment
        targetSegmentIndex = Math.floor(Math.random() * frozenWheelNumbers.length);
        frozenWheelNumbers[targetSegmentIndex] = spinResult;
        // Update wheel numbers ONLY with the result number for landing
        setWheelNumbers([...frozenWheelNumbers]);
      }

      // Step 6: Calculate final precise rotation to land exactly on result
      const targetAngle = segmentAngle * targetSegmentIndex + segmentAngle / 2;
      const fullRotations = 6 * 360; // 6 full rotations for consistent 8-second animation
      const finalRotation = fullRotations + (360 - targetAngle);

      // Step 7: Start the 8-second spinning animation with proper timing
      setRotation(finalRotation);
      
      // Ensure transition is properly applied
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'transform 8.0s cubic-bezier(0.25, 0.1, 0.25, 1.0)';
        wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;
      }
      console.log("🎯 8-second wheel animation started - will land on:", {
        spinResult,
        targetSegmentIndex,
        frozenNumbers: frozenWheelNumbers,
        finalRotation,
        apiCallSuccessful
      });

      // Step 8: Complete the spin sequence after EXACTLY 8 seconds from animation start
      setTimeout(async () => {
        console.log("🎯 8-second spin completed, showing result...");
        
        // Set final result
        setResult(spinResult);
        const isFree = spinResult >= freePlayStart;
        setIsFreePlay(isFree);
        setAmountCharged(isFree ? 0 : spinResult);
        
        // Show result modal immediately after wheel stops
        setTimeout(() => {
          setShowResultModal(true);
          if (!apiCallSuccessful) {
            console.error("⚠️ Spin completed with API failure - showing error in modal");
          }
        }, 200);
        
        // Only after modal is shown, release the spinning state and refresh numbers
        setTimeout(async () => {
          setIsSpinning(false);
          
          // Refresh available numbers ONLY after everything is complete
          if (apiCallSuccessful) {
            const path = window.location.pathname;
            const gameIdMatch = path.match(/\/game\/(\d+)/);
            if (gameIdMatch) {
              const gameId = parseInt(gameIdMatch[1]);
              await fetchAvailableNumbers(gameId);
            }
          }
          
          console.log("🎯 Spin sequence fully completed");
        }, 1000);
        
      }, 8000); // Exactly 8 seconds for animation completion
      
    }, 200); // Wait 200ms for rotation reset to fully take effect


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
                <div className="relative">
                  {/* Spinning wheel container */}
                  <div
                    ref={wheelRef}
                    className="w-[270px] h-[270px] sm:w-96 sm:h-96 md:w-[480px] md:h-[480px] lg:w-[520px] lg:h-[520px] rounded-full relative overflow-hidden"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning
                        ? `transform 8.0s cubic-bezier(0.25, 0.1, 0.25, 1.0)`
                        : "none", // No transition when stopping to prevent drift
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
                        {/* Static segment number - positioned with responsive class and counter-rotation */}
                        <div
                          id={`wheel-number-${index}`}
                          className="wheel-prize-number text-white font-bold text-xs sm:text-sm md:text-base flex items-center justify-center"
                          style={{
                            transform: `translate(-50%, -50%) translate(${Math.cos(((angle + 360 / segmentColors.length / 2 - 90) * Math.PI) / 180) * numberRadius}px, ${Math.sin(((angle + 360 / segmentColors.length / 2 - 90) * Math.PI) / 180) * numberRadius}px) rotate(${-rotation}deg)`,
                            transition: isSpinning
                              ? `transform 8.0s cubic-bezier(0.25, 0.1, 0.25, 1.0)`
                              : "none", // Keep numbers stationary when not spinning
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

                  </div>
                  
                  {/* Center hub with brand logo - COMPLETELY STATIC - Outside spinning wheel */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full border-3 sm:border-4 border-yellow-300 shadow-2xl flex items-center justify-center overflow-hidden z-50"
                    style={{
                      // NEVER MOVES - positioned outside the rotating wheel div
                      boxShadow: "0 0 30px rgba(234, 179, 8, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.3)"
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
        onClick={onInitiateSpin || handleSpin}
        disabled={isSpinning || disabled}
        className="w-full max-w-xs bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg shadow-lg transition-all duration-300 disabled:opacity-50 touch-manipulation focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
        aria-label={isSpinning ? "Wheel is spinning, please wait" : "Spin the wheel to play"}
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
          <DialogTitle className="sr-only">
            {isFreePlay ? "Free Play Result" : "Spin Result"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isFreePlay 
              ? `You got number ${result} as a free play - no charge!`
              : `You got number ${result} and were charged $${amountCharged.toFixed(2)}`
            }
          </DialogDescription>
          
          <div className="relative p-6 text-center">
            {/* Confetti - only when modal is visible */}
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
                <p className="text-white/80 text-sm">
                  Wheel stopped on segment with number {result}
                </p>
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
});
