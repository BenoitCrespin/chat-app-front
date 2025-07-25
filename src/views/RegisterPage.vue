<template>
    <div class="container">
      <h2>Inscription</h2>
      <form @submit.prevent="register">
        <label for="pseudo">Pseudo :</label>
        <input type="text" id="pseudo" v-model="pseudo" required>
  
        <label for="email">Email :</label>
        <input type="email" id="email" v-model="email" required>
  
        <label for="password">Mot de passe :</label>
        <input type="password" id="password" v-model="password" required>
  
        <button type="submit">S'inscrire</button>
      </form>
      <div v-if="message" :class="['message', messageType]">{{ message }}</div>
      <div class="switch-link">
        Déjà un compte ? <router-link to="/login">Se connecter</router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const pseudo = ref('');
  const email = ref('');
  const password = ref('');
  const message = ref('');
  const messageType = ref('');
  
  async function register() {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pseudo: pseudo.value, email: email.value, password: password.value }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        messageType.value = 'success';
        message.value = result.message;
        // Redirige après un court délai pour laisser le temps de lire le message
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        messageType.value = 'error';
        message.value = result.message || 'Une erreur est survenue lors de l\'inscription.';
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
  </style>