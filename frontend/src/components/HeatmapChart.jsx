import React from 'react';

function getCellColor(value, min, max) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '#2a2a2a';
  }
  const ratio = min === max ? 0.5 : (value - min) / (max - min);
  if (ratio < 0.5) {
    return `rgba(${255 - Math.round(ratio * 2 * 255)}, 99, 71, 0.85)`;
  }
  return `rgba(34, 197, 94, ${0.3 + ratio * 0.7})`;
}

export function HeatmapChart({ heatmap, onCellClick }) {
  const matrix = Array.isArray(heatmap?.matrix) ? heatmap.matrix : [];
  const xAxis = Array.isArray(heatmap?.x_axis) ? heatmap.x_axis : [];
  const yAxis = Array.isArray(heatmap?.y_axis) ? heatmap.y_axis : [];

  if (!heatmap || !matrix.length || !xAxis.length || !yAxis.length) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
        Generate a heatmap to explore parameter sensitivity.
      </div>
    );
  }

  const values = matrix.flatMap((row) => (Array.isArray(row) ? row : [])).filter((v) => typeof v === 'number' && Number.isFinite(v));
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-[0_0_50px_rgba(0,0,0,0.15)] overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted">Parameter heatmap</div>
          <h2 className="text-xl font-semibold text-white">Sharpe sensitivity</h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-grid rounded-xl border border-[#2b2b2b]" style={{ gridTemplateColumns: `140px repeat(${xAxis.length}, minmax(60px, 1fr))` }}>
          <div className="border-b border-r border-[#2b2b2b] bg-[#121212] px-3 py-3 text-[11px] uppercase tracking-[0.3em] text-muted">{heatmap.param_x} {'\\'} {heatmap.param_y}</div>
          {xAxis.map((x, colIndex) => (
            <div key={`x-${colIndex}`} className="border-b border-[#2b2b2b] bg-[#121212] px-3 py-3 text-right text-[11px] uppercase tracking-[0.3em] text-muted">
              {x}
            </div>
          ))}
          {yAxis.map((y, rowIndex) => (
            <React.Fragment key={`y-${rowIndex}`}>
              <div className="border-r border-[#2b2b2b] bg-[#121212] px-3 py-3 text-[11px] uppercase tracking-[0.3em] text-muted">
                {y}
              </div>
              {Array.isArray(matrix[rowIndex]) ? matrix[rowIndex].map((value, colIndex) => {
                const cellValue = Number.isFinite(value) ? value : null;
                return (
                  <button
                    key={`cell-${rowIndex}-${colIndex}`}
                    type="button"
                    onClick={() => onCellClick?.({ [heatmap.param_x]: xAxis[colIndex], [heatmap.param_y]: yAxis[rowIndex] })}
                    className="border border-[#2b2b2b] p-3 text-right text-sm text-white hover:opacity-90"
                    style={{ backgroundColor: cellValue !== null ? getCellColor(cellValue, min, max) : '#2a2a2a' }}
                  >
                    {cellValue !== null ? cellValue.toFixed(2) : '-'}
                  </button>
                );
              }) : null}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="mt-4 text-sm text-muted">Click a cell to load the selected parameters.</div>
    </div>
  );
}
