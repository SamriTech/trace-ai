import React from "react";

export default function PoliceEmblem({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Golden Ring */}
      <circle cx="50" cy="50" r="46" stroke="#D4AF37" strokeWidth="4" fill="#071026" />
      <circle cx="50" cy="50" r="40" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* Ethiopian Flag Colors Shield */}
      <path
        d="M50 16 L74 26 C74 54 50 78 50 78 C50 78 26 54 26 26 Z"
        fill="#0B132B"
        stroke="#D4AF37"
        strokeWidth="2"
      />

      {/* Flag Bands */}
      <path d="M30 32 L70 32 L68 42 L32 42 Z" fill="#009639" />
      <path d="M32 42 L68 42 L64 52 L36 52 Z" fill="#FED100" />
      <path d="M36 52 L64 52 L58 64 L42 64 Z" fill="#EF2B2D" />

      {/* Central Star / Emblem */}
      <circle cx="50" cy="47" r="7" fill="#0039A6" />
      <polygon
        points="50,42 52,45.5 56,46 53,48.5 54,52.5 50,50 46,52.5 47,48.5 44,46 48,45.5"
        fill="#FED100"
      />

      {/* Scales of Justice / Laurel Accent */}
      <path
        d="M50 74 L50 82 M42 82 L58 82"
        stroke="#D4AF37"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
