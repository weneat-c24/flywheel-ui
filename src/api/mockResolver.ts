import {
  agents,
  agentSummaryFor,
  sessionsFor,
  sessionDetailFor,
  toolReliabilityFor,
  kpisFor,
  recommendationsFor,
  versionsFor,
  versionCompareFor,
  ingestionSettings,
  augmentedSummary,
} from '@/mocks/fixtures/index'

const DELAY_MS = () => 80 + Math.random() * 170

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export async function mockResolve<T>(path: string, _init?: RequestInit): Promise<T> {
  await sleep(DELAY_MS())

  // Strip query string for matching
  const cleanPath = path.split('?')[0]

  // /overview
  if (cleanPath === '/overview') {
    return { agents, augmentedSummary } as T
  }

  // /agents
  if (cleanPath === '/agents') {
    return agents as T
  }

  // /agents/:id
  const agentMatch = cleanPath.match(/^\/agents\/([^/]+)$/)
  if (agentMatch) {
    const agent = agentSummaryFor(agentMatch[1])
    if (!agent) throw new Error('Agent not found')
    return agent as T
  }

  // /agents/:id/sessions
  const sessionsMatch = cleanPath.match(/^\/agents\/([^/]+)\/sessions$/)
  if (sessionsMatch) {
    return sessionsFor(sessionsMatch[1]) as T
  }

  // /sessions/:id
  const sessionDetailMatch = cleanPath.match(/^\/sessions\/([^/]+)$/)
  if (sessionDetailMatch) {
    const detail = sessionDetailFor(sessionDetailMatch[1])
    if (!detail) throw new Error('Session not found')
    return detail as T
  }

  // /agents/:id/tool-reliability
  const toolRelMatch = cleanPath.match(/^\/agents\/([^/]+)\/tool-reliability$/)
  if (toolRelMatch) {
    return toolReliabilityFor(toolRelMatch[1]) as T
  }

  // /agents/:id/kpis
  const kpisMatch = cleanPath.match(/^\/agents\/([^/]+)\/kpis$/)
  if (kpisMatch) {
    return kpisFor(kpisMatch[1]) as T
  }

  // /agents/:id/recommendations
  const recsMatch = cleanPath.match(/^\/agents\/([^/]+)\/recommendations$/)
  if (recsMatch) {
    return recommendationsFor(recsMatch[1]) as T
  }

  // /agents/:id/versions
  const versionsMatch = cleanPath.match(/^\/agents\/([^/]+)\/versions$/)
  if (versionsMatch) {
    return versionsFor(versionsMatch[1]) as T
  }

  // /agents/:id/version-compare
  const versionCompareMatch = cleanPath.match(/^\/agents\/([^/]+)\/version-compare$/)
  if (versionCompareMatch) {
    return versionCompareFor(versionCompareMatch[1]) as T
  }

  // /ingestion
  if (cleanPath === '/ingestion') {
    return ingestionSettings() as T
  }

  throw new Error(`[mockResolver] No mock for: ${path}`)
}
