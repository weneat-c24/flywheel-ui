export function cx(...args: (string | undefined | null | false | Record<string, boolean>)[]): string {
  return args
    .flatMap(a => {
      if (!a) return []
      if (typeof a === 'string') return [a]
      return Object.entries(a).filter(([, v]) => v).map(([k]) => k)
    })
    .join(' ')
}
