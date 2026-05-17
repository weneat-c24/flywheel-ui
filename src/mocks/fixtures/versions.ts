import type { Version, VersionCompare } from '@/api/types'
import { recs } from './recommendations'

export const versions: Version[] = [
  { id: 'v4', label: 'v4', when: '2m ago',     source: 'External platform', summary: 'Added timezone confirmation step before booking. Removed false claims about lookup_history.', passRate: 81, sessionsUnder: 38,  trend: 'up',   delta: +19, fresh: true },
  { id: 'v3', label: 'v3', when: '3 days ago',  source: 'External platform', summary: 'Added emergency keyword handling earlier in the session.',                                       passRate: 62, sessionsUnder: 218, trend: 'up',   delta: +1 },
  { id: 'v2', label: 'v2', when: '10 days ago', source: 'External platform', summary: 'Minor: shortened opening greeting.',                                                              passRate: 61, sessionsUnder: 42,  trend: 'flat', delta: 0 },
  { id: 'v1', label: 'v1', when: '14 days ago', source: 'External platform', summary: 'Initial config snapshot received.',                                                               passRate: 61, sessionsUnder: 14,  trend: 'flat', delta: 0 },
]

export const versionCompare: VersionCompare = {
  base: 'v3',
  head: 'v4',
  headline: { label: 'Booking rate', before: 62, after: 81, delta: 19 },
  honestyHeadline: { label: 'lookup_history FP rate', before: 26, after: 4, delta: -22 },
  perKpi: [
    { kpi: 'Appointment booked',               before: 68, after: 84, delta: 16 },
    { kpi: 'Timezone confirmed before booking', before: 38, after: 92, delta: 54 },
    { kpi: 'Service address collected',         before: 91, after: 92, delta: 1 },
    { kpi: 'Emergency detection',               before: 74, after: 76, delta: 2 },
    { kpi: 'Stayed under 4 minutes',            before: 81, after: 79, delta: -2 },
  ],
  promptDiff: recs[0],
  appliedRecs: ['r1', 'sk2'],
  sessionsBefore: 218,
  sessionsAfter: 38,
}
