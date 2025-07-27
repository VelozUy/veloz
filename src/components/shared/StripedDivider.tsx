export function StripedDivider() {
  return (
    <div className="w-full h-px bg-[--muted] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[--primary] to-transparent bg-repeat-x [background-size:16px_1px]" />
    </div>
  );
}
