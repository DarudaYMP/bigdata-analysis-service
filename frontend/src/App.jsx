import React, { useEffect } from 'react';
import { Settings2, BarChart4, Moon, Sun, HelpCircle, Database, Zap, Upload, Filter, Sparkles, Home } from 'lucide-react';
import { useStore } from './store/useStore';
import Swal from 'sweetalert2';
import 'katex/dist/katex.min.css';

import Welcome from './components/Welcome';
import Ingestion from './components/Ingestion';
import Cleaning from './components/Cleaning';
import Visualization from './components/Visualization';
import Analysis from './components/Analysis';
import Knowledge from './components/Knowledge';

function App() {
  const { theme, setTheme, currentStep, setCurrentStep, fileId } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleResetData = () => {
    const store = useStore.getState();
    store.setFileId(null);
    store.setColumns([]);
    store.setPrimaryKey(null);
    store.setTargetColumn('');
    store.setSelectedFeatures([]);
    store.setPreviewData([]);
    store.setEdaInsights([]);
    store.setResults(null);
    store.setCurrentStep('ingestion');
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'welcome':
        return <Welcome />;
      case 'ingestion':
        return <Ingestion />;
      case 'cleaning':
        return <Cleaning />;
      case 'visualization':
        return <Visualization />;
      case 'analysis':
        return <Analysis />;
      case 'help':
        return <Knowledge />;
      default:
        return <Welcome />;
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
          {fileId && (
            <button 
              className="btn-primary" 
              style={{ 
                padding: '0.4rem 0.8rem', 
                fontSize: '0.75rem', 
                background: 'transparent', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-main)', 
                boxShadow: 'none', 
                textTransform: 'none',
                cursor: 'pointer'
              }}
              onClick={handleResetData}
            >
              Завантажити нові дані / Reset
            </button>
          )}
          <div className="status-badge"><Zap size={14} color="var(--accent)" /> Система: Готова</div>
          <button className="icon-btn" onClick={toggleTheme}>{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="workspace">
        {/* Sidebar Nav */}
        <aside className="sidebar">
          <div className="sidebar-heading">Робочий процес</div>

          <div className={`nav-item ${currentStep === 'welcome' ? 'active' : ''}`} onClick={() => setCurrentStep('welcome')}>
            <Home size={18} /> Головна сторінка
          </div>

          <div className={`nav-item ${currentStep === 'ingestion' ? 'active' : ''}`} onClick={() => setCurrentStep('ingestion')}>
            <Upload size={18} /> Завантаження даних
          </div>

          <div className={`nav-item ${currentStep === 'cleaning' ? 'active' : ''}`} onClick={() => {
            if (fileId) setCurrentStep('cleaning'); else Swal.fire('Помилка', 'Спочатку завантажте файл.', 'error');
          }}>
            <Filter size={18} /> Очищення даних
          </div>

          <div className={`nav-item ${currentStep === 'visualization' ? 'active' : ''}`} onClick={() => {
            if (fileId) setCurrentStep('visualization'); else Swal.fire('Помилка', 'Спочатку завантажте файл.', 'error');
          }}>
            <Sparkles size={18} /> Візуалізація
          </div>

          <div className={`nav-item ${currentStep === 'analysis' ? 'active' : ''}`} onClick={() => {
            if (fileId) setCurrentStep('analysis'); else Swal.fire('Помилка', 'Спочатку завантажте файл.', 'error');
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
