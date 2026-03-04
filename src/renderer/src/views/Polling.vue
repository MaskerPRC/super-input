<template>
  <div>
    <div class="page-header flex items-center justify-between">
      <div>
        <h1 class="page-title">Polling</h1>
        <p class="page-subtitle">External service polling status and history</p>
      </div>
      <div class="flex gap-2">
        <button class="btn" :class="{ 'btn-primary': !pollingActive }" @click="togglePolling">
          {{ pollingActive ? 'STOP POLLING' : 'START POLLING' }}
        </button>
        <button class="btn btn-sm" @click="loadData">REFRESH</button>
      </div>
    </div>

    <div class="stat-grid">
      <StatCard :value="pollingActive ? 'ACTIVE' : 'STOPPED'" label="Status" />
      <StatCard :value="pollingUrl || 'NOT SET'" label="Endpoint" />
      <StatCard :value="rows.length" label="Log Entries" />
    </div>

    <LogTable
      :columns="columns"
      :rows="rows"
      :page="page"
      :page-size="pageSize"
      @page="onPage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useElectron } from '../composables/useElectron'
import StatCard from '../components/StatCard.vue'
import LogTable from '../components/LogTable.vue'

const api = useElectron()

const columns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'request_url', label: 'URL', width: '200px' },
  { key: 'response_status', label: 'Status', width: '80px' },
  { key: 'commands_count', label: 'Cmds', width: '60px' },
  { key: 'response_body', label: 'Response' },
  { key: 'created_at', label: 'Time', width: '160px' }
]

const rows = ref<Record<string, unknown>[]>([])
const page = ref(1)
const pageSize = 50
const pollingActive = ref(false)
const pollingUrl = ref('')

async function loadData() {
  try {
    rows.value = (await api.getPollingLogs(pageSize, (page.value - 1) * pageSize)) as Record<string, unknown>[]
    pollingActive.value = await api.isPollingActive()
    pollingUrl.value = await api.getConfigValue('polling_url')
  } catch {
    rows.value = []
  }
}

async function togglePolling() {
  if (pollingActive.value) {
    await api.stopPolling()
  } else {
    await api.startPolling()
  }
  pollingActive.value = await api.isPollingActive()
}

function onPage(p: number) {
  page.value = p
  loadData()
}

watch(page, loadData)
onMounted(loadData)
</script>
