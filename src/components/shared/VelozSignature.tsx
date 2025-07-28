export function VelozSignature({
  variant = 'horizontal',
}: {
  variant?: 'horizontal' | 'compact';
}) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        fill="currentColor"
        className="text-[--primary]"
      >
        {/* Veloz logo design - simplified geometric shape */}
        <path
          d="M20 30 L50 20 L80 30 L80 70 L50 80 L20 70 Z"
          fill="currentColor"
        />
        <circle cx="35" cy="45" r="3" fill="currentColor" />
        <circle cx="65" cy="45" r="3" fill="currentColor" />
        <path
          d="M35 55 Q50 65 65 55"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
      {variant === 'horizontal' && (
        <span className="font-logo text-xl uppercase tracking-widest text-[--primary]">
          VELOZ
        </span>
      )}
    </div>
  );
}
