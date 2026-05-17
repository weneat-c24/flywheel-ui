import { ref, onUnmounted } from 'vue'
import type { LiveEvent } from '@/api/types'
import { MockSSEFeed } from '@/mocks/sse-feed'

export function useSSE() {
  const feed = new MockSSEFeed()
  const events = ref<LiveEvent[]>(feed.seedEvents())
  const paused = ref(false)

  let intervalId: ReturnType<typeof setInterval> | null = null

  function start() {
    if (intervalId) return
    intervalId = setInterval(() => {
      if (!paused.value) {
        events.value = [feed.nextEvent(), ...events.value].slice(0, 50)
      }
    }, 2500)
  }

  function stop() {
    if (intervalId) { clearInterval(intervalId); intervalId = null }
  }

  start()
  onUnmounted(stop)

  return { events, paused, start, stop }
}
