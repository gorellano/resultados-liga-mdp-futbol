/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope

import { precacheAndRoute } from 'workbox-precaching'

// Precache los assets compilados
precacheAndRoute(self.__WB_MANIFEST || [])

// Escuchar el evento push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Costa y Gol';
    const options = {
      body: data.body,
      icon: data.icon || '/logo_costa_y_gol.png',
      badge: '/favicon.svg',
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (e) {
    console.error('Error parsing push data', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
