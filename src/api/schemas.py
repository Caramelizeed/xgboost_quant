from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    capital: float = Field(default=100_000, gt=0)
    asset: str = Field(default='BTC-USD')
    timeframe: str = Field(default='1d')
    threshold_long: float = Field(default=0.6, ge=0.5, le=1.0)
    threshold_short: float = Field(default=0.4, ge=0.0, le=0.5)
    risk_per_trade: float = Field(default=0.02, gt=0, le=0.1)
    start_date: str = Field(default='2020-01-01')
    end_date: str = Field(default='2024-01-01')


class SimulationResult(BaseModel):
    final_capital: float
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    hit_rate: float
    turnover: float
    equity_curve: list[float]
    dates: list[str]
    trades: list[dict]
