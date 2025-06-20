import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Target, Zap, Sparkles, Trophy, Star, Crown, PartyPopper } from "lucide-react";
import { Confetti } from "./confetti";

interface SpinningWheelProps {
  onSpin: () => Promise<number>;
  disabled?: boolean;
  totalNumbers?: number;
}

const wheelSegments = [
  { number: 12, color: "#ef4444", textColor: "#ffffff" },
  { number: 8, color: "#3b82f6", textColor: "#ffffff" },
  { number: 7, color: "#10b981", textColor: "#ffffff" },
  { number: 16, color: "#f59e0b", textColor: "#000000" },
  { number: 55, color: "#8b5cf6", textColor: "#ffffff" },
  { number: 42, color: "#06b6d4", textColor: "#ffffff" },
  { number: 38, color: "#84cc16", textColor: "#000000" },
  { number: 91, color: "#ec4899", textColor: "#ffffff" },
  { number: 25, color: "#f97316", textColor: "#ffffff" },
  { number: 73, color: "#6366f1", textColor: "#ffffff" },
  { number: 58, color: "#14b8a6", textColor: "#ffffff" },
  { number: 47, color: "#a855f7", textColor: "#ffffff" },
];

export function SpinningWheel({ onSpin, disabled = false, totalNumbers = 125 }: SpinningWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [glowIntensity, setGlowIntensity] = useState(0);

  // Pulsing glow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSpin = async () => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    setResult(null);
    setShowResultModal(false);

    // Enhanced spinning animation - 8 seconds duration
    const spinDuration = 8000;
    const finalRotation = rotation + 2880 + Math.random() * 1440; // At least 8 full rotations
    
    // Apply rotation immediately for visual feedback
    setRotation(finalRotation);

    // Start the API call but don't wait for it initially
    const resultPromise = onSpin();

    // Wait for the full spinning animation to complete
    await new Promise(resolve => setTimeout(resolve, spinDuration));

    // Then get the result
    const spinResult = await resultPromise;
    
    setResult(spinResult);
    setIsSpinning(false);
    
    // Show result modal after spinning completes
    setTimeout(() => {
      setShowResultModal(true);
    }, 500);
  };

  const segmentAngle = 360 / wheelSegments.length;

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Wheel Container */}
      <div className="relative">
        {/* Glow Effect */}
        <div 
          className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-pulse"
          style={{
            background: `conic-gradient(from 0deg, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ef4444, #ec4899, #8b5cf6)`,
            transform: `scale(${1.2 + Math.sin(glowIntensity * 0.1) * 0.1})`
          }}
        ></div>

        {/* Outer Ring - Removed border */}
        <div className="relative w-80 h-80 rounded-full shadow-2xl">
          
          {/* Enhanced Pointer - Pointing downward */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 z-30">
            <div className="flex flex-col items-center">
              {/* Arrow base */}
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              {/* Arrow tip pointing down */}
              <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[35px] border-l-transparent border-r-transparent border-t-gradient-to-t from-yellow-400 to-orange-500 drop-shadow-2xl -mt-2"></div>
            </div>
          </div>

          {/* Spinning Wheel */}
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full relative overflow-hidden transition-transform ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '8s' : '0s',
              background: `conic-gradient(${wheelSegments.map((segment, index) => 
                `${segment.color} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`
              ).join(', ')})`
            }}
          >
            {/* Segments with Numbers */}
            {wheelSegments.map((segment, index) => {
              const angle = index * segmentAngle + segmentAngle / 2;
              return (
                <div
                  key={index}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: 'center'
                  }}
                >
                  <div
                    className="font-bold text-2xl drop-shadow-lg"
                    style={{ 
                      color: segment.textColor,
                      transform: 'translateY(-100px)'
                    }}
                  >
                    {segment.number}
                  </div>
                </div>
              );
            })}

            {/* Center Hub */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full border-4 border-gray-600 shadow-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-inner"></div>
            </div>
          </div>
        </div>

        {/* Spinning Indicator */}
        {isSpinning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <div className="flex items-center space-x-2 text-white">
                <div className="animate-spin">
                  <Target className="h-5 w-5" />
                </div>
                <span className="font-semibold">Spinning...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-md mx-auto p-0 bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 border-0 overflow-hidden">
          <div className="relative p-8 text-center">
            {/* Confetti Effect */}
            <Confetti active={showResultModal} duration={5000} />
            
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-red-500/10 animate-pulse"></div>
            
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                >
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
              ))}
            </div>

            <div className="relative z-10 space-y-6">
              {/* Crown Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <Crown className="h-16 w-16 text-yellow-400 animate-bounce" />
                  <div className="absolute inset-0 bg-yellow-400/30 blur-xl animate-pulse"></div>
                </div>
              </div>

              {/* Winner Announcement */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  🎉 WINNER! 🎉
                </h2>
                <p className="text-white/80 text-lg">You spun the lucky number!</p>
              </div>

              {/* Result Number */}
              <div className="relative">
                <div className="text-8xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl">
                  {result}
                </div>
                <div className="absolute inset-0 text-8xl font-black text-yellow-400/20 blur-sm">
                  {result}
                </div>
              </div>

              {/* Celebration Message */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  <span className="text-xl font-bold text-green-300">Congratulations!</span>
                  <Trophy className="h-6 w-6 text-yellow-400" />
                </div>
                <p className="text-green-200">
                  Amazing spin! Your lucky number is <span className="font-bold text-yellow-300">{result}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowResultModal(false)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 transition-all duration-300"
                >
                  <PartyPopper className="h-4 w-4 mr-2" />
                  Awesome!
                </Button>
                <Button
                  onClick={() => {
                    setShowResultModal(false);
                    setResult(null);
                  }}
                  variant="outline"
                  className="flex-1 border-2 border-yellow-400/50 text-yellow-300 hover:bg-yellow-400/10 font-bold py-3"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Spin Again
                </Button>
              </div>

              {/* Stars Decoration */}
              <div className="flex justify-center space-x-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 text-yellow-400 animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={isSpinning || disabled}
        className={`
          relative overflow-hidden px-12 py-4 text-xl font-bold transition-all duration-300
          ${isSpinning 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-2xl'
          }
          shadow-lg border-2 border-purple-500/50
        `}
      >
        {/* Button Glow Effect */}
        {!isSpinning && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse"></div>
        )}
        
        <div className="relative flex items-center space-x-3">
          {isSpinning ? (
            <>
              <div className="animate-spin">
                <Target className="h-6 w-6" />
              </div>
              <span>Spinning...</span>
            </>
          ) : (
            <>
              <Zap className="h-6 w-6" />
              <span>SPIN TO WIN</span>
            </>
          )}
        </div>
      </Button>

      {/* Particles Effect */}
      {result && !isSpinning && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}