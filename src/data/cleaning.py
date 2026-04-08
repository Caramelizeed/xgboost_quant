import pandas as pd
import numpy as np
from pathlib import Path


def detect_missing_bars(df: pd.DataFrame, expected_freq: str = '1D') -> pd.DatetimeIndex:
    expected = pd.date_range(df.index.min(), df.index.max(), freq=expected_freq)
    return expected.difference(df.index)


def adjust_splits_dividends(df: pd.DataFrame) -> pd.DataFrame:
    if 'adj_close' in df.columns:
        df['close'] = df['adj_close']
    return df


def clean_price_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df = adjust_splits_dividends(df)
    df = df.sort_index()
    missing = detect_missing_bars(df)
    if len(missing) > 0:
        df = df.reindex(pd.date_range(df.index.min(), df.index.max(), freq='1D')).ffill()
    return df


def save_processed(df: pd.DataFrame, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(path)
