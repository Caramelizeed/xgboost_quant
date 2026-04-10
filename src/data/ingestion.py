import pandas as pd
import yfinance as yf
from pathlib import Path
import time
from ..config import CFG

ASSET_TICKER_MAP = {
    'NIFTY50': '^NSEI',
    'BANKNIFTY': '^NSEBANK',
    'SP500': '^GSPC',
    'DOWJONES': '^DJI',
    'NASDAQ': '^IXIC',
}
CACHE_DIR = Path(__file__).resolve().parents[1] / 'data' / 'cache'
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def resolve_asset_ticker(asset: str) -> str:
    normalized = asset.strip().upper()
    return ASSET_TICKER_MAP.get(normalized, asset)


def _cache_path(asset: str, start_date: str, end_date: str, timeframe: str, source: str) -> Path:
    safe_asset = asset.replace('/', '_').replace(' ', '_').replace(':', '_').upper()
    filename = f'{source}_{safe_asset}_{timeframe}_{start_date}_{end_date}.parquet'
    return CACHE_DIR / filename


def load_parquet(path: Path) -> pd.DataFrame | None:
    if path.exists():
        return pd.read_parquet(path)
    return None


def _fetch_yfinance_price_data(asset: str, start_date: str, end_date: str, timeframe: str = '1d') -> pd.DataFrame:
    ticker_symbol = resolve_asset_ticker(asset)
    df = yf.download(ticker_symbol, start=start_date, end=end_date, interval=timeframe, progress=False, threads=False)
    if df is None or df.empty:
        ticker = yf.Ticker(ticker_symbol)
        df = ticker.history(start=start_date, end=end_date, interval=timeframe)

    if df is None or df.empty:
        raise ValueError(f'No data available for {asset} ({ticker_symbol}) between {start_date} and {end_date}')

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    return df.rename(columns={
        'Open': 'open',
        'High': 'high',
        'Low': 'low',
        'Close': 'close',
        'Adj Close': 'adj_close',
        'Volume': 'volume',
    })


def _fetch_ccxt_price_data(asset: str, exchange: str, start_date: str, end_date: str, timeframe: str) -> pd.DataFrame:
    from .ccxt_ingestion import fetch_ccxt_ohlcv
    return fetch_ccxt_ohlcv(symbol=asset, exchange_id=exchange, timeframe=timeframe, start_date=start_date, end_date=end_date)


def fetch_price_data(
    asset: str,
    start_date: str,
    end_date: str,
    timeframe: str = '1d',
    exchange: str | None = None,
) -> pd.DataFrame:
    """Fetch OHLCV data for a single asset and cache it locally."""
    use_ccxt = '/' in asset or bool(exchange)
    source = 'ccxt' if use_ccxt else 'yfinance'
    cache_path = _cache_path(asset, start_date, end_date, timeframe, source)
    df = load_parquet(cache_path)
    if df is not None:
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        return df

    if source == 'ccxt':
        if not exchange:
            exchange = CFG['ccxt']['default_exchange']
        df = _fetch_ccxt_price_data(asset, exchange, start_date, end_date, timeframe)
    else:
        df = _fetch_yfinance_price_data(asset, start_date, end_date, timeframe)

    save_parquet(df, cache_path)
    return df


def save_parquet(df: pd.DataFrame, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(path)
