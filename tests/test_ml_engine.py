import pandas as pd
import numpy as np
import pytest
from ml_engine import run_classification, run_clustering

@pytest.fixture
def sample_classification_data():
    np.random.seed(42)
    df = pd.DataFrame({
        'feature1': np.random.randn(100),
        'feature2': np.random.randn(100),
        'target': np.random.choice(['classA', 'classB'], 100)
    })
    return df

@pytest.fixture
def sample_clustering_data():
    np.random.seed(42)
    df = pd.DataFrame({
        'feature1': np.random.randn(100) + 5,
        'feature2': np.random.randn(100) - 5,
    })
    return df

def test_run_classification_rf(sample_classification_data):
    df = sample_classification_data
    result = run_classification(df, target_col='target', feature_cols=['feature1', 'feature2'], algorithm='rf')
    assert 'accuracy' in result
    assert 'f1_score' in result
    assert 'sample_data' in result
    assert result['accuracy'] >= 0.0

def test_run_classification_lr(sample_classification_data):
    df = sample_classification_data
    result = run_classification(df, target_col='target', feature_cols=['feature1', 'feature2'], algorithm='lr')
    assert 'accuracy' in result
    assert 'f1_score' in result
    assert 'sample_data' in result

def test_run_clustering_kmeans(sample_clustering_data):
    df = sample_clustering_data
    result = run_clustering(df, feature_cols=['feature1', 'feature2'], k=2, algorithm='kmeans')
    assert 'silhouette_score' in result
    assert 'sample_data' in result
    assert 'centroids' in result
    assert len(result['centroids']) == 2
