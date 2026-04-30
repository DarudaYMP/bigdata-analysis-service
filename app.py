import os
import uuid
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from ml_engine.classifier import run_classification
from ml_engine.clusterer import run_clustering
from ml_engine.analyzer import generate_classification_summary, generate_clustering_summary

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend connecting to this API
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500 MB max

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    supported_extensions = ('.csv', '.xlsx', '.json', '.parquet', '.avro')
    if file and file.filename.endswith(supported_extensions):
        filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{unique_id}_{filename}")
        file.save(save_path)
        
        try:
            if save_path.endswith('.csv'):
                df = pd.read_csv(save_path, sep=None, engine='python', on_bad_lines='skip')
            elif save_path.endswith('.xlsx'):
                df = pd.read_excel(save_path)
            elif save_path.endswith('.json'):
                df = pd.read_json(save_path)
            elif save_path.endswith('.parquet'):
                df = pd.read_parquet(save_path)
            elif save_path.endswith('.avro'):
                import pandavro as pdx
                df = pdx.read_avro(save_path)
                
            columns = df.columns.tolist()
            preview_data = df.head(10).fillna("").to_dict(orient="records")
            
            from ml_engine.analyzer import generate_eda_insights
            eda_insights = generate_eda_insights(df)
            
            return jsonify({
                'file_path': save_path, 
                'columns': columns,
                'preview': preview_data,
                'insights': eda_insights
            })
        except Exception as e:
            return jsonify({'error': f'Failed to process file: {str(e)}'}), 500
            
    return jsonify({'error': 'Unsupported file format'}), 400

