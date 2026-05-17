export interface DiffLine {
  type: 'add' | 'rem' | 'ctx'
  text: string
}

export function parseDiff(current: string[], suggested: string[]): DiffLine[] {
  const lines: DiffLine[] = []
  for (const l of current) lines.push({ type: 'rem', text: l.replace(/^  /, '') })
  for (const l of suggested) lines.push({ type: 'add', text: l.replace(/^  /, '') })
  return lines
}
