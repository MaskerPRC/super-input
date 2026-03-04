<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">{{ t('settings.title') }}</h1>
      <p class="page-subtitle">{{ t('settings.subtitle') }}</p>
    </div>

    <!-- Language -->
    <div class="card">
      <div class="card-title">{{ t('settings.language') }}</div>
      <div class="form-group">
        <div class="form-hint" style="margin-bottom: 8px;">{{ t('settings.languageHint') }}</div>
        <div class="flex gap-2">
          <button class="btn btn-sm" :class="{ 'btn-primary': locale === 'zh' }" @click="switchLang('zh')">{{ t('settings.chinese') }}</button>
          <button class="btn btn-sm" :class="{ 'btn-primary': locale === 'en' }" @click="switchLang('en')">{{ t('settings.english') }}</button>
        </div>
      </div>
    </div>

    <!-- External API -->
    <div class="card">
      <div class="card-title">{{ t('settings.externalApi') }}</div>
      <div class="form-group">
        <label class="form-label">{{ t('settings.pushUrl') }}</label>
        <input type="url" v-model="config.external_api_url" @change="save('external_api_url')" placeholder="https://your-server.com/api/events" />
        <div class="form-hint">{{ t('settings.pushUrlHint') }}</div>
      </div>
      <div class="form-group">
        <label class="form-label">{{ t('settings.apiKey') }}</label>
        <input type="password" v-model="config.external_api_key" @change="save('external_api_key')" placeholder="Bearer token" />
      </div>
    </div>

    <!-- Polling -->
    <div class="card">
      <div class="card-title">{{ t('settings.polling') }}</div>
      <div class="form-group">
        <label class="form-label">{{ t('settings.pollingUrl') }}</label>
        <input type="url" v-model="config.polling_url" @change="save('polling_url')" placeholder="https://your-server.com/api/commands" />
        <div class="form-hint">{{ t('settings.pollingUrlHint') }}</div>
      </div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">{{ t('settings.pollingInterval') }}</label>
        <input type="number" v-model="config.polling_interval" @change="save('polling_interval')" style="width: 120px;" min="1000" step="1000" />
      </div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">{{ t('settings.pollingEnabled') }}</label>
        <Toggle :model-value="config.polling_enabled === 'true'" @update:model-value="toggleConfig('polling_enabled', $event)" />
      </div>
    </div>

    <!-- Local API -->
    <div class="card">
      <div class="card-title">{{ t('settings.localApi') }}</div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">{{ t('settings.port') }}</label>
        <input type="number" v-model="config.local_api_port" @change="save('local_api_port')" style="width: 120px;" />
      </div>
      <div class="form-group">
        <label class="form-label">{{ t('settings.localApiKey') }}</label>
        <input type="password" v-model="config.local_api_key" @change="save('local_api_key')" :placeholder="t('settings.localApiKeyHint')" />
      </div>
    </div>

    <!-- Monitors -->
    <div class="card">
      <div class="card-title">{{ t('settings.monitors') }}</div>
      <div v-for="m in monitorList" :key="m.key" class="flex items-center justify-between" style="padding: 10px 0; border-bottom: 1px solid var(--gray-200);">
        <div>
          <span style="font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">{{ t(m.labelKey) }}</span>
          <span style="font-size: 11px; color: var(--gray-500); margin-left: 8px;">{{ t(m.descKey) }}</span>
        </div>
        <Toggle :model-value="config[m.key] === 'true'" @update:model-value="toggleMonitor(m.name, $event)" />
      </div>
    </div>

    <!-- Clipboard Config -->
    <div class="card">
      <div class="card-title">{{ t('settings.clipboard') }}</div>
      <div class="form-group">
        <label class="form-label">{{ t('settings.watchTypes') }}</label>
        <input type="text" v-model="config.clipboard_watch_types" @change="save('clipboard_watch_types')" placeholder="text,image,file" />
        <div class="form-hint">{{ t('settings.watchTypesHint') }}</div>
      </div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">{{ t('settings.maxFileSize') }}</label>
        <input type="number" v-model="config.clipboard_max_file_size" @change="save('clipboard_max_file_size')" style="width: 160px;" />
      </div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">{{ t('settings.pushText') }}</label>
        <Toggle :model-value="config.clipboard_push_text === 'true'" @update:model-value="toggleConfig('clipboard_push_text', $event)" />
      </div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">{{ t('settings.pushImages') }}</label>
        <Toggle :model-value="config.clipboard_push_image === 'true'" @update:model-value="toggleConfig('clipboard_push_image', $event)" />
      </div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">{{ t('settings.pushFiles') }}</label>
        <Toggle :model-value="config.clipboard_push_file === 'true'" @update:model-value="toggleConfig('clipboard_push_file', $event)" />
      </div>
    </div>

    <!-- Maintenance -->
    <div class="card">
      <div class="card-title">{{ t('settings.maintenance') }}</div>
      <div class="form-group flex items-center gap-3">
        <label class="form-label" style="margin-bottom:0;">{{ t('settings.logRetention') }}</label>
        <input type="number" v-model="config.log_retention_days" @change="save('log_retention_days')" style="width: 100px;" />
      </div>
      <button class="btn" @click="cleanupLogs">{{ t('settings.cleanup') }}</button>
    </div>

    <div v-if="savedVisible" style="position: fixed; bottom: 60px; right: 24px; background: #000; color: #fff; padding: 8px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
      {{ t('settings.saved') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useElectron } from '../composables/useElectron'
import { useI18n, type Locale } from '../composables/useI18n'
import Toggle from '../components/Toggle.vue'

const { t, locale, setLocale } = useI18n()
const api = useElectron()

const config = ref<Record<string, string>>({})
const savedVisible = ref(false)
let saveTimeout: ReturnType<typeof setTimeout> | null = null

const monitorList = [
  { key: 'monitor_clipboard', name: 'clipboard', labelKey: 'settings.monitor.clipboard', descKey: 'settings.monitor.clipboard.desc' },
  { key: 'monitor_window', name: 'window', labelKey: 'settings.monitor.window', descKey: 'settings.monitor.window.desc' },
  { key: 'monitor_power', name: 'power', labelKey: 'settings.monitor.power', descKey: 'settings.monitor.power.desc' },
  { key: 'monitor_lock', name: 'lock', labelKey: 'settings.monitor.lock', descKey: 'settings.monitor.lock.desc' },
  { key: 'monitor_usb', name: 'usb', labelKey: 'settings.monitor.usb', descKey: 'settings.monitor.usb.desc' },
  { key: 'monitor_network', name: 'network', labelKey: 'settings.monitor.network', descKey: 'settings.monitor.network.desc' },
  { key: 'monitor_idle', name: 'idle', labelKey: 'settings.monitor.idle', descKey: 'settings.monitor.idle.desc' }
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

async function switchLang(lang: Locale) {
  setLocale(lang)
  config.value.language = lang
  await api.setConfig('language', lang)
  showSaved()
}

async function cleanupLogs() {
  await api.cleanupLogs()
  showSaved()
}

function showSaved() {
  savedVisible.value = true
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => { savedVisible.value = false }, 1500)
}

onMounted(loadConfig)
</script>
