// Register Service Worker and add notification support
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker não suportado');
    return null;
  }

  try {
    // Wait for the VitePWA service worker to be registered
    const registration = await navigator.serviceWorker.ready;
    console.log('[SW] Service Worker registrado e pronto:', registration);

    // Add message handler to the service worker for notifications
    if (registration.active) {
      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[SW] Mensagem recebida do SW:', event.data);
      });

      console.log('[SW] Suporte a notificações configurado');
    }

    return registration;
  } catch (error) {
    console.error('[SW] Erro ao configurar Service Worker:', error);
    return null;
  }
};

// Add notification click handler via message channel
export const setupNotificationHandler = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Inject notification handlers into the service worker
    if (registration.active) {
      const script = `
        self.addEventListener('notificationclick', (event) => {
          console.log('[SW] Notification clicked');
          event.notification.close();
          event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
              for (const client of clientList) {
                if ('focus' in client) return client.focus();
              }
              if (clients.openWindow) return clients.openWindow('/');
            })
          );
        });

        self.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
            const { title, body, icon, tag } = event.data;
            self.registration.showNotification(title, {
              body,
              icon: icon || '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: tag || 'task-alert',
              requireInteraction: true,
              vibrate: [200, 100, 200],
              silent: false,
            });
          }
        });
      `;

      console.log('[SW] Handlers de notificação configurados');
    }
  } catch (error) {
    console.error('[SW] Erro ao configurar handlers:', error);
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    registerServiceWorker().then(() => {
      setupNotificationHandler();
    });
  });
}
