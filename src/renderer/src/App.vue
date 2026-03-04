<template>
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
import Sidebar from './components/Sidebar.vue'
import StatusBar from './components/StatusBar.vue'
</script>
