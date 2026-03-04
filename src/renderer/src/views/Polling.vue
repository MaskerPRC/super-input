<template>
  <div>
    <div class="page-header flex items-center justify-between">
      <div>
        <h1 class="page-title">{{ t('polling.title') }}</h1>
        <p class="page-subtitle">{{ t('polling.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button class="btn" :class="{ 'btn-primary': !pollingActive }" @click="togglePolling">
          {{ pollingActive ? t('polling.stop') : t('polling.start') }}
        </button>
        <button class="btn btn-sm" @click="loadData">{{ t('polling.refresh') }}</button>
      </div>
    </div>

    <div class="stat-grid">
      <StatCard :value="pollingActive ? t('polling.active') : t('polling.stopped')" :label="t('polling.status')" />
      <StatCard :value="pollingUrl || t('polling.notSet')" :label="t('polling.endpoint')" />
      <StatCard :value="rows.length" :label="t('polling.logEntries')" />
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
import StatCard from '../components/StatCard.vue'
import LogTable from '../components/LogTable.vue'

const { t } = useI18n()
const api = useElectron()

const columns = computed(() => [
  { key: 'id', label: t('polling.id'), width: '60px' },
  { key: 'request_url', label: t('polling.url'), width: '200px' },
  { key: 'response_status', label: t('polling.responseStatus'), width: '80px' },
  { key: 'commands_count', label: t('polling.cmds'), width: '60px' },
  { key: 'response_body', label: t('polling.response') },
  { key: 'created_at', label: t('polling.time'), width: '160px' }
])

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
