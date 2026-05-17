import { http, HttpResponse } from 'msw'
import { delay } from './delay'
import {
  agents, agentSummaryFor, sessionsFor, sessionDetailFor,
  toolReliabilityFor, kpisFor, recommendationsFor,
  versionsFor, versionCompareFor, ingestionSettings, augmentedSummary,
} from './fixtures/index'

const BASE = '/api'

export const handlers = [
  // Overview
  http.get(`${BASE}/overview`, async () => {
    await delay()
    return HttpResponse.json({ agents, augmentedSummary })
  }),

  // Agents list
  http.get(`${BASE}/agents`, async () => {
    await delay()
    return HttpResponse.json(agents)
  }),

  // Single agent
  http.get(`${BASE}/agents/:agentId`, async ({ params }) => {
    await delay()
    const agent = agentSummaryFor(params.agentId as string)
    if (!agent) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(agent)
  }),

  // Sessions for agent
  http.get(`${BASE}/agents/:agentId/sessions`, async ({ params }) => {
    await delay()
    return HttpResponse.json(sessionsFor(params.agentId as string))
  }),

  // Session detail
  http.get(`${BASE}/sessions/:sessionId`, async ({ params }) => {
    await delay()
    const detail = sessionDetailFor(params.sessionId as string)
    if (!detail) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(detail)
  }),

  // Tool reliability
  http.get(`${BASE}/agents/:agentId/tool-reliability`, async ({ params }) => {
    await delay()
    return HttpResponse.json(toolReliabilityFor(params.agentId as string))
  }),

  // KPIs
  http.get(`${BASE}/agents/:agentId/kpis`, async ({ params }) => {
    await delay()
    return HttpResponse.json(kpisFor(params.agentId as string))
  }),

  // Recommendations
  http.get(`${BASE}/agents/:agentId/recommendations`, async ({ params }) => {
    await delay()
    return HttpResponse.json(recommendationsFor(params.agentId as string))
  }),

  // Versions
  http.get(`${BASE}/agents/:agentId/versions`, async ({ params }) => {
    await delay()
    return HttpResponse.json(versionsFor(params.agentId as string))
  }),

  // Version compare
  http.get(`${BASE}/agents/:agentId/version-compare`, async ({ params }) => {
    await delay()
    return HttpResponse.json(versionCompareFor(params.agentId as string))
  }),

  // Ingestion settings
  http.get(`${BASE}/ingestion`, async () => {
    await delay()
    return HttpResponse.json(ingestionSettings())
  }),
]
