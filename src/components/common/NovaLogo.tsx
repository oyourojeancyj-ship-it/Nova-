import React from 'react';

interface NovaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const NovaLogo: React.FC<NovaLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtitle,
  onClick,
}) => {
  const iconDimensions = {
    sm: { w: 26, h: 26, textClass: 'text-base', subClass: 'text-[9px]' },
    md: { w: 34, h: 34, textClass: 'text-xl', subClass: 'text-[10px]' },
    lg: { w: 48, h: 48, textClass: 'text-2xl', subClass: 'text-xs' },
    xl: { w: 72, h: 72, textClass: 'text-4xl', subClass: 'text-sm' },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 ${onClick ? 'cursor-pointer select-none active:scale-95 transition-transform' : ''} ${className}`}
    >
      {/* 6-point crystalline snowflake with glowing halo */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Glowing blue halo effect */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#1677FF] via-[#38BDF8] to-[#00F0FF] blur-md opacity-75 animate-pulse"
          style={{
            transform: 'scale(1.25)',
            filter: 'blur(8px)',
          }}
        />
        
        {/* Subtle secondary ambient ring */}
        <div 
          className="absolute rounded-full border border-[#38BDF8]/40"
          style={{
            width: iconDimensions.w * 1.3,
            height: iconDimensions.h * 1.3,
          }}
        />

        {/* Crystalline SVG */}
        <svg
          width={iconDimensions.w}
          height={iconDimensions.h}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]"
        >
          <defs>
            <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#7DD3FC" />
              <stop offset="80%" stopColor="#1677FF" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            <filter id="haloGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Halo Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#crystalGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.85"
          />

          {/* Outer diamond orbital points at 60 degree increments */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const cx = 50 + 44 * Math.cos(rad);
            const cy = 50 + 44 * Math.sin(rad);
            return (
              <circle
                key={`orb-${i}`}
                cx={cx}
                cy={cy}
                r="1.75"
                fill="#FFFFFF"
                className="animate-pulse"
              />
            );
          })}

          {/* 6 Crystalline Branches (rotated at 0, 60, 120, 180, 240, 300 deg) */}
          {[0, 60, 120, 180, 240, 300].map((angle, index) => (
            <g key={index} transform={`rotate(${angle} 50 50)`}>
              {/* Main crystal spear spine */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="10"
                stroke="url(#crystalGrad)"
                strokeWidth="2.75"
                strokeLinecap="round"
              />
              
              {/* Outer spear head rhombus */}
              <polygon
                points="50,6 54,12 50,18 46,12"
                fill="url(#coreGrad)"
              />

              {/* Upper secondary branch chevrons */}
              <line
                x1="50"
                y1="23"
                x2="41"
                y2="17"
                stroke="url(#crystalGrad)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <line
                x1="50"
                y1="23"
                x2="59"
                y2="17"
                stroke="url(#crystalGrad)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Mid crystal facets */}
              <polygon
                points="50,28 55,34 50,40 45,34"
                fill="#38BDF8"
                opacity="0.8"
              />

              {/* Inner branch chevrons */}
              <line
                x1="50"
                y1="34"
                x2="38"
                y2="28"
                stroke="url(#crystalGrad)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <line
                x1="50"
                y1="34"
                x2="62"
                y2="28"
                stroke="url(#crystalGrad)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Central multifaceted crystal core */}
          {/* Hexagon background */}
          <polygon
            points="50,38 60.4,44 60.4,56 50,62 39.6,56 39.6,44"
            fill="#0B1A3A"
            stroke="url(#crystalGrad)"
            strokeWidth="1.5"
          />

          {/* Inner brilliant faceted 6-point star */}
          <polygon
            points="50,42 53,48 59,50 53,52 50,58 47,52 41,50 47,48"
            fill="url(#coreGrad)"
          />

          {/* Central glowing white focal diamond */}
          <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Typography: NOVA + optional subtitle */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-[#38BDF8] font-brand ${iconDimensions.textClass}`}
            >
              NOVA
            </span>
          </div>
          {subtitle && (
            <span
              className={`text-[#38BDF8]/80 font-medium tracking-[0.16em] uppercase mt-0.5 ${iconDimensions.subClass}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
