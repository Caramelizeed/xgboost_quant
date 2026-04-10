# xgboost_quant

Structured quant ML project scaffold for signal generation, walk-forward training, FastAPI deployment, and a dark terminal-style React dashboard.

## Layout
- `data/` raw, processed, and feature parquet data
- `src/` core pipeline modules and FastAPI API
- `frontend/` React dashboard for live strategy simulation
- `notebooks/` research and analysis
- `config/config.yaml` hyperparameters and execution defaults
- `tests/` unit and integration checks

## Backend
The API is served from `src/api/main.py` with CORS enabled and exposes:
- `POST /simulate` — run a simulation and return performance metrics, equity curve, and trades

### Assets supported by frontend
- `NIFTY50` → `^NSEI`
- `BANKNIFTY` → `^NSEBANK`
- `BTC-USD` → `BTC-USD`

### Run backend
```bash
pip install -r requirements.txt
python -m uvicorn src.api.main:app --reload --port 8000
```

## Frontend
The dashboard is located in `frontend/` and uses React, Tailwind, Recharts, and Axios.

### Run frontend
```bash
cd frontend
npm install
npm start
```

Browse the app at `http://localhost:3000` and ensure backend is running at `http://127.0.0.1:8000`.

## What changed
- Added a React dashboard under `frontend/` with a dark terminal-style layout
- Added Tailwind CSS and custom terminal theme styling in `frontend/tailwind.config.js` and `frontend/src/index.css`
- Added dashboard components:
  - `Terminal.jsx` — main layout
  - `StrategyPanel.jsx` — parameter sliders + run button
  - `MetricsBar.jsx` — top metrics ribbon
  - `EquityCurve.jsx` — chart with equity + drawdown
  - `TradeBlotter.jsx` — sortable trade log
  - `StatusBar.jsx` — latency / asset / last run / errors
  - `RunButton.jsx` — loading CTA button
- Added API service with latency tracking in `frontend/src/services/api.js`
- Added `useSimulation` hook for async simulation state management
- Fixed frontend chart layout and overflow so the equity chart no longer breaks the page
- Anchored the run button within the strategy panel for stable layout
- Fixed backend asset mapping for `NIFTY50` and `BANKNIFTY` with yfinance-compatible tickers
- Updated React entry point to render the dashboard and added CSS imports

## Notes
- Backend and frontend are separate; run both servers concurrently for full end-to-end flow
- If the frontend complains about missing package versions, re-run `npm install` inside `frontend/`
