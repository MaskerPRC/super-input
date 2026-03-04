<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-subtitle">Configure monitors, API endpoints, and polling</p>
    </div>

    <!-- External API -->
    <div class="card">
      <div class="card-title">External API</div>
      <div class="form-group">
        <label class="form-label">Push Endpoint URL</label>
        <input type="url" v-model="config.external_api_url" @change="save('external_api_url')" placeholder="https://your-server.com/api/events" />
        <div class="form-hint">System events will be POSTed to this URL</div>
      </div>
      <div class="form-group">
        <label class="form-label">API Key</label>
        <input type="password" v-model="config.external_api_key" @change="save('external_api_key')" placeholder="Bearer token" />
      </div>
    </div>

    <!-- Polling -->
    <div class="card">
      <div class="card-title">Polling</div>
      <div class="form-group">
        <label class="form-label">Polling Endpoint URL</label>
        <input type="url" v-model="config.polling_url" @change="save('polling_url')" placeholder="https://your-server.com/api/commands" />
        <div class="form-hint">The app will poll this URL for pending commands</div>
      </div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">Polling Interval (ms)</label>
        <input type="number" v-model="config.polling_interval" @change="save('polling_interval')" style="width: 120px;" min="1000" step="1000" />
      </div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">Enabled</label>
        <Toggle :model-value="config.polling_enabled === 'true'" @update:model-value="toggleConfig('polling_enabled', $event)" />
      </div>
    </div>

    <!-- Local API -->
    <div class="card">
      <div class="card-title">Local API Server</div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">Port</label>
        <input type="number" v-model="config.local_api_port" @change="save('local_api_port')" style="width: 120px;" />
      </div>
      <div class="form-group">
        <label class="form-label">API Key (optional)</label>
        <input type="password" v-model="config.local_api_key" @change="save('local_api_key')" placeholder="Leave empty for no auth" />
      </div>
    </div>

    <!-- Monitors -->
    <div class="card">
      <div class="card-title">Monitors</div>
      <div v-for="m in monitorList" :key="m.key" class="flex items-center justify-between" style="padding: 10px 0; border-bottom: 1px solid var(--gray-200);">
        <div>
          <span style="font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">{{ m.label }}</span>
          <span style="font-size: 11px; color: var(--gray-500); margin-left: 8px;">{{ m.desc }}</span>
        </div>
        <Toggle :model-value="config[m.key] === 'true'" @update:model-value="toggleMonitor(m.name, $event)" />
      </div>
    </div>

    <!-- Clipboard Config -->
    <div class="card">
      <div class="card-title">Clipboard Settings</div>
      <div class="form-group">
        <label class="form-label">Watch Types</label>
        <input type="text" v-model="config.clipboard_watch_types" @change="save('clipboard_watch_types')" placeholder="text,image,file" />
        <div class="form-hint">Comma-separated: text, image, file</div>
      </div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">Max File Size (bytes)</label>
        <input type="number" v-model="config.clipboard_max_file_size" @change="save('clipboard_max_file_size')" style="width: 160px;" />
      </div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">Push Text</label>
        <Toggle :model-value="config.clipboard_push_text === 'true'" @update:model-value="toggleConfig('clipboard_push_text', $event)" />
      </div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">Push Images</label>
        <Toggle :model-value="config.clipboard_push_image === 'true'" @update:model-value="toggleConfig('clipboard_push_image', $event)" />
      </div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">Push Files</label>
        <Toggle :model-value="config.clipboard_push_file === 'true'" @update:model-value="toggleConfig('clipboard_push_file', $event)" />
      </div>
    </div>

    <!-- Maintenance -->
    <div class="card">
      <div class="card-title">Maintenance</div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">Log Retention (days)</label>
        <input type="number" v-model="config.log_retention_days" @change="save('log_retention_days')" style="width: 100px;" />
      </div>
      <button class="btn" @click="cleanupLogs">CLEANUP OLD LOGS</button>
    </div>

    <div v-if="saved" style="position: fixed; bottom: 60px; right: 24px; background: #000; color: #fff; padding: 8px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
      Saved
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useElectron } from '../composables/useElectron'
import Toggle from '../components/Toggle.vue'

const api = useElectron()

const config = ref<Record<string, string>>({})
const saved = ref(false)
let saveTimeout: ReturnType<typeof setTimeout> | null = null

const monitorList = [
  { key: 'monitor_clipboard', name: 'clipboard', label: 'Clipboard', desc: 'Text, image, file changes' },
  { key: 'monitor_window', name: 'window', label: 'Window', desc: 'Active window tracking' },
  { key: 'monitor_power', name: 'power', label: 'Power', desc: 'Boot, suspend, resume, shutdown' },
  { key: 'monitor_lock', name: 'lock', label: 'Lock Screen', desc: 'Lock/unlock detection' },
  { key: 'monitor_usb', name: 'usb', label: 'USB', desc: 'Device plug/unplug' },
  { key: 'monitor_network', name: 'network', label: 'Network', desc: 'Connection & IP changes' },
  { key: 'monitor_idle', name: 'idle', label: 'Idle', desc: 'System idle detection' }
]

async function loadConfig() {
  config.value = await api.getConfig()
}

async function save(key: string) {
  await api.setConfig(key, config.value[key])
  showSaved()
}

async function toggleConfig(key: string, value: boolean) {
  config.value[key] = value ? 'true' : 'false'
  await save(key)
}

async function toggleMonitor(name: string, enabled: boolean) {
  const key = `monitor_${name}`
  config.value[key] = enabled ? 'true' : 'false'
  await api.setConfig(key, config.value[key])
  if (enabled) {
    await api.startMonitor(name)
  } else {
    await api.stopMonitor(name)
  }
  showSaved()
}

async function cleanupLogs() {
  await api.cleanupLogs()
  showSaved()
}

function showSaved() {
  saved.value = true
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => { saved.value = false }, 1500)
}

onMounted(loadConfig)
</script>
