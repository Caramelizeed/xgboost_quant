import React from 'react';

export function MetricsCards({ metrics }) {
  return (
    <div>
      <h3>Metrics</h3>
      <ul>
        <li>Sharpe: {metrics.sharpe_ratio}</li>
        <li>Max Drawdown: {metrics.max_drawdown}</li>
      </ul>
    </div>
  );
}
