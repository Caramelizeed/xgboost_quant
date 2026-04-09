import React from 'react';

export function StatusBar({ latency, asset, lastRun, error }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <span>Latency: <span className="text-white">{latency !== undefined ? `${latency} ms` : '–'}</span></span>
        <span>Asset: <span className="text-white">{asset}</span></span>
        <span>Last run: <span className="text-white">{lastRun ?? 'never'}</span></span>
      </div>
      {error && <div className="text-negative">Error: {error}</div>}
    </div>
  );
}
