// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue'; // Nous allons créer ces fichiers
import RegisterPage from '../views/RegisterPage.vue';
import ChatPage from '../views/ChatPage.vue';
import ValidateEmailPage from '../views/ValidateEmailPage.vue'; // <-- NOUVEL IMPORT

const routes = [
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  { path: '/chat', name: 'Chat', component: ChatPage, meta: { requiresAuth: true } }, // Route protégée
  { path: '/validate/:token', name: 'ValidateEmail', component: ValidateEmailPage }, // <-- NOUVELLE ROUTE
  { path: '/', redirect: '/login' } // Redirige la racine vers la page de login par défaut
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard (Garde de navigation) pour les routes protégées
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); // Récupère le token

  if (to.meta.requiresAuth && !token) {
    // Si la route nécessite une auth et pas de token, redirige vers login
    next('/login');
  } else if ((to.name === 'Login' || to.name === 'Register') && token) {
    // Si déjà connecté (token présent) et tente d'aller sur Login/Register, redirige vers Chat
    next('/chat');
  } else {
    next(); // Continue la navigation
  }
});

export default router;