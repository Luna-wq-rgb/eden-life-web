import Link from "next/link";

type EdenLogoProps = {
  withWordmark?: boolean;
  className?: string;
};

export function EdenLogo({ withWordmark = true, className = "" }: EdenLogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-3 ${className}`.trim()} aria-label="Eden Life, volver al inicio">
      <span className="eden-logo-mark" aria-hidden="true">
        <span className="eden-logo-core">E</span>
      </span>
      {withWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-white/45">EDEN NETWORK</span>
          <span className="text-lg font-black uppercase tracking-[0.42em] text-white">Eden Life</span>
        </span>
      ) : null}
    </Link>
  );
}
