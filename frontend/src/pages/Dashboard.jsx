import React, { useState } from 'react';
import { InputPanel } from '../components/InputPanel';
import { EquityCurve } from '../components/EquityCurve';
import { MetricsCards } from '../components/MetricsCards';
import { TradeTable } from '../components/TradeTable';

export function Dashboard() {
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    const response = await fetch('http://localhost:8000/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset: 'BTC-USD', start_date: '2020-01-01', end_date: '2024-01-01' }),
    });
    const data = await response.json();
    setResult(data);
  };

  return (
    <div>
      <h1>Quant Dashboard</h1>
      <InputPanel onSubmit={handleSubmit} />
      {result && (
        <>
          <MetricsCards metrics={result} />
          <EquityCurve dates={result.dates} equityCurve={result.equity_curve} />
          <TradeTable trades={result.trades} />
        </>
      )}
    </div>
  );
}
