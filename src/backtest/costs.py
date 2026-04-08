def transaction_cost(cost_rate: float, size: float) -> float:
    return cost_rate * abs(size)


def slippage_cost(slippage_rate: float, size: float) -> float:
    return slippage_rate * abs(size)
