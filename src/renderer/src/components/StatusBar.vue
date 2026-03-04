<template>
  <div class="status-bar">
    <div class="status-item">
      <div class="status-dot" :class="{ active: apiActive }"></div>
      <span>{{ t('status.api') }}</span>
    </div>
    <div class="status-item">
      <div class="status-dot" :class="{ active: pollingActive }"></div>
      <span>{{ t('status.polling') }}</span>
    </div>
    <div class="status-item">
      <div class="status-dot" :class="{ active: monitorsCount > 0 }"></div>
      <span>{{ t('status.monitors') }}: {{ monitorsCount }}</span>
    </div>
    <div style="flex:1"></div>
    <div class="status-item">
      <span>{{ currentTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useElectron } from '../composables/useElectron'
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()
const apiActive = ref(true)
const pollingActive = ref(false)
const monitorsCount = ref(0)
const currentTime = ref('')

let timer: ReturnType<typeof setInterval> | null = null

function updateTime() {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

async function refreshStatus() {
  try {
    const api = useElectron()
    pollingActive.value = await api.isPollingActive()
    const status = await api.getMonitorStatus()
    monitorsCount.value = Object.values(status).filter(Boolean).length
  } catch {
    // ignore
  }
}

onMounted(() => {
  updateTime()
  refreshStatus()
  timer = setInterval(() => {
    updateTime()
    refreshStatus()
  }, 3000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
