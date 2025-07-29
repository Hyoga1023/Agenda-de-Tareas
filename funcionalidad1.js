console.log('🚀 Iniciando aplicación de tareas para Danielle...');

// 🐻 Inicializar tareas desde localStorage
let tareas = [];
let ultimoEstadoTareas = null;
let ultimoTareasGuardadas = null;

try {
  const tareasGuardadas = localStorage.getItem("tareas");
  tareas = tareasGuardadas ? JSON.parse(tareasGuardadas) : [];
} catch (error) {
  console.log('⚠️ Error cargando tareas:', error);
  tareas = [];
}

// Exponer tareas para el chatbot
window.getTareas = () => tareas;

// 💾 Guardar tareas solo si han cambiado
const guardarTareas = () => {
  const tareasJSON = JSON.stringify(tareas);
  if (tareasJSON === ultimoTareasGuardadas) {
    console.log('💾 Tareas sin cambios, omitiendo guardado');
    return;
  }
  ultimoTareasGuardadas = tareasJSON;

  try {
    localStorage.setItem("tareas", tareasJSON);
    console.log('💾 Tareas guardadas:', tareas.length);
  } catch (error) {
    console.error('❌ Error guardando tareas:', error);
  }
};

// 📅 Formatear fecha a YYYY-MM-DD
const formatearFecha = fecha => {
  if (typeof fecha === 'string') {
    return fecha;
  }
  const f = new Date(fecha);
  return f.toISOString().split('T')[0];
};

// 🧼 Obtener fecha de hoy como string
function obtenerFechaHoyString() {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

// 🌅 Obtener fecha de mañana como string
function obtenerFechaMananaString() {
  const mañana = new Date();
  mañana.setDate(mañana.getDate() + 1);
  const año = mañana.getFullYear();
  const mes = String(mañana.getMonth() + 1).padStart(2, '0');
  const dia = String(mañana.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

// 🗓️ Obtener fecha de pasado mañana como string
function obtenerFechaPasadoMananaString() {
  const pasadoMañana = new Date();
  pasadoMañana.setDate(pasadoMañana.getDate() + 2);
  const año = pasadoMañana.getFullYear();
  const mes = String(pasadoMañana.getMonth() + 1).padStart(2, '0');
  const dia = String(pasadoMañana.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

// 🎨 Mostrar tareas en el DOM solo si hay cambios
function mostrarTareas() {
  const contenedor = document.getElementById("contenedor-tarjetas");
  if (!contenedor) return;

  const tareasJSON = JSON.stringify(tareas);
  if (tareasJSON === ultimoEstadoTareas) {
    console.log('🖌️ DOM sin cambios, omitiendo actualización');
    return;
  }
  ultimoEstadoTareas = tareasJSON;

  contenedor.innerHTML = "";

  const fechaHoy = obtenerFechaHoyString();
  const fechaManana = obtenerFechaMananaString();
  const fechaPasadoManana = obtenerFechaPasadoMananaString();

  if (tareas.length === 0) {
    contenedor.innerHTML = `<p>No hay tareas aún. ¡Agrega una! 😊</p>`;
    return;
  }

  tareas.forEach((tarea, index) => {
    const fechaTarea = tarea.fecha;
    let clase = "";

    if (fechaTarea === fechaHoy) clase = "hoy";
    else if (fechaTarea === fechaManana) clase = "mañana";
    else if (fechaTarea === fechaPasadoManana) clase = "pasado-mañana";
    else if (fechaTarea < fechaHoy) clase = "vencida";

    const tarjeta = document.createElement("div");
    tarjeta.className = `tarjeta ${clase}`;
    tarjeta.innerHTML = `
      <strong>${tarea.titulo}</strong><br>
      📝 ${tarea.descripcion}<br>
      📅 ${tarea.fecha}
      <div class="acciones">
        <button onclick="editarTarea(${index})">✏️</button>
        <button onclick="eliminarTarea(${index})">🗑️</button>
      </div>
    `;
    contenedor.appendChild(tarjeta);
  });

  console.log('🖌️ DOM actualizado');
}

// ➕ Agregar nueva tarea con SweetAlert
function agregarTarea() {
  const titulo = document.getElementById("titulo")?.value?.trim();
  const descripcion = document.getElementById("descripcion")?.value?.trim();
  const fecha = document.getElementById("fecha")?.value;

  if (!titulo || !descripcion || !fecha) {
    alert("Debes llenar todos los campos 📝");
    return;
  }

  tareas.push({ titulo, descripcion, fecha });
  guardarTareas();
  mostrarTareas();
  if (window.chatbotTareas) window.chatbotTareas.actualizarTareas();

  ["titulo", "descripcion", "fecha"].forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.value = "";
  });

  console.log('✅ Tarea agregada:', titulo);
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: fecha === obtenerFechaHoyString() ? "🤔 ¡Tarea para HOY!" : "😊 ¡Tarea agregada!",
      html: `📌 <strong>${titulo}</strong> - ${descripcion}<br>📅 ${fecha}`,
      imageUrl: fecha === obtenerFechaHoyString() 
        ? "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif"
        : "https://media.giphy.com/media/IcGkqdUmYLFGE/giphy.gif",
      imageWidth: 250,
      imageHeight: 200,
      background: fecha === obtenerFechaHoyString() ? "#fff3cd" : "#d1f2eb",
      confirmButtonColor: fecha === obtenerFechaHoyString() ? "#ffc107" : "#28a745",
      confirmButtonText: "¡Entendido! 🎉",
      timer: 5000,
      timerProgressBar: true
    });
  }
}

