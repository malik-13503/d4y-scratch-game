import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Gift, DollarSign, Sparkles, Play } from "lucide-react";
import { Confetti } from "./confetti";
import { WheelPointer } from "./wheel-pointer";
import logoPath from "@assets/logo_1751956932645.png";

interface ProfessionalWheelProps {
  onSpin: () => Promise<number>;
  disabled?: boolean;
  totalNumbers?: number;
  onInitiateSpin?: () => void;
  gameData?: {
    id: number;
    totalNumbers: number;
    freePlayStart: number;
    freePlayEnd: number;
  };
}

export const ProfessionalWheel = forwardRef<
  { triggerSpin: () => Promise<void> },
  ProfessionalWheelProps
>(({ onSpin, disabled = false, totalNumbers = 200, onInitiateSpin, gameData }, ref) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pointerRotation, setPointerRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isFreePlay, setIsFreePlay] = useState(false);
  const [amountCharged, setAmountCharged] = useState<number>(0);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [claimedNumbers, setClaimedNumbers] = useState<number[]>([]);
  const [paymentFailed, setPaymentFailed] = useState(false);

  // Expose the handleSpin function for external triggers
  useImperativeHandle(ref, () => ({
    triggerSpin: async () => {
      await handleSpin();
    },
  }));

  const wheelRef = useRef<HTMLDivElement>(null);

  // Removed automatic free play logic - all spins are paid unless manually designated

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

  // Generate ALL wheel numbers in game range, showing "Claimed" for taken numbers
  const generateWheelNumbers = (): {number: number, isClaimed: boolean}[] => {
    const maxSegments = 50;
    const gameRange = gameData?.totalNumbers || totalNumbers;
    
    // Generate ALL numbers in the game range (1 to gameRange)
    const allNumbers: {number: number, isClaimed: boolean}[] = [];
    
    for (let i = 1; i <= gameRange; i++) {
      allNumbers.push({
        number: i,
        isClaimed: !availableNumbers.includes(i) && gameRange <= maxSegments
      });
    }
    
    // If game has more numbers than max segments, sample them evenly
    if (gameRange > maxSegments) {
      const sampledNumbers: {number: number, isClaimed: boolean}[] = [];
      for (let i = 0; i < maxSegments; i++) {
        const number = Math.floor((gameRange / maxSegments) * i) + 1;
        sampledNumbers.push({
          number: Math.min(number, gameRange),
          isClaimed: !availableNumbers.includes(Math.min(number, gameRange))
        });
      }
      return sampledNumbers;
    }
    
    return allNumbers;
  };

  const [wheelNumbers, setWheelNumbers] = useState<{number: number, isClaimed: boolean}[]>([]);

  // Fetch available numbers and calculate claimed numbers
  const fetchAvailableNumbers = async (gameId: number) => {
    try {
      const response = await fetch(`/api/games/${gameId}/available-numbers`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableNumbers(data.availableNumbers);
        
        // Calculate claimed numbers based on game range
        const range = gameData?.totalNumbers || totalNumbers;
        const claimed: number[] = [];
        for (let i = 1; i <= range; i++) {
          if (!data.availableNumbers.includes(i)) {
            claimed.push(i);
          }
        }
        setClaimedNumbers(claimed);
        
        return data.availableNumbers;
      }
    } catch (error) {
      console.error("Failed to fetch available numbers:", error);
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
        if (!isSpinning) {
          // Only refresh when not actively spinning
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
    setPaymentFailed(false);

    // Step 2: Freeze current wheel numbers during the entire spin
    const frozenWheelNumbers = [...wheelNumbers];

    // Step 3: Force complete rotation reset to ensure clean starting position
    setRotation(0);

    // Force a DOM reflow to ensure rotation reset is applied
    if (wheelRef.current) {
      wheelRef.current.style.transform = "rotate(0deg)";
      wheelRef.current.style.transition = "none";
      wheelRef.current.offsetHeight; // Force reflow
    }

    // Step 4: Get the number to spin to (without payment processing)
    setTimeout(async () => {
      let spinResult = null;
      let resultNumber: number;

      try {
        // Get just the number from the API (no payment yet)
        console.log("🎯 Getting spin number...");
        spinResult = await onSpin();
        
        // Extract the number from the result
        if (typeof spinResult === 'object' && spinResult && 'number' in spinResult) {
          resultNumber = (spinResult as any).number;
        } else if (typeof spinResult === 'number') {
          resultNumber = spinResult;
        } else {
          resultNumber = Number(spinResult);
        }
        
        console.log("🎯 Got spin number:", resultNumber);
      } catch (apiError) {
        console.error("🚨 Failed to get spin number:", apiError);
        // Use fallback random number
        if (availableNumbers.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableNumbers.length);
          resultNumber = availableNumbers[randomIndex];
        } else {
          resultNumber = Math.floor(Math.random() * totalNumbers) + 1;
        }
        console.log("🎯 Using fallback number:", resultNumber);
      }

      // Calculate precise landing position using FROZEN wheel numbers
      const segmentAngle = 360 / frozenWheelNumbers.length;
      let targetSegmentIndex = frozenWheelNumbers.findIndex(
        (wheelItem) => wheelItem.number === resultNumber,
      );

      if (targetSegmentIndex === -1 && frozenWheelNumbers.length < 50) {
        // If exact number not found and we have space, add it to the wheel
        frozenWheelNumbers.push({ number: resultNumber, isClaimed: false });
        targetSegmentIndex = frozenWheelNumbers.length - 1;
        setWheelNumbers([...frozenWheelNumbers]);
      } else if (targetSegmentIndex === -1) {
        // If wheel is full (50 segments), replace a random segment
        targetSegmentIndex = Math.floor(
          Math.random() * frozenWheelNumbers.length,
        );
        frozenWheelNumbers[targetSegmentIndex] = { number: resultNumber, isClaimed: false };
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
        wheelRef.current.style.transition =
          "transform 8.0s cubic-bezier(0.25, 0.1, 0.25, 1.0)";
        wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;
      }
      console.log("🎯 8-second wheel animation started - will land on:", {
        targetNumber: resultNumber,
        targetSegmentIndex,
        frozenNumbers: frozenWheelNumbers,
        finalRotation,
      });

      // Step 8: Complete the spin sequence after EXACTLY 8 seconds from animation start
      setTimeout(async () => {
        console.log("🎯 8-second spin completed, now processing payment...");

        // Set the result number for display
        setResult(resultNumber);
        setAmountCharged(resultNumber);

        // NOW process payment for the spun number
        let paymentSuccessful = false;
        try {
          console.log("💳 Processing payment for number", resultNumber);
          
          // Call the payment processing endpoint
          const paymentResponse = await fetch("/api/process-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              gameId: window.location.pathname.match(/\/game\/(\d+)/)?.[1],
              number: resultNumber
            })
          });

          if (paymentResponse.ok) {
            const paymentResult = await paymentResponse.json();
            if (paymentResult.success) {
              paymentSuccessful = true;
              setIsFreePlay(false);
              console.log("💳 Payment successful for number", resultNumber);
            } else {
              throw new Error(paymentResult.message || "Payment failed");
            }
          } else {
            const error = await paymentResponse.json();
            throw new Error(error.message || "Payment failed");
          }
        } catch (paymentError) {
          console.error("💳 Payment failed:", paymentError);
          setPaymentFailed(true);
          setIsFreePlay(false);
          
          // Show specific error message for card expiration
          if (paymentError instanceof Error && paymentError.message.includes('expired')) {
            console.log("💳 Card expired - user needs to update payment method");
          }
        }

        // Show result modal with payment outcome
        setTimeout(() => {
          setShowResultModal(true);
          if (!paymentSuccessful) {
            console.log("⚠️ Showing payment failure modal");
          }
        }, 500);

        // Only after modal is shown, release the spinning state and refresh numbers
        setTimeout(async () => {
          setIsSpinning(false);

          // Refresh available numbers if payment was successful
          if (paymentSuccessful) {
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
  const [isMobile, setIsMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const updateRadius = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width < 768);

      if (width >= 1200) {
        setNumberRadius(180); // For lg and xl screens
      } else if (width >= 1024) {
        setNumberRadius(160); // For md screens
      } else if (width >= 768) {
        setNumberRadius(120); // For sm screens
      } else {
        setNumberRadius(95); // Reduced for mobile - better spacing
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
                    {/* Wheel Segments - up to 50 segments */}
                    {wheelNumbers.map((wheelItem, index) => {
                      const segmentCount = wheelNumbers.length;
                      const angle = (360 / segmentCount) * index;
                      const nextAngle = (360 / segmentCount) * (index + 1);
                      const colorIndex = index % segmentColors.length;
                      const color = segmentColors[colorIndex];
                      const number = wheelItem.number;
                      const isClaimed = wheelItem.isClaimed;
                      const isAvailable = !isClaimed;
                      


                      return (
                        <div
                          key={index}
                          className="absolute inset-0 z-10"
                          style={{
                            clipPath: `polygon(50% 50%, ${50 + 65 * Math.cos(((angle - 90) * Math.PI) / 180)}% ${50 + 65 * Math.sin(((angle - 90) * Math.PI) / 180)}%, ${50 + 65 * Math.cos(((nextAngle - 90) * Math.PI) / 180)}% ${50 + 65 * Math.sin(((nextAngle - 90) * Math.PI) / 180)}%)`,
                            background: `linear-gradient(135deg, ${color}, ${color}dd)`, // Keep original colors always
                            opacity: 1,
                          }}
                        >
                          {/* Always upright number - counter-rotates exactly to stay readable */}
                          <div
                            id={`wheel-number-${index}`}
                            className={`wheel-prize-number font-bold flex items-center justify-center ${
                              isAvailable ? "text-white" : "text-gray-400"
                            }`}
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: "50%",
                              transform: `translate(-50%, -50%) translate(${Math.cos(((angle + 360 / segmentCount / 2 - 90) * Math.PI) / 180) * (numberRadius * 1.15)}px, ${Math.sin(((angle + 360 / segmentCount / 2 - 90) * Math.PI) / 180) * (numberRadius * 1.15)}px) rotate(${-rotation}deg)`,
                              transition: isSpinning
                                ? `transform 8.0s cubic-bezier(0.25, 0.1, 0.25, 1.0)`
                                : "none",
                              // Smaller black circles for better visibility
                              width: (() => {
                                const is3Digit = number >= 100;
                                if (isMobile) {
                                  if (is3Digit)
                                    return segmentCount > 40
                                      ? "18px"
                                      : segmentCount > 30
                                        ? "20px"
                                        : "22px";
                                  return segmentCount > 40
                                    ? "15px"
                                    : segmentCount > 30
                                      ? "17px"
                                      : "19px";
                                } else {
                                  if (is3Digit)
                                    return segmentCount > 40
                                      ? "24px"
                                      : segmentCount > 30
                                        ? "26px"
                                        : "28px";
                                  return segmentCount > 40
                                    ? "20px"
                                    : segmentCount > 30
                                      ? "22px"
                                      : "24px";
                                }
                              })(),
                              height: (() => {
                                const is3Digit = number >= 100;
                                if (isMobile) {
                                  if (is3Digit)
                                    return segmentCount > 40
                                      ? "18px"
                                      : segmentCount > 30
                                        ? "20px"
                                        : "22px";
                                  return segmentCount > 40
                                    ? "15px"
                                    : segmentCount > 30
                                      ? "17px"
                                      : "19px";
                                } else {
                                  if (is3Digit)
                                    return segmentCount > 40
                                      ? "24px"
                                      : segmentCount > 30
                                        ? "26px"
                                        : "28px";
                                  return segmentCount > 40
                                    ? "20px"
                                    : segmentCount > 30
                                      ? "22px"
                                      : "24px";
                                }
                              })(),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                              textShadow: "2px 2px 4px rgba(0,0,0,0.9)",
                              backgroundColor: isAvailable
                                ? "rgba(0,0,0,0.7)"
                                : "rgba(0,0,0,0.8)",
                              borderRadius: "50%",
                              border: isAvailable
                                ? "1px solid rgba(255,255,255,0.5)"
                                : "1px solid rgba(156,163,175,0.7)",
                              zIndex: 15,
                              // Enhanced font sizing for 3-digit numbers
                              fontSize: (() => {
                                const is3Digit = number >= 100;
                                if (isMobile) {
                                  if (is3Digit)
                                    return segmentCount > 40
                                      ? "8px"
                                      : segmentCount > 30
                                        ? "9px"
                                        : "10px";
                                  return segmentCount > 40
                                    ? "9px"
                                    : segmentCount > 30
                                      ? "10px"
                                      : "11px";
                                } else {
                                  if (is3Digit)
                                    return segmentCount > 40
                                      ? "10px"
                                      : segmentCount > 30
                                        ? "11px"
                                        : "12px";
                                  return segmentCount > 40
                                    ? "11px"
                                    : segmentCount > 30
                                      ? "12px"
                                      : "13px";
                                }
                              })(),
                              fontWeight: "800",
                              lineHeight: "1",
                              letterSpacing: number >= 100 ? "-0.5px" : "0",
                            }}
                          >
                            <div style={{ fontSize: 'inherit', lineHeight: '1' }}>
                              {number}
                            </div>
                          </div>

                          {/* Tick symbol for claimed numbers - positioned in center of segment */}
                          {isClaimed && (
                            <div
                              className="absolute"
                              style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: `translate(-50%, -50%) translate(${Math.cos(((angle + 360 / segmentCount / 2 - 90) * Math.PI) / 180) * (numberRadius * 0.7)}px, ${Math.sin(((angle + 360 / segmentCount / 2 - 90) * Math.PI) / 180) * (numberRadius * 0.7)}px) rotate(${-rotation}deg)`,
                                transition: isSpinning
                                  ? `transform 8.0s cubic-bezier(0.25, 0.1, 0.25, 1.0)`
                                  : "none",
                                width: isMobile ? "18px" : "22px",
                                height: isMobile ? "18px" : "22px",
                                borderRadius: "50%",
                                backgroundColor: "rgb(34, 197, 94)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: isMobile ? "9px" : "11px",
                                color: "white",
                                fontWeight: "bold",
                                border: "2px solid white",
                                boxShadow: "0 0 8px rgba(34, 197, 94, 0.8)",
                                zIndex: 25,
                              }}
                            >
                              ✓
                            </div>
                          )}

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
                      boxShadow:
                        "0 0 30px rgba(234, 179, 8, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.3)",
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
        aria-label={
          isSpinning
            ? "Wheel is spinning, please wait"
            : "Spin the wheel to play"
        }
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
              : `You got number ${result} and were charged $${amountCharged.toFixed(2)}`}
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
                  {paymentFailed ? "❌ PAYMENT FAILED!" : isFreePlay ? "🎁 FREE PLAY!" : "✨ NUMBER CLAIMED!"}
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
                {paymentFailed ? (
                  <div className="text-center space-y-3">
                    <div className="text-2xl font-bold text-red-300">
                      ❌ PAYMENT FAILED
                    </div>
                    <p className="text-red-200 text-sm">
                      Your payment account doesn't have sufficient funds to claim number {result}
                    </p>
                    <div className="bg-red-500/20 rounded-lg p-3 mt-3">
                      <p className="text-red-100 text-sm font-semibold">
                        💰 Please try again to top up your balance and play again
                      </p>
                    </div>
                  </div>
                ) : isFreePlay ? (
                  <div className="text-center space-y-3">
                    <div className="text-2xl font-bold text-green-300">
                      🎉 No Purchase Necessary - $0.00
                    </div>
                    <p className="text-green-200 text-sm">
                      You get one free spin per game to enter this game
                    </p>
                    <div className="bg-green-500/20 rounded-lg p-3 mt-3">
                      <p className="text-green-100 text-sm font-semibold">
                        🎁 No charge for this entry!
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
