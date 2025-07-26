// 🔔 SERVICE WORKER - El mayordomo de tu app
const CACHE_NAME = 'tareas-cesar-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/config.js',
  '/chatbot.js',
  '/manifest.json'
];

// 📦 Instalación - Cachear archivos
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.log('⚠️ Error al cachear algunos archivos:', error);
        // Intentar cachear archivos individuales
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url))
        );
      });
    })
  );
});

// 🌐 Interceptar peticiones de red
self.addEventListener('fetch', event => {
  // Solo interceptar requests GET del mismo origen
  if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Si está en cache, lo devuelve, si no, lo busca en la red
          return response || fetch(event.request).catch(() => {
            // Si falla todo, página de error básica para navegación
            if (event.request.destination === 'document') {
              return new Response(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Sin conexión</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                  </head>
                  <body style="font-family: Arial; padding: 20px; text-align: center;">
                    <h1>📵 Sin conexión</h1>
                    <p>No hay conexión a internet disponible.</p>
                    <button onclick="window.location.reload()">🔄 Reintentar</button>
                  </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            }
          });
        })
    );
  }
});

// 🔔 Manejar notificaciones push
self.addEventListener('push', event => {
  console.log('📨 Notificación push recibida');
     
  const options = {
    body: event.data ? event.data.text() : '¡Tienes tareas pendientes hoy! 🐻',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjNDI4NWY0Ii8+Cjx0ZXh0IHg9IjY0IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjUwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+TvTwvdGV4dD4KPC9zdmc+',
    badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjcyIiBmaWxsPSIjZGM0NDQ1Ii8+Cjx0ZXh0IHg9IjM2IiB5PSI0OCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+TlDwvdGV4dD4KPC9zdmc+',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'ver-tareas',
        title: '👀 Ver tareas'
      },
      {
        action: 'cerrar',
        title: '❌ Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('🐻 Recordatorio de Tareas', options)
  );
});

// 🎯 Manejar clicks en notificaciones
self.addEventListener('notificationclick', event => {
  console.log('🖱️ Click en notificación:', event.action);
     
  event.notification.close();

  if (event.action === 'ver-tareas') {
    // Abrir la app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
  // Si es 'cerrar' o click general, solo cierra la notificación
});

// 🧹 Limpiar caches antiguos
self.addEventListener('activate', event => {
  console.log('🧹 Service Worker activado, limpiando caches antiguos');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});