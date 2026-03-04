<template>
  <aside class="app-sidebar">
    <div class="sidebar-brand">PC Agent</div>
    <nav class="sidebar-nav">
      <router-link to="/" class="sidebar-link">
        <span class="icon">#</span>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/events" class="sidebar-link">
        <span class="icon">&gt;</span>
        <span>Events</span>
      </router-link>
      <router-link to="/actions" class="sidebar-link">
        <span class="icon">!</span>
        <span>Actions</span>
      </router-link>
      <router-link to="/polling" class="sidebar-link">
        <span class="icon">~</span>
        <span>Polling</span>
      </router-link>
      <router-link to="/settings" class="sidebar-link">
        <span class="icon">*</span>
        <span>Settings</span>
      </router-link>
    </nav>
    <div style="padding: 12px 16px; font-size: 10px; color: #666; border-top: 1px solid #333;">
      v1.0.0
    </div>
  </aside>
</template>
