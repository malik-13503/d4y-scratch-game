import React from 'react';

interface WheelPointerProps {
  className?: string;
}

export function WheelPointer({ className = "" }: WheelPointerProps) {
  return (
    <div className={`absolute z-30 pointer-events-none ${className}`}>
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        className="drop-shadow-2xl"
        style={{ transform: 'rotate(180deg)' }}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E676" />
            <stop offset="50%" stopColor="#2196F3" />
            <stop offset="100%" stopColor="#9C27B0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Sharp triangular pointer - larger size */}
        <path
          d="M40 10 L60 50 L40 45 L20 50 Z"
          fill="url(#pointerGradient)"
          stroke="#ffffff"
          strokeWidth="3"
          filter="url(#glow)"
        />
        
        {/* Center attachment circle */}
        <circle
          cx="40"
          cy="40"
          r="8"
          fill="url(#pointerGradient)"
          stroke="#ffffff"
          strokeWidth="3"
        />
        
        {/* Inner highlight for 3D effect */}
        <path
          d="M40 18 L52 42 L40 38 L28 42 Z"
          fill="rgba(255, 255, 255, 0.4)"
        />
        
        {/* Center dot */}
        <circle
          cx="40"
          cy="40"
          r="3"
          fill="#ffffff"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}