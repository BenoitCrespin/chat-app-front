<template>
  <div class="container">
    <h2>Connexion</h2>
    <form @submit.prevent="login">
      <label for="pseudo">Pseudo :</label>
      <input type="text" id="pseudo" v-model="pseudo" required>

      <label for="password">Mot de passe :</label>
      <input type="password" id="password" v-model="password" required>

      <button type="submit">Se connecter</button>
    </form>
    <div v-if="message" :class="['message', messageType]">{{ message }}</div>
    <div class="switch-link">
      Pas encore de compte ? <router-link to="/register">S'inscrire</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Changez la variable ici de 'identifier' à 'pseudo'
const pseudo = ref(''); // Anciennement 'identifier'
const password = ref('');
const message = ref('');
const messageType = ref(''); // 'success' ou 'error'

async function login() {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // MODIFICATION ICI : Envoyer 'pseudo' au lieu de 'identifier'
      body: JSON.stringify({ pseudo: pseudo.value, password: password.value }),
    });

    const result = await response.json();

    if (response.ok) {
      messageType.value = 'success';
      message.value = result.message;
      localStorage.setItem('token', result.token);
      localStorage.setItem('userPseudo', result.user.pseudo);
      localStorage.setItem('userId', result.user.userId); // Assurez-vous d'utiliser userId ici comme retourné par le serveur
      router.push('/chat');
    } else {
      messageType.value = 'error';
      message.value = result.message || 'Une erreur est survenue lors de la connexion.';
      if (result.errors) {
        message.value += '\n' + result.errors.map(err => `- ${err.msg}`).join('\n');
      }
    }
  } catch (error) {
    console.error('Erreur réseau ou du serveur:', error);
    messageType.value = 'error';
    message.value = 'Impossible de se connecter au serveur.';
  }
}
</script>

<style scoped>
/* Les styles spécifiques au composant peuvent rester ici */
</style>