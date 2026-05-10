import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);
import { BarChart4 } from 'lucide-react';
import { useStore } from '../store/useStore';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

/**
 * Visualization Component
 * Handles dynamic exploratory data visualization using Plotly.
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
      
      // Transform backend points [{x, y}] to Plotly format {x: [], y: []}
      const rawData = res.data.chartData || [];
      const plotData = {
        x: rawData.map(d => d.x),
        y: rawData.map(d => d.y),
        type: visChartType === 'scatter' ? 'scatter' : (visChartType === 'line' ? 'scatter' : 'bar'),
        mode: visChartType === 'scatter' ? 'markers' : (visChartType === 'line' ? 'lines+markers' : undefined),
        marker: { color: 'var(--accent)' }
      };
      
      setVisData([plotData]);
    } catch (err) {
      Swal.fire('Помилка', err.response?.data?.error || err.message, 'error');
    } finally {
      setLoading(false);
    }
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
        {visData && visData.length > 0 ? (
          <Plot
            data={visData}
            layout={{ 
              autosize: true, 
              paper_bgcolor: 'rgba(0,0,0,0)', 
              plot_bgcolor: 'rgba(0,0,0,0)', 
              font: { color: 'var(--text-main)' },
              xaxis: { title: visXCol },
              yaxis: { title: visYCol || 'Кількість' }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>Оберіть параметри та натисніть "Побудувати графік"</div>
        )}
      </div>
    </div>
  );
};

export default Visualization;
