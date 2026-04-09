import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

const tooltipStyle = {
  backgroundColor: '#121212',
  border: '1px solid rgba(239,159,39,0.2)',
  color: '#f8f8f2',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
};

export function EquityCurve({ dates = [], equityCurve = [], drawdown = [] }) {
  const data = dates.map((date, index) => ({
    date,
    equity: equityCurve[index] ?? null,
    drawdown: drawdown[index] ?? 0,
  }));

  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-[0_0_50px_rgba(0,0,0,0.15)] overflow-hidden" style={{ maxWidth: '100%' }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted">Equity Curve</div>
          <h2 className="text-xl font-semibold text-white">Portfolio performance</h2>
        </div>
      </div>
      <div style={{ height: 420, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#1b1b1b" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 12 }} tickLine={false} axisLine={false} interval="preserveStartEnd" tickFormatter={(value) => value.slice(0, 10)} />
            <YAxis yAxisId="left" tick={{ fill: '#999', fontSize: 12 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#999', fontSize: 12 }} tickLine={false} axisLine={false} domain={['dataMin', 0]} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#f8f8f2' }} formatter={(value, name) => [name === 'drawdown' ? `${Number(value).toFixed(1)}%` : `₹${Number(value).toLocaleString()}`, name]} />
            <ReferenceLine yAxisId="left" y={equityCurve[0] ?? 0} stroke="#EF9F27" strokeDasharray="4 4" />
            <Bar yAxisId="right" dataKey="drawdown" barSize={12} fill="rgba(226, 75, 74, 0.45)" />
            <Line yAxisId="left" type="monotone" dataKey="equity" stroke="#EF9F27" strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
