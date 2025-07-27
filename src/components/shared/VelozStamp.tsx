export function VelozStamp() {
  return (
    <div className="flex items-center text-xs uppercase tracking-wide gap-2">
      <svg
        width="16"
        height="16"
        viewBox="0 0 100 100"
        fill="currentColor"
        className="text-[--muted-foreground]"
      >
        {/* Veloz logo design - simplified geometric shape */}
        <path
          d="M15 25 L50 15 L85 25 L85 75 L50 85 L15 75 Z"
          fill="currentColor"
        />
        <circle cx="30" cy="40" r="2" fill="currentColor" />
        <circle cx="70" cy="40" r="2" fill="currentColor" />
        <path
          d="M30 50 Q50 60 70 50"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
      <span className="text-[--muted-foreground]">Veloz Studio</span>
    </div>
  );
}
