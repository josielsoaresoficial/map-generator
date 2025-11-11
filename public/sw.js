// Service Worker for persistent notifications
console.log('[SW] Service Worker loading...');

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  self.skipWaiting(); // Activate worker immediately
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating...');
  event.waitUntil(clients.claim()); // Become available to all pages
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data?.json() || {};
  const title = data.title || 'Assistente de Rotina';
  
  const options = {
    body: data.body || 'Lembrete de tarefa',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [500, 200, 500, 200, 500],
    requireInteraction: true,
    silent: false,
    tag: data.tag || 'task-notification',
    renotify: true,
    actions: [
      {
        action: 'complete',
        title: 'Completar'
      },
      {
        action: 'snooze',
        title: 'Adiar 5min'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Message handler for showing notifications
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag, requireInteraction, vibrate, soundType } = event.data;
    
    const options = {
      body: body || 'Lembrete de tarefa',
      icon: icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: vibrate || [500, 200, 500, 200, 500],
      requireInteraction: requireInteraction !== undefined ? requireInteraction : true,
      silent: false,
      tag: tag || 'task-notification',
      renotify: true,
      actions: [
        {
          action: 'complete',
          title: 'Completar'
        },
        {
          action: 'snooze',
          title: 'Adiar 5min'
        },
        {
          action: 'dismiss',
          title: 'Dispensar'
        }
      ],
      data: {
        url: '/',
        timestamp: Date.now(),
        soundType: soundType || 'task'
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
        .then(() => {
          console.log('[SW] Notification shown successfully with sound type:', soundType);
          // Send sound play message to client
          return clients.matchAll({ type: 'window' }).then(clientList => {
            clientList.forEach(client => {
              client.postMessage({
                type: 'PLAY_NOTIFICATION_SOUND',
                soundType: soundType || 'task'
              });
            });
          });
        })
        .then(() => {
          // Send confirmation back to client
          event.ports[0]?.postMessage({ success: true });
        })
        .catch((error) => {
          console.error('[SW] Error showing notification:', error);
          event.ports[0]?.postMessage({ success: false, error: error.message });
        })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked, action:', event.action);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    // Just close the notification
    return;
  }

  if (event.action === 'complete') {
    // Send message to complete task
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        if (clientList.length > 0) {
          clientList[0].postMessage({
            type: 'COMPLETE_TASK',
            taskId: event.notification.tag
          });
          clientList[0].focus();
        } else {
          clients.openWindow('/');
        }
      })
    );
    return;
  }

  if (event.action === 'snooze') {
    // Send message to snooze task
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        if (clientList.length > 0) {
          clientList[0].postMessage({
            type: 'SNOOZE_TASK',
            taskId: event.notification.tag,
            minutes: 5
          });
          clientList[0].focus();
        } else {
          clients.openWindow('/');
        }
      })
    );
    return;
  }

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          console.log('[SW] Focusing existing window');
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        console.log('[SW] Opening new window');
        return clients.openWindow('/');
      }
    })
  );
});

// Notification close handler
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

console.log('[SW] Service Worker loaded successfully');
