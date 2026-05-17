import type { TickerItem } from '@/api/types'

export const ticker: TickerItem[] = [
  { when: '2m ago', text: 'After-Hours Booking Agent v4 config received', kind: 'info' },
  { when: '8m ago', text: 'Tool-honesty alert: lookup_history FP rate 26% on v3', kind: 'alert' },
  { when: '2h ago', text: '47 sessions ingested in the last hour', kind: 'info' },
  { when: '4h ago', text: 'New recommendation: Confirm timezone before booking', kind: 'rec' },
  { when: '1d ago', text: 'Pass rate dropped 12% on After-Hours Booking Agent', kind: 'alert' },
  { when: '2d ago', text: 'New KPI suggestion: Customer Frustration', kind: 'rec' },
]
