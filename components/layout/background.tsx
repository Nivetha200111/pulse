export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-surface opacity-60" />
      <div className="absolute -left-40 top-24 h-72 w-72 rounded-full bg-[rgba(0,240,255,0.18)] blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[rgba(255,0,170,0.18)] blur-3xl" />
    </div>
  );
}
