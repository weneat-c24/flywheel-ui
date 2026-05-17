// ====== Core Types ======

export type SessionType = 'voice' | 'chat'
export type AgentStatus = 'active' | 'quiet' | 'dormant'
export type Severity = 'crit' | 'warn' | 'ok' | 'info'
export type SessionOutcome = 'booked' | 'voicemail' | 'hangup' | 'transferred'
export type RecStatus = 'open' | 'applied' | 'dismissed'
export type KpiType = 'binary' | 'compliance_phrase' | 'numeric_threshold'
export type VersionTrend = 'up' | 'down' | 'flat'
export type TickerKind = 'info' | 'alert' | 'rec'
export type EventKind = 'pass' | 'fail' | 'graded' | 'alert'

// ====== Agent ======

export interface Agent {
  id: string
  name: string
  externalAgentId: string
  sessionTypes: SessionType[]
  status: AgentStatus
  lastSessionAt: string
  firstSeenAt: string
  sessions7d: number
  sessionsPrev7d: number
  passRate: number
  passRatePrev: number
  passSpark: number[]
  honestyScore: number
  honestyPrev: number
  honestySpark: number[]
  topFPTool: string | null
  topFPRate: number
  openRecs: number
  suggestedKpiCount: number
  highImpactRecs: number
  topFailKPI: string
  currentVersion: string
}

// ====== KPI ======

export interface KpiPromptSuggestion {
  headline: string
  whyMatters: string
  lift: string
  clusterSize: number
  relatedRecId?: string
  currentBehavior: string[]
  suggestedPrompt: string[]
}

export interface Kpi {
  id: string
  name: string
  type: KpiType
  weight: number
  dependency?: string
  definition: string
  passRate: number
  sessions: number
  sinceVersion: string
  promptSuggestion?: KpiPromptSuggestion
}

// ====== Session ======

export interface SessionSummary {
  id: string
  agent: string
  type: SessionType
  time: string
  dur: string
  caller: string
  outcome: SessionOutcome
  passed: string
  maxSev: Severity
  failedKpis: string[]
  fp: number
  frustration?: boolean
  version: string
}

export interface TranscriptTurn {
  spk: 'agent' | 'caller' | 'tool'
  ts: string
  text?: string
  // tool fields
  name?: string
  args?: string
  result?: string
  ok?: boolean
  // flags
  flagged?: boolean
  flag?: Severity
  flagText?: string
  fpFlag?: boolean
  fpTool?: string
  fpText?: string
  augFlag?: boolean
  augText?: string
}

export interface GradingResult {
  kpi: string
  result: 'pass' | 'fail'
  sev: Severity
  reasoning?: string
  anchorTs?: string
}

export interface AugmentedFinding {
  type: string
  sev: Severity
  reasoning: string
  anchorTs?: string
  clusterId?: string
}

export interface ToolHonestyEntry {
  tool: string
  tp: number
  fp: number
  tn: number
  fn: number
}

export interface SessionDetail {
  id: string
  agent: string
  type: SessionType
  time: string
  duration: string
  caller: string
  outcome: SessionOutcome
  version: string
  transcript: TranscriptTurn[]
  grading: GradingResult[]
  augmentedFindings: AugmentedFinding[]
  toolHonesty: ToolHonestyEntry[]
}

// ====== Tool Reliability ======

export interface ToolPromptSuggestion {
  severity: Severity
  headline: string
  whyMatters: string
  lift: string
  currentBehavior: string[]
  suggestedPrompt: string[]
}

export interface ToolEntry {
  tool: string
  description: string
  tp: number
  fp: number
  tn: number
  fn: number
  sampleFPSessions: string[]
  honest: boolean
  promptSuggestion?: ToolPromptSuggestion
}

export interface ExplainerEntry {
  code: string
  label: string
  sev: Severity
}

export interface ToolReliability {
  agentId: string
  version: string
  windowDays: number
  honestyScore: number
  honestyPrev: number
  sessionsWithAnyFP: number
  sessionsTotal: number
  tools: ToolEntry[]
  explainer: ExplainerEntry[]
}

// ====== Augmented Summary ======

export interface AugmentedFindingSummary {
  id: string
  label: string
  count: number
  sev: Severity
  clusterId?: string
}

export interface AugmentedSummary {
  agentId: string
  windowDays: number
  findings: AugmentedFindingSummary[]
}

// ====== Recommendations ======

export interface PromptRec {
  id: string
  agentId: string
  type: 'prompt'
  title: string
  summary: string
  clusterSize: number
  sampleSize: number
  windowDays: number
  affectedKPIs: string[]
  lift: string
  status: RecStatus
  promptCurrent: string[]
  promptSuggested: string[]
  sampleSessions: string[]
}

export interface ProposedKpi {
  name: string
  type: KpiType
  weight: number
  dependency: string | null
  definition: string
}

export interface SuggestedKpi {
  id: string
  agentId: string
  title: string
  whyMatters: string
  basis: string
  windowDays: number
  sampleSessions: string[]
  proposed: ProposedKpi
  promptLanguage: string[]
  status: RecStatus
}

// ====== Versions ======

export interface Version {
  id: string
  label: string
  when: string
  source: string
  summary: string
  passRate: number
  sessionsUnder: number
  trend: VersionTrend
  delta: number
  fresh?: boolean
}

export interface PerKpiCompare {
  kpi: string
  before: number
  after: number
  delta: number
}

export interface VersionCompare {
  base: string
  head: string
  headline: { label: string; before: number; after: number; delta: number }
  honestyHeadline: { label: string; before: number; after: number; delta: number }
  perKpi: PerKpiCompare[]
  promptDiff: PromptRec
  appliedRecs: string[]
  sessionsBefore: number
  sessionsAfter: number
}

// ====== Ticker ======

export interface TickerItem {
  when: string
  text: string
  kind: TickerKind
}

// ====== Ingestion ======

export interface Ingestion {
  webhook: string
  secret: string
  lastEvent: string
  last24h: number
  samplePayload: Record<string, unknown>
}

// ====== Live Monitor Events ======

export interface LiveEvent {
  id: string
  kind: EventKind
  title: string
  agent: string
  detail: string
  ago: string
}
