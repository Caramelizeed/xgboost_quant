from argparse import ArgumentParser

from src.api.simulation import run_pipeline
from src.api.schemas import SimulationRequest


def main() -> None:
    parser = ArgumentParser(description='Run xgboost_quant end-to-end simulation')
    parser.add_argument('--asset', default='BTC-USD')
    parser.add_argument('--start', default='2019-01-01')
    parser.add_argument('--end', default='2024-01-01')
    parser.add_argument('--capital', type=float, default=100_000)
    args = parser.parse_args()

    request = SimulationRequest(
        asset=args.asset,
        start_date=args.start,
        end_date=args.end,
        capital=args.capital,
    )

    result = run_pipeline(request)
    print('Simulation complete')
    print(f"Final capital: {result['final_capital']}")
    print(f"Sharpe ratio: {result['sharpe_ratio']}")


if __name__ == '__main__':
    main()
