import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const tooltipStyle = {
  backgroundColor: '#121212',
  border: '1px solid rgba(239,159,39,0.2)',
  color: '#f8f8f2',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
};

export function FeatureImportance({ featureNames = [], meanAbsShap = [] }) {
  const data = useMemo(() => {
    return featureNames
      .map((name, index) => ({ name, value: meanAbsShap[index] ?? 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [featureNames, meanAbsShap]);

  if (!data.length) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
        Feature importance will appear after a successful run.
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-[0_0_50px_rgba(0,0,0,0.15)] overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted">Feature Importance</div>
          <h2 className="text-xl font-semibold text-white">Top 15 SHAP features</h2>
        </div>
      </div>
      <div style={{ height: 420, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke="#1b1b1b" vertical={false} horizontal={false} />
            <XAxis type="number" tick={{ fill: '#999', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" width={160} tick={{ fill: '#999', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [Number(value).toFixed(4), 'Mean |SHAP|']} />
            <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
