import React, { useEffect, useMemo, useState } from 'react';
import useSimulation from '../hooks/useSimulation';
import { runHeatmap } from '../services/api';
import { MetricsBar } from '../components/MetricsBar';
import { StrategyPanel } from '../components/StrategyPanel';
import { EquityCurve } from '../components/EquityCurve';
import { RollingChart } from '../components/RollingChart';
import { HeatmapChart } from '../components/HeatmapChart';
import { FeatureImportance } from '../components/FeatureImportance';
import { TradeHistogram } from '../components/TradeHistogram';
import { TradeBlotter } from '../components/TradeBlotter';
import { StatusBar } from '../components/StatusBar';

const defaultParams = {
  asset: 'NIFTY50',
  capital: 100000,
  labeling_method: 'threshold',
  exchange: null,
  threshold_long: 0.6,
  threshold_short: 0.4,
  risk_per_trade: 0.02,
  start_date: '2020-01-01',
  end_date: '2024-01-01',
  timeframe: '1d',
};


export default function Terminal({ initialAsset = 'NIFTY50', onOpenAssetSearch = () => {} }) {
  const [params, setParams] = useState(defaultParams);
  const [lastRun, setLastRun] = useState('never');
  const [heatmap, setHeatmap] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState(null);
  const { result, loading, error, run } = useSimulation();

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      asset: initialAsset,
      exchange: initialAsset.includes('/') ? prev.exchange : null,
    }));
  }, [initialAsset]);

  const handleParamChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleRun = async () => {
    const data = await run(params);
    if (data) {
      setLastRun(new Date().toLocaleString());
    }
  };

  const buildRange = (center, step, count, min, max) => {
    const half = (count - 1) / 2;
    const values = Array.from({ length: count }, (_, idx) => {
      const raw = Number((center + (idx - half) * step).toFixed(4));
      return Math.min(Math.max(raw, min), max);
    });
    return Array.from(new Set(values));
  };

  const handleGenerateHeatmap = async () => {
    setHeatmapLoading(true);
    setHeatmapError(null);
    try {
      const payload = {
        base_params: params,
        param_x: 'threshold_long',
        param_y: 'risk_per_trade',
        x_range: buildRange(params.threshold_long, 0.02, 8, 0.5, 1.0),
        y_range: buildRange(params.risk_per_trade, 0.005, 8, 0.005, 0.1),
      };
      const data = await runHeatmap(payload);
      setHeatmap(data);
    } catch (ex) {
      setHeatmapError(ex.message || 'Heatmap generation failed');
      setHeatmap(null);
    } finally {
      setHeatmapLoading(false);
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
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-white font-semibold">{params.asset}</span>
                  <button
                    type="button"
                    onClick={onOpenAssetSearch}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400"
                  >
                    Change
                  </button>
                </div>
                <div className="mt-2 text-xs text-muted">
                  Use the dedicated asset page to search and switch symbols cleanly.
                </div>
              </div>
              <div className="rounded border border-border bg-[#121212] p-3 text-sm">
                <div className="text-xs uppercase tracking-[0.3em] text-muted">Time range</div>
                <div className="mt-2 text-white">{params.start_date} → {params.end_date}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <MetricsBar data={result} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
              <div className="text-xs uppercase tracking-[0.3em] text-muted">Heatmap</div>
              <div className="mt-2 text-white">Explore the Sharpe surface for threshold and risk per trade.</div>
              {heatmapError && <div className="mt-3 text-sm text-negative">{heatmapError}</div>}
            </div>
            <button
              type="button"
              disabled={heatmapLoading}
              onClick={handleGenerateHeatmap}
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
            >
              {heatmapLoading ? 'Generating heatmap...' : 'Generate heatmap'}
            </button>
          </div>
        </section>

        <main className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(280px,320px)_1fr] overflow-x-hidden">
          <div className="space-y-6 min-w-0">
            <StrategyPanel params={params} onChange={handleParamChange} onRun={handleRun} loading={loading} />
          </div>

          <div className="space-y-6 min-w-0">
            {result?.dates?.length > 0 && result?.equity_curve?.length > 0 ? (
              <>
                <EquityCurve dates={result?.dates} equityCurve={result?.equity_curve} drawdown={drawdown} />
                <RollingChart
                  dates={result?.dates}
                  rollingSharpe={result?.rolling_sharpe}
                  rollingHitRate={result?.rolling_hit_rate}
                />
                <FeatureImportance
                  featureNames={result?.explain?.feature_names}
                  meanAbsShap={result?.explain?.mean_abs_shap}
                />
                <TradeHistogram trades={result?.trades || []} />
              </>
            ) : (
              <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
                Run a simulation to reveal the equity curve.
              </div>
            )}

            <HeatmapChart
              heatmap={heatmap}
              onCellClick={(values) => {
                const updated = { ...params, ...values };
                setParams(updated);
                run(updated);
              }}
            />

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
