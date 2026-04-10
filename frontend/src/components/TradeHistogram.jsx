import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const tooltipStyle = {
  backgroundColor: '#121212',
  border: '1px solid rgba(239,159,39,0.2)',
  color: '#f8f8f2',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
};

const BUCKET_WIDTH = 0.5;
const MIN_BUCKET = -5;
const MAX_BUCKET = 5;

function buildBuckets(trades) {
  const buckets = [];
  for (let value = MIN_BUCKET; value < MAX_BUCKET; value += BUCKET_WIDTH) {
    buckets.push({
      range: `${value.toFixed(1)}%`,
      count: 0,
      lower: value,
      upper: value + BUCKET_WIDTH,
    });
  }

  trades.forEach((trade) => {
    const pct = Number(trade.return_pct);
    if (Number.isNaN(pct)) return;
    const bucket = buckets.find((b) => pct >= b.lower && pct < b.upper);
    if (bucket) {
      bucket.count += 1;
    }
  });

  return buckets.map((bucket) => ({
    range: bucket.range,
    count: bucket.count,
  }));
}

export function TradeHistogram({ trades = [] }) {
  const data = useMemo(() => buildBuckets(trades), [trades]);
  const totalTrades = trades.length;

  if (!totalTrades) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
        Trade histogram will appear after a successful run.
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-[0_0_50px_rgba(0,0,0,0.15)] overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted">Trade distribution</div>
          <h2 className="text-xl font-semibold text-white">Trade return histogram</h2>
        </div>
        <div className="text-sm text-muted">{totalTrades} trades</div>
      </div>
      <div style={{ height: 320, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
            <CartesianGrid stroke="#1b1b1b" vertical={false} />
            <XAxis dataKey="range" tick={{ fill: '#999', fontSize: 10 }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: '#999', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, 'Trades']} />
            <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
