import type { ButtonHTMLAttributes, ReactNode } from 'react';
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

export const Card = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cx('min-w-0 rounded-card bg-s1', className)} {...p} />;

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'white' | 'outline'; small?: boolean };
export function Button({ variant = 'primary', small, className, ...p }: BtnProps) {
  const v = { primary: 'bg-primary text-white hover:brightness-110', white: 'bg-white text-page hover:bg-white/90',
    outline: 'border border-line text-white hover:bg-s2b' }[variant];
  return <button className={cx('inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition',
    small ? 'h-8 px-3 text-xs' : 'h-11 px-5 text-sm', v, className)} {...p} />;
}

export const IconButton = ({ className, ...p }: ButtonHTMLAttributes<HTMLButtonElement>) =>
  <button className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-full bg-icon text-white', className)} {...p} />;

const pill = { success: 'bg-okbg text-ok', warning: 'bg-warnbg text-warn', danger: 'bg-dangerbg text-danger', info: 'bg-hl text-soft' };
export const StatusPill = ({ tone, children }: { tone: keyof typeof pill; children: ReactNode }) =>
  <span className={cx('inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold', pill[tone])}>{children}</span>;

export const Avatar = ({ name, size = 40, src }: { name: string; size?: number; src?: string }) =>
  src
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={src} alt={name} width={size} height={size} style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover" />
    : <span style={{ width: size, height: size }} className="grid shrink-0 place-items-center rounded-full bg-s3 text-xs font-semibold text-soft">
        {name.split(' ').map(w => w[0]).slice(0, 2).join('')}
      </span>;

export function SegmentedTabs<T extends string>({ items, value, onChange }: { items: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="inline-flex max-w-full rounded-btn bg-s2 p-1">
      {items.map(i => (
        <button key={i} role="tab" aria-selected={i === value} onClick={() => onChange(i)}
          className={cx('h-10 rounded-lg px-3 text-sm font-medium transition sm:px-4', i === value ? 'bg-s3 text-white' : 'text-ink2 hover:text-white')}>{i}</button>
      ))}
    </div>
  );
}
