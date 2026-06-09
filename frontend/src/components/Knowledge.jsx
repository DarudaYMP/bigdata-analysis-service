import React, { useState } from 'react';
import { HelpCircle, Activity, Zap } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid } from 'recharts';
import { InlineMath, BlockMath } from 'react-katex';

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
              <strong>Метод K-Means (k-середніх)</strong> — це ітеративний алгоритм кластеризації без учителя, метою якого є поділ набору даних на <InlineMath math="K"/> попередньо заданих неперетинних підмножин (кластерів) <InlineMath math="S = \{S_1, S_2, \dots, S_K\}"/>. Кожен об'єкт відноситься до кластера з найближчим середнім значенням.
            </p>
            <h4 style={{ fontSize: '1.2rem', margin: '1rem 0 0.5rem', color: 'var(--accent)' }}>Математична модель</h4>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Алгоритм мінімізує сумарне квадратичне відхилення точок кластерів від їх центроїдів (критерій внутрішньокластерної дисперсії):
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math="J = \sum_{i=1}^{K} \sum_{x \in S_i} \| x - \mu_i \|^2" />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              де <InlineMath math="\mu_i"/> — центроїд кластера <InlineMath math="S_i"/>, який обчислюється як середнє арифметичне всіх точок кластера:
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math="\mu_i = \frac{1}{|S_i|} \sum_{x \in S_i} x" />
            </div>
            <h4 style={{ fontSize: '1.2rem', margin: '1rem 0 0.5rem', color: 'var(--accent)' }}>Ітераційний процес</h4>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Ініціалізація</strong>: Випадковий вибір <InlineMath math="K"/> центроїдів.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Класифікація</strong>: Призначення кожного об'єкта до найближчого центроїда за евклідовою відстанню: <InlineMath math="d(x, y) = \|x - y\|_2"/>.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Оновлення</strong>: Перерахунок центроїдів <InlineMath math="\mu_i"/> для кожної сформованої групи.</li>
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
              Основна концепція базується на аналізі щільності точок у заданому радіусі <InlineMath math="\epsilon"/>. Визначається <InlineMath math="\epsilon"/>-окіл точки <InlineMath math="p"/> як:
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math="N_{\epsilon}(p) = \{q \in D \mid \text{dist}(p, q) \le \epsilon\}" />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Точка <InlineMath math="p"/> позначається як ядрова (core point), якщо кількість сусідів у її околі є не меншою за поріг <InlineMath math="\text{MinPts}"/>:
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math="|N_{\epsilon}(p)| \ge \text{MinPts}" />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Точки діляться на 3 класи: <strong>ядрові</strong>, <strong>граничні</strong> (лежать у радіусі ядрової, але мають менше ніж <InlineMath math="\text{MinPts}"/> власних сусідів) та <strong>шумові</strong> (ізольовані точки, що не входять в окіл жодної ядрової).
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
              <BlockMath math="\hat{y} = \text{argmax}_{c \in C} \sum_{b=1}^{B} I(T_b(x) = c)" />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              де <InlineMath math="B"/> — кількість дерев в ансамблі, <InlineMath math="T_b(x)"/> — вихідний клас з <InlineMath math="b"/>-го дерева, а <InlineMath math="I(\cdot)"/> — індикаторна функція.
            </p>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Для вибору оптимального розділення вузлів дерева використовується неоднорідність Джині (Gini Impurity):
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math="I_G(t) = 1 - \sum_{i=1}^{C} p_i^2" />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              де <InlineMath math="p_i"/> — статистична ймовірність приналежності до класу <InlineMath math="i"/> у поточному вузлі <InlineMath math="t"/>.
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
              Рівняння гіперплощини з параметрами ваг <InlineMath math="w"/> та зсуву <InlineMath math="b"/> задається як:
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math="w^T x + b = 0" />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Оптимізаційне завдання для побудови класифікатора з м'якою маржею (Soft Margin SVM):
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math="\min_{w, b, \xi} \left( \frac{1}{2} \|w\|^2 + C \sum_{i=1}^{n} \xi_i \right) \quad \text{s.t.} \quad y_i(w^T x_i + b) \ge 1 - \xi_i, \ \xi_i \ge 0" />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              де <InlineMath math="C"/> — гіперпараметр регуляризації (контролює баланс між шириною зазору та помилками класифікації), а <InlineMath math="\xi_i"/> — слабкі змінні (slack variables) для штрафування точок, які порушують межі розділення.
            </p>
          </div>
        );
      case 'lr':
        return (
          <div>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
              <strong>Логістична регресія (Logistic Regression)</strong> — лінійний алгоритм класифікації, який використовується для оцінювання ймовірностей належності об'єктів до класів. Модель перетворює значення лінійної комбінації ознак за допомогою логістичної функції у діапазон ймовірностей <InlineMath math="[0, 1]"/>.
            </p>
            <h4 style={{ fontSize: '1.2rem', margin: '1rem 0 0.5rem', color: 'var(--accent)' }}>Математична модель</h4>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Ймовірність приналежності об'єкта до позитивного класу описується логістичною (сигмоїдною) функцією:
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math="P(y=1 \mid x) = \sigma(w^T x + b) = \frac{1}{1 + e^{-(w^T x + b)}}" />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              Навчання здійснюється шляхом мінімізації негативного логарифму функції правдоподібності (Cross-Entropy Loss):
            </p>
            <div style={{ margin: '1.5rem 0', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '8px', overflowX: 'auto' }}>
              <BlockMath math="L(w, b) = -\frac{1}{n} \sum_{i=1}^{n} \left[ y_i \ln(\hat{y}_i) + (1 - y_i) \ln(1 - \hat{y}_i) \right]" />
            </div>
            <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
              де <InlineMath math="\hat{y}_i = \sigma(w^T x_i + b)"/> — прогнозована моделлю ймовірність приналежності до класу 1 для <InlineMath math="i"/>-го об'єкта.
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
    
    // Generate a static preview chart
    const mockData = Array.from({length: 50}, (_, i) => ({ x: Math.random() * 100, y: Math.random() * 100, cluster: i % 3 }));
    
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

        <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Приклад просторового розподілу</h4>
        <div style={{ height: '300px', background: 'var(--bg-main)', borderRadius: '8px', padding: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} stroke="var(--border-color)" />
              <XAxis type="number" dataKey="x" stroke="var(--border-color)" tick={false} />
              <YAxis type="number" dataKey="y" stroke="var(--border-color)" tick={false} />
              <Scatter name="Points" data={mockData} fill="var(--accent)" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
};

export default Knowledge;
