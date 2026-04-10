import numpy as np
import pandas as pd
from typing import Optional
from ..config import CFG


def _sharpe_ratio(returns, periods: int = 252) -> float:
    if isinstance(returns, pd.DataFrame):
        returns = returns.iloc[:, 0] if returns.shape[1] == 1 else returns.mean(axis=1)
    elif hasattr(returns, 'squeeze'):
        returns = returns.squeeze()

    returns = pd.Series(returns, dtype=float)
    std = returns.std()
    if returns.empty or std == 0 or np.isnan(std):
        return 0.0
    return (returns.mean() / std) * np.sqrt(periods)


def _max_drawdown(equity) -> float:
    if np.isscalar(equity):
        return 0.0
    if hasattr(equity, 'to_frame') and isinstance(equity, pd.DataFrame):
        if equity.shape[1] == 1:
            equity = equity.iloc[:, 0]
        else:
            equity = equity.iloc[:, 0]
    elif hasattr(equity, 'squeeze'):
        equity = equity.squeeze()
    if np.isscalar(equity):
        return 0.0
    rolling_max = equity.cummax()
    drawdown = (equity - rolling_max) / rolling_max
    return drawdown.min()


def _extract_trades(signal: pd.Series, returns: pd.Series, close_prices: pd.Series, position_size: float) -> list[dict]:
    trades = []
    positions = signal[signal != 0]
    next_prices = close_prices.shift(-1)
    for idx, pos in positions.items():
        entry_price = close_prices.get(idx, None)
        exit_price = next_prices.get(idx, entry_price)
        pnl_value = float(pos * returns.loc[idx] * position_size)
        return_pct = float(returns.loc[idx] * 100)
        trades.append({
            'date': str(idx.date()),
            'direction': 'long' if pos > 0 else 'short',
            'entry': round(float(entry_price), 2) if entry_price is not None else None,
            'exit': round(float(exit_price), 2) if exit_price is not None else None,
            'size': round(float(position_size), 2),
            'pnl': round(pnl_value, 2),
            'return_pct': round(return_pct, 2),
        })
    return trades[-50:]


def run_backtest(
    probs,
    returns,
    close_prices,
    capital: float = 100_000,
    threshold_long: float = 0.6,
    threshold_short: float = 0.4,
    risk_per_trade: Optional[float] = None,
    transaction_cost: Optional[float] = None,
    slippage: Optional[float] = None,
) -> dict:
    if isinstance(probs, pd.DataFrame):
        probs = probs.iloc[:, 0] if probs.shape[1] == 1 else probs.mean(axis=1)
    if isinstance(returns, pd.DataFrame):
        returns = returns.iloc[:, 0] if returns.shape[1] == 1 else returns.mean(axis=1)
    if isinstance(close_prices, pd.DataFrame):
        close_prices = close_prices.iloc[:, 0]

    probs = pd.Series(probs, index=getattr(probs, 'index', None)).astype(float)
    returns = pd.Series(returns, index=getattr(returns, 'index', None)).astype(float)
    close_prices = pd.Series(close_prices, index=getattr(close_prices, 'index', None)).astype(float)

    common_index = probs.index.intersection(returns.index).intersection(close_prices.index)
    probs = probs.loc[common_index]
    returns = returns.loc[common_index]
    close_prices = close_prices.loc[common_index]

    if risk_per_trade is None:
        risk_per_trade = CFG['backtest']['risk_per_trade']
    if transaction_cost is None:
        transaction_cost = CFG['backtest']['transaction_cost']
    if slippage is None:
        slippage = CFG['backtest']['slippage']

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

    rolling_sharpe = (
        daily_returns
        .rolling(window=30, min_periods=10)
        .apply(lambda x: _sharpe_ratio(x, periods=252), raw=False)
        .fillna(0)
        .tolist()
    )

    wins = ((net_pnl > 0) & (signal != 0)).astype(int)
    trades = (signal != 0).astype(int)
    rolling_hit_rate = (
        wins
        .rolling(window=30, min_periods=1)
        .sum()
        .fillna(0)
        / trades.rolling(window=30, min_periods=1).sum().replace(0, pd.NA)
    ).fillna(0).tolist()

    win_rate = (net_pnl[signal != 0] > 0).mean()
    return {
        'final_capital': round(equity.iloc[-1], 2),
        'total_return': round((equity.iloc[-1] / capital - 1) * 100, 2),
        'sharpe_ratio': round(_sharpe_ratio(daily_returns), 3),
        'max_drawdown': round(_max_drawdown(equity) * 100, 2),
        'hit_rate': round(float(np.nan_to_num(win_rate, nan=0.0)), 4),
        'turnover': round(signal_change.sum() / len(signal) * 100, 2),
        'equity_curve': equity.tolist(),
        'dates': equity.index.strftime('%Y-%m-%d').tolist(),
        'rolling_sharpe': rolling_sharpe,
        'rolling_hit_rate': rolling_hit_rate,
        'trades': _extract_trades(signal, returns, close_prices, position_size),
    }
