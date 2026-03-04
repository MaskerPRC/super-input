import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import EventLog from '../views/EventLog.vue'
import ActionLog from '../views/ActionLog.vue'
import Polling from '../views/Polling.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard },
    { path: '/events', name: 'events', component: EventLog },
    { path: '/actions', name: 'actions', component: ActionLog },
    { path: '/polling', name: 'polling', component: Polling },
    { path: '/settings', name: 'settings', component: Settings }
  ]
})

export default router
