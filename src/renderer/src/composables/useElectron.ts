import { ref, onMounted, onUnmounted } from 'vue'

const api = () => window.electronAPI

export function useElectron() {
  return api()
}

export function useSystemEvents() {
  const events = ref<unknown[]>([])
  let cleanup: (() => void) | null = null

  onMounted(() => {
    cleanup = api().onSystemEvent((event) => {
      events.value.unshift(event)
      if (events.value.length > 200) {
        events.value = events.value.slice(0, 200)
      }
    })
  })

  onUnmounted(() => {
    cleanup?.()
  })

  return { events }
}
