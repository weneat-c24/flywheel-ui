import type { AugmentedSummary } from '@/api/types'

export const augmentedSummary: AugmentedSummary = {
  agentId: 'a1',
  windowDays: 7,
  findings: [
    { id: 'af1', label: 'Negative sentiment despite KPI pass', count: 12, sev: 'warn', clusterId: 'sk1' },
    { id: 'af2', label: 'Unhandled caller questions',          count: 8,  sev: 'warn' },
    { id: 'af3', label: 'Agent rushed booking close',          count: 5,  sev: 'info' },
    { id: 'af4', label: 'Tool claimed but not invoked',        count: 23, sev: 'crit', clusterId: 'sk2' },
  ],
}
