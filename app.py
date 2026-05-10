import os
import uuid
import traceback
import pandas as pd
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Local modules
from utils import get_supported_extensions, load_df, save_df
from data_processing import clean_dataframe, impute_missing_values, generate_eda_insights
from visualizations import generate_plot_data
from ml_engine import run_classification, run_clustering, generate_classification_summary, generate_clustering_summary

app = Flask(__name__, static_folder='static', static_url_path='/')
CORS(app)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500 MB max

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file uploads and return initial insights."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    supported_extensions = get_supported_extensions()
    if file and file.filename.endswith(supported_extensions):
        filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{unique_id}_{filename}")
        file.save(save_path)
        
        try:
            if save_path.endswith('.xlsx'):
                xls = pd.ExcelFile(save_path)
                if len(xls.sheet_names) > 1:
                    return jsonify({
                        'file_path': save_path,
                        'needs_sheet_selection': True,
                        'sheets': xls.sheet_names
                    })
            
            df = load_df(save_path)
            if df is None:
                return jsonify({'error': 'Failed to parse file: unsupported format'}), 400
                
            columns = df.columns.tolist()
            preview_data = df.head(10).fillna("").to_dict(orient="records")
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

@app.route('/select_sheet', methods=['POST'])
def select_sheet():
    """Handle sheet selection for multi-sheet Excel files."""
    data = request.json
    save_path = data.get('file_path')
    sheet_name = data.get('sheet_name')
    if not save_path or not sheet_name:
        return jsonify({'error': 'Missing file_path or sheet_name'}), 400
    try:
        df = load_df(save_path, sheet_name=sheet_name)
        if df is None:
            return jsonify({'error': 'Failed to load sheet'}), 400
            
        columns = df.columns.tolist()
        preview_data = df.head(10).fillna("").to_dict(orient="records")
        eda_insights = generate_eda_insights(df)
        
        return jsonify({
            'file_path': save_path, 
            'columns': columns,
            'preview': preview_data,
            'insights': eda_insights
        })
    except Exception as e:
        return jsonify({'error': f'Failed to process sheet: {str(e)}'}), 500

@app.route('/clean', methods=['POST'])
def clean_data():
    """Clean dataset based on requested action."""
    data = request.json
    file_path = data.get('file_path')
    action = data.get('action')
    subset = data.get('subset', [])
    
    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
        
    try:
        df = load_df(file_path)
        if df is None:
            return jsonify({'error': 'Unsupported file format'}), 400
            
        df = clean_dataframe(df, action, subset)
        
        save_df(df, file_path)
        
        columns = df.columns.tolist()
        preview_data = df.head(10).fillna("").to_dict(orient="records")
        eda_insights = generate_eda_insights(df)
        
        return jsonify({
            'success': True,
            'preview': preview_data,
            'insights': eda_insights,
            'columns': columns
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'Failed to clean data: {str(e)}'}), 500

@app.route('/get_page', methods=['POST'])
def get_page():
    """Get paginated data for full dataset view."""
    data = request.json
    file_path = data.get('file_path')
    page = int(data.get('page', 1))
    per_page = int(data.get('per_page', 50))
    try:
        df = load_df(file_path)
        if df is None:
            return jsonify({'error': 'Invalid file'}), 400
            
        total_rows = len(df)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        page_data = df.iloc[start_idx:end_idx].fillna("").to_dict(orient="records")
        
        return jsonify({'data': page_data, 'total_rows': total_rows})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_cell', methods=['POST'])
def update_cell():
    """Update a specific cell in the dataset."""
    data = request.json
    file_path = data.get('file_path')
    row_index = int(data.get('row_index'))
    column = data.get('column')
    new_value = data.get('value')
    
    try:
        df = load_df(file_path)
        if df is None:
            return jsonify({'error': 'Invalid file'}), 400
        
        if pd.api.types.is_numeric_dtype(df[column]):
            try:
                new_value = float(new_value)
            except ValueError:
                return jsonify({'error': 'Invalid numeric value'}), 400
                
        df.at[row_index, column] = new_value
        save_df(df, file_path)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download', methods=['GET'])
def download_file():
    """Download the processed dataset."""
    file_path = request.args.get('file_path')
    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    return send_file(file_path, as_attachment=True)

@app.route('/plot', methods=['POST'])
def plot_data():
    """Generate plotting data."""
    data = request.json
    file_path = data.get('file_path')
    x_col = data.get('x_col')
    y_col = data.get('y_col')
    chart_type = data.get('chart_type')
    
    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
        
    try:
        df = load_df(file_path)
        if df is None:
            return jsonify({'error': 'Unsupported file format'}), 400
            
        chart_data = generate_plot_data(df, x_col, y_col, chart_type)
        return jsonify({'success': True, 'chartData': chart_data})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'Failed to generate plot: {str(e)}'}), 500

@app.route('/analyze', methods=['POST'])
def analyze_data():
    """Run ML analysis on the dataset."""
    data = request.json
    file_path = data.get('file_path')
    analysis_type = data.get('analysis_type')
    algorithm = data.get('algorithm')
    features = data.get('features', [])
    target = data.get('target')
    
    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
        
    if not features:
        return jsonify({'error': 'No features selected'}), 400
        
    try:
        df = load_df(file_path)
        df = impute_missing_values(df)
        
        if analysis_type == 'classification':
            if not target:
                return jsonify({'error': 'No target selected'}), 400
            
            results = run_classification(df, target, features, algorithm)
            summary, recs = generate_classification_summary(results['accuracy'], results['f1_score'], algorithm)
            
            prediction_counts = results['sample_data']['prediction'].value_counts().to_dict()
            chart_data = [{"name": str(k), "value": int(v)} for k, v in prediction_counts.items()]
            
            return jsonify({
                'metrics': {
                    'Accuracy': f"{results['accuracy']:.4f}",
                    'F1-Score': f"{results['f1_score']:.4f}"
                },
                'summary': summary,
                'recommendations': recs,
                'chartType': 'pie',
                'chartData': chart_data
            })
            
        elif analysis_type == 'clustering':
            k = int(data.get('k', 3))
            results = run_clustering(df, features, k, algorithm)
            summary, recs = generate_clustering_summary(results['silhouette_score'], results['k'], algorithm)
            
            sample_df = results['sample_data']
            chart_data = []
            for idx, row in sample_df.iterrows():
                chart_data.append({
                    'x': round(row['pca_x'], 3) if not pd.isna(row['pca_x']) else 0,
                    'y': round(row['pca_y'], 3) if not pd.isna(row['pca_y']) else 0,
                    'cluster': str(row['prediction']),
                    'isCentroid': False
                })
            
            if 'centroids' in results and results['centroids']:
                for c in results['centroids']:
                    chart_data.append({
                        'x': round(c['pca_x'], 3),
                        'y': round(c['pca_y'], 3),
                        'cluster': c['cluster'],
                        'isCentroid': True
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
        traceback.print_exc()
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/')
def serve_frontend():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def static_proxy(path):
    if os.path.exists(os.path.join(app.root_path, 'static', path)):
        return app.send_static_file(path)
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
