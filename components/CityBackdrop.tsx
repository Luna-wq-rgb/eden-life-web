const particles = [
  "left-[6%] top-[14%] h-2 w-2 delay-[120ms]",
  "left-[18%] top-[28%] h-1.5 w-1.5 delay-[600ms]",
  "left-[31%] top-[10%] h-2.5 w-2.5 delay-[980ms]",
  "left-[45%] top-[22%] h-1.5 w-1.5 delay-[1800ms]",
  "left-[59%] top-[16%] h-2 w-2 delay-[1400ms]",
  "left-[72%] top-[31%] h-1.5 w-1.5 delay-[2400ms]",
  "left-[83%] top-[18%] h-2 w-2 delay-[900ms]",
  "left-[90%] top-[11%] h-1.5 w-1.5 delay-[2000ms]",
  "left-[10%] top-[56%] h-1.5 w-1.5 delay-[1600ms]",
  "left-[25%] top-[64%] h-2 w-2 delay-[500ms]",
  "left-[38%] top-[70%] h-1.5 w-1.5 delay-[2200ms]",
  "left-[53%] top-[59%] h-2.5 w-2.5 delay-[1300ms]",
  "left-[68%] top-[68%] h-1.5 w-1.5 delay-[2600ms]",
  "left-[79%] top-[61%] h-2 w-2 delay-[1700ms]",
  "left-[92%] top-[73%] h-1.5 w-1.5 delay-[800ms]"
];

export function CityBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.13),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_30%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[42vh] city-skyline opacity-90" />
      <div className="absolute left-1/2 top-[16%] h-64 w-64 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent" />

      {particles.map((particle) => (
        <span key={particle} className={`particle ${particle}`} />
      ))}
    </div>
  );
}
