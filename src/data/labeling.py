import numpy as np
import pandas as pd
from typing import Optional


def compute_log_returns(prices: pd.Series) -> pd.Series:
    return np.log(prices / prices.shift(1))


def threshold_labels(returns: pd.Series, theta: float = 0.001) -> pd.Series:
    future_returns = returns.shift(-1)
    return (future_returns > theta).astype(int)


def triple_barrier_labels(
    prices: pd.Series,
    upper_barrier: float = 0.02,
    lower_barrier: float = -0.02,
    max_holding: int = 10,
) -> pd.Series:
    labels = []
    for i in range(len(prices) - max_holding):
        entry = prices.iloc[i]
        window = prices.iloc[i + 1 : i + 1 + max_holding]
        returns = (window - entry) / entry
        upper_hit = (returns >= upper_barrier).idxmax() if (returns >= upper_barrier).any() else None
        lower_hit = (returns <= lower_barrier).idxmax() if (returns <= lower_barrier).any() else None
        if upper_hit and lower_hit:
            labels.append(1 if upper_hit < lower_hit else -1)
        elif upper_hit is not None:
            labels.append(1)
        elif lower_hit is not None:
            labels.append(-1)
        else:
            labels.append(0)
    labels += [np.nan] * max_holding
    return pd.Series(labels, index=prices.index)