const eliminarTarea = index => {
  if (confirm("¿Seguro que quieres eliminar esta tarea?")) {
    const tareaEliminada = tareas[index];
    tareas.splice(index, 1);
    guardarTareas();
    mostrarTareas();
    if (window.chatbotTareas) window.chatbotTareas.actualizarTareas();
    console.log('🗑️ Tarea eliminada:', tareaEliminada?.titulo);
  }
};

const editarTarea = index => {
  const tarea = tareas[index];
  if (!tarea) return;
  
  const nuevoTitulo = prompt("Nuevo nombre de la tarea:", tarea.titulo);
  const nuevaDescripcion = prompt("Nueva descripción:", tarea.descripcion);
  const nuevaFecha = prompt("Nueva fecha (YYYY-MM-DD):", tarea.fecha);

  if (nuevoTitulo && nuevaDescripcion && nuevaFecha) {
    tareas[index] = { titulo: nuevoTitulo, descripcion: nuevaDescripcion, fecha: nuevaFecha };
    guardarTareas();
    mostrarTareas();
    if (window.chatbotTareas) window.chatbotTareas.actualizarTareas();
    console.log('✏️ Tarea editada:', nuevoTitulo);
  }
};

// 🧸 SISTEMA DE NOTIFICACIONES COMPLETO
class GestorNotificaciones {
  constructor() {
    this.permisoConcedido = false;
    this.serviceWorkerRegistrado = false;
    this.ultimasNotificaciones = JSON.parse(localStorage.getItem('ultimasNotificaciones')) || {};
    this.timeoutId = null;
  }

  async inicializar() {
    console.log('🔔 Inicializando sistema de notificaciones...');
    
    await this.registrarServiceWorker();
    await this.pedirPermisos();
    this.programarVerificacionPeriodica();
    
    console.log('✅ Sistema de notificaciones inicializado');
  }

