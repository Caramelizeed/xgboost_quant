import React from 'react';

export function MetricsCards({ title = 'Metrics', metrics }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_0_50px_rgba(0,0,0,0.12)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <ul className="space-y-3 text-sm text-white/80">
        <li>
          <span className="font-medium text-white">Sharpe:</span> {metrics.sharpe_ratio ?? '—'}
        </li>
        <li>
          <span className="font-medium text-white">Max Drawdown:</span> {metrics.max_drawdown ?? '—'}
        </li>
        <li>
          <span className="font-medium text-white">Final Capital:</span> {metrics.final_capital ?? metrics.equity_curve?.slice(-1)?.[0] ?? '—'}
        </li>
        <li>
          <span className="font-medium text-white">Trades:</span> {metrics.trades?.length ?? '—'}
        </li>
      </ul>
    </div>
  );
}
