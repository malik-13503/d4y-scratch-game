import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Gift, DollarSign, Sparkles, Play } from "lucide-react";
import { Confetti } from "./confetti";

interface ProfessionalWheelProps {
  onSpin: () => Promise<number>;
  disabled?: boolean;
  totalNumbers?: number;
}

export function ProfessionalWheel({ 
  onSpin, 
  disabled = false, 
  totalNumbers = 200 
}: ProfessionalWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isFreePlay, setIsFreePlay] = useState(false);
  const [amountCharged, setAmountCharged] = useState<number>(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const freePlayStart = Math.floor(totalNumbers * 0.75) + 1;
  
  // Professional wheel colors - vibrant and visually appealing
  const segmentColors = [
    "#FF4757", // Bright Red
    "#2ED573", // Vibrant Green  
    "#3742FA", // Electric Blue
    "#FF6348", // Orange Red
    "#FFD32A", // Golden Yellow
    "#A55EEA", // Purple
    "#26D0CE", // Turquoise
    "#FF3838", // Crimson
    "#20BF6B", // Emerald Green
    "#0984e3", // Royal Blue
    "#FD79A8", // Pink
    "#00B894"  // Teal
  ];
  
  // Sample numbers for wheel display - more varied range
  const wheelNumbers = [15, 47, 182, 9, 156, 78, 195, 23, 167, 91, 189, 34];

  const handleSpin = async () => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    setResult(null);
    setShowResultModal(false);

    // Professional spinning animation - 8 seconds duration
    const spinDuration = 8000;
    const spins = 8 + Math.random() * 4; // 8-12 full rotations
    const finalRotation = rotation + (spins * 360);
    
    setRotation(finalRotation);

    // Get result from API
    const resultPromise = onSpin();
    
    // Wait for spin animation to complete
    setTimeout(async () => {
      try {
        const spinResult = await resultPromise;
        setResult(spinResult);
        
        // Determine if it's a free play
        const isFree = spinResult >= freePlayStart;
        setIsFreePlay(isFree);
        setAmountCharged(isFree ? 0 : spinResult);
        
        setIsSpinning(false);
        
        // Show result modal after wheel stops
        setTimeout(() => {
          setShowResultModal(true);
        }, 300);
      } catch (error) {
        console.error("Spin error:", error);
        setIsSpinning(false);
      }
    }, spinDuration);
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-lg mx-auto px-2 sm:px-4">
      {/* Wheel Container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-20">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] sm:border-l-[15px] sm:border-r-[15px] sm:border-b-[25px] border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg"></div>
        </div>

        {/* Wheel with complete circular border */}
        <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-104 md:h-104">
          {/* Outer border ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl flex items-center justify-center">
            <div 
              ref={wheelRef}
              className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full relative overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? `transform 8s cubic-bezier(0.25, 0.1, 0.25, 1)` : 'none',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.2)'
              }}
            >
              {/* Wheel Segments */}
              {segmentColors.map((color, index) => {
                const angle = (360 / segmentColors.length) * index;
                const nextAngle = (360 / segmentColors.length) * (index + 1);
                const midAngle = angle + (360 / segmentColors.length) / 2;
                
                return (
                  <div
                    key={index}
                    className="absolute inset-0"
                    style={{
                      clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((nextAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((nextAngle - 90) * Math.PI / 180)}%)`,
                      backgroundColor: color
                    }}
                  >
                    {/* Segment number - perfectly centered in segment */}
                    <div 
                      className="absolute text-white font-bold text-base sm:text-lg md:text-xl z-10 flex items-center justify-center"
                      style={{
                        top: '50%',
                        left: '50%',
                        width: '32px',
                        height: '32px',
                        transform: `translate(-50%, -50%) translate(${Math.cos((midAngle - 90) * Math.PI / 180) * 65}px, ${Math.sin((midAngle - 90) * Math.PI / 180) * 65}px)`,
                        textShadow: '2px 2px 8px rgba(0,0,0,0.9), 1px 1px 4px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.6)',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.9))',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.9)',
                        boxShadow: '0 0 8px rgba(0,0,0,0.5)'
                      }}
                    >
                      {wheelNumbers[index]}
                    </div>
                  </div>
                );
              })}
              
              {/* Center hub */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-2 sm:border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Spinning indicator */}
        {isSpinning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 sm:py-2">
              <div className="flex items-center space-x-2 text-gray-800">
                <div className="animate-spin">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="font-semibold text-sm sm:text-base">Spinning...</span>
              </div>
            </div>
          </div>
        )}
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
        <DialogContent className="max-w-sm mx-auto p-0 bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 border-0 overflow-hidden">
          <div className="relative p-6 text-center">
            {/* Confetti */}
            <Confetti active={showResultModal} duration={3000} />
            
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-red-500/10 animate-pulse"></div>
            
            <div className="relative z-10 space-y-4">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  {isFreePlay ? (
                    <Gift className="h-12 w-12 text-green-400 animate-bounce" />
                  ) : (
                    <DollarSign className="h-12 w-12 text-blue-400 animate-bounce" />
                  )}
                  <div className="absolute inset-0 bg-current blur-xl opacity-30 animate-pulse"></div>
                </div>
              </div>

              {/* Result */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  {isFreePlay ? "🎁 FREE PLAY!" : "✨ NUMBER CLAIMED!"}
                </h2>
                <div className="text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  {result}
                </div>
              </div>

              {/* Payment info */}
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                {isFreePlay ? (
                  <div className="text-center space-y-1">
                    <div className="text-xl font-bold text-green-300">
                      💰 $0.00 CHARGED
                    </div>
                    <p className="text-green-200 text-sm">
                      This number is in the free play range!
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <div className="text-xl font-bold text-blue-300">
                      💳 ${amountCharged}.00 CHARGED
                    </div>
                    <p className="text-blue-200 text-sm">
                      Your card has been charged the exact number amount
                    </p>
                  </div>
                )}
              </div>

              {/* Close button */}
              <Button
                onClick={() => setShowResultModal(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 rounded-lg"
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