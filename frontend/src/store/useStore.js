import { create } from 'zustand';

/**
 * Global Zustand store for managing application state.
 */
export const useStore = create((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),

  currentStep: 'ingestion', // ingestion, cleaning, visualization, analysis, help
  setCurrentStep: (step) => set({ currentStep: step }),

  fileId: null,
  setFileId: (id) => set({ fileId: id }),

  columns: [],
  setColumns: (cols) => set({ columns: cols }),

  previewData: [],
  setPreviewData: (data) => set({ previewData: data }),

  edaInsights: [],
  setEdaInsights: (insights) => set({ edaInsights: insights }),

  // Full dataset viewer state
  fullData: [],
  setFullData: (data) => set({ fullData: data }),
  dataPage: 1,
  setDataPage: (page) => set({ dataPage: page }),
  totalRows: 0,
  setTotalRows: (rows) => set({ totalRows: rows }),
  showFullData: false,
  setShowFullData: (show) => set({ showFullData: show }),

  // Analysis state
  targetColumn: '',
  setTargetColumn: (col) => set({ targetColumn: col }),
  selectedFeatures: [],
  setSelectedFeatures: (features) => set({ selectedFeatures: features }),
  toggleFeature: (feat) => set((state) => {
    const updated = state.selectedFeatures.includes(feat)
      ? state.selectedFeatures.filter(f => f !== feat)
      : [...state.selectedFeatures, feat];
    return { selectedFeatures: updated };
  }),

  // Visualizations state
  visXCol: '',
  setVisXCol: (col) => set({ visXCol: col }),
  visYCol: '',
  setVisYCol: (col) => set({ visYCol: col }),
  visChartType: 'bar',
  setVisChartType: (type) => set({ visChartType: type }),
  visData: [],
  setVisData: (data) => set({ visData: data }),

  // Results state
  results: null,
  setResults: (res) => set({ results: res }),

  // Global loading states
  loading: false,
  setLoading: (isLoading) => set({ loading: isLoading })
}));
