import numpy as np
import pandas as pd


def sharpe_ratio(returns: pd.Series, periods: int = 252) -> float:
    if returns.std() == 0:
        return 0.0
    return (returns.mean() / returns.std()) * np.sqrt(periods)


def max_drawdown(equity: pd.Series) -> float:
    rolling_max = equity.cummax()
    drawdown = (equity - rolling_max) / rolling_max
    return drawdown.min()


def annual_return(equity: pd.Series) -> float:
    days = len(equity)
    return (equity.iloc[-1] / equity.iloc[0]) ** (252 / days) - 1
