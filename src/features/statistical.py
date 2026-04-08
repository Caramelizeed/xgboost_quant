import pandas as pd
import numpy as np


def build_statistical_features(df: pd.DataFrame) -> pd.DataFrame:
    features = pd.DataFrame(index=df.index)
    log_ret = np.log(df['close'] / df['close'].shift(1))
    for w in [20, 60]:
        mu = log_ret.rolling(w).mean()
        sigma = log_ret.rolling(w).std()
        features[f'zscore_{w}'] = (log_ret - mu) / (sigma + 1e-8)
        features[f'skew_{w}'] = log_ret.rolling(w).skew()
        features[f'kurt_{w}'] = log_ret.rolling(w).kurt()
        features[f'autocorr_{w}'] = log_ret.rolling(w).apply(lambda x: x.autocorr(lag=1), raw=False)
    return features
