import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, Cpu, Database, Settings2, BarChart4, Moon, Sun, ChevronRight, Activity, Zap, ShieldAlert, Sparkles, Filter, Trash2, Edit3, BarChart, LineChart as LineChartIcon, ScatterChart as ScatterIcon, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Legend, BarChart as RechartsBarChart, Bar, LineChart, Line } from 'recharts';
import Swal from 'sweetalert2';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const CentroidShape = (props) => {
  const { cx, cy, fill, payload } = props;
  if (payload.isCentroid) {
    return (
      <g transform={`translate(${cx},${cy})`}>
        <path d="M-8,-8 L8,8 M8,-8 L-8,8" stroke={fill} strokeWidth={4} />
        <path d="M-8,-8 L8,8 M8,-8 L-8,8" stroke="#000" strokeWidth={1} opacity={0.5} />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={4} fill={fill} />;
};

// Use environment variable for API URL, default to empty for relative paths in prod
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
const COLORS = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'];

function App() {
  const [theme, setTheme] = useState('light');

  const [currentStep, setCurrentStep] = useState('ingestion'); // ingestion, cleaning, visualization, analysis

  const [fileId, setFileId] = useState(null);
  const [columns, setColumns] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [edaInsights, setEdaInsights] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [plotting, setPlotting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [analysisType, setAnalysisType] = useState('classification');
  const [algorithm, setAlgorithm] = useState('rf');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [targetColumn, setTargetColumn] = useState('');
  const [kValue, setKValue] = useState(3);

  const [results, setResults] = useState(null);

  // Custom Visualization States
  const [visXCol, setVisXCol] = useState('');
  const [visYCol, setVisYCol] = useState('');
  const [visChartType, setVisChartType] = useState('bar');
  const [visData, setVisData] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const showError = (msg) => Swal.fire({ icon: 'error', title: 'Увага', text: msg, background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#f8fafc' : '#1f2937' });
  const showSuccess = (msg) => Swal.fire({ icon: 'success', title: 'Успіх', text: msg, timer: 1500, showConfirmButton: false, background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#f8fafc' : '#1f2937' });

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData);
      setFileId(response.data.file_path);
      setColumns(response.data.columns);
      setTargetColumn(response.data.columns[0]);

      setVisXCol(response.data.columns[0]);

      setPreviewData(response.data.preview || []);
      setEdaInsights(response.data.insights || []);

      if (response.data.columns.length > 1) {
        setSelectedFeatures(response.data.columns.slice(1));
      }

      setCurrentStep('cleaning');
    } catch (err) {
      showError('Помилка завантаження файлу: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleCleaning = async (actionStr) => {
    setCleaning(true);
    try {
      const payload = { file_path: fileId, action: actionStr };
      const res = await axios.post(`${API_URL}/clean`, payload);
      setPreviewData(res.data.preview || []);
      setEdaInsights(res.data.insights || []);
      setColumns(res.data.columns || columns);
      showSuccess('Очищення успішно виконано!');
    } catch (err) {
      showError('Помилка очищення: ' + (err.response?.data?.error || err.message));
    } finally {
      setCleaning(false);
    }
  };

  const handlePlot = async () => {
    setPlotting(true);
    try {
      const payload = { file_path: fileId, x_col: visXCol, y_col: visYCol, chart_type: visChartType };
      const res = await axios.post(`${API_URL}/plot`, payload);
      setVisData(res.data.chartData || []);
    } catch (err) {
      showError('Помилка генерації графіка: ' + (err.response?.data?.error || err.message));
    } finally {
      setPlotting(false);
    }
  };

  const runAnalysis = async () => {
    if (selectedFeatures.length === 0) {
      showError("Оберіть хоча б одну ознаку.");
      return;
    }
    setAnalyzing(true);
    setResults(null);
    try {
      const payload = { file_path: fileId, analysis_type: analysisType, algorithm: algorithm, features: selectedFeatures, target: targetColumn, k: kValue };
      const res = await axios.post(`${API_URL}/analyze`, payload);
      setResults(res.data);
      showSuccess('Аналіз успішно завершено!');
    } catch (err) {
      showError('Помилка аналізу: ' + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleFeature = (col) => {
    if (selectedFeatures.includes(col)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== col));
    } else {
      setSelectedFeatures([...selectedFeatures, col]);
    }
  };

  const renderDataPreview = () => {
    if (previewData.length === 0) return null;
    return (
      <div className="panel" style={{ marginTop: 0, overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}><Database size={20} /> Попередній перегляд даних (перші 10 рядків)</h2>
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
      </div>
    );
  };

  const renderChart = () => {
    if (!results || !results.chartData) return null;
    if (results.chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value" stroke="var(--bg-card)" strokeWidth={2}>
              {results.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
            <Legend wrapperStyle={{ color: 'var(--text-main)' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    if (results.chartType === 'scatter') {
      const dataByCluster = {};
      results.chartData.forEach(p => {
        if (!dataByCluster[p.cluster]) dataByCluster[p.cluster] = [];
        dataByCluster[p.cluster].push({ x: p.x, y: p.y });
      });
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} stroke="var(--border-color)" />
            <XAxis type="number" dataKey="x" name={results.axisLabels.x} stroke="var(--border-color)" tick={{ fill: 'var(--text-muted)' }} />
            <YAxis type="number" dataKey="y" name={results.axisLabels.y} stroke="var(--border-color)" tick={{ fill: 'var(--text-muted)' }} />
            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
            <Legend wrapperStyle={{ color: 'var(--text-main)' }} />
            {Object.keys(dataByCluster).map((clusterId, index) => (
              <Scatter key={clusterId} name={clusterId} data={dataByCluster[clusterId]} fill={COLORS[index % COLORS.length]} shape={<CentroidShape />} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
  };

  const renderVisChart = () => {
    if (visData.length === 0) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Дані графіка відсутні. Згенеруйте новий графік.</div>;

    if (visChartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <RechartsBarChart data={visData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="x" stroke="var(--border-color)" tick={{ fill: 'var(--text-muted)' }} />
            <YAxis stroke="var(--border-color)" tick={{ fill: 'var(--text-muted)' }} />
            <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
            <Legend />
            <Bar dataKey="y" name={visYCol || 'Count'} fill={COLORS[1]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      );
    } else if (visChartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={visData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="x" stroke="var(--border-color)" tick={{ fill: 'var(--text-muted)' }} />
            <YAxis stroke="var(--border-color)" tick={{ fill: 'var(--text-muted)' }} />
            <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
            <Legend />
            <Line type="monotone" dataKey="y" name={visYCol || 'Count'} stroke={COLORS[1]} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (visChartType === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} stroke="var(--border-color)" />
            <XAxis type="number" dataKey="x" name={visXCol} stroke="var(--border-color)" tick={{ fill: 'var(--text-muted)' }} />
            <YAxis type="number" dataKey="y" name={visYCol} stroke="var(--border-color)" tick={{ fill: 'var(--text-muted)' }} />
            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
            <Scatter name="Data Points" data={visData} fill={COLORS[1]} />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'ingestion':
        return (
          <>
            <div className="hero-section" style={{ maxWidth: '800px' }}>
              <div className="hero-icon"><Upload size={32} /></div>
              <h2>Зручний аналіз даних <br />починається тут.</h2>
              <p>Алгоритми кластеризації, зокрема K-Means та DBSCAN, дозволяють знаходити приховані закономірності та сегментувати інформацію, а моделі класифікації, такі як метод опорних векторів (SVM) та випадковий ліс (Random Forest), – швидко розподіляти нові вхідні дані за визначеними категоріями.</p>
              <button className="btn-primary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                {uploading ? 'ЗАВАНТАЖЕННЯ...' : 'ЗАВАНТАЖИТИ ДАНІ (CSV/JSON/XLSX/PARQUET/AVRO)'} <ChevronRight size={18} />
              </button>
              <input type="file" accept=".csv,.json,.xlsx,.parquet,.avro" className="hidden-file-input" ref={fileInputRef} onChange={handleFileUpload} />
            </div>
          </>
        );

      case 'cleaning':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '1000px' }}>
            <div className="panel" style={{ marginTop: 0 }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}><Filter size={20} /> Очищення даних (Data Wrangling)</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Нормалізуйте сирі дані перед візуалізацією або моделюванням.</p>

              <div className="feature-cards">
                <div className="feature-card" style={{ cursor: 'pointer' }} onClick={() => handleCleaning('drop_duplicates')}>
                  <Trash2 size={24} color="var(--accent)" />
                  <h3>Видалити дублікати</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Знайти та видалити ідентичні рядки (OpenRefine).</p>
                </div>
                <div className="feature-card" style={{ cursor: 'pointer' }} onClick={() => handleCleaning('drop_nulls')}>
                  <Activity size={24} color="var(--accent)" />
                  <h3>Видалити порожні</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Форсовано видалити рядки з NaN для строгої чистоти.</p>
                </div>
                <div className="feature-card" style={{ cursor: 'pointer' }} onClick={() => handleCleaning('lower_text')}>
                  <Edit3 size={24} color="var(--accent)" />
                  <h3>Нормалізація тексту</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Перетворити весь текст у нижній регістр для стандартизації.</p>
                </div>
              </div>

              {cleaning && <p style={{ marginTop: '1rem', color: 'var(--accent)' }}>Обробка даних...</p>}
            </div>
            {renderDataPreview()}

            <div style={{ textAlign: 'right' }}>
              <button className="btn-primary" onClick={() => setCurrentStep('visualization')}>ПЕРЕЙТИ ДО ВІЗУАЛІЗАЦІЇ <ChevronRight size={18} /></button>
            </div>
          </div>
        );

      case 'visualization':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '1000px' }}>
            <div className="panel" style={{ marginTop: 0 }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}><Sparkles size={20} /> Візуальний редактор (Graph Builder)</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Побудуйте інтерактивні графіки для аналізу вручну.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Ось X</label>
                  <select className="form-control" value={visXCol} onChange={(e) => setVisXCol(e.target.value)}>
                    <option value="">-- Оберіть --</option>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Ось Y (опціонально)</label>
                  <select className="form-control" value={visYCol} onChange={(e) => setVisYCol(e.target.value)}>
                    <option value="">-- Частота (Count) --</option>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Тип графіка</label>
                  <select className="form-control" value={visChartType} onChange={(e) => setVisChartType(e.target.value)}>
                    <option value="bar">Стовпчикова діаграма (Bar)</option>
                    <option value="line">Лінійний графік (Line)</option>
                    <option value="scatter">Діаграма розсіювання (Scatter)</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary" onClick={handlePlot} disabled={plotting || !visXCol}>
                {plotting ? 'ГЕНЕРАЦІЯ...' : 'ПОБУДУВАТИ ГРАФІК'} <Activity size={18} />
              </button>
            </div>

            <div className="panel" style={{ marginTop: 0, padding: '1rem' }}>
              {renderVisChart()}
            </div>

            <div style={{ textAlign: 'right' }}>
              <button className="btn-primary" onClick={() => setCurrentStep('analysis')}>ПЕРЕЙТИ ДО АНАЛІЗУ <ChevronRight size={18} /></button>
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', width: '100%', maxWidth: '1400px', alignItems: 'start' }}>
            {/* Sidebar for parameters */}
            <div className="panel" style={{ marginTop: 0, position: 'sticky', top: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings2 size={18} /> Налаштування моделі</h2>

              <div className="form-group">
                <label>Тип аналізу</label>
                <select className="form-control" value={analysisType} onChange={(e) => {
                  setAnalysisType(e.target.value);
                  setAlgorithm(e.target.value === 'classification' ? 'rf' : 'kmeans');
                  setResults(null);
                }}>
                  <option value="classification">Класифікація</option>
                  <option value="clustering">Кластеризація</option>
                </select>
              </div>

              <div className="form-group">
                <label>Вибір алгоритму</label>
                <select className="form-control" value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); setResults(null); }}>
                  {analysisType === 'classification' ? (
                    <>
                      <option value="rf">Випадковий ліс (Random Forest)</option>
                      <option value="lr">Логістична регресія (Logistic Regression)</option>
                      <option value="svm">Метод опорних векторів (SVM)</option>
                    </>
                  ) : (
                    <>
                      <option value="kmeans">Стандартний K-Means</option>
                      <option value="bisecting_kmeans">Бісекційний K-Means</option>
                      <option value="dbscan">DBSCAN</option>
                    </>
                  )}
                </select>
              </div>

              {analysisType === 'classification' && (
                <div className="form-group">
                  <label>Цільовий клас (Тег)</label>
                  <select className="form-control" value={targetColumn} onChange={(e) => { setTargetColumn(e.target.value); setResults(null); }}>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              )}

              {analysisType === 'clustering' && algorithm !== 'dbscan' && (
                <div className="form-group">
                  <label>Кількість кластерів (K)</label>
                  <input type="number" className="form-control" value={kValue} min={2} max={20} onChange={(e) => { setKValue(e.target.value); setResults(null); }} />
                </div>
              )}

              <div className="form-group">
                <label>Матриця ознак</label>
                <div className="checkbox-grid" style={{ gridTemplateColumns: '1fr', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '6px' }}>
                  {columns.filter(c => analysisType === 'clustering' || c !== targetColumn).map(col => (
                    <label key={col} className="checkbox-item" style={{ marginBottom: '0.5rem' }}>
                      <input type="checkbox" checked={selectedFeatures.includes(col)} onChange={() => { toggleFeature(col); setResults(null); }} />
                      {col}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={runAnalysis} disabled={analyzing}>
                  {analyzing ? 'АНАЛІЗ...' : 'ЗАПУСТИТИ ШІ'} <Cpu size={18} />
                </button>
              </div>
            </div>

            {/* Main area for diagnostics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {!results ? (
                <div className="panel" style={{ marginTop: 0 }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={20} /> Попередня аналітика</h2>
                  <ul className="recommendations" style={{ color: 'var(--text-muted)' }}>
                    {edaInsights.map((insight, i) => <li key={i}>{insight}</li>)}
                  </ul>
                  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <BarChart4 size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>Оберіть параметри зліва та запустіть аналіз, щоб побачити результати та діагностику.</p>
                  </div>
                </div>
              ) : (
                <div className="panel" style={{ marginTop: 0 }}>
                  <div className="results-header" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart4 size={20} /> Результати {analysisType === 'classification' ? 'класифікації' : 'кластеризації'}</h2>
                    <button className="btn-primary" onClick={() => {
                      setFileId(null); setResults(null); setPreviewData([]); setCurrentStep('ingestion');
                    }}>НОВИЙ ФАЙЛ</button>
                  </div>
                  <div className="metric-grid">
                    {Object.entries(results.metrics).map(([key, val]) => (
                      <div key={key} className="metric-box"><h4>{key}</h4><div className="value">{val}</div></div>
                    ))}
                  </div>
                  <div className="chart-wrapper" style={{ height: '400px', margin: '2rem 0' }}>{renderChart()}</div>
                  <div className="text-content-box" style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18} color="var(--accent)" /> Структурне резюме</h3>
                    <p>{results.summary}</p>
                  </div>
                  <div className="text-content-box" style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={18} color="var(--accent)" /> Бізнес-рекомендації ШІ</h3>
                    <ul style={{ paddingLeft: '1.5rem' }}>{results.recommendations.map((r, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{r}</li>)}</ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="panel" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', marginTop: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><HelpCircle size={28} color="var(--accent)" /> База Знань (Knowledge Base)</h2>
            
            <h3 style={{ fontSize: '1.25rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>Що таке Кластеризація?</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Кластеризація (Clustering) — це метод машинного навчання <b>без учителя</b>, завданням якого є поділ набору даних на групи (кластери) таким чином, щоб об'єкти в одній групі були максимально схожі між собою, а об'єкти з різних груп — відрізнялися.
            </p>
            
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>K-Means (k-середніх)</h4>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Алгоритм K-Means намагається мінімізувати сумарне квадратичне відхилення точок кластерів від центрів цих кластерів (центроїдів). Математично це виглядає як мінімізація інерції:
            </p>
            <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', overflowX: 'auto' }}>
              <BlockMath math="J = \sum_{i=1}^{k} \sum_{x \in C_i} ||x - \mu_i||^2" />
            </div>
            <p style={{ margin: '1rem 0 2rem 0', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              де <InlineMath math="k" /> — кількість кластерів, <InlineMath math="C_i" /> — множина точок <InlineMath math="i" />-го кластеру, а <InlineMath math="\mu_i" /> — центроїд цього кластеру. Центроїди на графіках позначаються великими хрестиками.
            </p>

            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>DBSCAN</h4>
            <p style={{ marginBottom: '2.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              DBSCAN (Density-Based Spatial Clustering of Applications with Noise) групує точки, які знаходяться щільно одна біля одної, і позначає точки в регіонах з низькою щільністю як шум (викиди).
            </p>

            <h3 style={{ fontSize: '1.25rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>Що таке Класифікація?</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Класифікація — це задача навчання <b>з учителем</b>, коли алгоритм вчиться визначати категорію (клас) нових спостережень на основі тренувальних даних, які вже містять правильні відповіді (розмічені теги).
            </p>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Випадковий ліс (Random Forest)</h4>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Цей метод будує ансамбль з багатьох дерев рішень. Клас визначається шляхом "голосування" більшості дерев. Це дозволяє уникнути перенавчання (overfitting) та підвищує загальну точність.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="layout">
      {/* Top Navbar */}
      <nav className="top-nav">
        <div className="brand">
          <Database size={24} color="var(--accent)" strokeWidth={2.5} />
          <h1>DATACLUSTER <span style={{ color: 'var(--accent)', fontWeight: '900' }}>PRO</span> <br /><span style={{ display: 'block', marginTop: '4px' }}>Statistical ML Engine v2.0</span></h1>
        </div>
        <div className="top-actions">
          <div className="status-badge"><Zap size={14} color="var(--accent)" /> Система: Готова</div>
          <button className="icon-btn" onClick={toggleTheme}>{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="workspace">
        {/* Sidebar Nav */}
        <aside className="sidebar">
          <div className="sidebar-heading">Робочий процес</div>

          <div className={`nav-item ${currentStep === 'ingestion' ? 'active' : ''}`} onClick={() => setCurrentStep('ingestion')}>
            <Upload size={18} /> Завантаження даних
          </div>

          <div className={`nav-item ${currentStep === 'cleaning' ? 'active' : ''}`} onClick={() => {
            if (fileId) setCurrentStep('cleaning'); else showError('Спочатку завантажте файл.');
          }}>
            <Filter size={18} /> Очищення даних
          </div>

          <div className={`nav-item ${currentStep === 'visualization' ? 'active' : ''}`} onClick={() => {
            if (fileId) setCurrentStep('visualization'); else showError('Спочатку завантажте файл.');
          }}>
            <Sparkles size={18} /> Візуалізація
          </div>

          <div className={`nav-item ${currentStep === 'analysis' ? 'active' : ''}`} onClick={() => {
            if (fileId) setCurrentStep('analysis'); else showError('Спочатку завантажте файл.');
          }}>
            <BarChart4 size={18} /> Аналіз та Діагностика
          </div>

          <div className={`nav-item ${currentStep === 'help' ? 'active' : ''}`} onClick={() => setCurrentStep('help')}>
            <HelpCircle size={18} /> Довідка
          </div>

          <div style={{ flex: 1 }}></div>
        </aside>

        {/* Content Viewport */}
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
