import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Sparkles, Brain, Cpu } from 'lucide-react';
import { useStore } from '../store/useStore';
import PropTypes from 'prop-types';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
const COLORS = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'];

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

CentroidShape.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  fill: PropTypes.string,
  payload: PropTypes.object
};

/**
 * Analysis Component
 * Handles the configuration and execution of Machine Learning pipelines.
 */
const Analysis = () => {
  const { 
    fileId, columns, targetColumn, setTargetColumn, 
    selectedFeatures, toggleFeature, results, setResults, setLoading 
  } = useStore();

  const [analysisType, setAnalysisType] = useState('classification');
  const [algorithm, setAlgorithm] = useState('rf');
  const [clusters, setClusters] = useState(3);

  const runAnalysis = async () => {
    if (selectedFeatures.length === 0) {
      Swal.fire('Помилка', 'Оберіть хоча б одну ознаку.', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        file_path: fileId,
        analysis_type: analysisType,
        algorithm: algorithm,
        features: selectedFeatures,
        target: analysisType === 'classification' ? targetColumn : undefined,
        k: analysisType === 'clustering' ? parseInt(clusters) : undefined
      };
      
      const res = await axios.post(`${API_URL}/analyze`, payload);
      setResults(res.data);
    } catch (err) {
      Swal.fire('Помилка', err.response?.data?.error || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!results || !results.chartData) return null;
    
    if (results.chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
              {results.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    } else if (results.chartType === 'scatter') {
      // Group points by cluster
      const clustersMap = {};
      results.chartData.forEach(p => {
        if (!clustersMap[p.cluster]) clustersMap[p.cluster] = [];
        clustersMap[p.cluster].push(p);
      });
      
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} stroke="var(--border-color)" />
            <XAxis type="number" dataKey="x" stroke="var(--border-color)" name={results.axisLabels.x} />
            <YAxis type="number" dataKey="y" stroke="var(--border-color)" name={results.axisLabels.y} />
            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
            <Legend />
            {Object.keys(clustersMap).map((clusterId, index) => (
              <Scatter key={clusterId} name={clusterId} data={clustersMap[clusterId]} fill={COLORS[index % COLORS.length]} shape={<CentroidShape />} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', width: '100%', maxWidth: '1400px', alignItems: 'start' }}>
      <div className="panel" style={{ marginTop: 0 }}>
        <h3><Brain size={20} /> Аналіз даних та ШІ</h3>
        
        <div style={{ marginTop: '1.5rem' }}>
          <label className="form-label">Тип задачі</label>
          <select className="form-control" value={analysisType} onChange={e => { setAnalysisType(e.target.value); setResults(null); }}>
            <option value="classification">Класифікація</option>
            <option value="clustering">Кластеризація (Сегментація)</option>
          </select>
        </div>

        {analysisType === 'classification' && (
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">Цільова змінна (Y)</label>
            <select className="form-control" value={targetColumn} onChange={e => setTargetColumn(e.target.value)}>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
            <label className="form-label" style={{ marginTop: '1rem' }}>Алгоритм</label>
            <select className="form-control" value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
              <option value="rf">Random Forest (Випадковий ліс)</option>
              <option value="svm">Support Vector Machine (SVM)</option>
              <option value="lr">Logistic Regression (Лог. регресія)</option>
            </select>
          </div>
        )}

        {analysisType === 'clustering' && (
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">Кількість кластерів (K)</label>
            <input type="number" className="form-control" value={clusters} min="2" max="10" onChange={e => setClusters(e.target.value)} />
            <label className="form-label" style={{ marginTop: '1rem' }}>Алгоритм</label>
            <select className="form-control" value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
              <option value="kmeans">Standard K-Means</option>
              <option value="bisecting_kmeans">Bisecting K-Means</option>
              <option value="dbscan">DBSCAN (Density-based)</option>
            </select>
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <label className="form-label">Ознаки (X)</label>
          <div className="checkbox-grid" style={{ maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
            {columns.filter(col => col !== targetColumn).map(col => (
              <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={selectedFeatures.includes(col)} onChange={() => toggleFeature(col)} />
                {col}
              </label>
            ))}
          </div>
        </div>

        <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={runAnalysis}>
          <Cpu size={18} /> Запустити
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {results && (
          <div className="panel" style={{ marginTop: 0 }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Результати {analysisType === 'classification' ? 'класифікації' : 'кластеризації'}</h2>
            
            <div className="metric-grid">
              {Object.entries(results.metrics).map(([key, val]) => (
                <div key={key} className="metric-box"><h4>{key}</h4><div className="value">{val}</div></div>
              ))}
            </div>

            <p style={{ marginTop: '1.5rem', lineHeight: '1.6', fontSize: '1.05rem', color: 'var(--text-main)' }}>{results.summary}</p>
            
            <div style={{ height: '400px', marginTop: '2rem', background: 'var(--bg-main)', borderRadius: '12px', padding: '1rem' }}>
              {renderChart()}
            </div>

            <div className="text-content-box" style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={18} color="var(--accent)" /> Бізнес-рекомендації ШІ</h3>
              <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }}>{results.recommendations.map((r, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{r}</li>)}</ul>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => window.open(`${API_URL}/download?file_path=${encodeURIComponent(fileId)}`)}>
                Завантажити оброблені дані
              </button>
              <button className="btn-primary" onClick={() => window.print()}>
                Завантажити звіт (PDF)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
