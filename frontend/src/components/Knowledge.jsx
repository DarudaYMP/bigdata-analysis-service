import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HelpCircle, Activity, Zap, Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';

// Reusable animated algorithm visualizer component
const AlgorithmVisualizer = ({ algorithm }) => {
  const [points, setPoints] = useState([]);
  const [centroids, setCentroids] = useState([]);
  const [stepInfo, setStepInfo] = useState('');
  const [iteration, setIteration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms
  const [stepMode, setStepMode] = useState('assign'); // for kmeans
  
  // DBSCAN specific state
  const [dbscanScanIndex, setDbscanScanIndex] = useState(-1);
  
  // Classification specific state (SVM, LR, RF)
  const [weights, setWeights] = useState({ w1: 0, w2: 0, b: 0 });
  const [forestTrees, setForestTrees] = useState([]);
  const [supportVectors, setSupportVectors] = useState([]);

  const timerRef = useRef(null);

  const initData = useCallback(() => {
    setIsPlaying(false);
    setIteration(0);
    
    if (algorithm === 'kmeans') {
      const newPoints = [];
      const centers = [
        { x: 120, y: 100 },
        { x: 380, y: 120 },
        { x: 250, y: 220 }
      ];
      centers.forEach((center, cIdx) => {
        for (let i = 0; i < 20; i++) {
          const r = Math.random() * 40;
          const theta = Math.random() * 2 * Math.PI;
          newPoints.push({
            id: `pt-${cIdx}-${i}`,
            x: Math.round(center.x + r * Math.cos(theta)),
            y: Math.round(center.y + r * Math.sin(theta)),
            cluster: -1,
            color: '#94a3b8'
          });
        }
      });
      
      const initialCentroids = [
        { id: 'c-0', x: 100 + Math.random() * 80, y: 80 + Math.random() * 60, color: '#ef4444' },
        { id: 'c-1', x: 320 + Math.random() * 80, y: 80 + Math.random() * 60, color: '#3b82f6' },
        { id: 'c-2', x: 200 + Math.random() * 100, y: 200 + Math.random() * 60, color: '#10b981' }
      ];
      
      setPoints(newPoints);
      setCentroids(initialCentroids);
      setStepMode('assign');
      setStepInfo('Початкові точки та центроїди згенеровано.');
    } else if (algorithm === 'dbscan') {
      const newPoints = [];
      const centers = [
        { x: 150, y: 130 },
        { x: 350, y: 170 }
      ];
      centers.forEach((center, cIdx) => {
        for (let i = 0; i < 20; i++) {
          const r = Math.random() * 45;
          const theta = Math.random() * 2 * Math.PI;
          newPoints.push({
            id: `pt-${cIdx}-${i}`,
            x: Math.round(center.x + r * Math.cos(theta)),
            y: Math.round(center.y + r * Math.sin(theta)),
            cluster: -1,
            type: 'unvisited',
            color: '#94a3b8'
          });
        }
      });
      for (let i = 0; i < 6; i++) {
        newPoints.push({
          id: `pt-noise-${i}`,
          x: Math.round(50 + Math.random() * 400),
          y: Math.round(30 + Math.random() * 240),
          cluster: -1,
          type: 'unvisited',
          color: '#94a3b8'
        });
      }
      setPoints(newPoints);
      setDbscanScanIndex(0);
      setStepInfo('Пошук щільних областей з радіусом ε = 40 та MinPts = 4.');
    } else if (algorithm === 'svm') {
      const newPoints = [];
      for (let i = 0; i < 15; i++) {
        newPoints.push({
          id: `svm-c0-${i}`,
          x: Math.round(70 + Math.random() * 120),
          y: Math.round(50 + Math.random() * 70),
          label: 1,
          color: '#ef4444'
        });
      }
      for (let i = 0; i < 15; i++) {
        newPoints.push({
          id: `svm-c1-${i}`,
          x: Math.round(290 + Math.random() * 120),
          y: Math.round(160 + Math.random() * 80),
          label: -1,
          color: '#3b82f6'
        });
      }
      setPoints(newPoints);
      setWeights({ w1: 0.15, w2: 0.75, b: -130 });
      setSupportVectors([]);
      setStepInfo('Пошук гіперплощини з максимальним зазором розділення.');
    } else if (algorithm === 'lr') {
      const newPoints = [];
      for (let i = 0; i < 15; i++) {
        newPoints.push({
          id: `lr-c0-${i}`,
          x: Math.round(90 + Math.random() * 150),
          y: Math.round(60 + Math.random() * 80),
          label: 1,
          color: '#ef4444'
        });
      }
      for (let i = 0; i < 15; i++) {
        newPoints.push({
          id: `lr-c1-${i}`,
          x: Math.round(230 + Math.random() * 150),
          y: Math.round(140 + Math.random() * 90),
          label: 0,
          color: '#3b82f6'
        });
      }
      setPoints(newPoints);
      setWeights({ w1: 0.08, w2: 0.45, b: -70 });
      setStepInfo('Градієнтний спуск оптимізує ймовірнісні оцінки розділення.');
    } else if (algorithm === 'rf') {
      const newPoints = [];
      for (let i = 0; i < 40; i++) {
        const x = Math.round(60 + Math.random() * 380);
        const y = Math.round(40 + Math.random() * 220);
        let label = 0;
        if ((x < 250 && y < 140) || (x >= 250 && y >= 140)) {
          label = 1;
        }
        newPoints.push({
          id: `rf-${i}`,
          x,
          y,
          label,
          color: label === 1 ? '#ef4444' : '#3b82f6'
        });
      }
      setPoints(newPoints);
      setForestTrees([]);
      setStepInfo('Натисніть крок, щоб сформувати дерево рішень (випадковий спліт).');
    }
  }, [algorithm]);

  const stepForward = useCallback(() => {
    setIteration(prev => prev + 1);
    
    if (algorithm === 'kmeans') {
      if (stepMode === 'assign') {
        let changed = false;
        const newPoints = points.map(pt => {
          let minDist = Infinity;
          let closestIdx = -1;
          centroids.forEach((c, idx) => {
            const dist = Math.pow(pt.x - c.x, 2) + Math.pow(pt.y - c.y, 2);
            if (dist < minDist) {
              minDist = dist;
              closestIdx = idx;
            }
          });
          if (pt.cluster !== closestIdx) changed = true;
          return {
            ...pt,
            cluster: closestIdx,
            color: centroids[closestIdx].color
          };
        });
        
        setPoints(newPoints);
        setStepMode('update');
        setStepInfo('Класифікація: точки віднесено до найближчого центроїда.');
        if (!changed && iteration > 1) {
          setIsPlaying(false);
          setStepInfo('Алгоритм збігся! Збіжність центроїдів завершена.');
        }
      } else {
        let moved = false;
        const newCentroids = centroids.map((c, idx) => {
          const assigned = points.filter(pt => pt.cluster === idx);
          if (assigned.length === 0) return c;
          const sumX = assigned.reduce((sum, pt) => sum + pt.x, 0);
          const sumY = assigned.reduce((sum, pt) => sum + pt.y, 0);
          const newX = Math.round(sumX / assigned.length);
          const newY = Math.round(sumY / assigned.length);
          if (newX !== c.x || newY !== c.y) moved = true;
          return { ...c, x: newX, y: newY };
        });
        
        setCentroids(newCentroids);
        setStepMode('assign');
        setStepInfo('Оновлення: перераховано центроїди як середнє точок кластера.');
        if (!moved) {
          setIsPlaying(false);
          setStepInfo('Алгоритм збігся! Збіжність центроїдів завершена.');
        }
      }
    } else if (algorithm === 'dbscan') {
      const eps = 40;
      const minPts = 4;
      
      if (dbscanScanIndex >= points.length) {
        setIsPlaying(false);
        setStepInfo('DBSCAN повністю обійшов всі точки.');
        return;
      }
      
      const p = points[dbscanScanIndex];
      const neighbors = points.filter(q => {
        return Math.sqrt(Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2)) <= eps;
      });
      
      const newPoints = [...points];
      let clusterId = p.cluster;
      
      if (neighbors.length >= minPts) {
        p.type = 'core';
        p.color = '#10b981';
        
        if (clusterId === -1) {
          clusterId = Math.max(-1, ...points.map(pt => pt.cluster)) + 1;
        }
        
        neighbors.forEach(q => {
          q.cluster = clusterId;
          q.type = q.type === 'unvisited' ? 'border' : q.type;
          const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
          q.color = colors[clusterId % colors.length];
        });
        setStepInfo(`Точка ${dbscanScanIndex} є ядровою (Core, сусідів: ${neighbors.length}). Сформовано кластер.`);
      } else {
        if (p.cluster === -1) {
          p.type = 'noise';
          p.color = '#64748b';
          setStepInfo(`Точка ${dbscanScanIndex} є шумовою (Noise, сусідів: ${neighbors.length}).`);
        } else {
          p.type = 'border';
          setStepInfo(`Точка ${dbscanScanIndex} є граничною (Border) кластера.`);
        }
      }
      
      setPoints(newPoints);
      setDbscanScanIndex(prev => prev + 1);
    } else if (algorithm === 'svm') {
      const violations = points.filter(pt => {
        const val = pt.label * (weights.w1 * pt.x + weights.w2 * pt.y + weights.b);
        return val < 1;
      });
      
      if (violations.length > 0) {
        const v = violations[Math.floor(Math.random() * violations.length)];
        const lr = 0.04;
        
        const newW1 = weights.w1 + lr * (v.label * v.x * 0.01 - 0.01 * weights.w1);
        const newW2 = weights.w2 + lr * (v.label * v.y * 0.01 - 0.01 * weights.w2);
        const newB = weights.b + lr * v.label * 8;
        
        setWeights({ w1: newW1, w2: newW2, b: newB });
        setSupportVectors(violations.slice(0, 3));
        setStepInfo('Коригування гіперплощини для максимізації класифікаційного зазору.');
      } else {
        setIsPlaying(false);
        setStepInfo('SVM побудував оптимальну роздільну смугу.');
      }
    } else if (algorithm === 'lr') {
      let newW1 = weights.w1;
      let newW2 = weights.w2;
      let newB = weights.b;
      const lr = 0.012;
      
      let totalErr = 0;
      points.forEach(pt => {
        const z = newW1 * pt.x + newW2 * pt.y + newB;
        const pred = 1 / (1 + Math.exp(-z));
        const err = pt.label - pred;
        totalErr += Math.abs(err);
        
        newW1 += lr * err * pt.x * 0.005;
        newW2 += lr * err * pt.y * 0.005;
        newB += lr * err * 1.2;
      });
      
      setWeights({ w1: newW1, w2: newW2, b: newB });
      const avgErr = totalErr / points.length;
      setStepInfo(`Коригування ваг градієнтним спуском. Середня похибка: ${avgErr.toFixed(3)}`);
      if (avgErr < 0.08) {
        setIsPlaying(false);
        setStepInfo('Логістична регресія успішно збіглася.');
      }
    } else if (algorithm === 'rf') {
      if (forestTrees.length >= 5) {
        setIsPlaying(false);
        setStepInfo('Ансамбль з 5 дерев рішень повністю сформовано!');
        return;
      }
      
      const dir = Math.random() > 0.5 ? 'x' : 'y';
      let splitVal = 0;
      if (dir === 'x') {
        splitVal = Math.round(120 + Math.random() * 260);
      } else {
        splitVal = Math.round(60 + Math.random() * 180);
      }
      
      const newTree = {
        dir,
        val: splitVal,
        color: forestTrees.length === 0 ? 'rgba(239, 68, 68, 0.4)' : 
               forestTrees.length === 1 ? 'rgba(59, 130, 246, 0.4)' :
               forestTrees.length === 2 ? 'rgba(16, 185, 129, 0.4)' :
               forestTrees.length === 3 ? 'rgba(245, 158, 11, 0.4)' :
                                          'rgba(139, 92, 246, 0.4)'
      };
      setForestTrees(prev => [...prev, newTree]);
      setStepInfo(`Дерево ${forestTrees.length + 1}: розділяючий спліт по осі ${dir.toUpperCase()} = ${splitVal}`);
    }
  }, [algorithm, points, centroids, stepMode, weights, forestTrees, dbscanScanIndex, iteration]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        stepForward();
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, stepForward, speed]);

  useEffect(() => {
    initData();
  }, [algorithm, initData]);

  const getLineParams = () => {
    const { w1, w2, b } = weights;
    if (Math.abs(w2) < 0.0001) return null;
    return {
      y1: -b / w2,
      y2: -(w1 * 500 + b) / w2,
      ym1_1: -(b - 15) / w2,
      ym1_2: -(w1 * 500 + b - 15) / w2,
      ym2_1: -(b + 15) / w2,
      ym2_2: -(w1 * 500 + b + 15) / w2
    };
  };

  const lp = (algorithm === 'svm' || algorithm === 'lr') ? getLineParams() : null;

  return (
    <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: 'var(--accent)' }}>
          Анімована модель ({iteration} іт.)
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="icon-btn" 
            style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Пауза" : "Запуск"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button 
            className="icon-btn" 
            style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            onClick={stepForward}
            disabled={isPlaying}
            title="Крок вперед"
          >
            <SkipForward size={16} />
          </button>
          <button 
            className="icon-btn" 
            style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            onClick={initData}
            title="Скинути"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--bg-main)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
        <svg width="100%" height="300" viewBox="0 0 500 300" style={{ display: 'block' }}>
          {/* Background probability gradient for Logistic Regression */}
          {algorithm === 'lr' && lp && (
            <g opacity={0.15}>
              <polygon points={`0,0 500,0 500,${Math.max(0, Math.min(300, lp.y2))} 0,${Math.max(0, Math.min(300, lp.y1))}`} fill="#ef4444" />
              <polygon points={`0,300 500,300 500,${Math.max(0, Math.min(300, lp.y2))} 0,${Math.max(0, Math.min(300, lp.y1))}`} fill="#3b82f6" />
            </g>
          )}

          {/* K-Means helper lines */}
          {algorithm === 'kmeans' && points.map(pt => pt.cluster !== -1 && (
            <line 
              key={`line-${pt.id}`}
              x1={pt.x} 
              y1={pt.y} 
              x2={centroids[pt.cluster].x} 
              y2={centroids[pt.cluster].y} 
              stroke={centroids[pt.cluster].color} 
              strokeWidth={0.7} 
              opacity={0.3} 
            />
          ))}

          {/* DBSCAN epsilon scanner circle */}
          {algorithm === 'dbscan' && dbscanScanIndex < points.length && points[dbscanScanIndex] && (
            <circle
              cx={points[dbscanScanIndex].x}
              cy={points[dbscanScanIndex].y}
              r={40}
              fill="rgba(59, 130, 246, 0.08)"
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="4 2"
            />
          )}

          {/* SVM hyperplane and margins */}
          {algorithm === 'svm' && lp && (
            <>
              <line x1={0} y1={lp.ym1_1} x2={500} y2={lp.ym1_2} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" style={{ transition: 'all 0.4s' }} />
              <line x1={0} y1={lp.ym2_1} x2={500} y2={lp.ym2_2} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" style={{ transition: 'all 0.4s' }} />
              <line x1={0} y1={lp.y1} x2={500} y2={lp.y2} stroke="var(--accent)" strokeWidth={2.5} style={{ transition: 'all 0.4s' }} />
            </>
          )}

          {/* Logistic Regression hyperplane */}
          {algorithm === 'lr' && lp && (
            <line x1={0} y1={lp.y1} x2={500} y2={lp.y2} stroke="var(--accent)" strokeWidth={2.5} style={{ transition: 'all 0.4s' }} />
          )}

          {/* Random Forest splits */}
          {algorithm === 'rf' && forestTrees.map((tree, idx) => (
            <line
              key={`tree-${idx}`}
              x1={tree.dir === 'x' ? tree.val : 0}
              y1={tree.dir === 'y' ? tree.val : 0}
              x2={tree.dir === 'x' ? tree.val : 500}
              y2={tree.dir === 'y' ? tree.val : 300}
              stroke={tree.color}
              strokeWidth={2}
              strokeDasharray="2 2"
            />
          ))}

          {/* SVM Support Vector Rings */}
          {algorithm === 'svm' && supportVectors.map(sv => (
            <circle
              key={`sv-${sv.id}`}
              cx={sv.x}
              cy={sv.y}
              r={9}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth={1.5}
            />
          ))}

          {/* Render points */}
          {points.map(pt => {
            let r = 5;
            let stroke = '#ffffff';
            let strokeW = 1;
            if (algorithm === 'dbscan') {
              if (pt.type === 'core') { r = 7; stroke = '#1e293b'; strokeW = 1.5; }
              else if (pt.type === 'noise') { r = 4; stroke = '#ef4444'; }
            }
            return (
              <circle
                key={pt.id}
                cx={pt.x}
                cy={pt.y}
                r={r}
                fill={pt.color}
                stroke={stroke}
                strokeWidth={strokeW}
                style={{ transition: 'fill 0.4s, cx 0.6s ease-in-out, cy 0.6s ease-in-out' }}
              />
            );
          })}

          {/* Render K-Means centroids */}
          {algorithm === 'kmeans' && centroids.map(c => (
            <path
              key={c.id}
              d={`M ${c.x} ${c.y - 9} L ${c.x + 8} ${c.y + 5} L ${c.x - 8} ${c.y + 5} Z`}
              fill={c.color}
              stroke="#ffffff"
              strokeWidth={1.5}
              style={{ transition: 'all 0.6s ease-in-out' }}
            />
          ))}
        </svg>
      </div>

      <div style={{ marginTop: '0.75rem', background: 'var(--bg-main)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-main)', minHeight: '50px' }}>
        {stepInfo}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Швидкість:</span>
        <input 
          type="range" 
          min="200" 
          max="2000" 
          step="100"
          value={speed} 
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--accent)' }} 
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>
          {(speed / 1000).toFixed(1)}s
        </span>
      </div>
    </div>
  );
};

