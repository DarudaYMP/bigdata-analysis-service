import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score

def run_classification(df, target_col, feature_cols, algorithm="rf", test_ratio=0.2):
    """
    Run a scikit-learn classification pipeline.
    """
    # Use pre-loaded dataframe directly
    df = df.dropna(subset=[target_col] + feature_cols).copy()
    
    # Auto-binning for numeric continuous targets
    if pd.api.types.is_numeric_dtype(df[target_col]) and df[target_col].nunique() > 10:
        df[target_col] = pd.qcut(df[target_col], q=4, duplicates='drop').astype(str)
        
    X = df[feature_cols]
    y = df[target_col]
    
    # Process target (encode if string)
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Identify numeric and categorical columns
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
    
    # Preprocessing for numerical features
    numeric_transformer = StandardScaler()
    
    # Preprocessing for categorical features
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    # Algorithm
    if algorithm == "lr":
        classifier = LogisticRegression(max_iter=1000)
    elif algorithm == "svm":
        classifier = SVC(probability=False, random_state=42)
    else:
        classifier = RandomForestClassifier(random_state=42)
        
    pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                               ('classifier', classifier)])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=test_ratio, random_state=42)
    
    model = pipeline.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    # Get a small sample of predictions for visualization
    # We will compute predictions on the whole set to return a sample
    y_all_pred = model.predict(X)
    
    sample_df = df.copy()
    sample_df['prediction'] = le.inverse_transform(y_all_pred)
    sample_df = sample_df.sample(min(100, len(sample_df)))
    
    return {
        "accuracy": accuracy,
        "f1_score": f1,
        "sample_data": sample_df,
        "classes": le.classes_.tolist()
    }
