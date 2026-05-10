import pandas as pd
from typing import Dict, List, Any

def generate_plot_data(df: pd.DataFrame, x_col: str, y_col: str, chart_type: str) -> List[Dict[str, Any]]:
    """
    Generate plotting data for frontend consumption based on the chart type.
    
    Args:
        df (pd.DataFrame): The dataset.
        x_col (str): Column for X axis.
        y_col (str): Column for Y axis (can be None).
        chart_type (str): Type of chart ('bar', 'line', 'scatter').
        
    Returns:
        List[Dict[str, Any]]: List of dictionary points containing x and y coordinates.
        
    Raises:
        ValueError: If data structure does not support the requested chart type.
    """
    chart_data = []
    
    if x_col not in df.columns:
        raise ValueError(f"Ознака '{x_col}' не знайдена у наборі даних.")
    if y_col and y_col not in df.columns:
        raise ValueError(f"Ознака '{y_col}' не знайдена у наборі даних.")
    
    if chart_type in ['bar', 'line']:
        if chart_type == 'bar':
            unique_count = df[x_col].nunique()
            total_count = len(df[x_col].dropna())
            if total_count > 10 and unique_count >= total_count * 0.95:
                raise ValueError('Цей стовпець містить унікальні ID і не підходить для даного типу графіка.')

        if y_col:
            if pd.api.types.is_numeric_dtype(df[y_col]):
                grouped = df.groupby(x_col)[y_col].mean().reset_index()
            else:
                grouped = df.groupby(x_col).size().reset_index(name=y_col)
                
            grouped = grouped.sort_values(by=y_col, ascending=False).head(50)
            for _, row in grouped.iterrows():
                chart_data.append({'x': str(row[x_col]), 'y': row[y_col]})
        else:
            grouped = df[x_col].value_counts().reset_index()
            grouped.columns = [x_col, 'count']
            grouped = grouped.head(50)
            for _, row in grouped.iterrows():
                chart_data.append({'x': str(row[x_col]), 'y': row['count']})
                
    elif chart_type == 'scatter':
        if y_col:
            sampled = df.dropna(subset=[x_col, y_col]).sample(n=min(1000, len(df)))
            for _, row in sampled.iterrows():
                chart_data.append({'x': row[x_col], 'y': row[y_col]})
        else:
            raise ValueError('Scatter requires a Y column.')
            
    return chart_data
