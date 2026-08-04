import React from 'react';

export default function EcoLogo({ size = 32, style = {} }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className="notranslate"
      translate="no"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary-color)" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#10b981" floodOpacity="0.25" />
        </filter>
        {/* Reusable Leaf Shape */}
        <path id="eco-leaf" d="M 0,-8 C 2.5,-3 2.5,3 0,6 C -2.5,3 -2.5,-3 0,-8 Z" fill="url(#logo-grad)" />
      </defs>

      {/* Connective branch stems */}
      <g fill="none" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
        <path d="M 45.5,32 Q 41,24 41,18" />
        <path d="M 51.5,26 L 51.5,15" />
        <path d="M 57.5,29 Q 62,24 62,18" />
        <path d="M 63.5,37 Q 72,28 72,24" />
        <path d="M 34.5,45 Q 26,40 24,35" />
        <path d="M 35,52 Q 22,54 26,50" />
        <path d="M 64,52 Q 78,54 74,50" />
      </g>

      {/* Stylized Hand Trunk */}
      <path
        d="M 35,82 C 40,82 45,76 45,66 L 45,55 C 41,54 36,50 34,45 C 32.5,42 35,39 37.5,42 L 44,48 L 44,32 C 44,30 47,30 47,32 L 47,46 L 50,26 C 50,24 53,24 53,26 L 53,46 L 56,29 C 56,27 59,27 59,29 L 59,47 L 62,37 C 62,35 65,35 65,37 C 65,45 61,58 61,66 C 61,76 66,82 71,82 Z"
        fill="url(#logo-grad)"
        filter="url(#logo-glow)"
      />

      {/* Symmetrical canopy leaves */}
      <g>
        <use href="#eco-leaf" x="51.5" y="14" transform="rotate(0 51.5 14)" />
        <use href="#eco-leaf" x="41" y="17" transform="rotate(-25 41 17)" />
        <use href="#eco-leaf" x="62" y="17" transform="rotate(25 62 17)" />
        <use href="#eco-leaf" x="32" y="23" transform="rotate(-50 32 23)" />
        <use href="#eco-leaf" x="71" y="23" transform="rotate(50 71 23)" />
        <use href="#eco-leaf" x="24" y="34" transform="rotate(-75 24 34)" />
        <use href="#eco-leaf" x="79" y="34" transform="rotate(75 79 34)" />
        <use href="#eco-leaf" x="21" y="48" transform="rotate(-95 21 48)" />
        <use href="#eco-leaf" x="81" y="48" transform="rotate(95 81 48)" />
        <use href="#eco-leaf" x="25" y="62" transform="rotate(-115 25 62)" />
        <use href="#eco-leaf" x="77" y="62" transform="rotate(115 77 62)" />
        
        {/* Inner layers */}
        <use href="#eco-leaf" x="45" y="24" transform="rotate(-15 45 24)" />
        <use href="#eco-leaf" x="58" y="24" transform="rotate(15 58 24)" />
        <use href="#eco-leaf" x="36" y="34" transform="rotate(-35 36 34)" />
        <use href="#eco-leaf" x="66" y="34" transform="rotate(35 66 34)" />
        <use href="#eco-leaf" x="30" y="46" transform="rotate(-60 30 46)" />
        <use href="#eco-leaf" x="72" y="46" transform="rotate(60 72 46)" />
      </g>
    </svg>
  );
}
