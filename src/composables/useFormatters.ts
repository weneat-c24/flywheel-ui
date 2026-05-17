export function useFormatters() {
  function fmtNum(n: number): string {
    return n.toLocaleString()
  }
  function fmtPct(n: number): string {
    return `${n}%`
  }
  function sevColor(sev: string): string {
    return sev === 'crit' ? 'var(--critical)' : sev === 'warn' ? 'var(--warning)' : sev === 'ok' ? 'var(--success)' : 'var(--ink-3)'
  }
  return { fmtNum, fmtPct, sevColor }
}
