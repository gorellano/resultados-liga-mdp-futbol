self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: '/logo_costa_y_gol.png',
        badge: '/logo_costa_y_gol.png',
        vibrate: [100, 50, 100],
        data: {
          url: data.url || '/'
        }
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    } catch (e) {
      // Fallback para texto plano
      event.waitUntil(
        self.registration.showNotification(event.data.text(), {
          icon: '/logo_costa_y_gol.png'
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
