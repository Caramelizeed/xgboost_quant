import React from 'react';
import { RunButton } from './RunButton';

const controls = [
  { key: 'capital', label: 'CAPITAL (₹)', min: 10000, max: 1000000, step: 10000, fmt: (v) => `₹${v.toLocaleString()}` },
  { key: 'threshold_long', label: 'LONG THRESHOLD', min: 0.50, max: 1.0, step: 0.01, fmt: (v) => v.toFixed(2) },
  { key: 'threshold_short', label: 'SHORT THRESHOLD', min: 0.0, max: 0.50, step: 0.01, fmt: (v) => v.toFixed(2) },
  { key: 'risk_per_trade', label: 'RISK / TRADE', min: 0.005, max: 0.10, step: 0.005, fmt: (v) => `${(v * 100).toFixed(1)}%` },
];

export function StrategyPanel({ params, onChange, onRun, loading }) {
  const isCcxtAsset = params.asset?.includes('/');

  return (
    <div className="flex min-h-[620px] flex-col gap-5 rounded-xl border border-border bg-surface p-5 shadow-[0_0_50px_rgba(0,0,0,0.15)]">
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-[0.3em] text-muted">Strategy Panel</div>
        <h2 className="text-xl font-semibold text-white">Signal parameters</h2>
        <p className="text-sm text-muted">Tune the trading edge and run the simulation instantly.</p>
      </div>

      <div className="space-y-6 flex-1">
        <div className="grid gap-4">
          <div>
            <label className="text-sm uppercase tracking-[0.3em] text-muted">Start date</label>
            <input
              type="date"
              value={params.start_date}
              onChange={(event) => onChange('start_date', event.target.value)}
              className="mt-2 w-full rounded border border-[#2b2b2b] bg-[#0f172a] px-3 py-2 text-white outline-none"
            />
          </div>
          <div>
            <label className="text-sm uppercase tracking-[0.3em] text-muted">End date</label>
            <input
              type="date"
              value={params.end_date}
              onChange={(event) => onChange('end_date', event.target.value)}
              className="mt-2 w-full rounded border border-[#2b2b2b] bg-[#0f172a] px-3 py-2 text-white outline-none"
            />
          </div>
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-muted">Labeling method</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {['threshold', 'triple_barrier'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => onChange('labeling_method', method)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${params.labeling_method === method ? 'border-amber-400 bg-amber-500/15 text-white' : 'border-[#2b2b2b] text-muted'}`}
                >
                  {method.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          {isCcxtAsset && (
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-muted">Exchange</div>
              <select
                value={params.exchange || 'binance'}
                onChange={(event) => onChange('exchange', event.target.value)}
                className="mt-2 w-full rounded border border-[#2b2b2b] bg-[#0f172a] px-3 py-2 text-white outline-none"
              >
                {['binance', 'bybit', 'okx', 'kraken'].map((exchange) => (
                  <option key={exchange} value={exchange} className="bg-surface text-white">
                    {exchange}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {controls.map((control) => (
          <div key={control.key} className="space-y-2">
            <div className="flex items-center justify-between text-sm uppercase text-muted">
              <span>{control.label}</span>
              <span className="text-white">{control.fmt(params[control.key])}</span>
            </div>
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={Number(params[control.key])}
              onChange={(event) => onChange(control.key, Number(event.target.value))}
              className="w-full accent-amber"
            />
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <RunButton onClick={onRun} loading={loading} />
      </div>
    </div>
  );
}
