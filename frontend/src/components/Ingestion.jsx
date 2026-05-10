import React, { useRef, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Upload, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

/**
 * Ingestion Component
 * Handles file uploads and sheet selection.
 */
const Ingestion = () => {
  const { 
    setFileId, setColumns, setTargetColumn, setVisXCol, 
    setPreviewData, setEdaInsights, setSelectedFeatures, 
    setCurrentStep, setLoading, loading 
  } = useStore();
  
  const fileInputRef = useRef(null);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [localFileId, setLocalFileId] = useState(null);

  const showError = (msg) => Swal.fire('Помилка', msg, 'error');

  const finishUpload = (data) => {
    setFileId(data.file_path);
    setColumns(data.columns);
    setTargetColumn(data.columns[0]);
    setVisXCol(data.columns[0]);
    setPreviewData(data.preview || []);
    setEdaInsights(data.insights || []);

    if (data.columns.length > 1) {
      setSelectedFeatures(data.columns.slice(1));
    }
    setCurrentStep('cleaning');
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData);
      if (response.data.needs_sheet_selection) {
        setLocalFileId(response.data.file_path);
        setAvailableSheets(response.data.sheets);
        setSelectedSheet(response.data.sheets[0]);
      } else {
        finishUpload(response.data);
      }
    } catch (err) {
      showError('Помилка завантаження файлу: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSheetSelection = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/select_sheet`, { file_path: localFileId, sheet_name: selectedSheet });
      finishUpload(res.data);
      setAvailableSheets([]);
    } catch (err) {
      showError('Помилка вибору листа: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div className="hero-section" style={{ maxWidth: '800px' }}>
        <div className="hero-icon"><Upload size={32} /></div>
        <h2>Зручний аналіз даних <br />починається тут.</h2>
        <p>Алгоритми кластеризації, зокрема K-Means та DBSCAN, дозволяють знаходити приховані закономірності та сегментувати інформацію, а моделі класифікації, такі як метод опорних векторів (SVM) та випадковий ліс (Random Forest), – швидко розподіляти нові вхідні дані за визначеними категоріями.</p>
        
        {availableSheets.length > 0 ? (
          <div className="panel" style={{ padding: '2rem', marginTop: '1rem', background: 'var(--bg-main)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Оберіть таблицю / лист:</h3>
            <select className="form-control" value={selectedSheet} onChange={e => setSelectedSheet(e.target.value)} style={{ marginBottom: '1rem' }}>
              {availableSheets.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn-primary" onClick={handleSheetSelection} disabled={loading}>
              {loading ? 'ЗАВАНТАЖЕННЯ...' : 'ПІДТВЕРДИТИ'} <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <>
            <button className="btn-primary" onClick={() => fileInputRef.current.click()} disabled={loading}>
              {loading ? 'ЗАВАНТАЖЕННЯ...' : 'ЗАВАНТАЖИТИ ДАНІ (CSV/JSON/XLSX/PARQUET/AVRO)'} <ChevronRight size={18} />
            </button>
            <input type="file" accept=".csv,.json,.xlsx,.parquet,.avro" className="hidden-file-input" style={{display: 'none'}} ref={fileInputRef} onChange={handleFileUpload} />
          </>
        )}
      </div>
    </div>
  );
};

export default Ingestion;
