<template>
  <div class="table-container">
    <table v-if="rows.length > 0">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :style="col.width ? { width: col.width } : {}">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td v-for="col in columns" :key="col.key" :title="String(getCellValue(row, col.key))">
            <span v-if="col.key === 'event_type' || col.key === 'action_type' || col.key === 'source'">
              <span class="badge">{{ getCellValue(row, col.key) }}</span>
            </span>
            <span v-else-if="col.key === 'pushed'">
              <span class="badge" :class="{ 'badge-filled': getCellValue(row, col.key) }">
                {{ getCellValue(row, col.key) ? 'YES' : 'NO' }}
              </span>
            </span>
            <span v-else>{{ formatValue(getCellValue(row, col.key)) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty-state">
      <div class="empty-state-icon">[ ]</div>
      <div class="empty-state-text">No data</div>
    </div>

    <div v-if="rows.length > 0" class="flex items-center justify-between mt-4">
      <span style="font-size: 11px; color: var(--gray-500);">
        Showing {{ rows.length }} records
      </span>
      <div class="flex gap-2">
        <button class="btn btn-sm" :disabled="page <= 1" @click="$emit('page', page - 1)">PREV</button>
        <button class="btn btn-sm" :disabled="rows.length < pageSize" @click="$emit('page', page + 1)">NEXT</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string; width?: string }[]
  rows: Record<string, unknown>[]
  page: number
  pageSize: number
}>()

defineEmits<{ page: [page: number] }>()

function getCellValue(row: Record<string, unknown>, key: string): unknown {
  return row[key]
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'string' && val.length > 80) return val.slice(0, 80) + '...'
  return String(val)
}
</script>
