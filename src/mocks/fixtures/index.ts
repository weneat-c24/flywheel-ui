export { agents } from './agents'
export { kpis } from './kpis'
export { sessionPool } from './sessions'
export { sessionDetail } from './session-detail'
export { toolReliability } from './tool-reliability'
export { recs, suggestedKpis } from './recommendations'
export { versions, versionCompare } from './versions'
export { ingestion } from './settings'
export { ticker } from './ticker'
export { augmentedSummary } from './overview'

import { agents } from './agents'
import { sessionPool } from './sessions'
import { sessionDetail } from './session-detail'
import { kpis } from './kpis'
import { toolReliability } from './tool-reliability'
import { recs, suggestedKpis } from './recommendations'
import { versions, versionCompare } from './versions'
import { ingestion } from './settings'

// Helper functions

export function agentSummaryFor(id: string) {
  return agents.find(a => a.id === id)
}

export function dashboardFor(agentId: string) {
  return {
    agent: agents.find(a => a.id === agentId),
    sessions: sessionPool.filter(s => s.agent === agentId),
    kpis,
    toolReliability,
    recs: recs.filter(r => r.agentId === agentId),
    suggestedKpis: suggestedKpis.filter(s => s.agentId === agentId),
  }
}

export function sessionsFor(agentId: string) {
  return sessionPool.filter(s => s.agent === agentId)
}

export function sessionDetailFor(sessionId: string) {
  if (sessionId === 'c4') return sessionDetail
  const found = sessionPool.find(s => s.id === sessionId)
  if (!found) return null
  // Return a simplified version for non-c4 sessions
  return {
    ...sessionDetail,
    id: found.id,
    time: found.time,
    duration: found.dur,
    caller: found.caller,
    outcome: found.outcome,
    version: found.version,
  }
}

export function toolReliabilityFor(_agentId: string) {
  return toolReliability
}

export function kpisFor(_agentId: string) {
  return kpis
}

export function recommendationsFor(agentId: string) {
  return {
    recs: recs.filter(r => r.agentId === agentId),
    suggestedKpis: suggestedKpis.filter(s => s.agentId === agentId),
  }
}

export function updateRecommendation(id: string, status: string) {
  const rec = recs.find(r => r.id === id)
  if (rec) rec.status = status as 'open' | 'applied' | 'dismissed'
  return rec
}

export function configFor(_agentId: string) {
  return {
    systemPrompt: [
      'You are Avery, the after-hours scheduling assistant for Reliable Air HVAC.',
      'Your job is to book HVAC service appointments, route emergencies, and capture lead information.',
      '',
      '// Opening turn',
      'Greet the caller, identify yourself, ask how you can help.',
      '',
      '// Booking flow',
      'When a caller wants to schedule service:',
      '  1. Confirm service address',
      '  2. Offer available slots from check_availability',
      '  3. Call book_appointment with chosen slot',
      '',
      '// Emergency handling',
      'If caller indicates urgency, ask "is this an emergency".',
      'If yes, immediately call escalate_emergency.',
    ],
    tools: [
      { name: 'check_availability', description: 'Look up appointment slots' },
      { name: 'book_appointment', description: 'Create a service appointment' },
      { name: 'lookup_history', description: 'Pull caller account & past service history' },
      { name: 'escalate_emergency', description: 'Route emergency to on-call dispatcher' },
    ],
    voice: 'Avery — Warm female (en-US)',
    model: 'gpt-4o-mini-realtime',
    temperature: 0.40,
  }
}

export function versionsFor(_agentId: string) {
  return versions
}

export function versionCompareFor(_agentId: string) {
  return versionCompare
}

export function ingestionSettings() {
  return ingestion
}
