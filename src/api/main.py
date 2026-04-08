from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import SimulationRequest, SimulationResult
from .simulation import run_pipeline

app = FastAPI(title='Quant ML API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.post('/simulate', response_model=SimulationResult)
async def simulate(request: SimulationRequest):
    try:
        return run_pipeline(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
