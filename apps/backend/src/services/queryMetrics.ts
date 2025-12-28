/**
 * Query Metrics Service
 * 
 * Tracks metrics for Query (AI chatbot) interactions:
 * - Request counts
 * - Response times
 * - Token usage
 * - Errors
 * - Artifact detection
 */

import { metricsCollector } from '../middleware/metrics.js';
import { PersonaType, ProviderType, CustomInstructions } from './customInstructions.js';

export interface QueryMetrics {
  persona: PersonaType;
  provider: ProviderType;
  responseTime?: number;
  tokens?: { input: number; output: number };
  error?: { type: string; message: string };
  artifacts?: string[];
}

/**
 * Track a Query request
 */
export function trackQueryRequest(metrics: QueryMetrics): void {
  const { persona, provider, error } = metrics;
  
  // Track request
  metricsCollector.record('query_requests_total', 1, {
    persona,
    provider,
    status: error ? 'error' : 'success',
  });

  // Track response time if available
  if (metrics.responseTime !== undefined) {
    metricsCollector.record('query_response_time_ms', metrics.responseTime, {
      persona,
      provider,
    });
  }

  // Track tokens if available
  if (metrics.tokens) {
    metricsCollector.record('query_tokens_used', metrics.tokens.input, {
      persona,
      provider,
      type: 'input',
    });
    metricsCollector.record('query_tokens_used', metrics.tokens.output, {
      persona,
      provider,
      type: 'output',
    });
  }

  // Track errors
  if (error) {
    metricsCollector.record('query_errors_total', 1, {
      persona,
      provider,
      error_type: error.type,
    });
  }

  // Track artifacts detected
  if (metrics.artifacts && metrics.artifacts.length > 0) {
    metrics.artifacts.forEach(artifact => {
      metricsCollector.record('query_artifacts_detected', 1, {
        artifact_name: artifact,
      });
    });
  }

  // Track prompt version (from CustomInstructions)
  const promptVersion = CustomInstructions.VERSION || '1.0.0'
  metricsCollector.record('query_prompt_version', 1, {
    version: promptVersion,
    persona,
  });
}

/**
 * Get Query metrics summary
 */
export function getQueryMetricsSummary(): {
  totalRequests: number;
  totalErrors: number;
  avgResponseTime: number;
  totalTokens: number;
  topArtifacts: Array<{ name: string; count: number }>;
} {
  const allMetrics = metricsCollector.getMetrics();
  const queryMetrics = allMetrics.filter(m => 
    m.name.startsWith('query_')
  );

  const requests = queryMetrics.filter(m => m.name === 'query_requests_total');
  const errors = queryMetrics.filter(m => m.name === 'query_errors_total');
  const responseTimes = queryMetrics.filter(m => m.name === 'query_response_time_ms');
  const tokens = queryMetrics.filter(m => m.name === 'query_tokens_used');
  const artifacts = queryMetrics.filter(m => m.name === 'query_artifacts_detected');

  // Calculate totals
  const totalRequests = requests.length;
  const totalErrors = errors.length;
  
  // Calculate average response time
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, m) => sum + m.value, 0) / responseTimes.length
    : 0;

  // Calculate total tokens
  const totalTokens = tokens.reduce((sum, m) => sum + m.value, 0);

  // Get top artifacts
  const artifactCounts: Record<string, number> = {};
  artifacts.forEach(m => {
    const artifactName = m.labels.artifact_name || 'unknown';
    artifactCounts[artifactName] = (artifactCounts[artifactName] || 0) + 1;
  });
  
  const topArtifacts = Object.entries(artifactCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalRequests,
    totalErrors,
    avgResponseTime: Math.round(avgResponseTime),
    totalTokens,
    topArtifacts,
  };
}

