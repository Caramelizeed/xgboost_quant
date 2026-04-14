import './index.css';
import React, { useState } from 'react';
import Terminal from './pages/Terminal';
import AssetSearch from './pages/AssetSearch';
import { assetOptions } from './data/assetOptions';

export default function App() {
  const [page, setPage] = useState('terminal');
  const [selectedAsset, setSelectedAsset] = useState(assetOptions[0] || 'NIFTY50');

  return page === 'assets' ? (
    <AssetSearch
      assetOptions={assetOptions}
      selectedAsset={selectedAsset}
      onBack={() => setPage('terminal')}
      onSelectAsset={(asset) => {
        setSelectedAsset(asset);
        setPage('terminal');
      }}
    />
  ) : (
    <Terminal
      initialAsset={selectedAsset}
      onOpenAssetSearch={() => setPage('assets')}
    />
  );
}
