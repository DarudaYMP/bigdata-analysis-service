import React from 'react';
import { ArrowRight, Database, Filter, BarChart4, Brain, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

/**
 * Welcome Component
 * A premium landing page introducing the system's capabilities.
 */
const Welcome = () => {
  const { setCurrentStep } = useStore();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      textAlign: 'center'
    }}>
      {/* Hero Header */}
      <div style={{ marginBottom: '3rem', position: 'relative' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '50px',
          padding: '0.5rem 1.25rem',
          color: 'var(--accent)',
          fontSize: '0.85rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '1.5rem',
          animation: 'pulse 2s infinite'
        }}>
          <Sparkles size={14} /> Інтелектуальний аналіз великих даних
        </div>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '3.75rem',
          fontWeight: '400',
          lineHeight: '1.15',
          marginBottom: '1.5rem',
          color: 'var(--text-main)'
        }}>
          Класифікація та кластеризація <br />
          <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>на базі машинного навчання</span>
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1.2rem',
          maxWidth: '750px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Потужна веб-платформа для завантаження, інтелектуальної передочистки та автоматизованої побудови 
          моделей класифікації та кластеризації. Отримайте глибинні інсайти за лічені секунди.
        </p>
      </div>

      {/* Grid of Capabilities */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        marginBottom: '4rem'
      }}>
        <div className="feature-card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'rgba(59, 130, 246, 0.1)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '1rem'
          }}>
            <Database size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Імпорт Даних</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>
            Завантажуйте формати CSV, JSON, XLSX, Parquet чи Avro та обирайте листи Excel.
          </p>
        </div>

        <div className="feature-card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'rgba(16, 185, 129, 0.1)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1rem'
          }}>
            <Filter size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Передочистка</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>
            Інтелектуальне заповнення пропусків медіаною/модою, очистка дублікатів та нормалізація тексту.
          </p>
        </div>

        <div className="feature-card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'rgba(245, 158, 11, 0.1)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '1rem'
          }}>
            <BarChart4 size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Візуалізація</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>
            Побудова динамічних стовпчикових, лінійних та точкових діаграм на базі Recharts.
          </p>
        </div>

        <div className="feature-card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'rgba(139, 92, 246, 0.1)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', marginBottom: '1rem'
          }}>
            <Brain size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Моделі ML</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>
            Запуск алгоритмів K-Means, DBSCAN, Random Forest та SVM в один клік з оцінкою метрик.
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <button 
        className="btn-primary" 
        onClick={() => setCurrentStep('ingestion')}
        style={{
          padding: '1.25rem 2.5rem',
          fontSize: '1rem',
          borderRadius: '50px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer'
        }}
      >
        Розпочати роботу <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default Welcome;
