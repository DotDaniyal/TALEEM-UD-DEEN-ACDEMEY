import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  siteNameUrdu?: string;
  siteNameEn?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  siteNameUrdu = 'تعلیم الدین اکیڈمی',
  siteNameEn = 'TALEEM UD DEEN ACADEMY',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Original Refined Islamic Emblem: Mihrab Arch + Subtle Crescent + Geometric Motif */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-lg bg-[#0F382A] text-[#C5A059] border border-[#C5A059]/40 shadow-xs shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Mihrab Arch */}
          <path
            d="M32 8 C22 17 14 26 14 38 C14 50 22 55 32 55 C42 55 50 50 50 38 C50 26 42 17 32 8 Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Inner Decorative Arch */}
          <path
            d="M32 15 C24 23 19 30 19 40 C19 47 25 50 32 50 C39 50 45 47 45 40 C45 30 40 23 32 15 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            fill="currentColor"
            fillOpacity="0.12"
          />
          {/* Subtle Crescent / Minbar Star Point */}
          <circle cx="32" cy="27" r="2.8" fill="currentColor" />
          {/* Base Foundation line */}
          <path d="M12 55 H52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-urdu text-lg leading-tight font-semibold text-[#0F382A] tracking-tight">
            {siteNameUrdu}
          </span>
          <span className="text-[11px] font-sans text-stone-500 uppercase tracking-widest leading-none mt-0.5">
            {siteNameEn}
          </span>
        </div>
      )}
    </div>
  );
};
