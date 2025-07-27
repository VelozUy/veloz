export function PerimeterBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-6 border border-[--border] before:absolute before:inset-1 before:border before:border-[--muted]">
      {children}
    </div>
  );
}
