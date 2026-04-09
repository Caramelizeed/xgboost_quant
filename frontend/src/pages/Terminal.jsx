import React, { useMemo, useState } from 'react';
import useSimulation from '../hooks/useSimulation';
import { MetricsBar } from '../components/MetricsBar';
import { StrategyPanel } from '../components/StrategyPanel';
import { EquityCurve } from '../components/EquityCurve';
import { TradeBlotter } from '../components/TradeBlotter';
import { StatusBar } from '../components/StatusBar';

const defaultParams = {
  asset: 'NIFTY50',
  capital: 100000,
  threshold_long: 0.6,
  threshold_short: 0.4,
  risk_per_trade: 0.02,
  start_date: '2020-01-01',
  end_date: '2024-01-01',
  timeframe: '1d',
};

const assetOptions = ['NIFTY50', 'BANKNIFTY', 'BTC-USD'];

export default function Terminal() {
  const [params, setParams] = useState(defaultParams);
  const [lastRun, setLastRun] = useState('never');
  const { result, loading, error, run } = useSimulation();

  const handleParamChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleAssetChange = (event) => {
    setParams((prev) => ({ ...prev, asset: event.target.value }));
  };

  const handleRun = async () => {
    const data = await run(params);
    if (data) {
      setLastRun(new Date().toLocaleString());
    }
  };

  const drawdown = useMemo(() => {
    const equity = result?.equity_curve || [];
    let peak = -Infinity;
    return equity.map((value) => {
      peak = Math.max(peak, value);
      return peak > 0 ? ((value - peak) / peak) * 100 : 0;
    });
  }, [result]);

  return (
    <div className="min-h-screen bg-terminal px-4 py-6 text-white sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="mx-auto max-w-7xl space-y-6 overflow-x-hidden">
        <header className="rounded-xl border border-border bg-surface p-5 shadow-[0_0_70px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-muted">QUANTLAB TERMINAL</div>
              <h1 className="mt-2 text-3xl font-semibold text-white">Market signal desk</h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded border border-border bg-[#121212] p-3 text-sm">
                <div className="text-xs uppercase tracking-[0.3em] text-muted">Asset</div>
                <select value={params.asset} onChange={handleAssetChange} className="mt-2 w-full bg-transparent text-white outline-none">
                  {assetOptions.map((asset) => (
                    <option key={asset} value={asset} className="bg-surface text-white">
                      {asset}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded border border-border bg-[#121212] p-3 text-sm">
                <div className="text-xs uppercase tracking-[0.3em] text-muted">Time range</div>
                <div className="mt-2 text-white">{params.start_date} → {params.end_date}</div>
              </div>
            </div>
          </div>
        </header>

        <section>
          <MetricsBar data={result} />
        </section>

        <main className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(280px,320px)_1fr] overflow-x-hidden">
          <div className="space-y-6 min-w-0">
            <StrategyPanel params={params} onChange={handleParamChange} onRun={handleRun} loading={loading} />
          </div>

          <div className="space-y-6 min-w-0">
            {result?.dates?.length > 0 && result?.equity_curve?.length > 0 ? (
              <EquityCurve dates={result?.dates} equityCurve={result?.equity_curve} drawdown={drawdown} />
            ) : (
              <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
                Run a simulation to reveal the equity curve.
              </div>
            )}

            {result?.trades?.length > 0 ? (
              <TradeBlotter trades={result.trades} />
            ) : (
              <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
                Trade blotter will appear after a successful run.
              </div>
            )}
          </div>
        </main>

        <StatusBar latency={result?._latency} asset={params.asset} lastRun={lastRun} error={error} />
      </div>
    </div>
  );
}
