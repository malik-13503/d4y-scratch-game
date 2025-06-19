import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface SpinningWheelProps {
  onSpin: () => Promise<number>;
  disabled?: boolean;
}

const wheelNumbers = [12, 8, 7, 16, 55, 32, 89, 25, 58, 15, 20, 27];
const wheelColors = [
  "#E74C3C", "#F39C12", "#27AE60", "#3498DB", 
  "#9B59B6", "#E67E22", "#1ABC9C", "#F1C40F",
  "#E74C3C", "#27AE60", "#3498DB", "#9B59B6"
];

export function SpinningWheel({ onSpin, disabled = false }: SpinningWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const handleSpin = async () => {
    if (isSpinning || disabled) return;
    
    setIsSpinning(true);
    
    try {
      const result = await onSpin();
      
      // Calculate rotation based on result - make it land on a random segment
      const segmentAngle = 360 / wheelNumbers.length;
      const randomIndex = Math.floor(Math.random() * wheelNumbers.length);
      const baseRotation = rotation + 1440 + Math.random() * 720; // 4-6 full rotations
      const targetRotation = baseRotation + (360 - (randomIndex * segmentAngle));
      
      setRotation(targetRotation);
      
      // Reset after animation
      setTimeout(() => {
        setIsSpinning(false);
      }, 4000);
    } catch (error) {
      setIsSpinning(false);
      console.error("Spin failed:", error);
    }
  };

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 blur-xl animate-pulse"></div>
      
      {/* Wheel container */}
      <motion.div
        ref={wheelRef}
        className="w-full h-full relative z-10"
        animate={{ rotate: rotation }}
        transition={{ 
          duration: isSpinning ? 4 : 0, 
          ease: [0.17, 0.67, 0.12, 0.99],
          type: "tween"
        }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-8 border-yellow-400 shadow-2xl bg-gradient-to-br from-yellow-100 to-orange-100">
          {/* Wheel segments */}
          <div className="absolute inset-2 rounded-full overflow-hidden">
            {wheelNumbers.map((number, index) => {
              const segmentAngle = 360 / wheelNumbers.length;
              const startAngle = index * segmentAngle;
              
              return (
                <div
                  key={index}
                  className="absolute w-1/2 h-1/2 origin-bottom-right"
                  style={{
                    transform: `rotate(${startAngle}deg)`,
                    clipPath: `polygon(0 0, 0 100%, 86.6% 50%)`,
                    backgroundColor: wheelColors[index],
                  }}
                >
                  <div
                    className="absolute text-white font-bold text-lg flex items-center justify-center w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border-2 border-white/30"
                    style={{
                      top: "20px",
                      right: "20px",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                      fontSize: "16px",
                    }}
                  >
                    {number}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Center spin button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handleSpin}
            disabled={isSpinning || disabled}
            className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 text-white font-bold text-lg rounded-full shadow-2xl hover:from-red-600 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 border-4 border-white"
          >
            {isSpinning ? (
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                <span className="text-xs">SPINNING</span>
              </div>
            ) : (
              "SPIN"
            )}
          </button>
        </div>
      </motion.div>
      
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20">
        <div className="flex flex-col items-center">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[30px] border-l-transparent border-r-transparent border-b-yellow-400 shadow-lg"></div>
          <div className="w-2 h-8 bg-yellow-400 shadow-lg"></div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-yellow-300 rounded-full animate-ping"
            style={{
              top: `${20 + Math.sin(i * Math.PI / 4) * 30}%`,
              left: `${20 + Math.cos(i * Math.PI / 4) * 30}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
    </div>
  );
}
