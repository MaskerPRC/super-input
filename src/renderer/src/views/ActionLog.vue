<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Action Log</h1>
      <p class="page-subtitle">Actions executed via local API</p>
    </div>

    <div class="filter-bar">
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
  { key: 'action_type', label: 'Type', width: '120px' },
  { key: 'source', label: 'Source', width: '100px' },
  { key: 'action_data', label: 'Data' },
  { key: 'result', label: 'Result', width: '200px' },
  { key: 'created_at', label: 'Time', width: '160px' }
]

const rows = ref<Record<string, unknown>[]>([])
const page = ref(1)
const pageSize = 50

async function loadData() {
  try {
    rows.value = (await api.getActionLogs(
      pageSize,
      (page.value - 1) * pageSize
    )) as Record<string, unknown>[]
  } catch {
    rows.value = []
  }
}

function onPage(p: number) {
  page.value = p
  loadData()
}

watch(page, loadData)
onMounted(loadData)
</script>
