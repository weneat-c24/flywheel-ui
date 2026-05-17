import type { Ingestion } from '@/api/types'

export const ingestion: Ingestion = {
  webhook: 'https://ingest.copilot.app/v1/hvac-reliable-air/9f3a',
  secret: 'whsec_••••••••••••••••5e7c',
  lastEvent: '4 seconds ago',
  last24h: 89,
  samplePayload: {
    type: 'session.end',
    session_id: 'sess_44218',
    external_session_id: 'ghl_call_882199',
    agent_id: 'agt_ahb_8821',
    agent_version: 'v3',
    session_type: 'voice',
    started_at: '2026-05-16T19:44:39Z',
    ended_at: '2026-05-16T19:47:00Z',
    duration_ms: 141000,
    outcome: 'appointment_booked',
    external_kpi_results: [
      { kpi: 'Appointment booked', result: 'pass' },
      { kpi: 'Timezone confirmed before booking', result: 'fail' },
      { kpi: 'Service address collected', result: 'pass' },
      { kpi: 'Emergency detection', result: 'fail' },
      { kpi: 'Stayed under 4 minutes', result: 'pass' },
    ],
    tool_honesty: {
      lookup_history: { tp: 0, fp: 1, tn: 0, fn: 0 },
      book_appointment: { tp: 1, fp: 0, tn: 0, fn: 0 },
    },
    recording_url: 'https://recordings.ghl/r/sess_44218.wav',
  },
}
