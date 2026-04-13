# 🚀 XGBoost Quant Trading System

A full-stack **machine learning–driven trading simulation platform** that uses XGBoost for return classification, combined with realistic backtesting and an interactive frontend dashboard.

---

## 🧠 Overview

This project implements an **end-to-end quantitative research pipeline**:

* 📊 Feature engineering from market data
* 🤖 Machine learning model (XGBoost) for signal generation
* 🔁 Walk-forward validation (no data leakage)
* 💰 Cost-aware backtesting engine
* 🌐 FastAPI backend for simulation
* 🎨 React frontend for interactive strategy testing

---

## ⚙️ Tech Stack

### Backend

* Python (Pandas, NumPy)
* XGBoost
* Scikit-learn
* FastAPI

### Frontend

* React (Vite)
* Recharts (visualization)
* Axios

---

## 🔄 How It Works

```text
Market Data → Feature Engineering → Labeling → XGBoost Model
→ Probability Predictions → Strategy Rules → Backtesting → Results Visualization
```

---

## 📊 Features

* ✅ Return classification using XGBoost
* ✅ Walk-forward validation (time-series aware)
* ✅ Transaction cost & slippage modeling
* ✅ Probability-based trading strategy
* ✅ Equity curve visualization
* ✅ Key performance metrics:

  * Sharpe Ratio
  * Max Drawdown
  * Win Rate
  * Final Capital

---

## 📈 Example Results

| Metric        | Value    |
| ------------- | -------- |
| Final Capital | ₹124,500 |
| Sharpe Ratio  | 1.42     |
| Max Drawdown  | -18%     |
| Win Rate      | 56%      |

---

## 🖥️ Frontend Dashboard

* Interactive simulation controls
* Real-time results display
* Equity curve visualization
* Strategy performance metrics

📌 *(Add screenshot here later)*

```md
![Dashboard](./assets/dashboard.png)
```

---

## 🏗️ Project Structure

```text
xgboost_quant/
│
├── src/
│   ├── data/          # data ingestion & labeling
│   ├── features/      # feature engineering
│   ├── models/        # training & prediction
│   ├── backtest/      # PnL engine & metrics
│   └── api/           # FastAPI endpoints
│
├── frontend/          # React dashboard
├── config/            # configuration files
├── tests/             # unit tests
└── main.py
```

---

## 🚀 Run Locally

### 1. Backend

```bash
pip install -r requirements.txt
uvicorn src.api.main:app --reload
```

Open:

```
http://127.0.0.1:8000/docs
```

---

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

---

## ⚠️ Key Design Decisions

* ❌ No random train/test split
* ✅ Walk-forward validation
* ✅ Out-of-sample predictions only
* ✅ Realistic trading costs included

---

## 🔥 Why This Project Stands Out

* Combines **ML + finance + backend + frontend**
* Focuses on **real-world trading constraints**
* Avoids common pitfalls like **data leakage**
* Built as a **complete system**, not just a model

---

## 🛣️ Roadmap

* [ ] Strategy comparison (multi-run overlay)
* [ ] Feature importance (SHAP analysis)
* [ ] Deployment (cloud + live demo)

---

## 📌 Disclaimer

This project is for educational and research purposes only.
It does not constitute financial advice.

---

## 👤 Author

**Caramelizeed**

---

## ⭐ If you found this useful

Give this repo a star ⭐ — it helps a lot!
