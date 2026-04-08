import shap
import pandas as pd


def explain_model(model, X: pd.DataFrame) -> dict:
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)
    return {
        'feature_names': X.columns.tolist(),
        'shap_values': shap_values.tolist() if hasattr(shap_values, 'tolist') else shap_values,
    }
