import axios from 'axios'
import type { DashboardData, ConstraintResult, RefreshResponse } from '../types/rie'

const BASE_URL = import.meta.env.VITE_RIE_API_URL ?? 'http://localhost:8100'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
})

export const rieApi = {
  getDashboard: (): Promise<DashboardData> =>
    client.get<DashboardData>('/api/dashboard').then((r) => r.data),

  getConstraint: (id: string): Promise<ConstraintResult> =>
    client.get<ConstraintResult>(`/api/constraints/${id}`).then((r) => r.data),

  refresh: (): Promise<RefreshResponse> =>
    client.post<RefreshResponse>('/api/refresh').then((r) => r.data),
}
