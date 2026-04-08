import numpy as np
import pandas as pd


def _sharpe_ratio(returns, periods: int = 252) -> float:
    if isinstance(returns, pd.DataFrame):
        returns = returns.iloc[:, 0] if returns.shape[1] == 1 else returns.mean(axis=1)
    elif hasattr(returns, 'squeeze'):
        returns = returns.squeeze()

    returns = pd.Series(returns, dtype=float)
    if returns.empty or returns.std() == 0:
        return 0.0
    return (returns.mean() / returns.std()) * np.sqrt(periods)


def _max_drawdown(equity) -> float:
    if hasattr(equity, 'to_frame') and isinstance(equity, pd.DataFrame):
        if equity.shape[1] == 1:
            equity = equity.iloc[:, 0]
        else:
            equity = equity.iloc[:, 0]
    elif hasattr(equity, 'squeeze'):
        equity = equity.squeeze()
    rolling_max = equity.cummax()
    drawdown = (equity - rolling_max) / rolling_max
    return drawdown.min()


def _extract_trades(signal: pd.Series, returns: pd.Series) -> list[dict]:
    trades = []
    positions = signal[signal != 0]
    for idx, pos in positions.items():
        trades.append({
            'date': str(idx.date()),
            'direction': 'long' if pos > 0 else 'short',
            'pnl': round(float(pos * returns.loc[idx] * 1000), 2),
        })
    return trades[-50:]


def run_backtest(
    probs,
    returns,
    capital: float = 100_000,
    threshold_long: float = 0.6,
    threshold_short: float = 0.4,
    risk_per_trade: float = 0.02,
    transaction_cost: float = 0.001,
    slippage: float = 0.0005,
) -> dict:
    if isinstance(probs, pd.DataFrame):
        probs = probs.iloc[:, 0] if probs.shape[1] == 1 else probs.mean(axis=1)
    if isinstance(returns, pd.DataFrame):
        returns = returns.iloc[:, 0] if returns.shape[1] == 1 else returns.mean(axis=1)
    probs = pd.Series(probs, index=getattr(probs, 'index', None)).astype(float)
    returns = pd.Series(returns, index=getattr(returns, 'index', None)).astype(float)
    probs, returns = probs.align(returns, join='inner')
    signal = pd.Series(0, index=probs.index)
    signal[probs > threshold_long] = 1
    signal[probs < threshold_short] = -1
    position_size = risk_per_trade * capital
    signal_change = signal.diff().abs() > 0
    total_cost_pct = transaction_cost + slippage
    trade_pnl = signal * returns * position_size
    cost_pnl = signal_change * total_cost_pct * position_size
    net_pnl = trade_pnl - cost_pnl
    equity = capital + net_pnl.cumsum()
    daily_returns = pd.Series((net_pnl / equity.shift(1)).astype(float), index=probs.index)
    return {
        'final_capital': round(equity.iloc[-1], 2),
        'total_return': round((equity.iloc[-1] / capital - 1) * 100, 2),
        'sharpe_ratio': round(_sharpe_ratio(daily_returns), 3),
        'max_drawdown': round(_max_drawdown(equity) * 100, 2),
        'hit_rate': round((net_pnl[signal != 0] > 0).mean() * 100, 2),
        'turnover': round(signal_change.sum() / len(signal) * 100, 2),
        'equity_curve': equity.tolist(),
        'dates': equity.index.strftime('%Y-%m-%d').tolist(),
        'trades': _extract_trades(signal, returns),
    }
