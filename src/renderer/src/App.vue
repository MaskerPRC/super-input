<template>
  <div class="titlebar">
    <div class="titlebar-title">PC AGENT</div>
    <div class="titlebar-controls">
      <button class="titlebar-btn" @click="minimizeToTray" title="Minimize to tray / 最小化到托盘">&#x2513;</button>
      <button class="titlebar-btn" @click="minimize" title="Minimize">&#x2500;</button>
      <button class="titlebar-btn" @click="toggleMaximize" title="Maximize">&#x25A1;</button>
      <button class="titlebar-btn titlebar-btn-close" @click="closeWindow" title="Close to tray">&#x2715;</button>
    </div>
  </div>
  <div class="app-layout">
    <Sidebar />
    <div class="app-content">
      <div class="app-main">
        <router-view />
      </div>
      <StatusBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import StatusBar from './components/StatusBar.vue'
import { initLocale } from './composables/useI18n'

const api = window.electronAPI

function minimize() {
  api.windowMinimize()
}

function toggleMaximize() {
  api.windowToggleMaximize()
}

function closeWindow() {
  api.windowClose()
}

function minimizeToTray() {
  api.windowMinimizeToTray()
}

onMounted(async () => {
  try {
    const lang = await api.getConfigValue('language')
    if (lang) initLocale(lang)
  } catch { /* use default */ }
})
</script>
