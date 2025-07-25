// src/main.js
import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router'; // Importe le routeur

// Déplacez vos logs ici si vous voulez qu'ils s'exécutent au démarrage de l'app Vue
// Ou mieux encore, utilisez-les directement dans vos services ou composants
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const socketUrl = import.meta.env.VITE_SOCKET_URL;
console.log("URL de l'API :", apiBaseUrl);
console.log("URL Socket.IO :", socketUrl);

createApp(App)
  .use(router) // Utilise Vue Router
  .mount('#app');