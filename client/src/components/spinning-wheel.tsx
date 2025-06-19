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
      
      // Calculate rotation based on result
      const segmentAngle = 360 / wheelNumbers.length;
      const targetIndex = wheelNumbers.indexOf(result);
      const baseRotation = rotation + 1080 + Math.random() * 360; // 3+ full rotations
      const targetRotation = baseRotation + (360 - (targetIndex * segmentAngle));
      
      setRotation(targetRotation);
      
      // Reset after animation
      setTimeout(() => {
        setIsSpinning(false);
      }, 3000);
    } catch (error) {
      setIsSpinning(false);
      console.error("Spin failed:", error);
    }
  };

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Wheel container */}
      <motion.div
        ref={wheelRef}
        className="w-full h-full relative"
        animate={{ rotate: rotation }}
        transition={{ duration: 3, ease: [0.17, 0.67, 0.12, 0.99] }}
      >
        {/* Wheel segments */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
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
                  className="absolute text-white font-bold text-sm flex items-center justify-center w-8 h-8 text-shadow"
                  style={{
                    top: "15px",
                    right: "15px",
                    textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
                  }}
                >
                  {number}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Center spin button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handleSpin}
            disabled={isSpinning || disabled}
            className="w-16 h-16 bg-brand-red text-white font-bold text-sm rounded-full shadow-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSpinning ? "SPINNING..." : "SPIN"}
          </button>
        </div>
      </motion.div>
      
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-gray-800"></div>
      </div>
    </div>
  );
}
