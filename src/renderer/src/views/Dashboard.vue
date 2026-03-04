<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">System monitor overview</p>
    </div>

    <div class="stat-grid">
      <StatCard :value="stats.todayEvents" label="Today Events" />
      <StatCard :value="stats.todayActions" label="Today Actions" />
      <StatCard :value="stats.totalEvents" label="Total Events" />
      <StatCard :value="stats.totalActions" label="Total Actions" />
    </div>

    <div class="card">
      <div class="card-title">Monitor Status</div>
      <div class="flex gap-3" style="flex-wrap: wrap;">
        <div
          v-for="(active, name) in monitors"
          :key="name"
          class="flex items-center gap-2"
          style="min-width: 140px; padding: 8px 0;"
        >
          <div class="status-dot" :class="{ active }" style="border-color: #000;"></div>
          <span style="text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: 1px;">
            {{ name }}
          </span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Event Distribution</div>
      <div class="flex gap-3" style="flex-wrap: wrap;">
        <div
          v-for="item in stats.eventsByType"
          :key="item.event_type"
          style="padding: 12px 20px; border: var(--border); text-align: center;"
        >
          <div style="font-size: 24px; font-weight: 800;">{{ item.count }}</div>
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--gray-500);">
            {{ item.event_type }}
          </div>
        </div>
      </div>
      <div v-if="!stats.eventsByType?.length" class="empty-state" style="padding: 24px;">
        <div class="empty-state-text">No events yet</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title flex items-center justify-between">
        <span>Live Events</span>
        <span class="badge badge-filled">REAL-TIME</span>
      </div>
      <div style="max-height: 300px; overflow-y: auto;">
        <div
          v-for="(event, i) in liveEvents"
          :key="i"
          style="padding: 6px 0; border-bottom: 1px solid var(--gray-200); font-size: 12px;"
        >
          <span class="badge" style="margin-right: 8px;">{{ (event as any).type }}</span>
          <span style="color: var(--gray-500);">{{ (event as any).timestamp }}</span>
          <span style="margin-left: 8px;">{{ truncate(JSON.stringify((event as any).data)) }}</span>
        </div>
        <div v-if="liveEvents.length === 0" style="padding: 16px; text-align: center; color: var(--gray-400);">
          Waiting for events...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useElectron, useSystemEvents } from '../composables/useElectron'
import StatCard from '../components/StatCard.vue'

const api = useElectron()
const { events: liveEvents } = useSystemEvents()

const stats = ref({
  todayEvents: 0,
  todayActions: 0,
  totalEvents: 0,
  totalActions: 0,
  totalPolling: 0,
  eventsByType: [] as { event_type: string; count: number }[]
})
const monitors = ref<Record<string, boolean>>({})

let refreshTimer: ReturnType<typeof setInterval> | null = null

async function loadData() {
  try {
    stats.value = await api.getStats()
    monitors.value = await api.getMonitorStatus()
  } catch {
    // ignore
  }
}

function truncate(str: string, len = 80): string {
  return str.length > len ? str.slice(0, len) + '...' : str
}

onMounted(() => {
  loadData()
  refreshTimer = setInterval(loadData, 5000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
