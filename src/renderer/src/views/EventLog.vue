<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Event Log</h1>
      <p class="page-subtitle">System events captured by monitors</p>
    </div>

    <div class="filter-bar">
      <button
        class="filter-chip"
        :class="{ active: !filterType }"
        @click="filterType = ''"
      >ALL</button>
      <button
        v-for="t in eventTypes"
        :key="t"
        class="filter-chip"
        :class="{ active: filterType === t }"
        @click="filterType = t"
      >{{ t }}</button>
      <div style="flex: 1;"></div>
      <button class="btn btn-sm" @click="loadData">REFRESH</button>
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
import LogTable from '../components/LogTable.vue'

const api = useElectron()

const columns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'event_type', label: 'Type', width: '100px' },
  { key: 'event_data', label: 'Data' },
  { key: 'pushed', label: 'Pushed', width: '80px' },
  { key: 'created_at', label: 'Time', width: '160px' }
]

const eventTypes = ['clipboard', 'window', 'power', 'lock', 'usb', 'network', 'idle', 'browser']

const rows = ref<Record<string, unknown>[]>([])
const page = ref(1)
const pageSize = 50
const filterType = ref('')

async function loadData() {
  try {
    rows.value = (await api.getEventLogs(
      pageSize,
      (page.value - 1) * pageSize,
      filterType.value || undefined
    )) as Record<string, unknown>[]
  } catch {
    rows.value = []
  }
}

function onPage(p: number) {
  page.value = p
}

watch(filterType, () => {
  page.value = 1
  loadData()
})

watch(page, loadData)

onMounted(loadData)
</script>
