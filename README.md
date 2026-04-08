# xgboost_quant

Structured quant ML project scaffold for signal generation, walk-forward training, and FastAPI deployment.

## Layout
- `data/` raw, processed, and feature parquet data
- `src/` core pipeline modules
- `frontend/` React dashboard
- `notebooks/` research and analysis
- `config/config.yaml` hyperparameters and execution defaults
- `tests/` unit and integration checks

## Run
```bash
pip install -r requirements.txt
python main.py --asset BTC-USD --start 2019-01-01 --end 2024-01-01
```
