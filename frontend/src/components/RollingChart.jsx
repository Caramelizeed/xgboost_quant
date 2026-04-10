import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

const tooltipStyle = {
  backgroundColor: '#121212',
  border: '1px solid rgba(239,159,39,0.2)',
  color: '#f8f8f2',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
};

export function RollingChart({ dates = [], rollingSharpe = [], rollingHitRate = [] }) {
  const data = dates.map((date, index) => ({
    date,
    sharpe: rollingSharpe[index] ?? 0,
    hit_rate: (rollingHitRate[index] ?? 0) * 100,
  }));

  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-[0_0_50px_rgba(0,0,0,0.15)] overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted">Rolling Metrics</div>
          <h2 className="text-xl font-semibold text-white">Rolling Sharpe & Win Rate</h2>
        </div>
      </div>
      <div style={{ height: 360, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#1b1b1b" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 12 }} tickLine={false} axisLine={false} interval="preserveStartEnd" tickFormatter={(value) => value.slice(0, 10)} />
            <YAxis yAxisId="left" tick={{ fill: '#999', fontSize: 12 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#999', fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#f8f8f2' }} formatter={(value, name) => [`${Number(value).toFixed(name === 'hit_rate' ? 1 : 2)}${name === 'hit_rate' ? '%' : ''}`, name === 'hit_rate' ? 'Hit Rate' : 'Sharpe']} />
            <ReferenceLine y={1} yAxisId="left" stroke="#22c55e" strokeDasharray="4 4" />
            <Line yAxisId="left" type="monotone" dataKey="sharpe" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="hit_rate" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
