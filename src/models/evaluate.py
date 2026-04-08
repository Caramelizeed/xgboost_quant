from sklearn.metrics import roc_auc_score, log_loss
import pandas as pd


def evaluate_model(y_true: pd.Series, probs: pd.Series) -> dict:
    return {
        'auc': roc_auc_score(y_true, probs),
        'log_loss': log_loss(y_true, probs),
        'n_samples': len(y_true),
    }
