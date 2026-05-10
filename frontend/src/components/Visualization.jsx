import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BarChart4 } from 'lucide-react';
import { useStore } from '../store/useStore';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

/**
 * Visualization Component
 * Handles dynamic exploratory data visualization using Recharts.
 */
const Visualization = () => {
  const { 
    fileId, columns, 
    visXCol, setVisXCol, 
    visYCol, setVisYCol, 
    visChartType, setVisChartType, 
    visData, setVisData,
    loading, setLoading 
  } = useStore();

  const handlePlot = async () => {
    setLoading(true);
    try {
      const payload = { file_path: fileId, x_col: visXCol, y_col: visYCol, chart_type: visChartType };
      const res = await axios.post(`${API_URL}/plot`, payload);
      setVisData(res.data.chartData || []);
    } catch (err) {
      Swal.fire('Помилка', err.response?.data?.error || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!visData || visData.length === 0) return <div style={{ color: 'var(--text-muted)' }}>Оберіть параметри та натисніть "Побудувати графік"</div>;

    if (visChartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={visData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
            <XAxis dataKey="x" stroke="var(--text-muted)" tick={{ fill: 'var(--text-main)' }} angle={-45} textAnchor="end" />
            <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-main)' }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
            <Bar dataKey="y" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (visChartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
            <XAxis dataKey="x" stroke="var(--text-muted)" tick={{ fill: 'var(--text-main)' }} angle={-45} textAnchor="end" />
            <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-main)' }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
            <Line type="monotone" dataKey="y" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (visChartType === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis type="number" dataKey="x" name={visXCol} stroke="var(--text-muted)" tick={{ fill: 'var(--text-main)' }} />
            <YAxis type="number" dataKey="y" name={visYCol} stroke="var(--text-muted)" tick={{ fill: 'var(--text-main)' }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
            <Scatter name="Data" data={visData} fill="var(--accent)" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', width: '100%', maxWidth: '1400px', alignItems: 'start' }}>
      <div className="panel" style={{ marginTop: 0 }}>
        <h3><BarChart4 size={20} /> Візуалізація</h3>
        
        <div style={{ marginTop: '1.5rem' }}>
          <label className="form-label">Тип графіка</label>
          <select className="form-control" value={visChartType} onChange={e => setVisChartType(e.target.value)}>
            <option value="bar">Стовпчикова (Bar)</option>
            <option value="line">Лінійна (Line)</option>
            <option value="scatter">Точкова (Scatter)</option>
          </select>

          <label className="form-label" style={{ marginTop: '1rem' }}>X-Вісь (Обов'язково)</label>
          <select className="form-control" value={visXCol} onChange={e => setVisXCol(e.target.value)}>
            {columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>

          <label className="form-label" style={{ marginTop: '1rem' }}>Y-Вісь (Опціонально)</label>
          <select className="form-control" value={visYCol} onChange={e => setVisYCol(e.target.value)}>
            <option value="">-- Автоматично (Підрахунок) --</option>
            {columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>

        <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={handlePlot} disabled={loading}>
          Побудувати графік
        </button>
      </div>

      <div className="panel" style={{ marginTop: 0, height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default Visualization;
