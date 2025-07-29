// 🔔 SERVICE WORKER PARA TAREAS DE DANIELLE - ARREGLADO
const CACHE_NAME = 'tareas-danielle-v2';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './funcionalidad1.js',
  './config.js',
  './chatbot.js',
  './estrellas.js',
  './manifest.json',
  './img/ositos.png',
  './img/Gato_Favicon.png',
  './img/logo_letra_negra_sin_fondo.png'
];

console.log('🚀 Service Worker iniciando...');

// 📦 INSTALACIÓN - Cachear archivos importantes
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker instalándose...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('💾 Cacheando archivos...');
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('⚠️ Error cacheando algunos archivos:', error);
          // Intentar cachear uno por uno
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
        // Forzar activación inmediata
        return self.skipWaiting();
      })
  );
});

// 🔄 ACTIVACIÓN - Limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activándose...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
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
      // Tomar control inmediato
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activado y listo');
    })
  );
});

// 🌐 INTERCEPTAR PETICIONES - Estrategia Cache First
self.addEventListener('fetch', (event) => {
  // Solo manejar requests GET del mismo origen
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Si está en cache, devolverlo
        if (cachedResponse) {
          console.log('📦 Servido desde cache:', event.request.url);
          return cachedResponse;
        }

        // Si no está en cache, buscarlo en la red
        console.log('🌐 Buscando en red:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Si la respuesta es válida, guardarla en cache
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
            
            // Si es una navegación y falla, mostrar página offline
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
                      font-family: Arial, sans-serif;
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
                  <p>No hay conexión a internet, pero tu app sigue funcionando.</p>
                  <p>Las tareas guardadas están disponibles offline.</p>
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
            
            // Para otros recursos, devolver error
            return new Response('Recurso no disponible offline', {
              status: 404,
              statusText: 'Not Found'
            });
          });
      })
  );
});

// 🔔 MANEJAR NOTIFICACIONES PUSH (para futuras implementaciones)
self.addEventListener('push', (event) => {
  console.log('📨 Notificación push recibida');
  
  let datos = {};
  if (event.data) {
    try {
      datos = event.data.json();
    } catch (error) {
      datos = { titulo: '🐻 Recordatorio', mensaje: event.data.text() };
    }
  }

  const opciones = {
    body: datos.mensaje || '¡Tienes tareas pendientes!',
    icon: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%234285f4"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">🐻</text></svg>',
    badge: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="%23dc3545"/><text x="48" y="60" font-family="Arial" font-size="40" fill="white" text-anchor="middle">📝</text></svg>',
    vibrate: [200, 100, 200],
    tag: 'tarea-recordatorio',
    requireInteraction: true,
    timestamp: Date.now(),
    data: {
      url: '/',
      dateOfArrival: Date.now(),
      primaryKey: datos.id || Date.now()
    },
    actions: [
      {
        action: 'ver-tareas',
        title: '👀 Ver tareas',
        icon: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%2328a745"/><text x="32" y="40" font-family="Arial" font-size="20" fill="white" text-anchor="middle">👀</text></svg>'
      },
      {
        action: 'recordar-mas-tarde',
        title: '⏰ Recordar en 1 hora',
        icon: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23ffc107"/><text x="32" y="40" font-family="Arial" font-size="20" fill="white" text-anchor="middle">⏰</text></svg>'
      },
      {
        action: 'cerrar',
        title: '❌ Cerrar',
        icon: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23dc3545"/><text x="32" y="40" font-family="Arial" font-size="20" fill="white" text-anchor="middle">❌</text></svg>'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      datos.titulo || '🐻 Recordatorio de Tareas',
      opciones
    ).then(() => {
      console.log('✅ Notificación mostrada');
    }).catch((error) => {
      console.error('❌ Error mostrando notificación:', error);
    })
  );
});

// 🖱️ MANEJAR CLICKS EN NOTIFICACIONES
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Click en notificación:', event.action);
  
  event.notification.close();

  const accion = event.action;
  const datos = event.notification.data || {};

  event.waitUntil(
    (async () => {
      switch (accion) {
        case 'ver-tareas':
          console.log('👀 Abriendo aplicación...');
          // Intentar enfocar una ventana existente o abrir nueva
          const ventanaExistente = await clients.matchAll({
            type: 'window',
            includeUncontrolled: true
          });
          
          if (ventanaExistente.length > 0) {
            // Si hay una ventana abierta, enfocarla
            await ventanaExistente[0].focus();
          } else {
            // Si no, abrir nueva ventana
            await clients.openWindow(datos.url || '/');
          }
          break;

        case 'recordar-mas-tarde':
          console.log('⏰ Programando recordatorio...');
          // Programar recordatorio en 1 hora
          setTimeout(() => {
            self.registration.showNotification('🔔 Recordatorio programado', {
              body: 'No olvides revisar tus tareas pendientes',
              icon: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23ffc107"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">⏰</text></svg>',
              tag: 'recordatorio-diferido',
              requireInteraction: false
            });
          }, 60 * 60 * 1000); // 1 hora
          break;

        case 'cerrar':
        default:
          console.log('❌ Notificación cerrada');
          // No hacer nada especial, solo cerrar
          break;
      }
    })()
  );
});

// 📧 MANEJAR CIERRE DE NOTIFICACIONES
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notificación cerrada sin interacción');
  
  // Opcional: registrar estadísticas o programar recordatorio
  const datos = event.notification.data || {};
  if (datos.requiresFollowUp) {
    console.log('📋 Programando seguimiento...');
    // Aquí podrías programar un recordatorio adicional
  }
});

// 🔧 FUNCIONES AUXILIARES

// Función para programar notificaciones locales (sin push server)
function programarNotificacionLocal(titulo, mensaje, delay = 0) {
  setTimeout(() => {
    if (self.registration) {
      self.registration.showNotification(titulo, {
        body: mensaje,
        icon: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%234285f4"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">🐻</text></svg>',
        tag: 'programada-local',
        requireInteraction: false
      });
    }
  }, delay);
}

// 🧪 MENSAJES DEL CLIENTE (para comunicación con la app principal)
self.addEventListener('message', (event) => {
  console.log('📨 Mensaje recibido del cliente:', event.data);
  
  const { tipo, datos } = event.data;
  
  switch (tipo) {
    case 'PROGRAMAR_RECORDATORIO':
      console.log('⏰ Programando recordatorio local...');
      programarNotificacionLocal(
        datos.titulo,
        datos.mensaje,
        datos.delay || 0
      );
      break;
      
    case 'VERIFICAR_TAREAS':
      console.log('🔍 Verificando tareas desde SW...');
      // Aquí podrías implementar lógica adicional
      break;
      
    case 'LIMPIAR_CACHE':
      console.log('🧹 Limpiando cache por solicitud...');
      event.waitUntil(
        caches.delete(CACHE_NAME).then(() => {
          console.log('✅ Cache limpiado');
        })
      );
      break;
      
    default:
      console.log('❓ Tipo de mensaje desconocido:', tipo);
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