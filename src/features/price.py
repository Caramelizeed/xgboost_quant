import pandas as pd
import numpy as np
from typing import List


def build_price_features(df: pd.DataFrame, windows: List[int] = [5, 10, 20, 60]) -> pd.DataFrame:
    features = pd.DataFrame(index=df.index)
    close = df['close'].squeeze()
    log_ret = np.log(close / close.shift(1)).astype(float)

    for lag in [1, 2, 3, 5, 10]:
        features[f'ret_lag_{lag}'] = log_ret.shift(lag)

    for w in windows:
        vol = log_ret.rolling(w).std().astype(float)
        mom = (close / close.shift(w) - 1).astype(float)
        features[f'vol_{w}'] = (vol * np.sqrt(252)).squeeze()
        features[f'mom_{w}'] = mom.squeeze()
        features[f'vol_adj_mom_{w}'] = (mom / (vol + 1e-8)).squeeze()

    high, low = df['high'], df['low']
    tr = pd.concat([
        high - low,
        (high - close.shift(1)).abs(),
        (low - close.shift(1)).abs(),
    ], axis=1).max(axis=1)
    features['atr_14'] = tr.rolling(14).mean()
    return features
