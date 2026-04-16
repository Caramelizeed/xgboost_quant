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

const defaultParamsB = {
  ...defaultParams,
  threshold_long: 0.7,
  threshold_short: 0.3,
  risk_per_trade: 0.03,
};

export default function Terminal({ initialAsset = 'NIFTY50', onOpenAssetSearch = () => {} }) {
  const [mode, setMode] = useState('single');
  const [paramsA, setParamsA] = useState(defaultParams);
  const [paramsB, setParamsB] = useState(defaultParamsB);
  const [lastRun, setLastRun] = useState('never');
  const [heatmap, setHeatmap] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState(null);
  const { result: resultA, loading: loadingA, error: errorA, run: runA } = useSimulation();
  const { result: resultB, loading: loadingB, error: errorB, run: runB } = useSimulation();

  useEffect(() => {
    const exchange = initialAsset.includes('/') ? paramsA.exchange : null;
    setParamsA((prev) => ({
      ...prev,
      asset: initialAsset,
      exchange,
    }));
    setParamsB((prev) => ({
      ...prev,
      asset: initialAsset,
      exchange,
    }));
  }, [initialAsset]);

  const handleParamChange = (side, key, value) => {
    const updater = side === 'A' ? setParamsA : setParamsB;
    updater((prev) => ({ ...prev, [key]: value }));
  };

  const handleRun = async () => {
    if (mode === 'single') {
      const data = await runA(paramsA);
      if (data) {
        setLastRun(new Date().toLocaleString());
      }
    } else {
      const [dataA, dataB] = await Promise.all([runA(paramsA), runB(paramsB)]);
      if (dataA || dataB) {
        setLastRun(new Date().toLocaleString());
      }
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
        base_params: paramsA,
        param_x: 'threshold_long',
        param_y: 'risk_per_trade',
        x_range: buildRange(paramsA.threshold_long, 0.02, 8, 0.5, 1.0),
        y_range: buildRange(paramsA.risk_per_trade, 0.005, 8, 0.005, 0.1),
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

  const drawdownA = useMemo(() => {
    const equity = resultA?.equity_curve || [];
    let peak = -Infinity;
    return equity.map((value) => {
      peak = Math.max(peak, value);
      return peak > 0 ? ((value - peak) / peak) * 100 : 0;
    });
  }, [resultA]);

  const drawdownB = useMemo(() => {
    const equity = resultB?.equity_curve || [];
    let peak = -Infinity;
    return equity.map((value) => {
      peak = Math.max(peak, value);
      return peak > 0 ? ((value - peak) / peak) * 100 : 0;
    });
  }, [resultB]);

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
                <div className="text-xs uppercase tracking-[0.3em] text-muted">Mode</div>
                <div className="mt-2 inline-flex overflow-hidden rounded-full border border-border bg-surface text-sm">
                  <button
                    type="button"
                    className={`px-3 py-2 transition ${mode === 'single' ? 'bg-amber-500 text-black' : 'text-muted hover:bg-white/5'}`}
                    onClick={() => setMode('single')}
                  >
                    Single Mode
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 transition ${mode === 'compare' ? 'bg-amber-500 text-black' : 'text-muted hover:bg-white/5'}`}
                    onClick={() => setMode('compare')}
                  >
                    Compare Mode
                  </button>
                </div>
              </div>
              <div className="rounded border border-border bg-[#121212] p-3 text-sm">
                <div className="text-xs uppercase tracking-[0.3em] text-muted">Asset</div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-white font-semibold">{paramsA.asset}</span>
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
                <div className="mt-2 text-white">{paramsA.start_date} → {paramsA.end_date}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          {mode === 'single' && <MetricsBar data={resultA} />}
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

        <main className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(320px,380px)_1fr] overflow-x-hidden">
          <div className="space-y-6 min-w-0">
            {mode === 'single' ? (
              <StrategyPanel params={paramsA} onChange={(key, value) => handleParamChange('A', key, value)} onRun={handleRun} loading={loadingA} />
            ) : (
              <div className="space-y-6">
                <StrategyPanel params={paramsA} onChange={(key, value) => handleParamChange('A', key, value)} onRun={() => {}} loading={loadingA} />
                <StrategyPanel params={paramsB} onChange={(key, value) => handleParamChange('B', key, value)} onRun={() => {}} loading={loadingB} />
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={loadingA || loadingB}
                  className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {loadingA || loadingB ? 'Running comparison...' : 'Run Compare'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6 min-w-0">
            {(mode === 'single' ? resultA : resultA && resultB) && (mode === 'single' ? resultA?.dates?.length > 0 && resultA?.equity_curve?.length > 0 : resultA?.dates?.length > 0 && resultA?.equity_curve?.length > 0 && resultB?.equity_curve?.length > 0) ? (
              <>
                {mode === 'compare' ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-border bg-surface p-4">
                      <div className="text-sm uppercase tracking-[0.3em] text-muted">Strategy A</div>
                      <MetricsBar data={resultA} />
                    </div>
                    <div className="rounded-xl border border-border bg-surface p-4">
                      <div className="text-sm uppercase tracking-[0.3em] text-muted">Strategy B</div>
                      <MetricsBar data={resultB} />
                    </div>
                  </div>
                ) : (
                  <MetricsBar data={resultA} />
                )}

                <EquityCurve
                  dates={resultA?.dates}
                  equityCurve={resultA?.equity_curve}
                  drawdown={drawdownA}
                  compareCurve={mode === 'compare' ? resultB?.equity_curve : []}
                  compareDrawdown={mode === 'compare' ? drawdownB : []}
                />
                <RollingChart
                  dates={resultA?.dates}
                  rollingSharpe={resultA?.rolling_sharpe}
                  rollingHitRate={resultA?.rolling_hit_rate}
                />
                <FeatureImportance
                  featureNames={resultA?.explain?.feature_names}
                  meanAbsShap={resultA?.explain?.mean_abs_shap}
                />
                <TradeHistogram trades={resultA?.trades || []} />
              </>
            ) : (
              <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
                Run a simulation to reveal the equity curve.
              </div>
            )}

            <HeatmapChart
              heatmap={heatmap}
              onCellClick={(values) => {
                const updated = { ...paramsA, ...values };
                setParamsA(updated);
                runA(updated);
              }}
            />

            {(mode === 'single' ? resultA?.trades?.length > 0 : resultA?.trades?.length > 0 || resultB?.trades?.length > 0) ? (
              <TradeBlotter trades={resultA?.trades || []} />
            ) : (
              <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
                Trade blotter will appear after a successful run.
              </div>
            )}
          </div>
        </main>

        <StatusBar
          latency={resultA?._latency ?? resultB?._latency}
          asset={paramsA.asset}
          lastRun={lastRun}
          error={errorA || errorB}
        />
      </div>
    </div>
  );
}
