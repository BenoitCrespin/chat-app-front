<template>
    <div class="chat-container">
        <div class="chat-header">
            <h2>Bienvenue sur le Chat, {{ userPseudo }} !</h2>
            <button @click="logout">Déconnexion</button>
        </div>

        <div class="chat-messages">
            <div v-for="msg in messages" :key="msg.id"
                :class="['message-item', { 'my-message': msg.userId === currentUserId }]">
                <span class="message-sender">{{ msg.pseudo }}:</span>
                <span class="message-content">{{ msg.content }}</span>
            </div>
        </div>

        <form @submit.prevent="sendMessage" class="chat-input-form">
            <input type="text" v-model="newMessage" placeholder="Écrivez votre message..." required
                :disabled="!isConnected" />
            <button type="submit" :disabled="!isConnected">Envoyer</button>
        </form>

        <div v-if="!isConnected" class="connection-status error">
            Connexion au chat impossible. Veuillez rafraîchir ou vous reconnecter.
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { io } from 'socket.io-client'; // Importez le client Socket.IO

const router = useRouter();
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; // Assurez-vous que c'est bien http://localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Pour l'historique si on veut le récupérer via REST

const userPseudo = ref(localStorage.getItem('userPseudo') || 'Invité');
const currentUserId = ref(parseInt(localStorage.getItem('userId'))); // Convertir en nombre
const messages = ref([]);
const newMessage = ref('');
const socket = ref(null); // Pour stocker l'instance de la socket
const isConnected = ref(false); // État de la connexion Socket.IO

// Initialisation de la connexion Socket.IO
onMounted(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        // Si pas de token, redirigez l'utilisateur ou affichez un message
        console.error("Aucun token trouvé, redirection vers la connexion.");
        router.push('/login');
        return;
    }

    // Initialise la socket avec le token pour l'authentification
    socket.value = io(SOCKET_URL, {
        auth: { token: token },
        transports: ['websocket'], // Force l'utilisation de WebSocket
    });

    socket.value.on('connect', () => {
        console.log('Connecté au serveur Socket.IO !');
        isConnected.value = true;
    });

    socket.value.on('disconnect', () => {
        console.log('Déconnecté du serveur Socket.IO.');
        isConnected.value = false;
    });

    socket.value.on('connect_error', (err) => {
        console.error('Erreur de connexion Socket.IO :', err.message);
        isConnected.value = false;
        // Si l'erreur est liée au token, proposez une reconnexion
        if (err.message.includes('token') || err.message.includes('authentification')) {
            alert('Votre session a expiré ou est invalide. Veuillez vous reconnecter.');
            logout(); // Redirige vers la connexion
        }
    });

    // Écoute des nouveaux messages
    socket.value.on('chat message', (msg) => {
        console.log('Nouveau message reçu:', msg);
        // Assurez-vous d'avoir un identifiant unique pour la clé v-for
        messages.value.push({ ...msg, id: Date.now() + Math.random() });
    });

    // Écoute de l'historique des messages
    socket.value.on('chat history', (history) => {
        console.log('Historique de chat reçu:', history);
        // Ajoutez un ID unique pour le rendu Vue (sinon Vue se plaint des clés)
        messages.value = history.map(msg => ({ ...msg, id: Date.now() + Math.random() }));
        // Défilement vers le bas après chargement de l'historique
        scrollToBottom();
    });

    // Écoute des messages d'erreur du serveur (via Socket.IO)
    socket.value.on('error message', (data) => {
        console.error('Erreur du serveur via Socket.IO:', data.message);
        alert(`Erreur chat: ${data.message}`);
    });
});

// Nettoyage de la socket lors du démontage du composant
onUnmounted(() => {
    if (socket.value) {
        socket.value.disconnect();
    }
});

// Envoi d'un message
// Envoi d'un message
function sendMessage() {
    if (newMessage.value.trim()) { // <-- La condition 'newMessage.value.trim()' est déjà là
        console.log("Tentative d'envoi du message :", newMessage.value.trim()); // AJOUTEZ CE LOG
        socket.value.emit('chat message', {message: newMessage.value.trim()});
        newMessage.value = ''; // Réinitialise le champ de saisie
        setTimeout(() => scrollToBottom(), 100);
    } else {
        console.warn("Message vide détecté côté front-end. Non envoyé."); // AJOUTEZ CE LOG
    }
}

// Fonction de déconnexion
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userPseudo');
    localStorage.removeItem('userId');
    if (socket.value) {
        socket.value.disconnect(); // Déconnecte la socket
    }
    router.push('/login'); // Redirige vers la page de connexion
}

// Fonction pour faire défiler la boîte de messages vers le bas
function scrollToBottom() {
    const messagesContainer = document.querySelector('.chat-messages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
</script>