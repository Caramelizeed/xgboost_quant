import React, { useMemo, useState } from 'react';

export default function AssetSearch({ assetOptions, selectedAsset, onBack, onSelectAsset }) {
  const [query, setQuery] = useState('');
  const [customAsset, setCustomAsset] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const filteredAssets = useMemo(
    () => assetOptions.filter((asset) => asset.toLowerCase().includes(normalizedQuery)),
    [assetOptions, normalizedQuery]
  );

  const handleSelect = (asset) => {
    onSelectAsset(asset);
    setQuery('');
    setCustomAsset('');
  };

  return (
    <div className="min-h-screen bg-terminal px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-xl border border-border bg-surface p-6 shadow-[0_0_70px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-muted">Asset search</div>
              <h1 className="mt-2 text-3xl font-semibold text-white">Choose your market symbol</h1>
              <p className="mt-3 max-w-2xl text-sm text-muted">
                Search or type any stock or crypto ticker. The list is only a starting point — you can enter any valid symbol and use it immediately.
              </p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center rounded-xl bg-[#1f2937] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#374151]"
            >
              Back to terminal
            </button>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-xl border border-border bg-surface p-6 shadow-[0_0_50px_rgba(0,0,0,0.15)]">
            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-muted">Active symbol</div>
                <div className="mt-2 rounded-xl border border-[#2b2b2b] bg-[#0f172a] px-4 py-3 text-white font-semibold">
                  {selectedAsset}
                </div>
              </div>

              <div>
                <label className="text-sm uppercase tracking-[0.3em] text-muted">Search ticker</label>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by symbol or pair"
                  className="mt-3 w-full rounded-xl border border-[#2b2b2b] bg-[#0f172a] px-4 py-3 text-white outline-none placeholder:text-[#777]"
                />
              </div>

              <div>
                <label className="text-sm uppercase tracking-[0.3em] text-muted">Custom symbol</label>
                <input
                  value={customAsset}
                  onChange={(event) => setCustomAsset(event.target.value)}
                  placeholder="Enter ticker like BTC-USD or AAPL"
                  className="mt-3 w-full rounded-xl border border-[#2b2b2b] bg-[#0f172a] px-4 py-3 text-white outline-none placeholder:text-[#777]"
                />
                <button
                  type="button"
                  onClick={() => customAsset.trim() && handleSelect(customAsset.trim())}
                  className="mt-4 w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-60"
                  disabled={!customAsset.trim()}
                >
                  Use custom asset
                </button>
              </div>

              <div className="rounded-xl border border-[#2b2b2b] bg-[#0d0d0d] p-4 text-sm text-muted">
                Recommended symbols appear here. Click one to load it instantly into the simulation.
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-muted">Suggested assets</div>
                <p className="text-sm text-muted">Showing matches for your search query.</p>
              </div>
              <div className="text-xs text-white/70">{filteredAssets.length} results</div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAssets.map((asset) => (
                <button
                  key={asset}
                  type="button"
                  onClick={() => handleSelect(asset)}
                  className="rounded-2xl border border-[#2b2b2b] bg-[#111827] px-4 py-5 text-left text-white transition hover:border-amber-400 hover:bg-[#1f2937]"
                >
                  <div className="text-sm font-semibold">{asset}</div>
                  <div className="mt-2 text-xs text-muted">Click to select this ticker</div>
                </button>
              ))}
              {filteredAssets.length === 0 && (
                <div className="rounded-2xl border border-[#2b2b2b] bg-[#111827] px-4 py-8 text-center text-sm text-muted">
                  No matches found. Try another symbol or use the custom asset field.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
