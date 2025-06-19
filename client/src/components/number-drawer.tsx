import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NumberDrawerProps {
  onDraw: () => Promise<number>;
  disabled?: boolean;
  totalNumbers?: number;
}

export function NumberDrawer({ onDraw, disabled = false, totalNumbers = 125 }: NumberDrawerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);

  const handleDraw = async () => {
    if (isDrawing || disabled) return;
    
    setIsDrawing(true);
    
    try {
      // Animate number selection
      const animationDuration = 2000;
      const interval = 50;
      const steps = animationDuration / interval;
      
      let step = 0;
      const animation = setInterval(() => {
        const randomNum = Math.floor(Math.random() * totalNumbers) + 1;
        setCurrentNumber(randomNum);
        
        step++;
        if (step >= steps) {
          clearInterval(animation);
          
          // Get actual result from server
          onDraw().then(result => {
            setCurrentNumber(result);
            setDrawnNumbers(prev => [...prev, result]);
            setIsDrawing(false);
          }).catch(() => {
            setIsDrawing(false);
          });
        }
      }, interval);
      
    } catch (error) {
      setIsDrawing(false);
      console.error("Draw failed:", error);
    }
  };

  return (
    <div className="text-center space-y-8">
      {/* Number Display */}
      <div className="relative">
        <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl border-8 border-white">
          <div className="text-center">
            {currentNumber ? (
              <div className="text-8xl font-bold text-white animate-bounce-in">
                {currentNumber}
              </div>
            ) : (
              <div className="text-white text-lg font-semibold">
                Press Draw<br />to Start
              </div>
            )}
          </div>
        </div>
        
        {/* Glow Effect */}
        {isDrawing && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-500/30 blur-xl animate-pulse"></div>
        )}
      </div>

      {/* Draw Button */}
      <Button
        onClick={handleDraw}
        disabled={isDrawing || disabled}
        className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-12 py-4 text-xl font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
      >
        {isDrawing ? (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Drawing...</span>
          </div>
        ) : (
          "Draw Number"
        )}
      </Button>

      {/* Range Info */}
      <div className="text-white/80 text-lg">
        Draw a number between 1 and {totalNumbers}
      </div>

      {/* Previously Drawn Numbers */}
      {drawnNumbers.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-white text-lg font-semibold mb-4">Your Previous Numbers</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {drawnNumbers.slice(-5).map((num, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold"
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}