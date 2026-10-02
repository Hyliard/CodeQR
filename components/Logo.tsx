const EYE = 'M10 2h12a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H10a8 8 0 0 1-8-8V10a8 8 0 0 1 8-8ZM11 6a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V11a5 5 0 0 0-5-5Z';

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d={EYE} fill="currentColor" fillRule="evenodd" />
      <rect x={10} y={10} width={12} height={12} rx={3.5} fill="currentColor" />
    </svg>
  );
}
