import { useQuery } from '@tanstack/vue-query'
import { apiFetch } from './client'
import { queryKeys } from './keys'
import type {
  Agent, Kpi, SessionSummary, SessionDetail,
  ToolReliability, PromptRec, SuggestedKpi,
  Version, VersionCompare, Ingestion, AugmentedSummary,
} from './types'

export function useAgents() {
  return useQuery({
    queryKey: queryKeys.agents(),
    queryFn: () => apiFetch<Agent[]>('/agents'),
  })
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: queryKeys.agent(id),
    queryFn: () => apiFetch<Agent>(`/agents/${id}`),
  })
}

export function useSessions(agentId: string) {
  return useQuery({
    queryKey: queryKeys.sessions(agentId),
    queryFn: () => apiFetch<SessionSummary[]>(`/agents/${agentId}/sessions`),
  })
}

export function useSessionDetail(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.sessionDetail(sessionId),
    queryFn: () => apiFetch<SessionDetail>(`/sessions/${sessionId}`),
  })
}

export function useToolReliability(agentId: string) {
  return useQuery({
    queryKey: queryKeys.toolReliability(agentId),
    queryFn: () => apiFetch<ToolReliability>(`/agents/${agentId}/tool-reliability`),
  })
}

export function useKpis(agentId: string) {
  return useQuery({
    queryKey: queryKeys.kpis(agentId),
    queryFn: () => apiFetch<Kpi[]>(`/agents/${agentId}/kpis`),
  })
}

export function useRecommendations(agentId: string) {
  return useQuery({
    queryKey: queryKeys.recommendations(agentId),
    queryFn: () => apiFetch<{ recs: PromptRec[]; suggestedKpis: SuggestedKpi[] }>(
      `/agents/${agentId}/recommendations`
    ),
  })
}

export function useVersions(agentId: string) {
  return useQuery({
    queryKey: queryKeys.versions(agentId),
    queryFn: () => apiFetch<Version[]>(`/agents/${agentId}/versions`),
  })
}

export function useVersionCompare(agentId: string) {
  return useQuery({
    queryKey: queryKeys.versionCompare(agentId),
    queryFn: () => apiFetch<VersionCompare>(`/agents/${agentId}/version-compare`),
  })
}

export function useIngestion() {
  return useQuery({
    queryKey: queryKeys.ingestion(),
    queryFn: () => apiFetch<Ingestion>('/ingestion'),
  })
}

export function useOverview() {
  return useQuery({
    queryKey: queryKeys.overview(),
    queryFn: () => apiFetch<{
      agents: Agent[]
      augmentedSummary: AugmentedSummary
    }>('/overview'),
  })
}
