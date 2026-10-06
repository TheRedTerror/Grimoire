"use client";

interface GrimoireLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export default function GrimoireLogo({
  size = 40,
  showWordmark = true,
  className = "",
}: GrimoireLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Book spine + pages — hand-drawn angular geometry */}
        <path
          d="M8 6 L24 2 L40 6 L40 42 L24 46 L8 42 Z"
          stroke="#8b0018"
          strokeWidth="1.2"
          fill="#0a0a0c"
        />
        <path d="M24 2 V46" stroke="#1a1a20" strokeWidth="0.8" />
        <circle cx="16" cy="16" r="2.5" fill="#8b0018" opacity="0.9" />
        <circle cx="24" cy="22" r="2.5" fill="#4a3030" />
        <circle cx="32" cy="16" r="2.5" fill="#8b0018" opacity="0.5" />
        <circle cx="20" cy="32" r="2.5" fill="#cc0022" opacity="0.7" />
        <circle cx="30" cy="34" r="2" fill="#6a6068" opacity="0.5" />
        <path
          d="M16 16 L24 22 L32 16 M24 22 L20 32 L30 34"
          stroke="#4a3030"
          strokeWidth="0.8"
          strokeDasharray="2 2"
          opacity="0.8"
        />
        <path d="M4 4 H8 M4 4 V8" stroke="#8b0018" strokeWidth="0.6" opacity="0.35" />
        <path d="M44 44 H40 M44 44 V40" stroke="#8b0018" strokeWidth="0.6" opacity="0.35" />
      </svg>
      {showWordmark && (
        <div className="leading-none">
          <div className="font-display text-lg tracking-[0.22em] text-grimoire-accent">
            GRIMOIRE
          </div>
          <div className="text-[9px] tracking-[0.18em] text-grimoire-muted uppercase mt-0.5">
            Op Planning · v0.2
          </div>
        </div>
      )}
    </div>
  );
}
