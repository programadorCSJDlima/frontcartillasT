import { createRouter, createWebHistory } from 'vue-router'
import TherapyCardView from '@/views/TherapyCardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TherapyCardView,
      meta: { title: 'Cartilla de terapia' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  if (to.meta?.title) {
    document.title = `Tarjeta Terapeutica | ${String(to.meta.title)}`
  }

  return true
})

export default router
