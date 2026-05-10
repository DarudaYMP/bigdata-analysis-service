import React, { useState } from 'react';
import { HelpCircle, Activity, Zap } from 'lucide-react';
import Plot from 'react-plotly.js';

/**
 * Knowledge Base Component
 * Educational section explaining clustering and classification algorithms.
 */
const Knowledge = () => {
  const [helpView, setHelpView] = useState('root');

  if (helpView === 'root') {
    return (
      <div className="panel" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', marginTop: 0 }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <HelpCircle size={28} color="var(--accent)" /> База Знань
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div className="feature-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => setHelpView('clustering')}>
            <Activity size={48} color="var(--accent)" style={{ margin: '0 auto' }}/>
            <h3 style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Кластеризація</h3>
            <p style={{ color: 'var(--text-muted)' }}>Grouping similar objects together without predefined labels. Used for data segmentation.</p>
          </div>
          <div className="feature-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => setHelpView('classification')}>
            <Zap size={48} color="var(--accent)" style={{ margin: '0 auto' }}/>
            <h3 style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Класифікація</h3>
            <p style={{ color: 'var(--text-muted)' }}>Assigning categories to new objects based on trained data. Used for prediction.</p>
          </div>
        </div>
      </div>
    );
  } else if (helpView === 'clustering') {
    return (
      <div className="panel" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', marginTop: 0 }}>
        <button className="btn-primary" style={{ marginBottom: '1rem', padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setHelpView('root')}>Назад</button>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Activity size={28} color="var(--accent)" /> Кластеризація</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Кластеризація — це метод машинного навчання без учителя, завданням якого є поділ набору даних на групи таким чином, щоб об'єкти в одній групі були максимально схожі між собою, а з різних груп — відрізнялися.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="feature-card" style={{ cursor: 'pointer' }} onClick={() => setHelpView('kmeans')}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>K-Means</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Шукає центроїди та групує дані на основі відстані до них.</p>
          </div>
          <div className="feature-card" style={{ cursor: 'pointer' }} onClick={() => setHelpView('dbscan')}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>DBSCAN</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Групує щільно розташовані точки та ігнорує розсіяний шум.</p>
          </div>
        </div>
      </div>
    );
  } else if (helpView === 'classification') {
    return (
      <div className="panel" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', marginTop: 0 }}>
        <button className="btn-primary" style={{ marginBottom: '1rem', padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setHelpView('root')}>Назад</button>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Zap size={28} color="var(--accent)" /> Класифікація</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Класифікація — це задача навчання з учителем, коли алгоритм вчиться визначати категорію нових спостережень на основі тренувальних даних з мітками.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="feature-card" style={{ cursor: 'pointer' }} onClick={() => setHelpView('rf')}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Випадковий ліс</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ансамбль дерев рішень для високої точності.</p>
          </div>
          <div className="feature-card" style={{ cursor: 'pointer' }} onClick={() => setHelpView('svm')}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>SVM</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Пошук оптимальної гіперплощини між класами.</p>
          </div>
          <div className="feature-card" style={{ cursor: 'pointer' }} onClick={() => setHelpView('lr')}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Логістична регресія</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Оцінка ймовірності належності до класу.</p>
          </div>
        </div>
      </div>
    );
  } else {
    // Method detail view
    const details = {
      'kmeans': { title: 'K-Means (k-середніх)', desc: 'Мінімізує сумарне квадратичне відхилення точок кластерів від їх центроїдів. Ефективний для сферичних кластерів.' },
      'dbscan': { title: 'DBSCAN', desc: 'Групує точки з високою щільністю, позначаючи ізольовані точки як шум (викиди).' },
      'rf': { title: 'Випадковий ліс (Random Forest)', desc: 'Використовує багато дерев рішень та усереднює їх результат, що зменшує ризик перенавчання.' },
      'svm': { title: 'Метод опорних векторів (SVM)', desc: 'Перетворює дані у багатовимірний простір для знаходження площини, яка найкраще розділяє класи.' },
      'lr': { title: 'Логістична регресія', desc: 'Лінійна модель, що використовує логістичну функцію для передбачення ймовірності бінарних або мультикласових результатів.' }
    };
    const item = details[helpView];
    
    // Generate a static preview chart using plotly
    const x = Array.from({length: 50}, () => Math.random() * 100);
    const y = Array.from({length: 50}, () => Math.random() * 100);
    const color = Array.from({length: 50}, (_, i) => i % 3);
    
    return (
      <div className="panel" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', marginTop: 0 }}>
        <button className="btn-primary" style={{ marginBottom: '1rem', padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setHelpView(helpView === 'kmeans' || helpView === 'dbscan' ? 'clustering' : 'classification')}>Назад</button>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>{item.title}</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{item.desc}</p>
        <div style={{ height: '300px', background: 'var(--bg-main)', borderRadius: '8px', padding: '1rem' }}>
          <Plot
            data={[{ x, y, mode: 'markers', marker: { color, colorscale: 'Viridis' }, type: 'scatter' }]}
            layout={{ autosize: true, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', margin: {t:0,b:0,l:0,r:0} }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    );
  }
};

export default Knowledge;
