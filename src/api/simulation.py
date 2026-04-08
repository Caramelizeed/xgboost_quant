import pandas as pd
import numpy as np

from .schemas import SimulationRequest
from ..data.ingestion import fetch_price_data
from ..data.cleaning import clean_price_data
from ..data.labeling import compute_log_returns, threshold_labels
from ..features.price import build_price_features
from ..features.statistical import build_statistical_features
from ..features.regime import build_regime_features
from ..features.pipeline import FeaturePipeline
from ..models.train import walk_forward_train
from ..backtest.engine import run_backtest


def build_all_features(df: pd.DataFrame) -> pd.DataFrame:
    price_features = build_price_features(df)
    stat_features = build_statistical_features(df)
    regime_features = build_regime_features(df)
    X = pd.concat([price_features, stat_features, regime_features], axis=1)
    pipeline = FeaturePipeline()
    return pipeline.fit_transform(X)


def run_pipeline(request: SimulationRequest) -> dict:
    df = fetch_price_data(request.asset, request.start_date, request.end_date, request.timeframe)
    df = clean_price_data(df)
    returns = compute_log_returns(df['close'])
    y = threshold_labels(returns)
    X = build_all_features(df)
    fold_results = walk_forward_train(X, y)
    all_probs = pd.concat([r['probs'] for r in fold_results]).sort_index()
    result = run_backtest(
        probs=all_probs,
        returns=returns,
        capital=request.capital,
        threshold_long=request.threshold_long,
        threshold_short=request.threshold_short,
        risk_per_trade=request.risk_per_trade,
    )
    return result
