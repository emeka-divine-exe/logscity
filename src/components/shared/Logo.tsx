import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
        Logs<span className="text-primary">City</span>
      </span>
    </Link>
  );
}
