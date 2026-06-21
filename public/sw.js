// public/sw.js
console.log('🟢 Service Worker FPI chargé !');

// Écouter les événements push
self.addEventListener('push', function(event) {
  console.log('📨 Push reçu:', event);
  
  let notificationData = {
    title: 'FPI - Notification',
    body: 'Vous avez une nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/dashboard'
    },
    requireInteraction: false,
    tag: 'FPI-notification'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        image: data.image || null,
        vibrate: data.vibrate || notificationData.vibrate,
        data: {
          url: data.url || notificationData.data.url,
          notificationId: data.notificationId,
          type: data.type || 'info',
          projetId: data.projetId
        },
        actions: data.actions || [],
        requireInteraction: data.requireInteraction || false,
        tag: `FPI-${data.notificationId || Date.now()}`
      };
    } catch (e) {
      console.error('❌ Erreur parsing notification:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      vibrate: notificationData.vibrate,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      tag: notificationData.tag
    })
  );
});

// Gérer le clic sur la notification
self.addEventListener('notificationclick', function(event) {
  console.log('👆 Notification cliquée:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';
  const notificationId = event.notification.data?.notificationId;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Marquer comme lue via l'API
      if (notificationId) {
        fetch(`/api/notifications/${notificationId}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }).catch(err => console.error('Erreur marquage lu:', err));
      }

      // Ouvrir ou focus une fenêtre existante
      for (let client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          console.log('🔄 Focus fenêtre existante');
          return client.focus();
        }
      }
      
      // Ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        console.log('🆕 Ouverture nouvelle fenêtre:', urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('👷 Service Worker installé');
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activé');
  event.waitUntil(clients.claim());
});