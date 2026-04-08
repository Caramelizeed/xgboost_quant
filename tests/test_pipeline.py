import pandas as pd

from src.data.labeling import compute_log_returns, threshold_labels
from src.features.price import build_price_features


def test_threshold_labels():
    prices = pd.Series([100.0, 101.0, 100.5, 102.0])
    returns = compute_log_returns(prices)
    labels = threshold_labels(returns, theta=0.001)
    assert labels.iloc[0] == 1
    assert labels.iloc[1] == 0


def test_price_features_shape():
    df = pd.DataFrame({
        'open': [100, 101, 102, 103],
        'high': [101, 102, 103, 104],
        'low': [99, 100, 101, 102],
        'close': [100, 101, 102, 103],
        'volume': [10, 20, 30, 40],
    }, index=pd.date_range('2024-01-01', periods=4))
    features = build_price_features(df, windows=[2])
    assert 'ret_lag_1' in features.columns
