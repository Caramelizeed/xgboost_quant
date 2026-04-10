import pandas as pd
from pathlib import Path
from datetime import datetime
import time


def fetch_ccxt_ohlcv(
    symbol: str,
    exchange_id: str,
    timeframe: str,
    start_date: str,
    end_date: str,
) -> pd.DataFrame:
    import ccxt

    exchange = getattr(ccxt, exchange_id)({
        'enableRateLimit': True,
        'options': {'defaultType': 'spot'},
    })
    since = exchange.parse8601(start_date + 'T00:00:00Z')
    end_ts = exchange.parse8601(end_date + 'T00:00:00Z')
    all_candles = []

    while since < end_ts:
        candles = exchange.fetch_ohlcv(symbol, timeframe, since=since, limit=500)
        if not candles:
            break
        all_candles.extend(candles)
        since = candles[-1][0] + 1
        time.sleep(0.2)

    df = pd.DataFrame(all_candles, columns=['ts', 'open', 'high', 'low', 'close', 'volume'])
    df.index = pd.to_datetime(df['ts'], unit='ms')
    df.index.name = 'Date'
    return df.drop('ts', axis=1).loc[:end_date]
