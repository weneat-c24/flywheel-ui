import { ref, watch } from 'vue'

const STORAGE_KEY = 'flywheel-sidebar-collapsed'

function readStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const collapsed = ref(readStorage())

watch(collapsed, val => {
  try { localStorage.setItem(STORAGE_KEY, String(val)) } catch { /* ignore */ }
})

export function useUiState() {
  return {
    collapsed,
    toggleCollapsed: () => { collapsed.value = !collapsed.value },
  }
}
