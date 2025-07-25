// server.js (à la racine de votre dossier front-end)

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtenez __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000; // Render utilise généralement 10000 par défaut

// Servir les fichiers statiques du dossier 'dist' (qui est le résultat de la build Vite)
app.use(express.static(path.join(__dirname, 'dist')));

// Pour toutes les autres routes, servir le fichier index.html (pour le routing client-side de Vue)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur front-end statique lancé sur le port ${PORT}`);
});