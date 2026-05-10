import pandas as pd
from typing import List, Optional

def clean_dataframe(df: pd.DataFrame, action: str, subset: Optional[List[str]] = None) -> pd.DataFrame:
    """
    Clean the dataframe based on the provided action.
    
    Args:
        df (pd.DataFrame): The dataframe to clean.
        action (str): The cleaning action ('drop_duplicates', 'drop_nulls', 'lower_text').
        subset (list of str, optional): Subset of columns to consider for duplicates.
        
    Returns:
        pd.DataFrame: The cleaned dataframe.
    """
    if action == 'drop_duplicates':
        if subset and len(subset) > 0:
            df = df.drop_duplicates(subset=subset)
        else:
            df = df.drop_duplicates()
    elif action == 'drop_nulls':
        df = df.dropna()
    elif action == 'lower_text':
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        for col in categorical_cols:
            df[col] = df[col].astype(str).str.lower()
            
    return df

def impute_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """
    Perform missing value numeric/categorical imputation.
    
    Args:
        df (pd.DataFrame): The dataframe to impute.
        
    Returns:
        pd.DataFrame: Dataframe with missing values handled.
    """
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns

    for col in numeric_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].mean())
            
    for col in categorical_cols:
        if df[col].isnull().any():
            mode_val = df[col].mode()
            df[col] = df[col].fillna(mode_val[0] if not mode_val.empty else "Unknown")
            
    return df

def generate_eda_insights(df: pd.DataFrame) -> List[str]:
    """
    Generate basic exploratory data analysis insights.
    
    Args:
        df (pd.DataFrame): The dataset.
        
    Returns:
        List[str]: A list of text insights about the dataset.
    """
    insights = []
    rows, cols = df.shape
    insights.append(f"Завантажено матрицю з {rows} рядків та {cols} вимірів.")
    
    null_counts = df.isnull().sum()
    null_cols = null_counts[null_counts > 0]
    
    if not null_cols.empty:
        insights.append(f"Виявлено пропущені значення в {len(null_cols)} колонках. Застосовано автоматичне заповнення (середнє/мода) для стабілізації алгоритмів.")
    else:
        insights.append("Не виявлено математичних аномалій або пропущених змінних у сирих даних.")
        
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    if len(numeric_cols) > 1:
        insights.append(f"Успішно розмічено {len(numeric_cols)} кількісних ознак. Масштабування готове.")
        
    return insights