@app.route('/clean', methods=['POST'])
def clean_data():
    data = request.json
    file_path = data.get('file_path')
    action = data.get('action') # 'drop_duplicates', 'drop_nulls', 'lower_text'
    
    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
        
    try:
        from ml_engine.analyzer import load_and_clean_dataframe
        # Since load_and_clean already imputes nulls, we should load it raw first if we want strict drop_nulls
        # But for simplicity, let's load it through pd directly to apply explicit dropping logic
        if file_path.endswith('.csv'): df = pd.read_csv(file_path, sep=None, engine='python', on_bad_lines='skip')
        elif file_path.endswith('.xlsx'): df = pd.read_excel(file_path)
        elif file_path.endswith('.json'): df = pd.read_json(file_path)
        elif file_path.endswith('.parquet'): df = pd.read_parquet(file_path)
        elif file_path.endswith('.avro'): 
            import pandavro as pdx
            df = pdx.read_avro(file_path)
        else:
            return jsonify({'error': 'Unsupported file format'}), 400
            
        if action == 'drop_duplicates':
            df = df.drop_duplicates()
        elif action == 'drop_nulls':
            df = df.dropna()
        elif action == 'lower_text':
            categorical_cols = df.select_dtypes(include=['object', 'category']).columns
            for col in categorical_cols:
                df[col] = df[col].astype(str).str.lower()
                
        # Save back to file to persist changes across steps
        if file_path.endswith('.csv'): df.to_csv(file_path, index=False)
        elif file_path.endswith('.xlsx'): df.to_excel(file_path, index=False)
        elif file_path.endswith('.json'): df.to_json(file_path, orient='records')
        elif file_path.endswith('.parquet'): df.to_parquet(file_path, index=False)
        elif file_path.endswith('.avro'): pdx.to_avro(file_path, df)
        
        columns = df.columns.tolist()
        preview_data = df.head(10).fillna("").to_dict(orient="records")
        
        from ml_engine.analyzer import generate_eda_insights
        eda_insights = generate_eda_insights(df)
        
        return jsonify({
            'success': True,
            'preview': preview_data,
            'insights': eda_insights,
            'columns': columns
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to clean data: {str(e)}'}), 500

@app.route('/plot', methods=['POST'])
def plot_data():
    data = request.json
    file_path = data.get('file_path')
    x_col = data.get('x_col')
    y_col = data.get('y_col')
    chart_type = data.get('chart_type') # 'bar', 'line', 'scatter'
    
    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
        
    try:
        if file_path.endswith('.csv'): df = pd.read_csv(file_path, sep=None, engine='python', on_bad_lines='skip')
        elif file_path.endswith('.xlsx'): df = pd.read_excel(file_path)
        elif file_path.endswith('.json'): df = pd.read_json(file_path)
        elif file_path.endswith('.parquet'): df = pd.read_parquet(file_path)
        elif file_path.endswith('.avro'): 
            import pandavro as pdx
            df = pdx.read_avro(file_path)
        else:
            return jsonify({'error': 'Unsupported file format'}), 400
            
        chart_data = []
        
        # We aggregate for bar and line to save frontend performance
        if chart_type in ['bar', 'line']:
            if chart_type == 'bar':
                unique_count = df[x_col].nunique()
                total_count = len(df[x_col].dropna())
                if total_count > 10 and unique_count >= total_count * 0.95:
                    return jsonify({'error': 'Цей стовпець містить унікальні ID і не підходить для даного типу графіка.'}), 400

            if y_col:
                # Group by X and take Mean of Y
                grouped = df.groupby(x_col)[y_col].mean().reset_index()
                # Limit to top 50 strictly for performance
                grouped = grouped.sort_values(by=y_col, ascending=False).head(50)
                for _, row in grouped.iterrows():
                    chart_data.append({'x': str(row[x_col]), 'y': row[y_col]})
            else:
                # Group by X and Count frequency
                grouped = df[x_col].value_counts().reset_index()
                grouped.columns = [x_col, 'count']
                grouped = grouped.head(50)
                for _, row in grouped.iterrows():
                    chart_data.append({'x': str(row[x_col]), 'y': row['count']})
                    
        elif chart_type == 'scatter':
            if y_col:
                # To prevent React crash, sample up to 1000 points
                sampled = df.dropna(subset=[x_col, y_col]).sample(n=min(1000, len(df)))
                for _, row in sampled.iterrows():
                    chart_data.append({'x': row[x_col], 'y': row[y_col]})
            else:
                return jsonify({'error': 'Scatter requires a Y column.'}), 400
                
        return jsonify({
            'success': True,
            'chartData': chart_data
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to generate plot: {str(e)}'}), 500

@app.route('/analyze', methods=['POST'])
def analyze_data():
    data = request.json
    file_path = data.get('file_path')
    analysis_type = data.get('analysis_type')  # 'classification' or 'clustering'
    algorithm = data.get('algorithm')
    features = data.get('features', [])
    target = data.get('target')
    
    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
        
    if not features:
        return jsonify({'error': 'No features selected'}), 400
        
    try:
        from ml_engine.analyzer import load_and_clean_dataframe
        df = load_and_clean_dataframe(file_path)
        
        if analysis_type == 'classification':
            if not target:
                return jsonify({'error': 'No target selected for classification'}), 400
            
            results = run_classification(df, target, features, algorithm)
            summary, recs = generate_classification_summary(results['accuracy'], results['f1_score'], algorithm)
            
            # Formulating chart data for frontend (Recharts)
            # Send sample predictions for pie charts or bar charts
            prediction_counts = results['sample_data']['prediction'].value_counts().to_dict()
            chart_data = [{"name": str(k), "value": int(v)} for k, v in prediction_counts.items()]
            
            return jsonify({
                'metrics': {
                    'Accuracy': f"{results['accuracy']:.4f}",
                    'F1-Score': f"{results['f1_score']:.4f}"
                },
                'summary': summary,
                'recommendations': recs,
                'chartType': 'pie', # For frontend rendering logic
                'chartData': chart_data
            })
            
        elif analysis_type == 'clustering':
            k = int(data.get('k', 3))
            results = run_clustering(df, features, k, algorithm)
            summary, recs = generate_clustering_summary(results['silhouette_score'], results['k'], algorithm)
            
            # Formulate Scatter Plot data
            sample_df = results['sample_data']
            
            chart_data = []
            for idx, row in sample_df.iterrows():
                chart_data.append({
                    'x': round(row['pca_x'], 3) if not pd.isna(row['pca_x']) else 0,
                    'y': round(row['pca_y'], 3) if not pd.isna(row['pca_y']) else 0,
                    'cluster': str(row['prediction'])
                })
            
            return jsonify({
                'metrics': {
                    'Silhouette Score': f"{results['silhouette_score']:.4f}",
                    'Clusters': k
                },
                'summary': summary,
                'recommendations': recs,
                'chartType': 'scatter',
                'chartData': chart_data,
                'axisLabels': {'x': 'Principal Component 1', 'y': 'Principal Component 2'}
            })
            
        else:
            return jsonify({'error': 'Invalid analysis type'}), 400
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

app = Flask(__name__, static_folder='static', static_url_path='/')
# (Update Flask init)
@app.route('/')
def serve_frontend():
    return app.send_static_file('index.html')
@app.route('/<path:path>')
def static_proxy(path):
    # Serve files from static directory, fallback to index.html for React Router
    import os
    if os.path.exists(os.path.join(app.root_path, 'static', path)):
        return app.send_static_file(path)
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
