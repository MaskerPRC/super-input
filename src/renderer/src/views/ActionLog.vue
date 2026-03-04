<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">{{ t('actions.title') }}</h1>
      <p class="page-subtitle">{{ t('actions.subtitle') }}</p>
    </div>

    <div class="filter-bar">
      <button class="btn btn-sm" @click="loadData">{{ t('actions.refresh') }}</button>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useElectron } from '../composables/useElectron'
import { useI18n } from '../composables/useI18n'
import LogTable from '../components/LogTable.vue'

const { t } = useI18n()
const api = useElectron()

const columns = computed(() => [
  { key: 'id', label: t('actions.id'), width: '60px' },
  { key: 'action_type', label: t('actions.type'), width: '120px' },
  { key: 'source', label: t('actions.source'), width: '100px' },
  { key: 'action_data', label: t('actions.data') },
  { key: 'result', label: t('actions.result'), width: '200px' },
  { key: 'created_at', label: t('actions.time'), width: '160px' }
])

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
