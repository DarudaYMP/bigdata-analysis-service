import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Database, Filter, Trash2, Edit3 } from 'lucide-react';
import { useStore } from '../store/useStore';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

/**
 * Cleaning Component
 * Handles data wrangling actions and rendering the full dataset viewer.
 */
const Cleaning = () => {
  const { 
    fileId, columns, previewData, edaInsights,
    setColumns, setPreviewData, setEdaInsights,
    fullData, setFullData, dataPage, setDataPage,
    totalRows, setTotalRows, showFullData, setShowFullData,
    loading, setLoading
  } = useStore();

  const [cleaningSubset, setCleaningSubset] = useState([]);

  const showError = (msg) => Swal.fire('Помилка', msg, 'error');

  const handleCleaning = async (actionStr, extraPayload = {}) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/clean`, { file_path: fileId, action: actionStr, ...extraPayload });
      setColumns(res.data.columns);
      setPreviewData(res.data.preview);
      setEdaInsights(res.data.insights);
      if (showFullData) {
        loadPage(dataPage);
      }
      Swal.fire('Успішно', 'Дані оброблено.', 'success');
    } catch (err) {
      showError('Помилка обробки: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadPage = async (page) => {
    try {
      const res = await axios.post(`${API_URL}/get_page`, { file_path: fileId, page, per_page: 50 });
      setFullData(res.data.data);
      setTotalRows(res.data.total_rows);
      setDataPage(page);
    } catch (err) {
      showError('Помилка завантаження даних.');
    }
  };

  const handleCellEdit = async (rowIndex, col, newValue) => {
    try {
      const absoluteIndex = (dataPage - 1) * 50 + rowIndex;
      await axios.post(`${API_URL}/update_cell`, { file_path: fileId, row_index: absoluteIndex, column: col, value: newValue });
      
      const newData = [...fullData];
      newData[rowIndex][col] = newValue;
      setFullData(newData);
    } catch (err) {
      showError('Помилка оновлення клітинки: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleShowFullData = () => {
    setShowFullData(true);
    loadPage(1);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', width: '100%', maxWidth: '1400px', alignItems: 'start' }}>
      
      {/* Sidebar: Data Actions */}
      <div className="panel" style={{ marginTop: 0 }}>
        <h3><Filter size={20} /> Очищення даних</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '1rem 0' }}>Оптимізуйте набір даних перед побудовою моделей.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="feature-card" style={{ padding: '1rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><Trash2 size={16} /> Видалення дублікатів</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Оберіть стовпці для перевірки (залиште порожнім для перевірки цілого рядка)</p>
            <div className="checkbox-grid" style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '1rem', padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '4px' }}>
              {columns.map(col => (
                <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <input type="checkbox" checked={cleaningSubset.includes(col)} onChange={() => {
                    setCleaningSubset(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
                  }} /> {col}
                </label>
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '0.5rem' }} onClick={() => handleCleaning('drop_duplicates', { subset: cleaningSubset })} disabled={loading}>Видалити дублікати</button>
          </div>

          <button className="btn-primary" onClick={() => handleCleaning('drop_nulls')} disabled={loading}>
            <Trash2 size={18} /> Видалити пропущені значення (NaN)
          </button>
          
          <button className="btn-primary" onClick={() => handleCleaning('lower_text')} disabled={loading}>
            <Edit3 size={18} /> Нормалізувати текст (Lower)
          </button>
        </div>
      </div>

      {/* Main Content: EDA & Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="panel" style={{ marginTop: 0 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Структура набору даних</h2>
          <ul className="recommendations" style={{ color: 'var(--text-muted)' }}>
            {edaInsights.map((insight, i) => <li key={i}>{insight}</li>)}
          </ul>
        </div>

        {previewData.length > 0 && (
          <div className="panel" style={{ marginTop: 0, overflowX: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><Database size={20} /> Структура даних</span>
              {!showFullData && <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={handleShowFullData}>Показати всі дані</button>}
            </h2>
            
            {!showFullData ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>{columns.map(col => <th key={col}>{col}</th>)}</tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx}>{columns.map(col => <td key={col}>{row[col]}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>{columns.map(col => <th key={col}>{col}</th>)}</tr>
                  </thead>
                  <tbody>
                    {fullData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {columns.map(col => (
                          <td key={col} style={{ padding: 0 }}>
                            <input 
                              type="text" 
                              defaultValue={row[col]} 
                              onBlur={(e) => {
                                if (e.target.value !== String(row[col])) {
                                  handleCellEdit(rowIndex, col, e.target.value);
                                }
                              }}
                              style={{
                                width: '100%', border: 'none', background: 'transparent', padding: '0.75rem 1rem',
                                color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none'
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Всього рядків: {totalRows}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} disabled={dataPage === 1} onClick={() => loadPage(dataPage - 1)}>Попередня</button>
                    <span style={{ fontSize: '0.85rem' }}>Сторінка {dataPage}</span>
                    <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} disabled={dataPage * 50 >= totalRows} onClick={() => loadPage(dataPage + 1)}>Наступна</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cleaning;
