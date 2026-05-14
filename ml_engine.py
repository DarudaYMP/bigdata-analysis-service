import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
import nest_asyncio

from sklearn.cluster import KMeans, BisectingKMeans, DBSCAN
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import silhouette_score, accuracy_score, f1_score
from sklearn.decomposition import PCA

nest_asyncio.apply()

def _get_llm_advice(prompt: str, fallback_recs: List[str]) -> List[str]:
    """
    Attempt to fetch business recommendations from a free LLM using g4f.
    
    Args:
        prompt (str): The prompt for the LLM.
        fallback_recs (List[str]): Fallback recommendations if LLM fails.
        
    Returns:
        List[str]: List of bullet point recommendations.
    """
    try:
        from g4f.client import Client
        import g4f
        g4f.debug.logging = False
        client = Client()
        response = client.chat.completions.create(
            model=g4f.models.default,
            messages=[{"role": "user", "content": prompt}]
        )
        answer = response.choices[0].message.content.strip()
        return [sentence.strip() for sentence in answer.split('.') if len(sentence) > 10]
    except Exception as e:
        print("LLM Error:", str(e))
        return fallback_recs

def run_classification(df: pd.DataFrame, target_col: str, feature_cols: List[str], 
                       algorithm: str = "rf", test_ratio: float = 0.2) -> Dict[str, Any]:
    """
    Run a scikit-learn classification pipeline.
    
    Args:
        df (pd.DataFrame): The dataset.
        target_col (str): The target column to predict.
        feature_cols (List[str]): The feature columns to use for prediction.
        algorithm (str): The algorithm ('rf', 'lr', 'svm').
        test_ratio (float): Ratio of testing data.
        
    Returns:
        Dict[str, Any]: A dictionary containing accuracy, f1_score, sample_data, and classes.
    """
    df = df.dropna(subset=[target_col] + feature_cols).copy()
    
    if len(df) < 10:
        raise ValueError(f"Недостатньо валідних даних для тренування (залишилось {len(df)} рядків). Переконайтеся, що обрані колонки не є повністю порожніми.")
        
    if pd.api.types.is_numeric_dtype(df[target_col]) and df[target_col].nunique() > 10:
        df[target_col] = pd.qcut(df[target_col], q=4, duplicates='drop').astype(str)
        
    X = df[feature_cols]
    y = df[target_col]
    
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    if len(le.classes_) < 2:
        raise ValueError("Цільова змінна повинна мати щонайменше 2 унікальних класи для класифікації.")
    
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
    
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
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
    
    y_all_pred = model.predict(X)
    sample_df = df.copy()
    sample_df['prediction'] = le.inverse_transform(y_all_pred)
    sample_df = sample_df.sample(min(100, len(sample_df)))
    
    return {
        "accuracy": float(accuracy),
        "f1_score": float(f1),
        "sample_data": sample_df,
        "classes": le.classes_.tolist()
    }

def run_clustering(df: pd.DataFrame, feature_cols: List[str], k: int = 3, algorithm: str = "kmeans") -> Dict[str, Any]:
    """
    Run a scikit-learn clustering pipeline.
    
    Args:
        df (pd.DataFrame): The dataset.
        feature_cols (List[str]): The feature columns to use for clustering.
        k (int): Number of clusters.
        algorithm (str): The algorithm ('kmeans', 'bisecting_kmeans', 'dbscan').
        
    Returns:
        Dict[str, Any]: A dictionary containing silhouette_score, sample_data, centroids, and k.
    """
    df = df.dropna(subset=feature_cols)
    
    if len(df) < k:
        raise ValueError(f"Недостатньо валідних даних для кластеризації. Залишилося {len(df)} рядків, але потрібно мінімум {k} (к-сть кластерів). Переконайтеся, що обрані колонки не є повністю порожніми.")
        
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
    
    predictions = pipeline.fit_predict(X)
    
    if algorithm == "dbscan":
        k_measured = len(set(predictions)) - (1 if -1 in predictions else 0)
        k = k_measured if k_measured > 0 else 1
    
    X_transformed = preprocessor.transform(X)
    if hasattr(X_transformed, 'toarray'):
        X_transformed = X_transformed.toarray()
    
    try:
        silhouette = silhouette_score(X_transformed, predictions)
    except ValueError:
        silhouette = 0.0
        
    if X_transformed.shape[1] >= 2:
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_transformed)
    else:
        X_pca = np.hstack((X_transformed, np.zeros((X_transformed.shape[0], 1))))
        
    df_pca = pd.DataFrame(X_pca, columns=['pca_x', 'pca_y'])
    df_pca['prediction'] = [f"Cluster {p}" for p in predictions]
    sample_df = df_pca.sample(min(150, len(df_pca)))
    
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
        "silhouette_score": float(silhouette),
        "sample_data": sample_df,
        "centroids": centroids_data,
        "k": k
    }

