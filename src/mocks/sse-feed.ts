import type { LiveEvent, EventKind } from '@/api/types'

const SCRIPTED_EVENTS: Omit<LiveEvent, 'id' | 'ago'>[] = [
  { kind: 'fail',   title: 'Timezone confirmed before booking', agent: 'After-Hours Booking', detail: 'Failed · evidence at 0:36 · APT-44218' },
  { kind: 'pass',   title: 'Service address collected',         agent: 'After-Hours Booking', detail: 'Passed · 412 Mariposa St, San Mateo' },
  { kind: 'pass',   title: 'Satisfaction question asked',       agent: 'Service Follow-Up',   detail: 'Passed · evidence at 0:18' },
  { kind: 'graded', title: 'Session c-44218 finished grading',  agent: 'After-Hours Booking', detail: '3 of 5 KPIs passed · 2:21 duration' },
  { kind: 'fail',   title: 'Emergency detection',               agent: 'After-Hours Booking', detail: 'Failed · caller mentioned "as soon as possible"' },
  { kind: 'alert',  title: 'Pass rate threshold breached',      agent: 'After-Hours Booking', detail: 'Timezone query at 38% (< 50% threshold)' },
  { kind: 'pass',   title: 'Appointment booked',                agent: 'After-Hours Booking', detail: 'Passed · book_appointment succeeded' },
  { kind: 'pass',   title: 'Review request made',               agent: 'Service Follow-Up',   detail: 'Passed' },
  { kind: 'pass',   title: 'Reschedule offer made',             agent: 'Maintenance Reminder', detail: 'Passed' },
  { kind: 'fail',   title: 'Stayed under 4 minutes',            agent: 'After-Hours Booking', detail: 'Failed · call was 4:51' },
  { kind: 'pass',   title: 'Confirmed maintenance type',        agent: 'Maintenance Reminder', detail: 'Passed · "AC tune-up"' },
  { kind: 'graded', title: 'Session c-44215 finished grading',  agent: 'Service Follow-Up',   detail: '3 of 3 KPIs passed · 1:48 duration' },
]

const LOOP_VARIANTS: Omit<LiveEvent, 'id' | 'ago'>[] = [
  { kind: 'pass',   title: 'Service address collected',         agent: 'After-Hours Booking', detail: 'Passed · evidence at 0:24' },
  { kind: 'pass',   title: 'Satisfaction question asked',       agent: 'Service Follow-Up',   detail: 'Passed · evidence at 0:11' },
  { kind: 'fail',   title: 'Timezone confirmed before booking', agent: 'After-Hours Booking', detail: 'Failed · no timezone confirmation found' },
  { kind: 'pass',   title: 'Appointment booked',                agent: 'After-Hours Booking', detail: 'Passed · book_appointment succeeded' },
  { kind: 'pass',   title: 'Reschedule offer made',             agent: 'Maintenance Reminder', detail: 'Passed' },
  { kind: 'fail',   title: 'Emergency detection',               agent: 'After-Hours Booking', detail: 'Failed · keyword not detected in opener' },
  { kind: 'pass',   title: 'Confirmed maintenance type',        agent: 'Maintenance Reminder', detail: 'Passed · "AC tune-up"' },
]

function formatAge(secs: number): string {
  if (secs < 60) return `${secs}s ago`
  return `${Math.floor(secs / 60)}m ago`
}

export class MockSSEFeed {
  private counter = 1000
  private loopIndex = 0

  seedEvents(): LiveEvent[] {
    const ages = [4, 8, 14, 21, 28, 44, 58, 84, 102, 130, 168, 220]
    return SCRIPTED_EVENTS.map((e, i) => ({
      ...e,
      id: `e-seed-${i}`,
      ago: formatAge(ages[i] ?? i * 10),
    }))
  }

  nextEvent(): LiveEvent {
    this.counter++
    this.loopIndex = (this.loopIndex + 1) % LOOP_VARIANTS.length
    const base = LOOP_VARIANTS[this.loopIndex]
    return {
      ...base,
      id: `e-${Date.now()}-${this.counter}`,
      ago: 'just now',
      kind: base.kind as EventKind,
    }
  }
}