/**
 * Knowledge Base Component

 * Educational section explaining clustering and classification algorithms with LaTeX formulas.
 */
const Knowledge = () => {
  const [helpView, setHelpView] = useState('root');

  const titles = {
    'kmeans': 'K-Means (k-середніх)',
    'dbscan': 'DBSCAN',
    'rf': 'Випадковий ліс (Random Forest)',
    'svm': 'Метод опорних векторів (SVM)',
    'lr': 'Логістична регресія'
  };

  const renderDetails = () => {
    switch (helpView) {
      case 'kmeans':
        return (
          <div>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
              <strong>Метод K-Means (k-середніх)</strong> — це ітеративний алгоритм кластеризації без учителя, метою якого є поділ набору даних на <InlineMath math={"K"} /> попередньо заданих неперетинних підмножин (кластерів) <InlineMath math={"S = \\{S_1, S_2, \\dots, S_K\\}"} />. Кожен об'єкт відноситься до кластера з найближчим середнім значенням.
            </p>
            <h4 style={{ fontSize: '1.2rem', margin: '1rem 0 0.5rem', color: 'var(--accent)' }}>Математична модель</h4>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Алгоритм мінімізує сумарне квадратичне відхилення точок кластерів від їх центроїдів (критерій внутрішньокластерної дисперсії):
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math={"J = \\sum_{i=1}^{K} \\sum_{x \\in S_i} \\| x - \\mu_i \\|^2"} />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              де <InlineMath math={"\\mu_i"} /> — центроїд кластера <InlineMath math={"S_i"} />, який обчислюється як середнє арифметичне всіх точок кластера:
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math={"\\mu_i = \\frac{1}{|S_i|} \\sum_{x \\in S_i} x"} />
            </div>
            <h4 style={{ fontSize: '1.2rem', margin: '1rem 0 0.5rem', color: 'var(--accent)' }}>Ітераційний процес</h4>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Ініціалізація</strong>: Випадковий вибір <InlineMath math={"K"} /> центроїдів.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Класифікація</strong>: Призначення кожного об'єкта до найближчого центроїда за евклідовою відстанню: <InlineMath math={"d(x, y) = \\|x - y\\|_2"} />.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Оновлення</strong>: Перерахунок центроїдів <InlineMath math={"\\mu_i"} /> для кожної сформованої групи.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Критерій зупинки</strong>: Процес повторюється до повної стабілізації центроїдів або досягнення ліміту ітерацій.</li>
            </ol>
          </div>
        );
      case 'dbscan':
        return (
          <div>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
              <strong>DBSCAN (Density-Based Spatial Clustering of Applications with Noise)</strong> — густинний алгоритм кластеризації. На відміну від K-Means, він не вимагає попереднього вказання кількості кластерів, здатний знаходити кластери довільної геометричної форми та ефективно фільтрувати аномалії (шум).
            </p>
            <h4 style={{ fontSize: '1.2rem', margin: '1rem 0 0.5rem', color: 'var(--accent)' }}>Математична модель</h4>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Основна концепція базується на аналізі щільності точок у заданому радіусі <InlineMath math={"\\epsilon"} />. Визначається <InlineMath math={"\\epsilon"} />-окіл точки <InlineMath math={"p"} /> як:
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math={"N_{\\epsilon}(p) = \\{q \\in D \\mid \\text{dist}(p, q) \\le \\epsilon\\}"} />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Точка <InlineMath math={"p"} /> позначається як ядрова (core point), якщо кількість сусідів у її околі є не меншою за поріг <InlineMath math={"\\text{MinPts}"} />:
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math={"|N_{\\epsilon}(p)| \\ge \\text{MinPts}"} />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Точки діляться на 3 класи: <strong>ядрові</strong>, <strong>граничні</strong> (лежать у радіусі ядрової, але мають менше ніж <InlineMath math={"\\text{MinPts}"} /> власних сусідів) та <strong>шумові</strong> (ізольовані точки, що не входять в окіл жодної ядрової).
            </p>
          </div>
        );
      case 'rf':
        return (
          <div>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
              <strong>Випадковий ліс (Random Forest)</strong> — ансамблевий метод класифікації та регресії, побудований на основі композиції незалежних дерев рішень. Використовує бутстреп-агрегацію (Bagging) та метод випадкових підпросторів для зменшення кореляції між деревами та запобігання перенавчанню.
            </p>
            <h4 style={{ fontSize: '1.2rem', margin: '1rem 0 0.5rem', color: 'var(--accent)' }}>Математична модель</h4>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Фінальний класифікатор визначається шляхом більшості голосів (majority vote) окремих дерев рішень:
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math={"\\hat{y} = \\text{argmax}_{c \\in C} \\sum_{b=1}^{B} I(T_b(x) = c)"} />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              де <InlineMath math={"B"} /> — кількість дерев в ансамблі, <InlineMath math={"T_b(x)"} /> — вихідний клас з <InlineMath math={"b"} />-го дерева, а <InlineMath math={"I(\\cdot)"} /> — індикаторна функція.
            </p>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Для вибору оптимального розділення вузлів дерева використовується неоднорідність Джині (Gini Impurity):
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math={"I_G(t) = 1 - \\sum_{i=1}^{C} p_i^2"} />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              де <InlineMath math={"p_i"} /> — статистична ймовірність приналежності до класу <InlineMath math={"i"} /> у поточному вузлі <InlineMath math={"t"} />.
            </p>
          </div>
        );
      case 'svm':
        return (
          <div>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
              <strong>Метод опорних векторів (Support Vector Machine)</strong> — дискримінантний метод класифікації. Він знаходить роздільну лінійну гіперплощину в багатовимірному просторі ознак, яка забезпечує найбільшу геометричну відстань (зазор) до найближчих точок обох класів (опорних векторів).
            </p>
            <h4 style={{ fontSize: '1.2rem', margin: '1rem 0 0.5rem', color: 'var(--accent)' }}>Математична модель</h4>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Рівняння гіперплощини з параметрами ваг <InlineMath math={"w"} /> та зсуву <InlineMath math={"b"} /> задається як:
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math={"w^T x + b = 0"} />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Оптимізаційне завдання для побудови класифікатора з м'якою маржею (Soft Margin SVM):
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math={"\\min_{w, b, \\xi} \\left( \\frac{1}{2} \\|w\\|^2 + C \\sum_{i=1}^{n} \\xi_i \\right) \\quad \\text{s.t.} \\quad y_i(w^T x_i + b) \\ge 1 - \\xi_i, \\ \\xi_i \\ge 0"} />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              де <InlineMath math={"C"} /> — гіперпараметр регуляризації (контролює баланс між шириною зазору та помилками класифікації), а <InlineMath math={"\\xi_i"} /> — слабкі змінні (slack variables) для штрафування точок, які порушують межі розділення.
            </p>
          </div>
        );
      case 'lr':
        return (
          <div>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
              <strong>Логістична регресія (Logistic Regression)</strong> — лінійний алгоритм класифікації, який використовується для оцінювання ймовірностей належності об'єктів до класів. Модель перетворює значення лінійної комбінації ознак за допомогою логістичної функції у діапазон ймовірностей <InlineMath math={"[0, 1]"} />.
            </p>
            <h4 style={{ fontSize: '1.2rem', margin: '1rem 0 0.5rem', color: 'var(--accent)' }}>Математична модель</h4>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Ймовірність приналежності об'єкта до позитивного класу описується логістичною (сигмоїдною) функцією:
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math={"P(y=1 \\mid x) = \\sigma(w^T x + b) = \\frac{1}{1 + e^{-(w^T x + b)}}"} />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Навчання здійснюється шляхом мінімізації негативного логарифму функції правдоподібності (Cross-Entropy Loss):
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math={"L(w, b) = -\\frac{1}{n} \\sum_{i=1}^{n} \\left[ y_i \\ln(\\hat{y}_i) + (1 - y_i) \\ln(1 - \\hat{y}_i) \\right]"} />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              де <InlineMath math={"\\hat{y}_i = \\sigma(w^T x_i + b)"} /> — прогнозована моделлю ймовірність приналежності до класу 1 для <InlineMath math={"i"} />-го об'єкта.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  if (helpView === 'root') {
    return (
      <div className="panel" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', marginTop: 0, padding: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <HelpCircle size={28} color="var(--accent)" /> База Знань
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div className="feature-card" style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem' }} onClick={() => setHelpView('clustering')}>
            <Activity size={48} color="var(--accent)" style={{ margin: '0 auto' }}/>
            <h3 style={{ fontSize: '1.5rem', marginTop: '1rem', color: 'var(--text-main)' }}>Кластеризація</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Групування схожих об'єктів без попередньо визначених міток класів. Використовується для сегментації даних.</p>
          </div>
          <div className="feature-card" style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem' }} onClick={() => setHelpView('classification')}>
            <Zap size={48} color="var(--accent)" style={{ margin: '0 auto' }}/>
            <h3 style={{ fontSize: '1.5rem', marginTop: '1rem', color: 'var(--text-main)' }}>Класифікація</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Визначення категорії для нових об'єктів на основі навчальних мічених даних. Використовується для прогнозування.</p>
          </div>
        </div>
      </div>
    );
  } else if (helpView === 'clustering') {
    return (
      <div className="panel" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', marginTop: 0, padding: '2.5rem' }}>
        <button className="btn-primary" style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setHelpView('root')}>Назад</button>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <Activity size={28} color="var(--accent)" /> Кластеризація
        </h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1.05rem' }}>
          Кластеризація — це метод машинного навчання без учителя, завданням якого є поділ набору даних на групи (кластери) таким чином, щоб об'єкти в одній групі були максимально схожі між собою за обраними метриками, а з різних груп — максимально відрізнялися.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="feature-card" style={{ cursor: 'pointer', padding: '1.5rem' }} onClick={() => setHelpView('kmeans')}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>K-Means</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>Мінімізує відстані до центроїдів кластерів за допомогою ітераційного підходу.</p>
          </div>
          <div className="feature-card" style={{ cursor: 'pointer', padding: '1.5rem' }} onClick={() => setHelpView('dbscan')}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>DBSCAN</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>Об'єднує точки з високою локальною щільністю, позначаючи ізольовані викиди як шум.</p>
          </div>
        </div>
      </div>
    );
  } else if (helpView === 'classification') {
    return (
      <div className="panel" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', marginTop: 0, padding: '2.5rem' }}>
        <button className="btn-primary" style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setHelpView('root')}>Назад</button>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <Zap size={28} color="var(--accent)" /> Класифікація
        </h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1.05rem' }}>
          Класифікація — це задача навчання з учителем, де модель будує роздільну межу або ймовірнісну функцію на основі розмічених тренувальних даних, щоб відносити нові нерозмічені спостереження до одного з відомих класів.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="feature-card" style={{ cursor: 'pointer', padding: '1.25rem' }} onClick={() => setHelpView('rf')}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Випадковий ліс</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>Ансамбль багатьох дерев рішень для стійкості моделі.</p>
          </div>
          <div className="feature-card" style={{ cursor: 'pointer', padding: '1.25rem' }} onClick={() => setHelpView('svm')}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>SVM</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>Пошук гіперплощини з максимальним класифікаційним зазором.</p>
          </div>
          <div className="feature-card" style={{ cursor: 'pointer', padding: '1.25rem' }} onClick={() => setHelpView('lr')}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Логістична регресія</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>Оцінка ймовірності належності за допомогою логістичної сигмоїди.</p>
          </div>
        </div>
      </div>
    );
  } else {
    // Method detail view
    const title = titles[helpView];
    
    return (
      <div className="panel" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', marginTop: 0, padding: '2.5rem' }}>
        <button 
          className="btn-primary" 
          style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', fontSize: '0.75rem' }} 
          onClick={() => setHelpView(helpView === 'kmeans' || helpView === 'dbscan' ? 'clustering' : 'classification')}
        >
          Назад
        </button>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', fontFamily: 'var(--font-serif)', color: 'var(--text-main)' }}>
          {title}
        </h2>
        
        <div style={{ marginBottom: '2rem', lineHeight: '1.7' }}>
          {renderDetails()}
        </div>

        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Інтерактивна симуляція алгоритму</h4>
        <AlgorithmVisualizer algorithm={helpView} />
      </div>
    );
  }
};

export default Knowledge;
