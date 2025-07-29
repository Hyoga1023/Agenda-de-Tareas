
const CACHE_NAME = 'agenda-tareas-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/reset.css',
  '/styles.css',
  '/config.js',
  '/chatbot.js',
  '/funcionalidad1.js',
  '/estrellas.js',
  '/img/Gato_Favicon.png',
  '/img/ositos.png',
  '/img/logo_letra_negra_sin_fondo.png',
  '/manifest.json',
  '/live2d/shizuku.model.json',
  '/live2d/shizuku.1024/texture_00.png',
  '/live2d/shizuku.moc',
  '/live2d/shizuku.physics.json',
  // Añade otros archivos del modelo Shizuku si son necesarios
  'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js',
  'https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching archivos');
      return cache.addAll(urlsToCache);
    }).catch(error => {
      console.error('Error en cache:', error);
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Permitir solicitudes a Groq API y CDNs
  if (url.origin !== self.location.origin || url.pathname.startsWith('/live2d/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => {
      return caches.match('/index.html');
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'verificar-tareas') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'VERIFICAR_TAREAS' });
      });
    });
  }
});
