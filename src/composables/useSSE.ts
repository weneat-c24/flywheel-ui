import { ref, onUnmounted } from 'vue'
import type { LiveEvent } from '@/api/types'
import { MockSSEFeed } from '@/mocks/sse-feed'
import { isMockMode } from '@/utils/mockMode'

export function useSSE() {
  const events = ref<LiveEvent[]>([])
  const paused = ref(false)

  let cleanup: (() => void) | null = null

  if (isMockMode()) {
    const feed = new MockSSEFeed()
    events.value = feed.seedEvents()

    let intervalId: ReturnType<typeof setInterval> | null = null

    intervalId = setInterval(() => {
      if (!paused.value) {
        events.value = [feed.nextEvent(), ...events.value].slice(0, 50)
      }
    }, 2500)

    cleanup = () => { if (intervalId) clearInterval(intervalId) }
  } else {
    const source = new EventSource('/api/events')

    source.onmessage = (e) => {
      if (paused.value) return
      try {
        const event: LiveEvent = JSON.parse(e.data)
        events.value = [event, ...events.value].slice(0, 50)
      } catch {
        // ignore malformed frames
      }
    }

    cleanup = () => source.close()
  }

  onUnmounted(() => cleanup?.())

  return { events, paused }
}
