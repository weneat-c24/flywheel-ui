import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/overview' },
    { path: '/overview', component: () => import('@/screens/OverviewScreen.vue') },
    { path: '/agents', component: () => import('@/screens/AgentsListScreen.vue') },
    {
      path: '/agents/:agentId',
      component: () => import('@/screens/AgentDetailScreen.vue'),
      redirect: to => `/agents/${to.params.agentId}/dashboard`,
      children: [
        { path: 'dashboard',      component: () => import('@/screens/tabs/DashboardTab.vue') },
        { path: 'sessions',       component: () => import('@/screens/tabs/SessionsTab.vue') },
        { path: 'sessions/:sessionId', component: () => import('@/screens/tabs/SessionDetailTab.vue') },
        { path: 'tool-reliability', component: () => import('@/screens/tabs/ToolReliabilityTab.vue') },
        { path: 'kpis',           component: () => import('@/screens/tabs/KpisTab.vue') },
        { path: 'recommendations', component: () => import('@/screens/tabs/RecommendationsTab.vue') },
        { path: 'config',         component: () => import('@/screens/tabs/ConfigTab.vue') },
        { path: 'versions',       component: () => import('@/screens/tabs/VersionsTab.vue') },
      ],
    },
    { path: '/monitor',    component: () => import('@/screens/MonitorScreen.vue') },
    { path: '/settings',   component: () => import('@/screens/SettingsScreen.vue') },
    { path: '/ghl-panel',  component: () => import('@/screens/GhlPanelScreen.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/overview' },
  ],
})

export default router
