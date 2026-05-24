export function isMockMode(): boolean {
  const params = new URLSearchParams(window.location.search)
  if (params.has('mock')) {
    const val = params.get('mock') !== 'false'
    sessionStorage.setItem('useMock', String(val))
    return val
  }
  const stored = sessionStorage.getItem('useMock')
  if (stored !== null) return stored === 'true'
  return import.meta.env.VITE_USE_MOCK === 'true'
}
