// 🔔 SERVICE WORKER PARA TAREAS DE DANIELLE - OPTIMIZADO
const CACHE_NAME = 'tareas-danielle-v3';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './funcionalidad1.js',
  './chatbot.js',
  './manifest.json',
  './img/Gato_Favicon.png'
];

console.log('🚀 Service Worker iniciando...');

// 📦 INSTALACIÓN - Cachear archivos esenciales
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker instalándose...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('💾 Cacheando archivos esenciales...');
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('⚠️ Error cacheando algunos archivos:', error);
          return Promise.allSettled(
            urlsToCache.map(url => 
              cache.add(url).catch(err => 
                console.log(`❌ No se pudo cachear: ${url}`, err)
              )
            )
          );
        });
      })
      .then(() => {
        console.log('✅ Archivos cacheados correctamente');
        return self.skipWaiting();
      })
  );
});

// 🔄 ACTIVACIÓN - Limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activándose...');
  
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activado y listo');
    })
  );
});

// 🌐 INTERCEPTAR PETICIONES - Estrategia Cache First
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('📦 Servido desde cache:', event.request.url);
          return cachedResponse;
        }

        console.log('🌐 Buscando en red:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.log('❌ Error de red:', error);
            
            if (event.request.destination === 'document') {
              return new Response(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Sin conexión - Tareas de Danielle</title>
                  <style>
                    body {
                      font-family: 'Flavors', cursive;
                      text-align: center;
                      padding: 50px 20px;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      min-height: 100vh;
                      margin: 0;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;
                    }
                    .offline-bear {
                      font-size: 100px;
                      margin-bottom: 20px;
                      animation: bounce 2s infinite;
                    }
                    @keyframes bounce {
                      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                      40% { transform: translateY(-30px); }
                      60% { transform: translateY(-15px); }
                    }
                    h1 { margin: 0 0 20px 0; }
                    button {
                      background: #28a745;
                      color: white;
                      border: none;
                      padding: 15px 30px;
                      border-radius: 25px;
                      font-size: 16px;
                      cursor: pointer;
                      margin-top: 20px;
                      transition: background 0.3s;
                    }
                    button:hover { background: #218838; }
                  </style>
                </head>
                <body>
                  <div class="offline-bear">🐻</div>
                  <h1>📵 Sin conexión</h1>
                  <p>No hay conexión a internet, pero tus tareas guardadas están disponibles.</p>
                  <button onclick="window.location.reload()">
                    🔄 Reintentar conexión
                  </button>
                </body>
                </html>
              `, {
                headers: { 
                  'Content-Type': 'text/html',
                  'Cache-Control': 'no-cache'
                }
              });
            }
            
            return new Response('Recurso no disponible offline', {
              status: 404,
              statusText: 'Not Found'
            });
          });
      })
  );
});

// 🔔 MANEJAR NOTIFICACIONES - Integrado con funcionalidad1.js
self.addEventListener('push', (event) => {
  console.log('📨 Notificación push recibida');
  
  let datos = {};
  if (event.data) {
    try {
      datos = event.data.json();
    } catch (error) {
      datos = { titulo: '🐻 Recordatorio', mensaje: '¡Tienes tareas pendientes!' };
    }
  }

  const opciones = {
    body: datos.mensaje || '¡Tienes tareas pendientes!',
    icon: datos.icon || 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%2328a745"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">🐻</text></svg>',
    tag: datos.tag || 'tarea-recordatorio',
    requireInteraction: datos.requireInteraction || false,
    vibrate: datos.vibrate || [200, 100, 200],
    timestamp: Date.now(),
    actions: [
      {
        action: 'ver',
        title: '👀 Ver tareas',
        icon: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%2328a745"/><text x="32" y="40" font-family="Arial" font-size="20" fill="white" text-anchor="middle">👀</text></svg>'
      },
      {
        action: 'cerrar',
        title: '❌ Cerrar',
        icon: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23dc3545"/><text x="32" y="40" font-family="Arial" font-size="20" fill="white" text-anchor="middle">❌</text></svg>'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(datos.titulo || '🐻 Recordatorio de Tareas', opciones)
      .then(() => {
        console.log('✅ Notificación mostrada');
      })
      .catch((error) => {
        console.error('❌ Error mostrando notificación:', error);
      })
  );
});

// 🖱️ MANEJAR CLICKS EN NOTIFICACIONES
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Click en notificación:', event.action);
  
  event.notification.close();

  event.waitUntil(
    (async () => {
      if (event.action === 'ver') {
        console.log('👀 Abriendo aplicación...');
        const ventanaExistente = await clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });
        
        if (ventanaExistente.length > 0) {
          await ventanaExistente[0].focus();
        } else {
          await clients.openWindow('/');
        }
      } else {
        console.log('❌ Notificación cerrada');
      }
    })()
  );
});

// 🧪 MENSAJES DEL CLIENTE
self.addEventListener('message', (event) => {
  if (event.data === 'keep-alive') {
    console.log('🛌 Service Worker en espera');
    return;
  }

  const { tipo, datos } = event.data || {};
  if (tipo === 'MOSTRAR_NOTIFICACION') {
    console.log('📨 Mostrando notificación desde cliente:', datos.titulo);
    self.registration.showNotification(datos.titulo, {
      body: datos.mensaje,
      icon: datos.icon,
      tag: datos.tag,
      requireInteraction: datos.requireInteraction,
      vibrate: datos.vibrate,
      timestamp: Date.now(),
      actions: datos.actions
    });
  }
});

// 🔄 MANEJO DE ERRORES GLOBALES
self.addEventListener('error', (event) => {
  console.error('❌ Error en Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rechazada en Service Worker:', event.reason);
});

console.log('✅ Service Worker configurado completamente');
