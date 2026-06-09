import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Database, Filter, Trash2, Edit3, Type } from 'lucide-react';
import { useStore } from '../store/useStore';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

/**
 * Cleaning Component
 * Handles data wrangling actions and rendering the full dataset viewer in a 16:9 responsive view.
 */
const Cleaning = () => {
  const { 
    fileId, columns, previewData, edaInsights,
    setColumns, setPreviewData, setEdaInsights,
    fullData, setFullData, dataPage, setDataPage,
    totalRows, setTotalRows, showFullData, setShowFullData,
    loading, setLoading, setPrimaryKey
  } = useStore();

  const [cleaningSubset, setCleaningSubset] = useState([]);
  const [normalizationCols, setNormalizationCols] = useState([]);
  const [normType, setNormType] = useState('lowercase');

  const showError = (msg) => Swal.fire('Помилка', msg, 'error');

  const handleCleaning = async (actionStr, extraPayload = {}) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/clean`, { file_path: fileId, action: actionStr, ...extraPayload });
      setColumns(res.data.columns);
      setPreviewData(res.data.preview);
      setEdaInsights(res.data.insights);
      if (res.data.primary_key !== undefined) {
        setPrimaryKey(res.data.primary_key);
      }
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

  const handleNullsClick = () => {
    Swal.fire({
      title: 'Обробити пропущені значення',
      text: 'Оберіть метод обробки пропущених значень (NaN) у вашому наборі даних:',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Видалити рядки',
      denyButtonText: 'Автозаповнення',
      cancelButtonText: 'Скасувати',
      confirmButtonColor: '#d33',
      denyButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        handleCleaning('drop_nulls');
      } else if (result.isDenied) {
        handleCleaning('impute_nulls');
      }
    });
  };

  const handleNormalizeText = () => {
    if (normalizationCols.length === 0) {
      Swal.fire('Помилка', 'Будь ласка, оберіть хоча б одну колонку для нормалізації.', 'error');
      return;
    }
    handleCleaning('normalize_text', { subset: normalizationCols, norm_type: normType });
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '320px 1fr', 
      gap: '1.5rem', 
      width: '100%', 
      maxWidth: '1400px', 
      height: 'calc(100vh - var(--nav-height) - 8rem)', 
      maxHeight: 'calc(100vh - var(--nav-height) - 8rem)', 
      overflow: 'hidden',
      alignItems: 'stretch' 
    }}>
      
      {/* Sidebar: Data Actions */}
      <div className="panel" style={{ 
        marginTop: 0, 
        height: '100%', 
        overflowY: 'auto', 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.25rem',
        borderRadius: 'var(--border-radius)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', fontWeight: '700' }}>
          <Filter size={20} color="var(--accent)" /> Очищення даних
        </h3>
        
        {/* Card 1: Deduplication */}
        <div className="feature-card" style={{ padding: '1rem', flexShrink: 0 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
            <Trash2 size={16} /> Видалення дублікатів
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Повні дублікати або за критерієм колонок.
          </p>
          
          <div className="checkbox-grid" style={{ 
            maxHeight: '80px', 
            overflowY: 'auto', 
            marginBottom: '0.75rem', 
            padding: '0.5rem', 
            background: 'var(--bg-main)', 
            borderRadius: '4px',
            gridTemplateColumns: '1fr'
          }}>
            {columns.map(col => (
              <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={cleaningSubset.includes(col)} onChange={() => {
                  setCleaningSubset(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
                }} /> {col}
              </label>
            ))}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }} onClick={() => handleCleaning('drop_duplicates', { subset: [] })} disabled={loading}>
              Видалити повні дублікати
            </button>
            <button className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }} onClick={() => {
              if (cleaningSubset.length === 0) {
                Swal.fire('Увага', 'Оберіть принаймні одну колонку для перевірки дублікатів.', 'warning');
                return;
              }
              handleCleaning('drop_duplicates', { subset: cleaningSubset });
            }} disabled={loading}>
              Видалити за критерієм
            </button>
          </div>
        </div>

        {/* Card 2: Missing Values */}
        <div className="feature-card" style={{ padding: '1rem', flexShrink: 0 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
            <Database size={16} /> Пропущені значення
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Видалити неповні рядки або автоматично заповнити медіаною/модою.
          </p>
          <button className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }} onClick={handleNullsClick} disabled={loading}>
            Обробити пропуски
          </button>
        </div>

        {/* Card 3: Text Normalization */}
        <div className="feature-card" style={{ padding: '1rem', flexShrink: 0 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
            <Type size={16} /> Нормалізація тексту
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Оберіть колонки та тип регістру:
          </p>
          <div className="checkbox-grid" style={{ 
            maxHeight: '80px', 
            overflowY: 'auto', 
            marginBottom: '0.75rem', 
            padding: '0.5rem', 
            background: 'var(--bg-main)', 
            borderRadius: '4px',
            gridTemplateColumns: '1fr'
          }}>
            {columns.map(col => (
              <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={normalizationCols.includes(col)} onChange={() => {
                  setNormalizationCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
                }} /> {col}
              </label>
            ))}
          </div>
          <select className="form-control" style={{ marginBottom: '0.75rem', padding: '0.4rem', fontSize: '0.75rem' }} value={normType} onChange={e => setNormType(e.target.value)}>
            <option value="uppercase">UPPERCASE (Всі великі)</option>
            <option value="lowercase">lowercase (Всі малі)</option>
            <option value="capitalize">Capitalize first letter (Перша літера велика)</option>
          </select>
          <button className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }} onClick={handleNormalizeText} disabled={loading}>
            Нормалізувати текст
          </button>
        </div>
      </div>

      {/* Main Content: EDA & Preview */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem', 
        height: '100%',
        maxHeight: '100%', 
        overflow: 'hidden' 
      }}>
        
        {/* EDA Insights Panel */}
        <div className="panel" style={{ marginTop: 0, padding: '1.5rem', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            Структура набору даних
          </h2>
          <ul className="recommendations" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, paddingLeft: '1.25rem' }}>
            {edaInsights.map((insight, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{insight}</li>)}
          </ul>
        </div>

        {/* Data Preview Table Panel */}
        {previewData.length > 0 && (
          <div className="panel" style={{ 
            marginTop: 0, 
            padding: '1.5rem', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden' 
          }}>
            <h2 style={{ 
              fontSize: '1.3rem', 
              marginBottom: '0.75rem', 
              paddingBottom: '0.5rem', 
              borderBottom: '1px solid var(--border-color)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexShrink: 0
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} color="var(--accent)" /> Структура даних
              </span>
              {!showFullData ? (
                <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleShowFullData}>
                  Показати всі дані
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  style={{ 
                    padding: '0.4rem 0.8rem', 
                    fontSize: '0.75rem', 
                    background: 'transparent', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-main)', 
                    boxShadow: 'none',
                    cursor: 'pointer'
                  }} 
                  onClick={() => setShowFullData(false)}
                >
                  Вийти з повного перегляду
                </button>
              )}
            </h2>
            
            {/* Table Scrollable Container */}
            <div className="table-responsive" style={{ 
              flex: 1, 
              overflow: 'auto', 
              maxHeight: '100%',
              borderRadius: '6px',
              border: '1px solid var(--border-color)'
            }}>
              {!showFullData ? (
                <table className="data-table" style={{ width: '100%', tableLayout: 'auto', margin: 0 }}>
                  <thead>
                    <tr>
                      {columns.map(col => (
                        <th key={col} style={{ whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--bg-sidebar)' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx}>
                        {columns.map(col => (
                          <td key={col} style={{ whiteSpace: 'nowrap' }}>
                            {String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="data-table" style={{ width: '100%', tableLayout: 'auto', margin: 0 }}>
                  <thead>
                    <tr>
                      {columns.map(col => (
                        <th key={col} style={{ whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--bg-sidebar)' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fullData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {columns.map(col => (
                          <td key={col} style={{ padding: 0, whiteSpace: 'nowrap' }}>
                            <input 
                              type="text" 
                              defaultValue={row[col]} 
                              onBlur={(e) => {
                                if (e.target.value !== String(row[col])) {
                                  handleCellEdit(rowIndex, col, e.target.value);
                                }
                              }}
                              style={{
                                width: '100%', border: 'none', background: 'transparent', padding: '0.5rem 0.75rem',
                                color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none'
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {showFullData && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginTop: '1rem',
                flexShrink: 0
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Всього рядків: {totalRows}</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} disabled={dataPage === 1} onClick={() => loadPage(dataPage - 1)}>
                    Попередня
                  </button>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Сторінка {dataPage}</span>
                  <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} disabled={dataPage * 50 >= totalRows} onClick={() => loadPage(dataPage + 1)}>
                    Наступна
                  </button>
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
