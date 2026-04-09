import React, { useMemo, useState } from 'react';

const columns = [
  { key: 'date', label: 'DATE' },
  { key: 'direction', label: 'DIRECTION' },
  { key: 'entry', label: 'ENTRY' },
  { key: 'exit', label: 'EXIT' },
  { key: 'size', label: 'SIZE' },
  { key: 'pnl', label: 'PNL' },
  { key: 'return_pct', label: 'RETURN%' },
];

export function TradeBlotter({ trades = [] }) {
  const [sortKey, setSortKey] = useState('date');
  const [sortDescending, setSortDescending] = useState(true);

  const sortedTrades = useMemo(() => {
    const sorted = [...trades].sort((a, b) => {
      const aValue = a[sortKey] ?? '';
      const bValue = b[sortKey] ?? '';
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue - bValue;
      }
      return String(aValue).localeCompare(String(bValue));
    });
    return sortDescending ? sorted.reverse() : sorted;
  }, [sortKey, sortDescending, trades]);

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDescending((current) => !current);
    } else {
      setSortKey(key);
      setSortDescending(true);
    }
  };

  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-[0_0_50px_rgba(0,0,0,0.15)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted">Trade Blotter</div>
          <h2 className="text-xl font-semibold text-white">Trade log</h2>
        </div>
        <div className="text-sm text-muted">{trades.length} trades</div>
      </div>
      <div className="overflow-x-auto max-w-full rounded-lg border border-[#232323] bg-[#121212]" style={{ maxWidth: '100%' }}>
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-[#121212] text-[11px] uppercase tracking-[0.3em] text-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="cursor-pointer px-4 py-3"
                  onClick={() => toggleSort(column.key)}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1f]">
            {sortedTrades.map((trade, idx) => (
              <tr key={`${trade.date}-${idx}`} className="hover:bg-white/5">
                <td className="px-4 py-3 text-[#c7c7c7]">{trade.date}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-[11px] uppercase ${trade.direction?.toLowerCase() === 'long' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                    {trade.direction}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-[#c7c7c7]">{trade.entry ?? '–'}</td>
                <td className="px-4 py-3 text-right text-[#c7c7c7]">{trade.exit ?? '–'}</td>
                <td className="px-4 py-3 text-right text-[#c7c7c7]">{trade.size ?? '–'}</td>
                <td className={`px-4 py-3 text-right ${trade.pnl >= 0 ? 'text-positive' : 'text-negative'}`}>₹{trade.pnl?.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right ${trade.return_pct >= 0 ? 'text-positive' : 'text-negative'}`}>{trade.return_pct?.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
