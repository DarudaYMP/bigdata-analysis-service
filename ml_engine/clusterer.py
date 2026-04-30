import pandas as pd
from sklearn.cluster import KMeans, BisectingKMeans, DBSCAN
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import silhouette_score

def run_clustering(df, feature_cols, k=3, algorithm="kmeans"):
    """
    Run a scikit-learn clustering pipeline.
    """
    df = df.dropna(subset=feature_cols)
    
    X = df[feature_cols]
    
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
    
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    if algorithm == "bisecting_kmeans":
        clusterer = BisectingKMeans(n_clusters=k, random_state=42)
    elif algorithm == "dbscan":
        clusterer = DBSCAN()
    else:
        clusterer = KMeans(n_clusters=k, random_state=42)
        
    pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                               ('clusterer', clusterer)])
    
    # Fit and predict
    predictions = pipeline.fit_predict(X)
    
    if algorithm == "dbscan":
        k_measured = len(set(predictions)) - (1 if -1 in predictions else 0)
        k = k_measured if k_measured > 0 else 1
    
    from sklearn.decomposition import PCA
    import numpy as np

    # Transform features for silhouette score (requires numerical representation)
    X_transformed = preprocessor.transform(X)
    
    # Dense array conversion in case of sparse matrices from OneHotEncoder
    if hasattr(X_transformed, 'toarray'):
        X_transformed = X_transformed.toarray()
    
    try:
        silhouette = silhouette_score(X_transformed, predictions)
    except ValueError:
        # Happens if k=1 or everything falls into 1 cluster
        silhouette = 0.0
        
    # Project down to 2D using PCA for the UI Scatter chart
    if X_transformed.shape[1] >= 2:
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_transformed)
    else:
        # Fallback if only 1 dimension is provided
        X_pca = np.hstack((X_transformed, np.zeros((X_transformed.shape[0], 1))))
        
    df_pca = pd.DataFrame(X_pca, columns=['pca_x', 'pca_y'])
    df_pca['prediction'] = [f"Cluster {p}" for p in predictions]
    
    # Random sample of 100 to prevent Recharts rendering lag
    sample_df = df_pca.sample(min(150, len(df_pca)))
    
    # Extract centroids and transform them with PCA
    centroids_data = []
    if algorithm in ["kmeans", "bisecting_kmeans"] and hasattr(clusterer, "cluster_centers_"):
        centroids = clusterer.cluster_centers_
        if X_transformed.shape[1] >= 2:
            centroids_pca_array = pca.transform(centroids)
        else:
            centroids_pca_array = np.hstack((centroids, np.zeros((centroids.shape[0], 1))))
        for i, c in enumerate(centroids_pca_array):
            centroids_data.append({
                "pca_x": float(c[0]),
                "pca_y": float(c[1]),
                "cluster": f"Cluster {i}"
            })
            
    return {
        "silhouette_score": silhouette,
        "sample_data": sample_df,
        "centroids": centroids_data,
        "k": k
    }
