from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import SimulationRequest, SimulationResult, ExplainResult, HeatmapRequest, HeatmapResult
from .simulation import run_pipeline, explain_pipeline, heatmap_pipeline

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


@app.post('/explain', response_model=ExplainResult)
async def explain(request: SimulationRequest):
    try:
        return explain_pipeline(request)
    except Exception:
        return {'feature_names': [], 'mean_abs_shap': []}


@app.post('/heatmap', response_model=HeatmapResult)
async def heatmap(request: HeatmapRequest):
    try:
        return heatmap_pipeline(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
