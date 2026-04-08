import pandas as pd


def predict_probabilities(model, X: pd.DataFrame) -> pd.Series:
    return pd.Series(model.predict_proba(X)[:, 1], index=X.index)
