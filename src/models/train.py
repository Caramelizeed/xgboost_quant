import pandas as pd
import xgboost as xgb
from sklearn.metrics import roc_auc_score
from sklearn.calibration import CalibratedClassifierCV


def walk_forward_train(
    X: pd.DataFrame,
    y: pd.Series,
    train_years: int = 3,
    test_years: int = 1,
):
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

        if hasattr(y_train, 'squeeze'):
            y_train = y_train.squeeze()
        if hasattr(y_test, 'squeeze'):
            y_test = y_test.squeeze()

        train_valid = (~X_train.isnull().any(axis=1)) & (~y_train.isnull())
        test_valid = (~X_test.isnull().any(axis=1)) & (~y_test.isnull())
        X_train, y_train = X_train[train_valid], y_train[train_valid]
        X_test, y_test = X_test[test_valid], y_test[test_valid]

        pos_weight = int((y_train == 0).sum()) / max(int((y_train == 1).sum()), 1)

        model = xgb.XGBClassifier(
            n_estimators=300,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.7,
            scale_pos_weight=pos_weight,
            reg_lambda=1.5,
            reg_alpha=0.5,
            objective='binary:logistic',
            eval_metric='auc',
            random_state=42,
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
        })

    return results
