from pydantic import BaseModel, Field
from ..config import CFG


class SimulationRequest(BaseModel):
    capital: float = Field(default=100_000, gt=0)
    asset: str = Field(default=CFG['data']['default_asset'])
    timeframe: str = Field(default=CFG['data']['timeframe'])
    exchange: str | None = Field(default=None)
    labeling_method: str = Field(default=CFG['labeling']['method'])
    threshold_long: float = Field(default=0.6, ge=0.5, le=1.0)
    threshold_short: float = Field(default=0.4, ge=0.0, le=0.5)
    risk_per_trade: float = Field(default=CFG['backtest']['risk_per_trade'], gt=0, le=0.1)
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
    rolling_sharpe: list[float]
    rolling_hit_rate: list[float]
    trades: list[dict]


class ExplainResult(BaseModel):
    feature_names: list[str]
    mean_abs_shap: list[float]


class HeatmapRequest(BaseModel):
    base_params: SimulationRequest
    param_x: str
    param_y: str
    x_range: list[float]
    y_range: list[float]


class HeatmapResult(BaseModel):
    param_x: str
    param_y: str
    x_axis: list[float]
    y_axis: list[float]
    matrix: list[list[float]]
