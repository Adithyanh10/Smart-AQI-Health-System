// ─── Union Types ────────────────────────────────────────────────────────────

export type AQICategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous'

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Severe'

export type ActionUrgency =
  | 'Monitor'
  | 'Caution'
  | 'Avoid Outdoors'
  | 'Stay Indoors'
  | 'Emergency'

export type ModelType =
  | 'random_forest'
  | 'gradient_boosting'
  | 'xgboost'
  | 'linear_regression'

export type HealthCondition = 'Asthma' | 'COPD' | 'Heart Disease' | 'Diabetes' | 'Pregnancy'

export type AgeGroup = 'Child' | 'Adult' | 'Senior'

// ─── Prediction ─────────────────────────────────────────────────────────────

export interface PollutantInput {
  'PM2.5': number
  PM10: number
  NO2: number
  SO2: number
  CO: number
  O3: number
}

export interface ConfidenceInterval {
  lower: number
  upper: number
}

export interface FeatureImportanceItem {
  feature: string
  importance: number
}

// ─── Health Impact ───────────────────────────────────────────────────────────

export interface SensitiveGroupNotes {
  children: string
  elderly: string
  pregnant: string
  asthma: string
  cardiovascular: string
}

export interface OrganImpact {
  organ: string
  risk_level: RiskLevel
  severity_score: number
  description: string
  prevention_tips: string[]
  precautions: string[]
  action_urgency: ActionUrgency
  sensitive_group_notes: SensitiveGroupNotes
}

export interface HealthImpactResponse {
  aqi_category: AQICategory
  organs: OrganImpact[]
}

// ─── Prediction Response ─────────────────────────────────────────────────────

export interface PredictionResponse {
  aqi: number
  aqi_category: AQICategory
  confidence_interval: ConfidenceInterval
  model_id: string
  model_type: ModelType
  feature_importance: FeatureImportanceItem[]
  organs: OrganImpact[]
  timestamp: string
  cached: boolean
}

export interface BatchPredictionRow {
  row_index: number
  input: PollutantInput
  aqi: number
  aqi_category: AQICategory
}

export interface BatchRowError {
  row_index: number
  error: string
}

export interface BatchPredictionResponse {
  predictions: BatchPredictionRow[]
  errors: BatchRowError[]
  total_rows: number
  processed_rows: number
  error_rows: number
}

// ─── Comparison ──────────────────────────────────────────────────────────────

export interface OrganComparison {
  organ: string
  from_risk: RiskLevel
  to_risk: RiskLevel
  worsened: boolean
}

export interface ComparisonResult {
  from_category: AQICategory
  to_category: AQICategory
  worsened_organs: OrganComparison[]
  improved_organs: OrganComparison[]
  unchanged_organs: OrganComparison[]
}

// ─── Model ───────────────────────────────────────────────────────────────────

export interface ModelMetrics {
  mae: number
  rmse: number
  r2: number
  accuracy: number
  cv_mean_accuracy: number
  cv_std_accuracy: number
}

export interface ModelVersion {
  model_id: string
  model_type: ModelType
  trained_at: string
  dataset_rows: number
  metrics: ModelMetrics
  is_active: boolean
  artifact_path: string
}

export interface RetrainStatus {
  job_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string | null
  completed_at: string | null
  metrics: ModelMetrics | null
  error: string | null
}

export interface HyperparameterResult {
  params: Record<string, unknown>
  cv_score: number
}

export interface TuningResult {
  best_params: Record<string, unknown>
  best_score: number
  all_results: HyperparameterResult[]
}

// ─── Live AQI ────────────────────────────────────────────────────────────────

export interface LiveAQIResponse {
  aqi: number
  aqi_category: AQICategory
  pollutants: PollutantInput
  timestamp: string
  latency_ms: number
}

// ─── Dataset ─────────────────────────────────────────────────────────────────

export interface DatasetRow {
  'PM2.5': number
  PM10: number
  NO2: number
  SO2: number
  CO: number
  O3: number
  AQI: number
  AQI_Category: AQICategory
}

export interface ColumnStats {
  column: string
  mean: number
  median: number
  std: number
  min: number
  max: number
  p25: number
  p75: number
  missing_count: number
  missing_pct: number
  outlier_count: number
}

export interface DatasetStats {
  total_rows: number
  outlier_rows: number
  outlier_pct: number
  columns: ColumnStats[]
  correlation_matrix: Record<string, Record<string, number>>
}

// ─── User Profile ────────────────────────────────────────────────────────────

export interface FavoriteLocation {
  id: string
  name: string
  lat: number
  lng: number
  last_pollutants?: PollutantInput
}

export interface UserProfile {
  name: string
  city: string
  health_conditions: HealthCondition[]
  notification_threshold: number
  favorites: FavoriteLocation[]
}

export interface PredictionHistoryEntry {
  id: string
  input: PollutantInput
  aqi: number
  aqi_category: AQICategory
  timestamp: string
}
