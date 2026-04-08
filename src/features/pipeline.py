import pandas as pd
from sklearn.base import TransformerMixin, BaseEstimator
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer


class FeaturePipeline(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.num_transformer = Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler()),
        ])
        self.pipeline = None

    def fit(self, X: pd.DataFrame, y=None):
        self.pipeline = ColumnTransformer([
            ('numeric', self.num_transformer, X.columns.tolist()),
        ])
        self.pipeline.fit(X)
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        return pd.DataFrame(
            self.pipeline.transform(X),
            index=X.index,
            columns=X.columns,
        )

    def fit_transform(self, X: pd.DataFrame, y=None) -> pd.DataFrame:
        return self.fit(X, y).transform(X)
