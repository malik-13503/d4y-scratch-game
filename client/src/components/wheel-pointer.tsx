import React from 'react';

interface WheelPointerProps {
  className?: string;
}

export function WheelPointer({ className = "" }: WheelPointerProps) {
  return (
    <div className={`absolute z-30 pointer-events-none ${className}`}>
      <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        className="drop-shadow-2xl"
        style={{ transform: 'rotate(90deg)' }}
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
        
        {/* Sharp triangular pointer */}
        <path
          d="M25 8 L38 32 L25 28 L12 32 Z"
          fill="url(#pointerGradient)"
          stroke="#ffffff"
          strokeWidth="2"
          filter="url(#glow)"
        />
        
        {/* Center attachment circle */}
        <circle
          cx="25"
          cy="25"
          r="5"
          fill="url(#pointerGradient)"
          stroke="#ffffff"
          strokeWidth="2"
        />
        
        {/* Inner highlight for 3D effect */}
        <path
          d="M25 12 L33 28 L25 25 L17 28 Z"
          fill="rgba(255, 255, 255, 0.4)"
        />
        
        {/* Center dot */}
        <circle
          cx="25"
          cy="25"
          r="2"
          fill="#ffffff"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}