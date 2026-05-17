export const queryKeys = {
  overview: () => ['overview'] as const,
  agents: () => ['agents'] as const,
  agent: (id: string) => ['agent', id] as const,
  sessions: (agentId: string) => ['sessions', agentId] as const,
  sessionDetail: (sessionId: string) => ['session', sessionId] as const,
  toolReliability: (agentId: string) => ['toolReliability', agentId] as const,
  kpis: (agentId: string) => ['kpis', agentId] as const,
  recommendations: (agentId: string) => ['recommendations', agentId] as const,
  versions: (agentId: string) => ['versions', agentId] as const,
  versionCompare: (agentId: string) => ['versionCompare', agentId] as const,
  ingestion: () => ['ingestion'] as const,
}
