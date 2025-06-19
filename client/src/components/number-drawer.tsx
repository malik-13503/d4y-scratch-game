import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Hash, Sparkles, Star } from "lucide-react";

interface NumberDrawerProps {
  onDraw: () => Promise<number>;
  disabled?: boolean;
  totalNumbers?: number;
}

export function NumberDrawer({ onDraw, disabled = false, totalNumbers = 125 }: NumberDrawerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [result, setResult] = useState<number | null>(null);
  const [animatingNumbers, setAnimatingNumbers] = useState<number[]>([]);
  const [glowIntensity, setGlowIntensity] = useState(0);

  // Continuous number cycling for visual appeal
  useEffect(() => {
    if (!isDrawing) return;
    
    const interval = setInterval(() => {
      setCurrentNumber(prev => (prev % totalNumbers) + 1);
    }, 50);

    return () => clearInterval(interval);
  }, [isDrawing, totalNumbers]);

  // Pulsing glow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Generate random floating numbers
  useEffect(() => {
    const interval = setInterval(() => {
      const newNumbers = Array.from({ length: 8 }, () => Math.floor(Math.random() * totalNumbers) + 1);
      setAnimatingNumbers(newNumbers);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [totalNumbers]);

  const handleDraw = async () => {
    if (isDrawing || disabled) return;

    setIsDrawing(true);
    setResult(null);

    // Start the number cycling animation
    const drawDuration = 2500;
    
    // Start the API call
    const resultPromise = onDraw();

    // Wait for both animation and API call
    await Promise.all([
      new Promise(resolve => setTimeout(resolve, drawDuration)),
      resultPromise.then(setResult)
    ]);

    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Main Draw Area */}
      <div className="relative">
        {/* Background Glow */}
        <div 
          className="absolute inset-0 rounded-3xl blur-3xl opacity-40 animate-pulse"
          style={{
            background: `linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6, #ec4899)`,
            transform: `scale(${1.1 + Math.sin(glowIntensity * 0.1) * 0.05})`
          }}
        ></div>

        {/* Draw Container */}
        <div className="relative w-96 h-96 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl border-4 border-gradient-to-r from-green-500 to-blue-500 shadow-2xl overflow-hidden">
          
          {/* Floating Background Numbers */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {animatingNumbers.map((num, index) => (
              <div
                key={`${num}-${index}`}
                className="absolute text-6xl font-bold text-white/10 animate-float"
                style={{
                  left: `${10 + (index % 3) * 30}%`,
                  top: `${10 + Math.floor(index / 3) * 25}%`,
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                {num}
              </div>
            ))}
          </div>

          {/* Central Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-6">
              {isDrawing ? (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="text-8xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                      {currentNumber.toString().padStart(3, '0')}
                    </div>
                    {/* Number change effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-purple-400/20 rounded-xl blur-sm animate-ping"></div>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <div className="animate-spin">
                      <Hash className="h-6 w-6" />
                    </div>
                    <span className="font-semibold text-lg">Drawing Number...</span>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  <div className="relative">
                    <div className="flex items-center justify-center space-x-4">
                      <Star className="h-12 w-12 text-yellow-400 animate-bounce" />
                      <div className="text-9xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                        {result.toString().padStart(3, '0')}
                      </div>
                      <Star className="h-12 w-12 text-yellow-400 animate-bounce" />
                    </div>
                    {/* Winner glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-orange-500/30 to-red-500/30 rounded-2xl blur-xl animate-pulse"></div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-green-500/30">
                    <p className="text-green-400 font-semibold text-lg">Amazing! You drew number {result}!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl font-bold text-white/60">
                    000
                  </div>
                  <p className="text-gray-400 text-lg">Ready to draw your number</p>
                </div>
              )}
            </div>
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          <div className="absolute top-4 right-4 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-4 left-4 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-4 right-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
        </div>
      </div>

      {/* Number Range Display */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
        <div className="flex items-center space-x-3 text-gray-300">
          <Hash className="h-5 w-5" />
          <span className="font-semibold">Numbers 1 - {totalNumbers}</span>
        </div>
      </div>

      {/* Draw Button */}
      <Button
        onClick={handleDraw}
        disabled={isDrawing || disabled}
        className={`
          relative overflow-hidden px-12 py-4 text-xl font-bold transition-all duration-300
          ${isDrawing 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 hover:scale-105 hover:shadow-2xl'
          }
          shadow-lg border-2 border-green-500/50
        `}
      >
        {/* Button Glow Effect */}
        {!isDrawing && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse"></div>
        )}
        
        <div className="relative flex items-center space-x-3">
          {isDrawing ? (
            <>
              <div className="animate-spin">
                <Hash className="h-6 w-6" />
              </div>
              <span>Drawing...</span>
            </>
          ) : (
            <>
              <Zap className="h-6 w-6" />
              <span>DRAW NUMBER</span>
            </>
          )}
        </div>
      </Button>

      {/* Particles Effect */}
      {result && !isDrawing && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-ping"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${15 + Math.random() * 70}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Success Sparkles */}
      {result && !isDrawing && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-yellow-400 animate-bounce"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${1 + Math.random()}rem`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}