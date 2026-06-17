import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg
        className="w-7 h-7"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-gold)" />
          </linearGradient>
        </defs>
        <polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          stroke="url(#star-gradient)"
          fill="none"
        />
      </svg>
      <span className="text-xl font-bold tracking-tight text-heading">
        Rate & Review
      </span>
    </div>
  );
};

export default Logo;
