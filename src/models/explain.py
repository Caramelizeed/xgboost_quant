import numpy as np
import shap
import pandas as pd


def _extract_tree_model(model):
    if hasattr(model, 'calibrated_classifiers_') and len(model.calibrated_classifiers_) > 0:
        calibrated = model.calibrated_classifiers_[0]
        if hasattr(calibrated, 'estimator') and getattr(calibrated, 'estimator') is not None:
            return calibrated.estimator
        if hasattr(calibrated, 'base_estimator') and getattr(calibrated, 'base_estimator') is not None:
            return calibrated.base_estimator
        if hasattr(calibrated, 'base_estimator_') and getattr(calibrated, 'base_estimator_') is not None:
            return calibrated.base_estimator_
        return calibrated
    if hasattr(model, 'estimator') and getattr(model, 'estimator') is not None:
        return getattr(model, 'estimator')
    if hasattr(model, 'base_estimator') and getattr(model, 'base_estimator') is not None:
        return getattr(model, 'base_estimator')
    if hasattr(model, 'base_estimator_') and getattr(model, 'base_estimator_') is not None:
        return getattr(model, 'base_estimator_')
    return model


def explain_model(model, X: pd.DataFrame, sample_size: int = 200) -> dict:
    if len(X) > sample_size:
        X = X.sample(n=sample_size, random_state=42)

    model_for_explain = _extract_tree_model(model)
    explainer = shap.TreeExplainer(model_for_explain)
    shap_values = explainer.shap_values(X)

    if isinstance(shap_values, list):
        shap_values = shap_values[1] if len(shap_values) > 1 else shap_values[0]

    shap_array = np.array(shap_values)
    mean_abs_shap = np.mean(np.abs(shap_array), axis=0).tolist()

    return {
        'feature_names': X.columns.tolist(),
        'mean_abs_shap': mean_abs_shap,
    }
