import pandas as pd
import pytest
import os
from utils import load_df, save_df, get_supported_extensions

def test_get_supported_extensions():
    exts = get_supported_extensions()
    assert '.csv' in exts
    assert '.xlsx' in exts
    assert '.json' in exts

def test_load_and_save_csv(tmp_path):
    df = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})
    file_path = str(tmp_path / "test.csv")
    
    save_df(df, file_path)
    assert os.path.exists(file_path)
    
    loaded_df = load_df(file_path)
    assert loaded_df is not None
    assert loaded_df.shape == (2, 2)
    assert list(loaded_df.columns) == ['A', 'B']

def test_unsupported_save():
    df = pd.DataFrame({'A': [1]})
    with pytest.raises(ValueError):
        save_df(df, "test.unsupported")
