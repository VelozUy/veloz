export function TargetLoader() {
  return (
    <div className="relative w-12 h-12">
      <svg
        viewBox="0 0 37 38"
        className="w-full h-full text-[--primary]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        {/* Outer target crosshair - no animation */}
        <path fillRule="evenodd" d="m18.5 0.8v36.7" />
        <path fillRule="evenodd" d="m0.1 19.2h36.8" />

        {/* Single large circle with animation */}
        <circle
          cx="18.5"
          cy="19.2"
          r="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          style={{
            animation: 'targetPulse 1.5s ease-in-out infinite',
            transformOrigin: 'center',
          }}
        />
      </svg>

      {/* Inline CSS for animations */}
      <style jsx>{`
        @keyframes targetPulse {
          0%,
          100% {
            transform: scale(0.7);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
