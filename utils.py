import pandas as pd
import pandavro as pdx

def get_supported_extensions() -> tuple:
    """Return supported file extensions."""
    return ('.csv', '.xlsx', '.json', '.parquet', '.avro')

def load_df(file_path: str, sheet_name: str = None) -> pd.DataFrame:
    """
    Load a dataframe from a supported file format.
    
    Args:
        file_path (str): The absolute or relative path to the data file.
        sheet_name (str, optional): Sheet name for Excel files. Defaults to None.
        
    Returns:
        pd.DataFrame or None: The loaded DataFrame, or None if format is unsupported.
    """
    if file_path.endswith('.csv'):
        return pd.read_csv(file_path, sep=None, engine='python', on_bad_lines='skip')
    elif file_path.endswith('.xlsx'):
        return pd.read_excel(file_path, sheet_name=sheet_name or 0)
    elif file_path.endswith('.json'):
        return pd.read_json(file_path)
    elif file_path.endswith('.parquet'):
        return pd.read_parquet(file_path)
    elif file_path.endswith('.avro'):
        return pdx.read_avro(file_path)
    return None

def save_df(df: pd.DataFrame, file_path: str) -> None:
    """
    Save a dataframe back to its original file format.
    
    Args:
        df (pd.DataFrame): The DataFrame to save.
        file_path (str): The path to save the file to.
    """
    if file_path.endswith('.csv'):
        df.to_csv(file_path, index=False)
    elif file_path.endswith('.xlsx'):
        df.to_excel(file_path, index=False)
    elif file_path.endswith('.json'):
        df.to_json(file_path, orient='records')
    elif file_path.endswith('.parquet'):
        df.to_parquet(file_path, index=False)
    elif file_path.endswith('.avro'):
        pdx.to_avro(file_path, df)
    else:
        raise ValueError("Unsupported format for saving")
