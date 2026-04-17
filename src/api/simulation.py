import hashlib
import json
from pathlib import Path

import pandas as pd
import numpy as np

from .schemas import HeatmapRequest, SimulationRequest
from ..data.ingestion import fetch_price_data
from ..data.cleaning import clean_price_data
from ..data.labeling import compute_log_returns, threshold_labels, triple_barrier_labels
from ..features.price import build_price_features
from ..features.statistical import build_statistical_features
from ..features.regime import build_regime_features
from ..models.train import walk_forward_train
from ..models.explain import explain_model
from ..backtest.engine import run_backtest

CACHE_DIR = Path(__file__).resolve().parents[1] / 'data' / 'cache' / 'heatmap'
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _heatmap_cache_key(base_params: dict, param_x: str, param_y: str, x_val: float, y_val: float) -> str:
    payload = {
        'base': base_params,
        'param_x': param_x,
        'param_y': param_y,
        'x_val': x_val,
        'y_val': y_val,
    }
    digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode('utf-8')).hexdigest()
    return digest


def _load_cached_heatmap(key: str):
    path = CACHE_DIR / f'{key}.json'
    if path.exists():
        return json.loads(path.read_text(encoding='utf-8'))
    return None


def _save_cached_heatmap(key: str, value):
    path = CACHE_DIR / f'{key}.json'
    path.write_text(json.dumps(value), encoding='utf-8')
    return value


def _run_heatmap_cell(base_params: dict, param_x: str, param_y: str, x_val: float, y_val: float) -> float:
    cache_key = _heatmap_cache_key(base_params, param_x, param_y, x_val, y_val)
    cached = _load_cached_heatmap(cache_key)
    if cached is not None:
        return cached
#fa.mgt.tum.de
    params = dict(base_params)
    params[param_x] = x_val
    params[param_y] = y_val
    request = SimulationRequest(**params)
    result = run_pipeline(request)
    value = float(result['sharpe_ratio'])
    _save_cached_heatmap(cache_key, value)
    return value


def build_all_features(df: pd.DataFrame) -> pd.DataFrame:
    price_features = build_price_features(df)
    stat_features = build_statistical_features(df)
    regime_features = build_regime_features(df)
    return pd.concat([price_features, stat_features, regime_features], axis=1)


def run_pipeline(request: SimulationRequest) -> dict:
    df = fetch_price_data(request.asset, request.start_date, request.end_date, request.timeframe, request.exchange)
    df = clean_price_data(df)
    returns = compute_log_returns(df['close'])
    if request.labeling_method == 'triple_barrier':
        y = triple_barrier_labels(df['close'])
    else:
        y = threshold_labels(returns)
    X = build_all_features(df)
    fold_results = walk_forward_train(X, y)
    all_probs = pd.concat([r['probs'] for r in fold_results]).sort_index()
    result = run_backtest(
        probs=all_probs,
        returns=returns,
        close_prices=df['close'],
        capital=request.capital,
        threshold_long=request.threshold_long,
        threshold_short=request.threshold_short,
        risk_per_trade=request.risk_per_trade,
    )
    return result


def explain_pipeline(request: SimulationRequest) -> dict:
    df = fetch_price_data(request.asset, request.start_date, request.end_date, request.timeframe, request.exchange)
    df = clean_price_data(df)
    returns = compute_log_returns(df['close'])
    if request.labeling_method == 'triple_barrier':
        y = triple_barrier_labels(df['close'])
    else:
        y = threshold_labels(returns)
    X = build_all_features(df)
    fold_results = walk_forward_train(X, y)
    if not fold_results:
        return {'feature_names': [], 'mean_abs_shap': []}
    last_fold = fold_results[-1]
    model = last_fold['model']
    X_test = last_fold['X_test']
    return explain_model(model, X_test)


def heatmap_pipeline(request: HeatmapRequest) -> dict:
    if request.param_x == request.param_y:
        raise ValueError('param_x and param_y must differ')

    if request.param_x not in SimulationRequest.model_fields or request.param_y not in SimulationRequest.model_fields:
        raise ValueError('Invalid heatmap parameter names')

    x_len = len(request.x_range)
    y_len = len(request.y_range)
    if x_len * y_len > 64:
        raise ValueError('Heatmap grid too large; maximum 64 cells supported')

    base_params = request.base_params.model_dump()
    matrix = []
    for y_val in request.y_range:
        row = []
        for x_val in request.x_range:
            row.append(_run_heatmap_cell(base_params, request.param_x, request.param_y, x_val, y_val))
        matrix.append(row)

    return {
        'param_x': request.param_x,
        'param_y': request.param_y,
        'x_axis': request.x_range,
        'y_axis': request.y_range,
        'matrix': matrix,
    }
