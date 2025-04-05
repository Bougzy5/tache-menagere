```javascript
    // service-worker.js
    // Ce script s'exécute en arrière-plan et gère la mise en cache pour le mode hors ligne.

    const CACHE_NAME = 'taches-menageres-cache-v1'; // Nom du cache (changez si vous mettez à jour les fichiers principaux)
    const urlsToCache = [
      '/', // La page principale (index.html)
      '/manifest.json', // Le fichier manifest
      '/styles/tailwind.css', // Si vous utilisez un fichier CSS séparé pour Tailwind (sinon, supprimez)
      'https://cdn.tailwindcss.com', // Le script Tailwind (si chargé via CDN)
      'https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/plus-circle.svg', // Icônes utilisées
      'https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/check.svg',
      'https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/trash-2.svg',
      // Ajoutez ici les chemins vers vos fichiers d'icônes (ex: '/icons/icon-192x192.png')
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png'
      // Ajoutez d'autres ressources statiques si nécessaire (JS, polices...)
    ];

    // Événement d'installation: Mise en cache des ressources principales
    self.addEventListener('install', event => {
      console.log('Service Worker: Installation...');
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => {
            console.log('Service Worker: Mise en cache des fichiers principaux');
            return cache.addAll(urlsToCache);
          })
          .then(() => {
            console.log('Service Worker: Fichiers principaux mis en cache avec succès.');
            return self.skipWaiting(); // Force le nouveau SW à devenir actif immédiatement
          })
          .catch(error => {
            console.error('Service Worker: Échec de la mise en cache initiale:', error);
          })
      );
    });

    // Événement d'activation: Nettoyage des anciens caches
    self.addEventListener('activate', event => {
      console.log('Service Worker: Activation...');
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              if (cacheName !== CACHE_NAME) {
                console.log('Service Worker: Suppression de l\'ancien cache:', cacheName);
                return caches.delete(cacheName);
              }
            })
          );
        }).then(() => {
           console.log('Service Worker: Activation terminée, contrôle de la page.');
           return self.clients.claim(); // Permet au SW activé de contrôler les clients ouverts immédiatement
        })
      );
    });

    // Événement fetch: Interception des requêtes réseau
    self.addEventListener('fetch', event => {
      // Stratégie: Cache d'abord, puis réseau (Cache falling back to Network)
      // Idéal pour les ressources de l'application (HTML, CSS, JS, images)
      event.respondWith(
        caches.match(event.request)
          .then(response => {
            // Si la ressource est dans le cache, la retourner
            if (response) {
              // console.log('Service Worker: Ressource trouvée dans le cache:', event.request.url);
              return response;
            }
            // Sinon, essayer de la récupérer sur le réseau
            // console.log('Service Worker: Ressource non trouvée dans le cache, récupération réseau:', event.request.url);
            return fetch(event.request).then(
              networkResponse => {
                // Optionnel: Mettre en cache la nouvelle ressource récupérée dynamiquement
                // Attention: ne pas mettre en cache n'importe quoi (ex: requêtes API POST)
                // if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
                //   const responseToCache = networkResponse.clone();
                //   caches.open(CACHE_NAME)
                //     .then(cache => {
                //       cache.put(event.request, responseToCache);
                //     });
                // }
                return networkResponse;
              }
            ).catch(error => {
               console.error('Service Worker: Erreur de récupération réseau:', error);
               // Optionnel: Retourner une page hors ligne personnalisée ici
               // return caches.match('/offline.html');
            });
          })
      );
    });
```
