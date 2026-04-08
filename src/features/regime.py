import pandas as pd
import numpy as np


def build_regime_features(df: pd.DataFrame) -> pd.DataFrame:
    features = pd.DataFrame(index=df.index)
    close = df['close']
    log_ret = np.log(close / close.shift(1))

    vol_20 = log_ret.rolling(20).std()
    features['vol_regime'] = vol_20.rolling(252).rank(pct=True)

    ma_50 = close.rolling(50).mean()
    ma_200 = close.rolling(200).mean()
    features['trend_regime'] = np.sign(ma_50 - ma_200)
    features['mean_rev_signal'] = (close - ma_50) / (close.rolling(50).std() + 1e-8)
    return features
