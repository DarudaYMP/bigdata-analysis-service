# Software Architecture & Project Structure

## 1. Project Directory Structure

```text
bigdata-analysis-service/
├── backend/                  # (Conceptual grouping of backend scripts)
│   ├── app.py                # API and Routing Controller
│   ├── data_processing.py    # Data Wrangling and EDA Service
│   ├── ml_engine.py          # Scikit-learn Machine Learning Pipelines
│   ├── visualizations.py     # Data Transformation for Plotly Charts
│   └── utils.py              # File I/O and System Helpers
│
├── frontend/                 # React UI Application
│   ├── src/
│   │   ├── components/       # Reusable UI Components
│   │   │   ├── Ingestion.jsx # File Upload & Sheet Selection
│   │   │   ├── Cleaning.jsx  # Data Cleaning & Preview
│   │   │   ├── Analysis.jsx  # ML Configuration & Results
│   │   │   └── Knowledge.jsx # Interactive Help & Methods
│   │   ├── store/            # Zustand State Management
│   │   │   └── useStore.js
│   │   ├── __tests__/        # UI Testing Suite
│   │   ├── App.jsx           # Main Application Layout 
│   │   └── main.jsx          # React Entry Point
│   ├── index.html            # Vite HTML Template
│   └── vite.config.js        # Build Configuration
│
└── tests/                    # Backend Unit Testing Suite
    ├── test_data_processing.py
    ├── test_ml_engine.py
    └── test_utils.py
```

## 2. Architectural Components

### Backend (Python/Flask)
- **`app.py` (Controllers):** Serves as the primary entry point and API router. It handles HTTP requests, extracts parameters, delegates work to the respective service modules, and returns standardized JSON payloads.
- **`data_processing.py` (Services):** Isolates the data wrangling logic using Pandas. It handles missing value imputation, duplicate removal, text normalization, and generates exploratory data analysis (EDA) insights.
- **`ml_engine.py` (ML Pipelines):** Encapsulates the core analytical engines. It initializes Scikit-learn models (K-Means, Random Forest, SVM), manages feature scaling, and interacts with LLMs to generate business summaries.
- **`visualizations.py` (Presentation Logic):** Transforms raw datasets into structured formats optimized for frontend consumption (`react-plotly.js`), preventing memory overloads on the client by aggregating massive datasets before transmission.

### Frontend (React/Vite)
- **`store/useStore.js` (State Management):** A unified Zustand store managing the global state (current step, uploaded file metadata, analysis results) to eliminate prop-drilling across deep component trees.
- **`components/` (UI Components):** A highly modularized hierarchy of React components following the Single Responsibility Principle. Complex interfaces are broken down into logical domains (Ingestion, Cleaning, Analysis, Knowledge).
- **`__tests__/`:** Contains the frontend unit tests implemented using `React Testing Library`, ensuring core UI interactions (e.g., file uploading) function reliably.

## 3. Client-Server Interaction Flow
The application utilizes a decoupled, RESTful Client-Server architecture:
1. **Ingestion Phase:** The React client uploads a file via a `multipart/form-data` POST request. The Flask backend validates the file, caches it, and returns a unique `file_path` identifier along with structural metadata.
2. **Processing Phase:** All subsequent client requests (cleaning, plotting, analyzing) are stateless API calls that reference the cached `file_path`. The Python backend loads the dataset, performs the intensive computation, and overwrites the cached file if mutated.
3. **Presentation Phase:** The backend responds with strictly typed JSON payloads containing structured results, metrics, and visualization coordinates. The React client dynamically re-renders the UI, utilizing `react-plotly.js` for complex interactive graphs.
