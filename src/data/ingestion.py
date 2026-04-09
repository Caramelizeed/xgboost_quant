import pandas as pd
import yfinance as yf
from pathlib import Path

ASSET_TICKER_MAP = {
    'NIFTY50': '^NSEI',
    'BANKNIFTY': '^NSEBANK',
    'SP500': '^GSPC',
    'DOWJONES': '^DJI',
    'NASDAQ': '^IXIC',
}


def resolve_asset_ticker(asset: str) -> str:
    normalized = asset.strip().upper()
    return ASSET_TICKER_MAP.get(normalized, asset)


def fetch_price_data(asset: str, start_date: str, end_date: str, timeframe: str = '1d') -> pd.DataFrame:
    """Fetch OHLCV data for a single asset and cache it locally."""
    ticker_symbol = resolve_asset_ticker(asset)
    df = yf.download(ticker_symbol, start=start_date, end=end_date, interval=timeframe, progress=False, threads=False)
    if df is None or df.empty:
        ticker = yf.Ticker(ticker_symbol)
        df = ticker.history(start=start_date, end=end_date, interval=timeframe)

    if df is None or df.empty:
        raise ValueError(f'No data available for {asset} ({ticker_symbol}) between {start_date} and {end_date}')

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
