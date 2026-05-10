import pandas as pd
import numpy as np
import pytest
from data_processing import clean_dataframe, impute_missing_values, generate_eda_insights

def test_clean_dataframe_drop_duplicates():
    df = pd.DataFrame({'A': [1, 1, 2], 'B': [3, 3, 4]})
    cleaned = clean_dataframe(df, 'drop_duplicates')
    assert cleaned.shape == (2, 2)
    
def test_clean_dataframe_drop_nulls():
    df = pd.DataFrame({'A': [1, np.nan, 2], 'B': [3, 3, np.nan]})
    cleaned = clean_dataframe(df, 'drop_nulls')
    assert cleaned.shape == (1, 2)
    
def test_clean_dataframe_lower_text():
    df = pd.DataFrame({'A': [1, 2], 'B': ['HELLO', 'World']})
    # Object column should be transformed
    cleaned = clean_dataframe(df, 'lower_text')
    assert list(cleaned['B']) == ['hello', 'world']

def test_impute_missing_values():
    df = pd.DataFrame({
        'num': [1.0, np.nan, 3.0],
        'cat': ['A', np.nan, 'A']
    })
    imputed = impute_missing_values(df)
    assert not imputed['num'].isnull().any()
    assert imputed['num'].iloc[1] == 2.0  # Mean of 1.0 and 3.0
    assert not imputed['cat'].isnull().any()
    assert imputed['cat'].iloc[1] == 'A'  # Mode

def test_generate_eda_insights():
    df = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})
    insights = generate_eda_insights(df)
    assert len(insights) > 0
    assert "2 рядків" in insights[0]
