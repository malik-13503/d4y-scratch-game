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
  availableNumbers?: number[];
}

export const ProfessionalWheel = forwardRef<
  { triggerSpin: () => Promise<void> },
  ProfessionalWheelProps
>(({ onSpin, disabled = false, totalNumbers = 200, onInitiateSpin, availableNumbers: propAvailableNumbers = [] }, ref) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isFreePlay, setIsFreePlay] = useState(false);
  const [amountCharged, setAmountCharged] = useState<number>(0);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>(propAvailableNumbers);

  // Update available numbers when prop changes
  useEffect(() => {
    if (propAvailableNumbers.length > 0) {
      setAvailableNumbers(propAvailableNumbers);
    }
  }, [propAvailableNumbers]);

  const wheelRef = useRef<HTMLDivElement>(null);
  const freePlayStart = Math.floor(totalNumbers * 0.75) + 1;

  // Use actual available numbers as wheel segments (limit to 200 max)
  const wheelNumbers = availableNumbers.length > 0 ? availableNumbers.slice(0, 200) : 
    Array.from({ length: Math.min(12, totalNumbers) }, (_, i) => i + 1);

  // Calculate segment angle based on number of segments
  const segmentAngle = wheelNumbers.length > 0 ? 360 / wheelNumbers.length : 30;

  // Generate colors for dynamic segments
  const generateSegmentColors = (count: number) => {
    const baseColors = [
      "#FF1744", "#00E676", "#2196F3", "#FF9800", "#9C27B0", "#00BCD4",
      "#8BC34A", "#E91E63", "#FF5722", "#673AB7", "#03A9F4", "#4CAF50",
      "#FFC107", "#607D8B", "#795548", "#3F51B5", "#009688", "#CDDC39",
      "#F44336", "#FFEB3B", "#9E9E9E", "#FF5722", "#8BC34A", "#E91E63"
    ];
    
    return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
  };

  const segmentColors = generateSegmentColors(wheelNumbers.length);

  // Expose the handleSpin function for external triggers
  useImperativeHandle(ref, () => ({
    triggerSpin: async () => {
      await handleSpin();
    },
  }));

  // Fetch available numbers from API
  const fetchAvailableNumbers = async (gameId: number) => {
    try {
      const response = await fetch(`/api/games/${gameId}/available-numbers`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableNumbers(data.availableNumbers || []);
        return data.availableNumbers || [];
      }
    } catch (error) {
      console.error('Failed to fetch available numbers:', error);
    }
    return [];
  };

  // Initialize available numbers
  useEffect(() => {
    const path = window.location.pathname;
    const gameIdMatch = path.match(/\/game\/(\d+)/);
    
    if (gameIdMatch) {
      const gameId = parseInt(gameIdMatch[1]);
      fetchAvailableNumbers(gameId);
    }
  }, []);

  const handleSpin = async () => {
    if (isSpinning || disabled) return;

    if (onInitiateSpin) {
      onInitiateSpin();
    }

    setIsSpinning(true);
    setResult(null);
    setShowResultModal(false);

    // Freeze wheel numbers for consistent animation
    const frozenWheelNumbers = [...wheelNumbers];
    console.log("🎯 Spinning with", frozenWheelNumbers.length, "segments");

    // Reset wheel position
    setRotation(0);
    
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(0deg)`;
      wheelRef.current.style.transition = "none";
      await new Promise(resolve => setTimeout(resolve, 50));
      wheelRef.current.style.transition = "";
    }

    // Wait for rotation reset, then make API call and calculate precise landing
    setTimeout(async () => {
      let spinResult = null;
      let apiCallSuccessful = false;

      try {
        console.log("🎯 Making API call for spin result...");
        spinResult = await onSpin();
        apiCallSuccessful = true;
        console.log("🎯 API call successful, result:", spinResult);
      } catch (apiError) {
        console.error("🚨 API call failed:", apiError);
        apiCallSuccessful = false;
        spinResult = frozenWheelNumbers[0] || 1; // Safe fallback
      }

      // Calculate precise landing position
      const targetSegmentIndex = frozenWheelNumbers.findIndex(num => num === spinResult);
      const validTargetIndex = targetSegmentIndex !== -1 ? targetSegmentIndex : 0;
      
      // Calculate exact angle to land on target segment
      const segmentAngle = 360 / frozenWheelNumbers.length;
      const targetAngle = validTargetIndex * segmentAngle + (segmentAngle / 2);
      
      // Add multiple full rotations for dramatic effect (8+ rotations over 8 seconds)
      const totalRotations = 8 + Math.random() * 2; // 8-10 rotations
      const finalRotation = (totalRotations * 360) - targetAngle; // Negative to land on target
      
      console.log(`🎯 Landing on segment ${validTargetIndex} (number ${spinResult}) at angle ${targetAngle}°`);
      console.log(`🎯 Total rotation: ${finalRotation}°`);

      // Start 8-second spin animation
      setRotation(finalRotation);

      // Complete the spin sequence after exactly 8 seconds
      setTimeout(async () => {
        console.log("🎯 8-second spin completed, showing result...");
        
        setResult(spinResult);
        const isFree = spinResult >= freePlayStart;
        setIsFreePlay(isFree);
        setAmountCharged(isFree ? 0 : spinResult);
        
        // Show result modal
        setTimeout(() => {
          setShowResultModal(true);
          if (!apiCallSuccessful) {
            console.error("⚠️ Spin completed with API failure");
          }
        }, 200);
        
        // Release spinning state and refresh numbers
        setTimeout(async () => {
          setIsSpinning(false);
          
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
        
      }, 8000); // Exactly 8 seconds
      
    }, 200); // Wait for rotation reset
  };

  // Enhanced dynamic number radius with better positioning
  const [numberRadius, setNumberRadius] = useState(140);

  useEffect(() => {
    const updateRadius = () => {
      const width = window.innerWidth;
      const segmentCount = wheelNumbers.length;
      
      // Base radius calculation with better responsive scaling
      let baseRadius;
      if (width >= 1200) {
        baseRadius = 190;
      } else if (width >= 1024) {
        baseRadius = 170;
      } else if (width >= 768) {
        baseRadius = 140;
      } else {
        baseRadius = 120;
      }
      
      // More aggressive radius reduction for better number visibility with many segments
      if (segmentCount > 150) {
        baseRadius *= 0.65; // Much smaller for 150+ segments
      } else if (segmentCount > 100) {
        baseRadius *= 0.75; // Smaller for 100+ segments
      } else if (segmentCount > 50) {
        baseRadius *= 0.85; // Slightly smaller for 50+ segments
      }
      
      setNumberRadius(baseRadius);
    };

    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, [wheelNumbers.length]);

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-2xl mx-auto px-4 sm:px-4">
      {/* Wheel Container */}
      <div className="relative w-full flex justify-center">
        {/* Enhanced Professional Pointer */}
        <WheelPointer className="top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 max-sm:top-[-6%] sm:mb-20" />

        {/* Wheel with Premium Border */}
        <div className="relative">
          {/* Enhanced multi-layer decorative border */}
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
                        : "none",
                      boxShadow:
                        "inset 0 0 30px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.3)",
                    }}
                  >
                  {/* Dynamic Wheel Segments */}
                  {segmentColors.map((color, index) => {
                    const angle = segmentAngle * index;
                    const nextAngle = segmentAngle * (index + 1);

                    return (
                      <div
                        key={`segment-${wheelNumbers[index]}-${index}`}
                        className="absolute inset-0 z-10"
                        style={{
                          clipPath: `polygon(50% 50%, ${50 + 65 * Math.cos(((angle - 90) * Math.PI) / 180)}% ${50 + 65 * Math.sin(((angle - 90) * Math.PI) / 180)}%, ${50 + 65 * Math.cos(((nextAngle - 90) * Math.PI) / 180)}% ${50 + 65 * Math.sin(((nextAngle - 90) * Math.PI) / 180)}%)`,
                          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                        }}
                      >
                        {/* Perfectly positioned numbers within segments */}
                        <div
                          className="wheel-prize-number text-white font-black select-none pointer-events-none"
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            // Position number at 75% of the way from center to edge, perfectly centered in segment
                            transform: `translate(-50%, -50%) translate(${Math.cos(((angle + segmentAngle / 2 - 90) * Math.PI) / 180) * (numberRadius * 0.75)}px, ${Math.sin(((angle + segmentAngle / 2 - 90) * Math.PI) / 180) * (numberRadius * 0.75)}px) rotate(${-rotation}deg)`,
                            transition: isSpinning
                              ? `transform 8.0s cubic-bezier(0.25, 0.1, 0.25, 1.0)`
                              : "none",
                            width: wheelNumbers.length > 150 ? '18px' : wheelNumbers.length > 100 ? '22px' : wheelNumbers.length > 50 ? '28px' : '36px',
                            height: wheelNumbers.length > 150 ? '18px' : wheelNumbers.length > 100 ? '22px' : wheelNumbers.length > 50 ? '28px' : '36px',
                            fontSize: wheelNumbers.length > 150 ? '7px' : wheelNumbers.length > 100 ? '9px' : wheelNumbers.length > 50 ? '12px' : '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textShadow: '0 0 10px rgba(0,0,0,1), 2px 2px 6px rgba(0,0,0,0.9), -2px -2px 4px rgba(0,0,0,0.8)',
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,0.95)',
                            boxShadow: '0 0 15px rgba(255,255,255,0.4), inset 0 0 10px rgba(255,255,255,0.25)',
                            zIndex: 20,
                            fontWeight: '900',
                            letterSpacing: '-0.3px',
                            lineHeight: '1'
                          }}
                        >
                          {wheelNumbers[index]}
                        </div>
                      </div>
                    );
                  })}

                  {/* Center decoration */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full border-3 sm:border-4 border-white shadow-2xl z-20"></div>

                  {/* Middle ring */}
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-full border-3 border-white shadow-xl z-30"
                    style={{
                      boxShadow:
                        "0 0 30px rgba(147, 51, 234, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.3)",
                    }}
                  ></div>

                  {/* Center logo */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-white rounded-full border-2 border-gray-300 shadow-inner z-40 flex items-center justify-center">
                    <img
                      src={logoPath}
                      alt="Game Logo"
                      className="w-12 h-12 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain rounded-full"
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
        size="lg"
        className="w-full max-w-xs bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSpinning ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
            SPINNING...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            SPIN TO WIN!
          </>
        )}
      </Button>

      {/* Enhanced Segments Info */}
      <div className="text-center text-sm bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
        <div className="flex justify-center space-x-6 text-white/80">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"></div>
            <span className="font-medium">{wheelNumbers.length} Segments</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></div>
            <span className="font-medium">{availableNumbers.length} Available</span>
          </div>
        </div>
        {wheelNumbers.length > 100 && (
          <p className="text-xs text-purple-300 mt-2">
            High-density wheel mode active for optimal visibility
          </p>
        )}
      </div>

      {/* Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            🎉 Spin Complete!
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                {result}
              </div>
              
              {isFreePlay ? (
                <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                  <Gift className="w-6 h-6" />
                  <span className="text-xl font-semibold">Free Play!</span>
                  <Sparkles className="w-6 h-6" />
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-orange-600 dark:text-orange-400">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-xl font-semibold">
                    Charged: ${amountCharged}
                  </span>
                </div>
              )}
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                You landed on number {result}!
              </div>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {/* Confetti Effect */}
      <Confetti active={result !== null && showResultModal} />
    </div>
  );
});

ProfessionalWheel.displayName = "ProfessionalWheel";