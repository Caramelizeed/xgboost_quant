import React, { useState } from 'react';
import { InputPanel } from '../components/InputPanel';
import { EquityCurve } from '../components/EquityCurve';
import { MetricsCards } from '../components/MetricsCards';
import { TradeTable } from '../components/TradeTable';
import { runSimulation } from '../services/api';

const defaultParams = {
  asset: 'BTC-USD',
  start_date: '2020-01-01',
  end_date: '2024-01-01',
  threshold_long: 0.6,
  threshold_short: 0.4,
  risk_per_trade: 0.02,
};

const defaultParamsB = {
  ...defaultParams,
  threshold_long: 0.7,
  threshold_short: 0.3,
  risk_per_trade: 0.03,
};

export function Dashboard() {
  const [mode, setMode] = useState('single');
  const [paramsA, setParamsA] = useState(defaultParams);
  const [paramsB, setParamsB] = useState(defaultParamsB);
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResultA(null);
    setResultB(null);

    try {
      if (mode === 'single') {
        const dataA = await runSimulation(paramsA);
        setResultA(dataA);
      } else {
        const [dataA, dataB] = await Promise.all([runSimulation(paramsA), runSimulation(paramsB)]);
        setResultA(dataA);
        setResultB(dataB);
      }
    } catch (e) {
      setError(e.message || 'Unable to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const renderDifferencePanel = () => {
    if (!resultA || !resultB) return null;

    const capitalA = resultA.final_capital ?? resultA.equity_curve?.slice(-1)?.[0] ?? 0;
    const capitalB = resultB.final_capital ?? resultB.equity_curve?.slice(-1)?.[0] ?? 0;
    const sharpeA = resultA.sharpe_ratio ?? 0;
    const sharpeB = resultB.sharpe_ratio ?? 0;

    return (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-sm text-muted">Delta Final Capital</div>
          <div className="mt-2 text-2xl font-semibold text-white">{Number(capitalB - capitalA).toFixed(0)}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-sm text-muted">Delta Sharpe Ratio</div>
          <div className="mt-2 text-2xl font-semibold text-white">{(sharpeB - sharpeA).toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-sm text-muted">Strategy B vs A</div>
          <div className="mt-2 text-2xl font-semibold text-white">{capitalB > capitalA ? 'B leads' : 'A leads'}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 px-4 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Quant Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Switch between a single strategy run and a side-by-side comparison of two strategies.
          </p>
        </div>

        <div className="inline-flex overflow-hidden rounded-full border border-border bg-surface text-sm shadow-sm">
          <button
            className={`px-4 py-2 transition ${mode === 'single' ? 'bg-primary text-white' : 'text-muted hover:bg-white/5'}`}
            onClick={() => setMode('single')}
            type="button"
          >
            Single Mode
          </button>
          <button
            className={`px-4 py-2 transition ${mode === 'compare' ? 'bg-primary text-white' : 'text-muted hover:bg-white/5'}`}
            onClick={() => setMode('compare')}
            type="button"
          >
            Compare Mode
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${mode === 'compare' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        <InputPanel
          title={mode === 'single' ? 'Strategy' : 'Strategy A'}
          values={paramsA}
          onChange={setParamsA}
          hideSubmit={mode === 'compare'}
          submitLabel="Run Simulation"
          disabled={loading}
        />

        {mode === 'compare' && (
          <InputPanel
            title="Strategy B"
            values={paramsB}
            onChange={setParamsB}
            hideSubmit
            disabled={loading}
          />
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted">Use the same date range in both strategies to make the comparison meaningful.</p>
        </div>
        <button
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleRun}
          disabled={loading}
          type="button"
        >
          {mode === 'single' ? 'Run Simulation' : 'Run Compare'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
      )}

      {mode === 'single' && resultA && (
        <div className="space-y-6">
          <MetricsCards title="Strategy" metrics={resultA} />
          <EquityCurve dates={resultA.dates} equityCurve={resultA.equity_curve} drawdown={resultA.drawdown} />
          <TradeTable trades={resultA.trades} />
        </div>
      )}

      {mode === 'compare' && resultA && resultB && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <MetricsCards title="Strategy A" metrics={resultA} />
            <MetricsCards title="Strategy B" metrics={resultB} />
          </div>

          {renderDifferencePanel()}

          <EquityCurve
            dates={resultA.dates}
            equityCurve={resultA.equity_curve}
            compareCurve={resultB.equity_curve}
            drawdown={resultA.drawdown}
            compareDrawdown={resultB.drawdown}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <TradeTable trades={resultA.trades} title="Strategy A Trades" />
            <TradeTable trades={resultB.trades} title="Strategy B Trades" />
          </div>
        </div>
      )}
    </div>
  );
}
