<template>
    <div class="container">
      <h2>Validation de l'Email</h2>
      <div v-if="loading" class="message">Validation en cours...</div>
      <div v-else-if="message" :class="['message', messageType]">{{ message }}</div>
      <div v-if="showLoginLink && !loading" class="switch-link">
        <router-link to="/login">Retour à la connexion</router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  
  const route = useRoute();
  const router = useRouter();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Assurez-vous que c'est bien http://localhost:3000
  
  const loading = ref(true);
  const message = ref('');
  const messageType = ref(''); // 'success' ou 'error'
  const showLoginLink = ref(false);
  
  onMounted(async () => {
    const token = route.params.token;
  
    if (!token) {
      message.value = 'Token de validation manquant dans l\'URL.';
      messageType.value = 'error';
      loading.value = false;
      showLoginLink.value = true;
      return;
    }
  
    try {
      // Appel à votre route de validation backend (méthode GET correcte, URL correcte)
      const response = await fetch(`${API_BASE_URL}/validate/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
          const textError = await response.text();
          console.error("Réponse du serveur n'est pas du JSON:", textError);
          message.value = `Erreur du serveur (code ${response.status}). Réponse inattendue.`;
          messageType.value = 'error';
          showLoginLink.value = true;
          loading.value = false;
          return;
      }
  
      const result = await response.json();
  
      if (response.ok) {
        message.value = result.message || 'Votre email a été validé avec succès !';
        messageType.value = 'success';
  
        // **MODIFICATION CLÉ ICI : Traitement du JWT renvoyé par le back-end**
        if (result.token && result.user) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('userPseudo', result.user.pseudo);
          localStorage.setItem('userId', result.user.id); // Assurez-vous que le back-end renvoie 'id' et non 'userId' si c'est le cas
  
          setTimeout(() => {
            router.push('/chat'); // Redirige directement vers la page de chat
          }, 3000);
        } else {
          // Au cas où le token ne serait pas renvoyé malgré le succès (ce qui ne devrait pas arriver avec votre code backend)
          message.value = 'Validation réussie, mais connexion automatique impossible. Veuillez vous connecter manuellement.';
          messageType.value = 'error'; // Ou 'info'
          showLoginLink.value = true;
        }
      } else {
        message.value = result.message || 'La validation de l\'email a échoué.';
        messageType.value = 'error';
        showLoginLink.value = true;
      }
    } catch (error) {
      console.error('Erreur lors de la validation de l\'email (Front-end):', error);
      message.value = 'Impossible de se connecter au serveur pour la validation.';
      messageType.value = 'error';
      showLoginLink.value = true;
    } finally {
      loading.value = false;
    }
  });
  </script>
  
  <style scoped>
  /* Vos styles existants */
  </style>