  async registrarServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker no soportado');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      this.serviceWorkerRegistrado = true;
      console.log('✅ Service Worker registrado:', registration.scope);
      
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data === 'keep-alive') {
          console.log('🛌 Service Worker en espera');
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
      return false;
    }
  }

  async desregistrarServiceWorker() {
    if (this.serviceWorkerRegistrado) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
        console.log('🛑 Service Worker desregistrado');
      }
      this.serviceWorkerRegistrado = false;
    }
  }

  async pedirPermisos() {
    if (!('Notification' in window)) {
      console.log('❌ Notificaciones no soportadas');
      await this.desregistrarServiceWorker();
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permisoConcedido = true;
      console.log('✅ Permisos ya concedidos');
      this.mostrarNotificacionBienvenida();
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Permisos denegados permanentemente');
      this.mostrarInstruccionesManual();
      await this.desregistrarServiceWorker();
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permisoConcedido = permission === 'granted';
      
      if (this.permisoConcedido) {
        console.log('✅ Permisos concedidos');
        this.mostrarNotificacionBienvenida();
      } else {
        console.log('❌ Permisos denegados');
        this.mostrarInstruccionesManual();
        await this.desregistrarServiceWorker();
      }
      
      return this.permisoConcedido;
    } catch (error) {
      console.error('❌ Error pidiendo permisos:', error);
      await this.desregistrarServiceWorker();
      return false;
    }
  }

  mostrarNotificacionBienvenida() {
    if (!this.permisoConcedido) return;

    setTimeout(() => {
      this.enviarNotificacion(
        '🐻 ¡Hola Danielle!',
        'Las notificaciones están activadas. Te recordaré tus tareas a las 8AM, 12PM y 5PM.',
        'bienvenida',
        false
      );
    }, 1000);
  }

  mostrarInstruccionesManual() {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: '🔔 Activa las notificaciones',
        html: `
          <p>Para recibir recordatorios de tus tareas:</p>
          <ol style="text-align: left; margin: 20px;">
            <li>🔧 Ve a configuración del navegador</li>
            <li>🔔 Busca "Notificaciones"</li>
            <li>✅ Permite notificaciones para este sitio</li>
            <li>🔄 Recarga la página</li>
          </ol>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
    } else {
      alert('🔔 Para recibir recordatorios, activa las notificaciones en la configuración de tu navegador.');
    }
  }

  programarVerificacionPeriodica() {
    console.log('⏰ Configurando verificaciones precisas: 8AM, 12PM, 5PM');

    const programarProximaVerificacion = () => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      
      const horarios = [
        { hora: 8, nombre: "🌅 Buenos días" },
        { hora: 12, nombre: "🌞 Mediodía" },
        { hora: 17, nombre: "🌆 Tarde" }
      ];

      let proximoTimeout = null;
      let nombreProximo = "";

      for (let horario of horarios) {
        const tiempoHorario = new Date(hoy.getTime()).setHours(horario.hora, 0, 0, 0);
        if (tiempoHorario > ahora.getTime()) {
          proximoTimeout = tiempoHorario - ahora.getTime();
          nombreProximo = horario.nombre;
          break;
        }
      }

      if (!proximoTimeout) {
        const mañana8AM = new Date(hoy.getTime() + 24 * 60 * 60 * 1000).setHours(8, 0, 0, 0);
        proximoTimeout = mañana8AM - ahora.getTime();
        nombreProximo = "🌅 Buenos días (mañana)";
      }

      const horasRestantes = Math.round(proximoTimeout / (1000 * 60 * 60 * 100)) / 10;
      console.log(`⏱️ Próxima verificación: ${nombreProximo} en ${horasRestantes}h`);

      this.timeoutId = setTimeout(() => {
        console.log(`🔔 Ejecutando: ${nombreProximo}`);
        this.verificarYNotificar();
        programarProximaVerificacion();
      }, proximoTimeout);
    };

    programarProximaVerificacion();
    console.log('✅ Sistema ultra-eficiente activado - Solo 3 verificaciones/día');
  }

  verificarYNotificar() {
    if (!this.permisoConcedido) {
      console.log('⚠️ Sin permisos para notificar');
      return;
    }

    const fechaHoy = obtenerFechaHoyString();
    const fechaManana = obtenerFechaMananaString();
    const fechaPasadoManana = obtenerFechaPasadoMananaString();
    
    const categorizarTareas = () => {
      const resultado = { hoy: [], mañana: [], pasadoMañana: [], pasadas: [] };
      
      for (let tarea of tareas) {
        if (tarea.fecha === fechaHoy) resultado.hoy.push(tarea);
        else if (tarea.fecha === fechaManana) resultado.mañana.push(tarea);
        else if (tarea.fecha === fechaPasadoManana) resultado.pasadoMañana.push(tarea);
        else if (tarea.fecha < fechaHoy) resultado.pasadas.push(tarea);
      }
      
      return resultado;
    };

    const { hoy, mañana, pasadoMañana, pasadas } = categorizarTareas();

    console.log('🔍 Verificación eficiente:', {
      hoy: hoy.length,
      mañana: mañana.length,
      pasadoMañana: pasadoMañana.length,
      pasadas: pasadas.length
    });

    if (pasadas.length > 0 && !this.notificacionYaEnviada('vencidas', pasadas)) {
      this.enviarNotificacion(
        '😰 ¡Tareas vencidas!',
        `${pasadas.length} tarea(s) vencida(s): ${pasadas[0].titulo}${pasadas.length > 1 ? ' y más...' : ''}`,
        'vencidas',
        true
      );
      this.registrarNotificacion('vencidas', pasadas);
    }

    if (hoy.length > 0 && !this.notificacionYaEnviada('hoy', hoy)) {
      this.enviarNotificacion(
        '📝 ¡Tareas para HOY!',
        hoy.length === 1 ? `"${hoy[0].titulo}"` : `${hoy.length} tareas para hoy`,
        'hoy',
        true
      );
      this.registrarNotificacion('hoy', hoy);
    }

    if (mañana.length > 0 && !this.notificacionYaEnviada('mañana', mañana)) {
      this.enviarNotificacion(
        '🌅 Tareas para MAÑANA',
        mañana.length === 1 ? `"${mañana[0].titulo}"` : `${mañana.length} tareas para mañana`,
        'mañana',
        false
      );
      this.registrarNotificacion('mañana', mañana);
    }

    const horaActual = new Date().getHours();
    if (pasadoMañana.length > 0 && horaActual === 8 && !this.notificacionYaEnviada('pasadoMañana', pasadoMañana)) {
      this.enviarNotificacion(
        '🗓️ Planificación',
        pasadoMañana.length === 1 ? `Pasado mañana: "${pasadoMañana[0].titulo}"` : `${pasadoMañana.length} tareas en 2 días`,
        'pasadoMañana',
        false
      );
      this.registrarNotificacion('pasadoMañana', pasadoMañana);
    }
  }

  notificacionYaEnviada(tipo, tareas) {
    const clave = tipo + '-' + tareas.map(t => t.titulo + t.fecha).join('|');
    return this.ultimasNotificaciones[tipo] === clave;
  }

  registrarNotificacion(tipo, tareas) {
    this.ultimasNotificaciones[tipo] = tipo + '-' + tareas.map(t => t.titulo + t.fecha).join('|');
    localStorage.setItem('ultimasNotificaciones', JSON.stringify(this.ultimasNotificaciones));
  }

  enviarNotificacion(titulo, mensaje, tipo, requireInteraction = false) {
    if (!this.permisoConcedido) return;

    const iconos = {
      bienvenida: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%2328a745"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">🐻</text></svg>',
      vencidas: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23dc3545"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">😰</text></svg>',
      hoy: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23ffc107"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">📝</text></svg>',
      mañana: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%2328a745"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">🌅</text></svg>',
      pasadoMañana: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%236f42c1"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">🗓️</text></svg>'
    };

    const vibraciones = {
      vencidas: [200, 100, 200, 100, 200],
      hoy: [200, 100, 200],
      mañana: [100, 50, 100],
      pasadoMañana: [50, 25, 50],
      bienvenida: [100, 50, 100]
    };

    const opciones = {
      body: mensaje,
      icon: iconos[tipo] || iconos.hoy,
      tag: `tareas-${tipo}`,
      requireInteraction: requireInteraction,
      vibrate: vibraciones[tipo] || [200, 100, 200],
      timestamp: Date.now(),
      actions: [
        { action: 'ver', title: '👀 Ver tareas' },
        { action: 'cerrar', title: '❌ Cerrar' }
      ]
    };

    try {
      if (this.serviceWorkerRegistrado && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          tipo: 'MOSTRAR_NOTIFICACION',
          datos: {
            titulo,
            mensaje,
            icon: opciones.icon,
            tag: opciones.tag,
            requireInteraction: opciones.requireInteraction,
            vibrate: opciones.vibrate,
            actions: opciones.actions
          }
        });
        console.log(`📨 Notificación enviada al Service Worker: ${titulo}`);
      } else {
        new Notification(titulo, opciones);
        console.log(`📨 Notificación local enviada: ${titulo}`);
      }
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
    }
  }

  probarNotificacion() {
    if (!this.permisoConcedido) {
      alert('❌ Primero debes activar los permisos de notificación');
      return;
    }

    this.enviarNotificacion(
      '🧪 Notificación de Prueba',
      '¡Si ves esto, las notificaciones funcionan perfectamente! 🎉',
      'hoy',
      false
    );
  }
}

const gestorNotificaciones = new GestorNotificaciones();

function inicializarApp() {
  console.log('🚀 Inicializando aplicación...');

  const formulario = document.getElementById("formulario-tarea");
  if (formulario) {
    formulario.addEventListener("submit", e => {
      e.preventDefault();
      agregarTarea();
    });
  }

  mostrarTareas();
  gestorNotificaciones.inicializar();

  setTimeout(() => {
    gestorNotificaciones.verificarYNotificar();
  }, 2000);

  console.log('✅ Aplicación inicializada correctamente');
}

document.addEventListener('DOMContentLoaded', inicializarApp);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('👁️ Página visible, actualizando DOM...');
    mostrarTareas();
  }
});

window.editarTarea = editarTarea;
window.eliminarTarea = eliminarTarea;