def generate_classification_summary(accuracy: float, f1_score: float, algorithm: str) -> Tuple[str, List[str]]:
    """
    Generate business summary and recommendations for classification.
    """
    alg_name = 'Випадковий ліс' if algorithm == 'rf' else ('Метод опорних векторів (SVM)' if algorithm == 'svm' else 'Логістична регресія')
    summary = f"Обраний модуль ({alg_name}) побудував гіперплощину класифікації з Точністю (Accuracy) {accuracy:.4f} та F1-Оцінкою {f1_score:.4f}."
    
    fallback_recs = []
    if accuracy > 0.85:
        fallback_recs.append("Модель демонструє високу прогностичну здатність. Бізнесу рекомендується автоматизувати рішення на базі цих даних.")
    elif accuracy > 0.7:
        fallback_recs.append("Модель показує прийнятні результати, але варто зібрати додаткові точки дотику з клієнтами.")
    else:
        fallback_recs.append("Точність занадто низька. База даних не містить явних індикаторів для класифікації.")

    prompt = f"Виступайте як старший бізнес-аналітик. У нас є модель машинного навчання ({alg_name}), яка класифікує клієнтську базу " \
             f"з точністю {accuracy:.4f}. Надайте 2 конкретні, короткі бізнес-рекомендації або поради. " \
             f"Відповідайте ВИКЛЮЧНО українською мовою."
             
    recs = _get_llm_advice(prompt, fallback_recs)
    return summary, recs

def generate_clustering_summary(silhouette: float, k: int, algorithm: str) -> Tuple[str, List[str]]:
    """
    Generate business summary and recommendations for clustering.
    """
    if algorithm == "dbscan":
        alg_name = "DBSCAN"
    elif algorithm == "kmeans":
        alg_name = "Стандартний K-Means"
    else:
        alg_name = "Бісекційний K-Means"
        
    summary = f"Топологічне відображення {alg_name} ініціювало {k} окремих кластерів. Щільність силуету моделі оцінена у {silhouette:.4f}."
    
    fallback_recs = []
    if silhouette > 0.71:
        fallback_recs.append("Дані чітко розділені на групи. Це ідеальна база для гіпер-персоналізованого маркетингу.")
    elif silhouette > 0.51:
        fallback_recs.append("Виявлено помірну сегментацію. Зосередьте увагу на A/B тестуванні між знайденими групами.")
    elif silhouette > 0.26:
        fallback_recs.append("Клієнтська база не має яскраво виражених сегментів. Впроваджуйте масові пропозиції.")
    else:
        fallback_recs.append("Ситуація є абсолютно хаотичною. Сегментація на цей момент є недоцільною.")

    prompt = f"Виступайте як старший маркетолог-аналітик. Алгоритм ({alg_name}) розбив базу користувачів " \
             f"на {k} сегментів (кластерів) із показником silhouette density {silhouette:.4f}. " \
             f"Надайте 2 короткі бізнес-рекомендації. Відповідайте ВИКЛЮЧНО українською мовою."
             
    recs = _get_llm_advice(prompt, fallback_recs)
    return summary, recs
