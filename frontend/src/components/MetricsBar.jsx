import React from 'react';

const metricsConfig = [
  { key: 'final_capital', label: 'FINAL CAPITAL', fmt: (v) => `₹${Math.round(v).toLocaleString()}` },
  { key: 'sharpe_ratio', label: 'SHARPE RATIO', fmt: (v) => v.toFixed(2) },
  { key: 'max_drawdown', label: 'MAX DRAWDOWN', fmt: (v) => `${v.toFixed(1)}%` },
  { key: 'hit_rate', label: 'WIN RATE', fmt: (v) => `${(v * 100).toFixed(1)}%` },
  { key: 'turnover', label: 'TURNOVER', fmt: (v) => v.toFixed(1) },
];

export function MetricsBar({ data }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {metricsConfig.map((metric) => {
        const value = data?.[metric.key];
        return (
          <div key={metric.key} className="rounded-lg border border-border bg-surface px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted">{metric.label}</div>
            <div className="mt-2 text-2xl font-semibold text-white">{value !== undefined ? metric.fmt(value) : '–'}</div>
          </div>
        );
      })}
    </div>
  );
}
