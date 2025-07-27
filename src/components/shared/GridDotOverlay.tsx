export function GridDotOverlay({ spacing = 10 }: { spacing?: number }) {
  const dots = [];
  for (let x = 0; x < 100; x += spacing) {
    for (let y = 0; y < 100; y += spacing) {
      dots.push(
        <circle key={`${x}-${y}`} cx={x} cy={y} r={0.5} fill="currentColor" />
      );
    }
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full text-[--muted] absolute inset-0 z-0"
    >
      {dots}
    </svg>
  );
}
