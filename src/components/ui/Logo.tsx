import Image from 'next/image';
/** Supplied mark, untouched (373×376 native). Wordmark text sits where the reference wordmark sat. */
export function Logo({ size = 36, showWordmark = true }: { size?: number; showWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image src="/trustpay-mark.png" alt={showWordmark ? '' : 'TrustPay'} width={size} height={Math.round((size * 376) / 373)} priority />
      {showWordmark && <span className="text-lg font-semibold tracking-tight text-soft">TrustPay</span>}
    </span>
  );
}
