# XGBoost Quant

A full-stack quantitative trading system that uses XGBoost to generate buy/sell signals, backtest strategies, and visualize results through an interactive dashboard.

Supports both **stocks/indexes** (via yfinance) and **crypto** (via CCXT).

---

## What It Does

This project is an end-to-end ML trading pipeline — not just a price predictor. It fetches market data, engineers features, trains a model using walk-forward validation, backtests a threshold-based strategy with realistic costs, and serves everything through a FastAPI backend + React dashboard.

---

## Pipeline Overview

```
Raw OHLCV Data
      ↓
Data Cleaning & Labeling
      ↓
Feature Engineering (momentum, volatility, regime, statistical)
      ↓
XGBoost Training (walk-forward splits)
      ↓
Probability → Signal Generation (long/short thresholds)
      ↓
Backtest (equity curve, Sharpe, drawdown, trade log)
      ↓
FastAPI backend → React Dashboard
```

---

## Project Structure

```
xgboost_quant/
├── main.py                   # CLI entry point
├── config/
│   └── config.yaml           # Asset, model, and backtest config
├── src/
│   ├── api/
│   │   ├── main.py           # FastAPI app and endpoints
│   │   ├── simulation.py     # Full pipeline orchestration
│   │   └── schemas.py        # Request/response models
│   ├── data/
│   │   ├── ingestion.py      # yfinance + CCXT data fetching (Parquet cache)
│   │   ├── ccxt_ingestion.py # CCXT helper
│   │   ├── cleaning.py       # Data preparation
│   │   └── labeling.py       # Target label generation
│   ├── features/
│   │   ├── price.py          # Price-based features
│   │   ├── statistical.py    # Statistical features
│   │   ├── regime.py         # Regime/trend features
│   │   └── pipeline.py       # Feature combiner
│   ├── models/
│   │   ├── train.py          # Walk-forward training
│   │   ├── predict.py        # Prediction helper
│   │   ├── explain.py        # Feature importance / SHAP
│   │   └── evaluate.py       # Scoring utilities
│   └── backtest/
│       ├── engine.py         # Equity curve, P&L, signals
│       ├── metrics.py        # Sharpe, drawdown, hit rate
│       └── costs.py          # Transaction cost handling
├── frontend/
│   └── src/
│       ├── App.jsx           # Navigation
│       ├── pages/
│       │   ├── Terminal.jsx  # Main simulation dashboard
│       │   └── AssetSearch.jsx
│       ├── components/       # Charts, metrics, heatmaps, trade log
│       └── services/api.js   # Axios wrapper for backend
├── notebooks/
│   └── research.ipynb
└── tests/
```

---

## Features

- **Walk-forward validation** — no data leakage; model trained on expanding windows
- **Dual labeling** — threshold labeling or triple barrier method
- **Realistic backtest** — includes transaction costs and slippage
- **Performance metrics** — Sharpe ratio, max drawdown, hit rate, turnover
- **SHAP explainability** — understand which features drive signals
- **Heatmap analysis** — parameter sensitivity across threshold combinations
- **Dark terminal UI** — built for fast iteration during research

---

## Backtest Metrics

| Metric | Description |
|--------|-------------|
| Sharpe Ratio | Risk-adjusted return |
| Max Drawdown | Largest peak-to-trough loss |
| Hit Rate | % of winning trades |
| Turnover | Trading frequency |
| Equity Curve | Cumulative P&L over time |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/simulate` | Run full pipeline and return backtest results |
| POST | `/explain` | Return feature importance for a trained model |
| POST | `/heatmap` | Generate parameter sensitivity heatmap |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Caramelizeed/xgboost_quant.git
cd xgboost_quant
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure the project

Edit `config/config.yaml` to set your asset, date range, model hyperparameters, and backtest settings.

### 4. Run via CLI

```bash
python main.py
```

### 5. Start the backend API

```bash
uvicorn src.api.main:app --reload
```

### 6. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173` (or whichever port Vite assigns).

---

## Configuration (`config/config.yaml`)

Key settings you can tune:

```yaml
asset: "BTC/USDT"          # Stock ticker or crypto pair (use / for crypto)
timeframe: "1d"             # Data frequency
feature_windows: [5, 10, 20, 50]
validation_years: 1
model:
  n_estimators: 200
  max_depth: 4
  learning_rate: 0.05
backtest:
  threshold_long: 0.6
  threshold_short: 0.4
  transaction_cost: 0.001
  slippage: 0.0005
```

---

## Tech Stack

**Backend:** Python, XGBoost, FastAPI, yfinance, CCXT, pandas, scikit-learn

**Frontend:** React, Vite, Axios, Recharts

---

## Roadmap

- [ ] Live trading integration
- [ ] Portfolio-level backtesting (multi-asset)
- [ ] Additional models (LightGBM, CatBoost)
- [ ] Automated hyperparameter tuning

---

## License

MIT
