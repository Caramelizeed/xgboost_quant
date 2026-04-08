import React from 'react';

export function EquityCurve({ dates, equityCurve }) {
  return (
    <div>
      <h3>Equity Curve</h3>
      <pre>{JSON.stringify({ dates: dates.slice(-5), equity: equityCurve.slice(-5) }, null, 2)}</pre>
    </div>
  );
}
