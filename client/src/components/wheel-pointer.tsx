import React from 'react';

interface WheelPointerProps {
  className?: string;
}

export function WheelPointer({ className = "" }: WheelPointerProps) {
  return (
    <div className={`absolute z-30 pointer-events-none ${className}`}>
      <svg
        width="60"
        height="40"
        viewBox="0 0 60 40"
        className="drop-shadow-2xl"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="50%" stopColor="#ff6b35" />
            <stop offset="100%" stopColor="#ff1744" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main pointer triangle pointing down */}
        <path
          d="M30 5 L50 25 L30 35 L10 25 Z"
          fill="url(#pointerGradient)"
          stroke="#ffffff"
          strokeWidth="2"
          filter="url(#glow)"
        />
        
        {/* Center circle */}
        <circle
          cx="30"
          cy="20"
          r="6"
          fill="url(#pointerGradient)"
          stroke="#ffffff"
          strokeWidth="2"
        />
        
        {/* Inner highlight for 3D effect */}
        <path
          d="M30 8 L45 23 L30 30 L15 23 Z"
          fill="rgba(255, 255, 255, 0.3)"
        />
        
        {/* Small white dot in center */}
        <circle
          cx="30"
          cy="20"
          r="2"
          fill="#ffffff"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}