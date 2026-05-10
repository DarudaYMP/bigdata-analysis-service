import React, { useEffect } from 'react';
import { Settings2, BarChart4, Moon, Sun, HelpCircle } from 'lucide-react';
import { useStore } from './store/useStore';
import 'katex/dist/katex.min.css';

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

  const renderContent = () => {
    switch (currentStep) {
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
        return <Ingestion />;
    }
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="nav-brand">Даруда | Аналітика</div>
        <div className="nav-links">
          <button className={`nav-btn ${currentStep === 'ingestion' ? 'active' : ''}`} onClick={() => setCurrentStep('ingestion')}><Settings2 size={18}/> Завантаження</button>
          <button className={`nav-btn ${currentStep === 'cleaning' ? 'active' : ''}`} disabled={!fileId} onClick={() => setCurrentStep('cleaning')}><Settings2 size={18}/> Очищення</button>
          <button className={`nav-btn ${currentStep === 'visualization' ? 'active' : ''}`} disabled={!fileId} onClick={() => setCurrentStep('visualization')}><BarChart4 size={18}/> Візуалізація</button>
          <button className={`nav-btn ${currentStep === 'analysis' ? 'active' : ''}`} disabled={!fileId} onClick={() => setCurrentStep('analysis')}><BarChart4 size={18}/> Аналіз & ШІ</button>
          <button className={`nav-btn ${currentStep === 'help' ? 'active' : ''}`} onClick={() => setCurrentStep('help')}><HelpCircle size={18}/> База знань</button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </nav>

      <main style={{ marginTop: '2rem' }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
