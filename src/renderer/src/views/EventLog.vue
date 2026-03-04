<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">{{ t('events.title') }}</h1>
      <p class="page-subtitle">{{ t('events.subtitle') }}</p>
    </div>

    <div class="filter-bar">
      <button
        class="filter-chip"
        :class="{ active: !filterType }"
        @click="filterType = ''"
      >{{ t('events.all') }}</button>
      <button
        v-for="type in eventTypes"
        :key="type"
        class="filter-chip"
        :class="{ active: filterType === type }"
        @click="filterType = type"
      >{{ type }}</button>
      <div style="flex: 1;"></div>
      <button class="btn btn-sm" @click="loadData">{{ t('events.refresh') }}</button>
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
  { key: 'id', label: t('events.id'), width: '60px' },
  { key: 'event_type', label: t('events.type'), width: '100px' },
  { key: 'event_data', label: t('events.data') },
  { key: 'pushed', label: t('events.pushed'), width: '80px' },
  { key: 'created_at', label: t('events.time'), width: '160px' }
])

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
