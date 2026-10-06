"use client";

const ILLUSTRATIONS: Record<string, React.ReactNode> = {
  "adversary-emulation": (
    <svg viewBox="0 0 80 48" className="w-full h-12" fill="none">
      <path d="M8 40 L40 8 L72 40" stroke="#00E5FF" strokeWidth="1" opacity="0.5" />
      <circle cx="40" cy="24" r="6" stroke="#FF0055" strokeWidth="1.2" />
      <circle cx="20" cy="34" r="3" fill="#935b95" opacity="0.8" />
      <circle cx="60" cy="34" r="3" fill="#935b95" opacity="0.8" />
      <path d="M40 30 v8 M34 38 h12" stroke="#97d2e6" strokeWidth="0.8" opacity="0.6" />
    </svg>
  ),
  "purple-team": (
    <svg viewBox="0 0 80 48" className="w-full h-12" fill="none">
      <rect x="10" y="14" width="24" height="20" stroke="#FF0055" strokeWidth="1" opacity="0.7" />
      <rect x="46" y="14" width="24" height="20" stroke="#00E5FF" strokeWidth="1" opacity="0.7" />
      <path d="M34 24 h12" stroke="#935b95" strokeWidth="1" strokeDasharray="3 2" />
      <circle cx="22" cy="24" r="4" stroke="#FF0055" strokeWidth="0.8" />
      <circle cx="58" cy="24" r="4" stroke="#00E5FF" strokeWidth="0.8" />
    </svg>
  ),
  "ransomware-readiness": (
    <svg viewBox="0 0 80 48" className="w-full h-12" fill="none">
      <path d="M40 8 L56 16 V32 L40 40 L24 32 V16 Z" stroke="#FF0055" strokeWidth="1" />
      <path d="M32 24 h16 M40 20 v8" stroke="#97d2e6" strokeWidth="0.8" opacity="0.5" />
      <circle cx="40" cy="24" r="10" stroke="#935b95" strokeWidth="0.6" strokeDasharray="2 3" />
    </svg>
  ),
  "cloud-identity": (
    <svg viewBox="0 0 80 48" className="w-full h-12" fill="none">
      <path d="M20 32 Q20 22 30 22 Q32 14 42 16 Q52 12 58 20 Q68 20 68 30 Q68 36 62 36 H22 Q16 36 16 30 Q16 32 20 32" stroke="#00E5FF" strokeWidth="1" opacity="0.6" />
      <rect x="34" y="26" width="12" height="10" stroke="#935b95" strokeWidth="0.8" />
      <path d="M40 20 v6" stroke="#FF0055" strokeWidth="0.8" />
    </svg>
  ),
  "insider-threat": (
    <svg viewBox="0 0 80 48" className="w-full h-12" fill="none">
      <circle cx="40" cy="18" r="8" stroke="#FF0055" strokeWidth="1" />
      <path d="M24 40 Q40 28 56 40" stroke="#935b95" strokeWidth="1" />
      <path d="M52 12 L58 8 M58 8 L56 14" stroke="#00E5FF" strokeWidth="0.7" opacity="0.5" />
    </svg>
  ),
  "supply-chain": (
    <svg viewBox="0 0 80 48" className="w-full h-12" fill="none">
      <rect x="8" y="20" width="14" height="14" stroke="#97d2e6" strokeWidth="0.8" />
      <rect x="33" y="16" width="14" height="14" stroke="#00E5FF" strokeWidth="0.8" />
      <rect x="58" y="20" width="14" height="14" stroke="#935b95" strokeWidth="0.8" />
      <path d="M22 27 h11 M47 23 h11" stroke="#935b95" strokeWidth="0.8" strokeDasharray="2 2" />
    </svg>
  ),
  "data-exfiltration": (
    <svg viewBox="0 0 80 48" className="w-full h-12" fill="none">
      <rect x="12" y="16" width="20" height="24" stroke="#97d2e6" strokeWidth="0.8" />
      <path d="M32 28 h20 M48 22 l12 6 l-12 6" stroke="#FF0055" strokeWidth="1" />
      <path d="M18 22 h8 M18 28 h12 M18 34 h6" stroke="#935b95" strokeWidth="0.6" opacity="0.6" />
    </svg>
  ),
  "assumed-breach": (
    <svg viewBox="0 0 80 48" className="w-full h-12" fill="none">
      <rect x="28" y="10" width="24" height="28" stroke="#00E5FF" strokeWidth="1" />
      <path d="M34 18 h12 M34 24 h12 M34 30 h8" stroke="#935b95" strokeWidth="0.6" />
      <circle cx="40" cy="38" r="3" fill="#FF0055" opacity="0.8" />
      <path d="M8 38 h16" stroke="#97d2e6" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  ),
};

export function EngagementIllustration({ typeId }: { typeId: string }) {
  return (
    <div className="opacity-80 group-hover:opacity-100 transition-opacity">
      {ILLUSTRATIONS[typeId] ?? ILLUSTRATIONS["adversary-emulation"]}
    </div>
  );
}

export function EmptyGraphIllustration() {
  return (
    <svg viewBox="0 0 200 120" className="w-48 h-28 mx-auto opacity-40" fill="none">
      <path d="M20 100 L60 40 L100 70 L140 30 L180 80" stroke="#00E5FF" strokeWidth="1" strokeDasharray="4 4" />
      {[20, 60, 100, 140, 180].map((x, i) => (
        <g key={i}>
          <rect x={x - 8} y={[100, 40, 70, 30, 80][i] - 8} width="16" height="16" stroke="#935b95" strokeWidth="0.8" fill="#071e36" />
          <circle cx={x} cy={[100, 40, 70, 30, 80][i]} r="2" fill="#00E5FF" opacity="0.6" />
        </g>
      ))}
      <text x="100" y="115" textAnchor="middle" fill="#935b95" fontSize="8" fontFamily="monospace">
        AWAITING PLAN GENERATION
      </text>
    </svg>
  );
}
