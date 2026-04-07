// public/custom-sw.js
// Ce script sera injecté dans le Service Worker principal généré par Next.js

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-deliveries') {
    console.log('📡 [KoliSync SW] Réseau détecté : Lancement de la synchronisation en arrière-plan...');
    event.waitUntil(processOfflineDeliveries());
  }
});

async function processOfflineDeliveries() {
  // 1. Connexion à notre base de données locale (Vanilla IndexedDB)
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('kolisync-offline-db', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // 2. Extraction des livraisons en attente
  const tx = db.transaction('sync_queue', 'readonly');
  const store = tx.objectStore('sync_queue');
  const events = await new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  if (!events || events.length === 0) return;

  try {
    // 3. Envoi au serveur KoliSync (API Route)
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events })
    });

    if (response.ok) {
      // 4. Succès : On efface les données du téléphone
      const deleteTx = db.transaction('sync_queue', 'readwrite');
      const deleteStore = deleteTx.objectStore('sync_queue');
      events.forEach(ev => deleteStore.delete(ev.id));
      
      console.log(`✅ [KoliSync SW] ${events.length} livraisons synchronisées et purgées avec succès.`);
      
      // Optionnel : Dire à l'application ouverte de se rafraîchir
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));
      });
    } else {
      throw new Error('Erreur HTTP du serveur lors de la synchronisation');
    }
  } catch (error) {
    console.error('❌ [KoliSync SW] Échec de la synchro. Conservation des données pour un prochain essai.', error);
    // 🚨 IMPORTANT : Lancer une erreur ici ordonne au navigateur de réessayer plus tard
    throw error; 
  }
}

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || "Nouvelle mise à jour KoliSync",
      icon: '/icons/icon-192x192.png', // Assure-toi d'avoir cette icône
      badge: '/icons/badge-72x72.png', // Icône monochrome pour la barre de statut (Android)
      vibrate: [200, 100, 200, 100, 200, 100, 200], // Vibration agressive "Uber-style"
      data: {
        url: data.url || '/pwa'
      },
      requireInteraction: true // La notification reste à l'écran jusqu'à action du livreur
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "KoliSync", options)
    );
  } catch (error) {
    console.error('Erreur lors du parsing du Push:', error);
  }
});

// Action quand le livreur clique sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si l'app est déjà ouverte en arrière-plan, on la focus et on navigue
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, on ouvre une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
