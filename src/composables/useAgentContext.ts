import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useAgentContext() {
  const route = useRoute()
  const agentId = computed(() => route.params.agentId as string | undefined)
  return { agentId }
}
