import pandas as pd
import yfinance as yf
from pathlib import Path


def fetch_price_data(asset: str, start_date: str, end_date: str, timeframe: str = '1d') -> pd.DataFrame:
    """Fetch OHLCV data for a single asset and cache it locally."""
    df = yf.download(asset, start=start_date, end=end_date, interval=timeframe, progress=False, threads=False)
    if df is None or df.empty:
        ticker = yf.Ticker(asset)
        df = ticker.history(start=start_date, end=end_date, interval=timeframe)

    if df is None or df.empty:
        raise ValueError(f'No data available for {asset} between {start_date} and {end_date}')

    df = df.rename(columns={
        'Open': 'open',
        'High': 'high',
        'Low': 'low',
        'Close': 'close',
        'Adj Close': 'adj_close',
        'Volume': 'volume',
    })
    return df


def save_parquet(df: pd.DataFrame, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(path)
