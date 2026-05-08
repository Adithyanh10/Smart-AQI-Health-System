import axios, { AxiosInstance, AxiosResponse } from 'axios'
import type {
  PollutantInput,
  PredictionResponse,
  BatchPredictionResponse,
  HealthImpactResponse,
  ComparisonResult,
  ModelVersion,
  ModelMetrics,
  RetrainStatus,
  TuningResult,
  LiveAQIResponse,
  DatasetRow,
  DatasetStats,
  AQICategory,
  ModelType,
} from '../types'

// ─── Axios Instance ──────────────────────────────────────────────────────────
// In dev: Vite proxy forwards /api → localhost:8000
// In production (Vercel): vercel.json rewrites /api → Render backend URL

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ─────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('aqi_api_key')
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey
  }
  return config
})

// ─── Response Interceptor ────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error — surface to calling component
      return Promise.reject(error)
    }

    const { status, headers } = error.response

    if (status === 429) {
      const retryAfter = headers['retry-after'] ?? 'unknown'
      console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds.`)
    } else if (status === 401) {
      localStorage.removeItem('aqi_api_key')
      window.location.href = '/login'
    } else if (status >= 500) {
      console.error(`Server error ${status}:`, error.response.data)
    }

    // Surface 4xx errors to calling component
    return Promise.reject(error)
  }
)

// ─── Paginated Response ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ─── Prediction ──────────────────────────────────────────────────────────────

export async function predictAQI(input: PollutantInput): Promise<PredictionResponse> {
  const res: AxiosResponse<PredictionResponse> = await api.post('/predict', input)
  return res.data
}

export async function predictCSV(file: File): Promise<BatchPredictionResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const res: AxiosResponse<BatchPredictionResponse> = await api.post('/predict/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// ─── Health Impact ───────────────────────────────────────────────────────────

export async function getHealthImpact(category: AQICategory): Promise<HealthImpactResponse> {
  const encoded = encodeURIComponent(category)
  const res: AxiosResponse<HealthImpactResponse> = await api.get(`/health-impact/${encoded}`)
  return res.data
}

export async function compareHealthImpact(
  from: AQICategory,
  to: AQICategory
): Promise<ComparisonResult> {
  const res: AxiosResponse<ComparisonResult> = await api.get('/health-impact/compare', {
    params: { from, to },
  })
  return res.data
}

// ─── Models ──────────────────────────────────────────────────────────────────

export async function getModels(): Promise<ModelVersion[]> {
  const res: AxiosResponse<ModelVersion[]> = await api.get('/models')
  return res.data
}

export async function activateModel(id: string): Promise<ModelVersion> {
  const res: AxiosResponse<ModelVersion> = await api.post(`/models/${id}/activate`)
  return res.data
}

export async function getModelMetrics(): Promise<ModelMetrics> {
  const res: AxiosResponse<ModelMetrics> = await api.get('/model/metrics')
  return res.data
}

export async function retrainModel(type?: ModelType): Promise<{ job_id: string }> {
  const res: AxiosResponse<{ job_id: string }> = await api.post('/model/retrain', type ? { model_type: type } : {})
  return res.data
}

export async function getRetrainStatus(jobId: string): Promise<RetrainStatus> {
  const res: AxiosResponse<RetrainStatus> = await api.get('/model/retrain/status', {
    params: { job_id: jobId },
  })
  return res.data
}

export async function tuneModel(
  modelType: ModelType,
  paramGrid: Record<string, unknown[]>
): Promise<TuningResult> {
  const res: AxiosResponse<TuningResult> = await api.post('/models/tune', {
    model_type: modelType,
    param_grid: paramGrid,
  })
  return res.data
}

// ─── Live AQI ────────────────────────────────────────────────────────────────

export async function getLiveAQI(): Promise<LiveAQIResponse> {
  const res: AxiosResponse<LiveAQIResponse> = await api.get('/aqi/live')
  return res.data
}

// ─── Dataset ─────────────────────────────────────────────────────────────────

export async function getDataset(
  page: number,
  pageSize: number,
  filter?: string
): Promise<PaginatedResponse<DatasetRow>> {
  const res: AxiosResponse<PaginatedResponse<DatasetRow>> = await api.get('/dataset', {
    params: { page, page_size: pageSize, ...(filter ? { filter } : {}) },
  })
  return res.data
}

export async function getDatasetStats(): Promise<DatasetStats> {
  const res: AxiosResponse<DatasetStats> = await api.get('/dataset/stats')
  return res.data
}

// ─── Cache ───────────────────────────────────────────────────────────────────

export async function flushCache(): Promise<{ evicted: number }> {
  const res: AxiosResponse<{ evicted: number }> = await api.delete('/cache/flush')
  return res.data
}

// ─── PDF Report ──────────────────────────────────────────────────────────────

export async function downloadPDF(
  aqi: number,
  category: AQICategory,
  modelId?: string
): Promise<Blob> {
  const res: AxiosResponse<Blob> = await api.get('/report/pdf', {
    params: { aqi, category, ...(modelId ? { model_id: modelId } : {}) },
    responseType: 'blob',
  })
  return res.data
}

export default api
