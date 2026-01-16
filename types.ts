export type IntegrationSource =
  | 'hubspot'
  | 'freshdesk'
  | 'notion'
  | 'gemini'
  | 'stripe'
  | 'github'
  | 'slack'
  | 'jira'
  | 'system';

export type MetricUnit =
  | 'currency'
  | 'count'
  | 'percentage'
  | 'duration'
  | 'email'
  | 'phone'
  | 'bytes';

export interface IntegrationError {
  source: IntegrationSource;
  code: 'AUTH_FAILED' | 'RATE_LIMIT' | 'TIMEOUT' | 'VALIDATION_ERROR' | 'UNKNOWN';
  cause: string;
  fix: string;
  retryable: boolean;
  retryAfter?: Date;
  timestamp: Date;
}

export interface DashboardMetric {
  id: string;
  source: IntegrationSource;
  sourceKey: string;
  label: string;
  value: number | string;
  unit: MetricUnit;
  trend?: 'up' | 'down' | 'flat';
  changePercent?: number;
  timestamp: Date;
  refreshedAt: Date;
  refreshInterval: number;
  error?: IntegrationError;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  action: 'FETCH' | 'WEBHOOK' | 'AUTH' | 'CONFIG_CHANGE' | 'ERROR';
  source: IntegrationSource;
  status: 'success' | 'failure';
  details: string;
  timestamp: Date;
  requestId: string;
}

export interface CostRecord {
  month: string;
  source: IntegrationSource;
  cost: number;
  currency: string;
}

export interface CostForecastItem {
  source: IntegrationSource;
  cost: number;
  reasoning: string;
}

export interface CostForecastMonth {
  monthLabel: string;
  items: CostForecastItem[];
}

export interface CostForecastResult {
  summary: string;
  forecasts: CostForecastMonth[];
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'compact';
  notifications: {
    email: boolean;
    slack: boolean;
    criticalAlertsOnly: boolean;
  };
}