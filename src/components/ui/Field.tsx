export const inputCls = 'h-11 w-full rounded-btn border border-line/60 bg-s2 px-4 text-sm text-white outline-none placeholder:text-ink2 focus:border-primary';
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="mb-2 block text-ink2">{label}</span>{children}</label>;
}
