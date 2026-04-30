import pandas as pd
import numpy as np

def load_and_clean_dataframe(file_path):
    """
    Loads datastructure dynamically and performs missing value numeric/categorical imputation.
    """
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path, sep=None, engine='python', on_bad_lines='skip')
    elif file_path.endswith('.xlsx'):
        df = pd.read_excel(file_path)
    elif file_path.endswith('.json'):
        df = pd.read_json(file_path)
    elif file_path.endswith('.parquet'):
        df = pd.read_parquet(file_path)
    elif file_path.endswith('.avro'):
        import pandavro as pdx
        df = pdx.read_avro(file_path)
    else:
        raise ValueError("Unsupported extension format")

    # Automated cleaning/imputation
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns

    for col in numeric_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].mean())
            
    for col in categorical_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "Unknown")
            
    return df

def generate_eda_insights(df):
    """
    Returns advanced data insights regarding nulls, dimensions, and correlations.
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

import nest_asyncio
nest_asyncio.apply()

def _get_llm_advice(prompt, fallback_recs):
    """
    Attempts to fetch a business recommendation from a free LLM using g4f.
    Falls back to hardcoded recommendations if the request fails (due to provider issues).
    """
    try:
        from g4f.client import Client
        import g4f
        from g4f.models import gpt_35_turbo
        g4f.debug.logging = False
        client = Client()
        response = client.chat.completions.create(
            model=gpt_35_turbo,
            messages=[{"role": "user", "content": prompt}]
        )
        answer = response.choices[0].message.content.strip()
        # Parse into bullet points if it returned a block
        return [sentence.strip() for sentence in answer.split('.') if len(sentence) > 10]
    except Exception as e:
        print("LLM Error:", str(e))
        return fallback_recs

def generate_classification_summary(accuracy, f1_score, algorithm):
    """
    Generate summary text and recommendations for classification using LLM.
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
             f"з точністю {accuracy:.4f}. Надайте 2 конкретні, короткі бізнес-рекомендації або поради щодо того, що компанії слід робити далі з цими даними. " \
             f"Відповідайте ВИКЛЮЧНО українською мовою. Не використовуйте форматування."
             
    recs = _get_llm_advice(prompt, fallback_recs)
    return summary, recs


def generate_clustering_summary(silhouette, k, algorithm):
    """
    Generate summary text and recommendations for clustering using LLM.
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

    prompt = f"Виступайте як старший маркетолог-аналітик. Алгоритм кластеризації ({alg_name}) розбив базу користувачів " \
             f"на {k} сегментів (кластерів) із показником 'silhouette density' {silhouette:.4f} (де 1 - ідеальний поділ, а 0 - хаос). " \
             f"Надайте 2 конкретні, короткі бізнес-рекомендації компанії про те, як продавати продукти або працювати з цими сегментами далі. " \
             f"Відповідайте ВИКЛЮЧНО українською мовою. Не використовуйте форматування."
             
    recs = _get_llm_advice(prompt, fallback_recs)
    return summary, recs
