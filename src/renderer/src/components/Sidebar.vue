<template>
  <aside class="app-sidebar">
    <div class="sidebar-brand">PC Agent</div>
    <nav class="sidebar-nav">
      <router-link to="/" class="sidebar-link">
        <span class="icon">#</span>
        <span>{{ t('nav.dashboard') }}</span>
      </router-link>
      <router-link to="/events" class="sidebar-link">
        <span class="icon">&gt;</span>
        <span>{{ t('nav.events') }}</span>
      </router-link>
      <router-link to="/actions" class="sidebar-link">
        <span class="icon">!</span>
        <span>{{ t('nav.actions') }}</span>
      </router-link>
      <router-link to="/polling" class="sidebar-link">
        <span class="icon">~</span>
        <span>{{ t('nav.polling') }}</span>
      </router-link>
      <router-link to="/settings" class="sidebar-link">
        <span class="icon">*</span>
        <span>{{ t('nav.settings') }}</span>
      </router-link>
    </nav>
    <div class="sidebar-footer" @click="switchLang" title="Switch language / 切换语言">
      <span>{{ locale === 'zh' ? '中/EN' : 'EN/中' }}</span>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useI18n } from '../composables/useI18n'

const { t, locale, toggleLocale } = useI18n()

async function switchLang() {
  toggleLocale()
  try {
    await window.electronAPI.setConfig('language', locale.value)
  } catch { /* ignore */ }
}
</script>

<style scoped>
.sidebar-footer {
  padding: 10px 16px;
  font-size: 11px;
  font-weight: 700;
  color: #999;
  border-top: 1px solid #333;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  user-select: none;
}
.sidebar-footer:hover {
  color: #fff;
  background: rgba(255,255,255,0.08);
}
</style>
