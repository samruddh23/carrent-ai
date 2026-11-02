import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const api = {
  // Metadata & Options
  getMetaOptions: () => client.get('/meta/options').then(res => res.data),

  // Dataset & Preprocessing
  getDatasetOverview: () => client.get('/dataset/overview').then(res => res.data),
  getDatasetRecords: (params) => client.get('/dataset/records', { params }).then(res => res.data),
  getDatasetStatistics: () => client.get('/dataset/statistics').then(res => res.data),
  getDatasetCategorical: () => client.get('/dataset/categorical').then(res => res.data),
  getPreprocessingAudit: () => client.get('/preprocessing/audit').then(res => res.data),

  // EDA
  getPriceDistribution: (bins = 15) => client.get('/eda/price-distribution', { params: { bins } }).then(res => res.data),
  getBivariateAnalysis: () => client.get('/eda/bivariate').then(res => res.data),
  getCorrelationMatrix: () => client.get('/eda/correlation').then(res => res.data),

  // Models & Lab
  getModelMetrics: () => client.get('/models/metrics').then(res => res.data),
  retrainModels: () => client.post('/models/train').then(res => res.data),
  getActualVsPredicted: (sampleSize = 80) => client.get('/models/actual-vs-predicted', { params: { sample_size: sampleSize } }).then(res => res.data),
  getFeatureImportance: () => client.get('/models/feature-importance').then(res => res.data),
  getLinearRegressionEquation: () => client.get('/models/linear-regression/equation').then(res => res.data),
  getDecisionTreeStructure: (maxNodes = 35) => client.get('/models/decision-tree/structure', { params: { max_nodes: maxNodes } }).then(res => res.data),
  traceDecisionPath: (data) => client.post('/models/decision-tree/trace', data).then(res => res.data),
  getRandomForestBreakdown: (data) => client.post('/models/random-forest/breakdown', data).then(res => res.data),

  // Predictions
  predictSingle: (data) => client.post('/predict', data).then(res => res.data),
  predictCompare: (data) => client.post('/predict/compare', data).then(res => res.data),

  // Prediction History
  getHistory: (params) => client.get('/history', { params }).then(res => res.data),
  deleteHistoryItem: (id) => client.delete(`/history/${id}`).then(res => res.data),
  clearHistory: () => client.post('/history/clear').then(res => res.data),

  // Cars Catalog
  getCars: () => client.get('/cars').then(res => res.data),
  getCarDetails: (id) => client.get(`/cars/${id}`).then(res => res.data),
};

export default api;
