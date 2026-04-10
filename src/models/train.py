import pandas as pd
import xgboost as xgb
from sklearn.metrics import roc_auc_score
from sklearn.calibration import CalibratedClassifierCV
from ..config import CFG
from ..features.pipeline import FeaturePipeline
from typing import Optional


def walk_forward_train(
    X: pd.DataFrame,
    y: pd.Series,
    train_years: Optional[int] = None,
    test_years: Optional[int] = None,
):
    if train_years is None:
        train_years = CFG['validation']['train_years']
    if test_years is None:
        test_years = CFG['validation']['test_years']
    results = []
    years = sorted(X.index.year.unique())

    for i in range(train_years, len(years) - test_years + 1):
        train_end_year = years[i - 1]
        test_start_year = years[i]
        test_end_year = years[i + test_years - 1] if i + test_years - 1 < len(years) else years[-1]

        train_mask = X.index.year <= train_end_year
        test_mask = (X.index.year >= test_start_year) & (X.index.year <= test_end_year)

        X_train, y_train = X[train_mask], y[train_mask]
        X_test, y_test = X[test_mask], y[test_mask]

        if isinstance(y_train, pd.DataFrame) and y_train.shape[1] == 1:
            y_train = y_train.iloc[:, 0]
        if isinstance(y_test, pd.DataFrame) and y_test.shape[1] == 1:
            y_test = y_test.iloc[:, 0]

        train_valid = ~y_train.isnull()
        test_valid = ~y_test.isnull()
        X_train, y_train = X_train[train_valid], y_train[train_valid]
        X_test, y_test = X_test[test_valid], y_test[test_valid]

        if X_train.empty or X_test.empty:
            continue

        pipeline = FeaturePipeline()
        X_train = pipeline.fit_transform(X_train)
        X_test = pipeline.transform(X_test)

        pos_weight = int((y_train == 0).sum()) / max(int((y_train == 1).sum()), 1)

        model = xgb.XGBClassifier(
            n_estimators=CFG['model']['n_estimators'],
            max_depth=CFG['model']['max_depth'],
            learning_rate=CFG['model']['learning_rate'],
            subsample=CFG['model']['subsample'],
            colsample_bytree=CFG['model']['colsample_bytree'],
            scale_pos_weight=pos_weight,
            reg_lambda=CFG['model']['reg_lambda'],
            reg_alpha=CFG['model']['reg_alpha'],
            objective='binary:logistic',
            eval_metric='auc',
            random_state=CFG['model']['random_state'],
        )

        calibrated = CalibratedClassifierCV(estimator=model, method='sigmoid', cv=3)
        calibrated.fit(X_train, y_train)

        probs = calibrated.predict_proba(X_test)[:, 1]
        auc = roc_auc_score(y_test, probs)

        results.append({
            'fold': f'{train_end_year}→{test_start_year}',
            'model': calibrated,
            'auc': auc,
            'probs': pd.Series(probs, index=X_test.index),
            'y_test': y_test,
            'X_test': X_test,
        })

    return results
