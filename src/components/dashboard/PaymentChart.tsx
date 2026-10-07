'use client';
import { useState } from 'react';
import { Card, Button, SegmentedTabs } from '@/components/ui/primitives';

const RANGES = {
  '12 Month': { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], v: [48,56,60,52,40,46,70,64,52,66,78,72], on: 4 },
  '6 Month': { labels: ['Jul','Aug','Sep','Oct','Nov','Dec'], v: [60,52,68,58,76,70], on: 3 },
  '30 Days': { labels: ['1','5','10','15','20','25','30'], v: [40,52,46,64,58,72,66], on: 4 },
} as const;
type R = keyof typeof RANGES;

export function PaymentChart() {
  const [range, setRange] = useState<R>('12 Month');
  const { labels, v, on } = RANGES[range];
  const W = 600, H = 220, step = W / (v.length - 1);
  const xy = v.map((p, i) => [i * step, H - (p / 100) * H]);
  let d = `M${xy[0][0]},${xy[0][1]}`;
  for (let i = 0; i < xy.length - 1; i++) { const cx = (xy[i][0] + xy[i + 1][0]) / 2; d += ` C${cx},${xy[i][1]} ${cx},${xy[i + 1][1]} ${xy[i + 1][0]},${xy[i + 1][1]}`; }
  const left = (on / (v.length - 1)) * 100, top = (xy[on][1] / H) * 100;
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Payment Volume</h2>
        <div className="flex items-center gap-3"><SegmentedTabs items={Object.keys(RANGES) as R[]} value={range} onChange={setRange} />
          <Button variant="outline" small className="hidden bg-s2b sm:inline-flex">Export Data</Button></div>
      </div>
      <div className="relative mt-6 h-[180px] sm:h-[220px]" role="img" aria-label={`Payment volume, ${range}`}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5542f6" stopOpacity=".35" /><stop offset="1" stopColor="#5542f6" stopOpacity="0" /></linearGradient></defs>
          <path d={`${d} L${W},${H} L0,${H} Z`} fill="url(#fill)" />
          <path d={d} fill="none" stroke="#9b90f9" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="absolute bottom-0 w-[9%] -translate-x-1/2 rounded-t-xl bg-hl/80" style={{ left: `${left}%`, top: `${top}%` }} />
        <span className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-primary" style={{ left: `${left}%`, top: `${top}%` }} />
      </div>
      <div className="mt-4 flex justify-between text-xs text-ink2 sm:text-sm">
        {labels.map((l, i) => <span key={l + i} className={i === on ? 'rounded-full bg-primary px-3 py-1 font-semibold text-white' : 'px-1 py-1'}>{l}</span>)}
      </div>
    </Card>
  );
}
