// 🐻 GESTOR DE TAREAS CON NOTIFICACIONES - ARREGLADO PARA CESAR
console.log('🚀 Iniciando aplicación de tareas para Danielle...');

// 🐻 Inicializar tareas desde localStorage (pero SIN usar en artifacts)
let tareas = [];
try {
  const tareasGuardadas = localStorage.getItem("tareas");
  tareas = tareasGuardadas ? JSON.parse(tareasGuardadas) : [];
} catch (error) {
  console.log('⚠️ Error cargando tareas:', error);
  tareas = [];
}

// 💾 Guardar tareas
const guardarTareas = () => {
  try {
    localStorage.setItem("tareas", JSON.stringify(tareas));
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

// 🎨 Mostrar tareas en el DOM
function mostrarTareas() {
  const contenedor = document.getElementById("contenedor-tarjetas");
  if (!contenedor) return;
  
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
}

// ➕ Agregar nueva tarea
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

  // Limpiar formulario
  ["titulo", "descripcion", "fecha"].forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.value = "";
  });

  console.log('✅ Tarea agregada:', titulo);
  
  // Verificar si necesitamos notificar inmediatamente
  setTimeout(() => verificarTareasCercanas(), 500);
}

// ❌ Eliminar tarea
const eliminarTarea = index => {
  if (confirm("¿Seguro que quieres eliminar esta tarea?")) {
    const tareaEliminada = tareas[index];
    tareas.splice(index, 1);
    guardarTareas();
    mostrarTareas();
    console.log('🗑️ Tarea eliminada:', tareaEliminada?.titulo);
  }
};

// ✏️ Editar tarea
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
    console.log('✏️ Tarea editada:', nuevoTitulo);
  }
};

// 🧸 SISTEMA DE NOTIFICACIONES COMPLETO
class GestorNotificaciones {
  constructor() {
    this.permisoConcedido = false;
    this.serviceWorkerRegistrado = false;
  }

  // 🚀 Inicializar todo el sistema
  async inicializar() {
    console.log('🔔 Inicializando sistema de notificaciones...');
    
    await this.registrarServiceWorker();
    await this.pedirPermisos();
    this.programarVerificacionPeriodica();
    
    console.log('✅ Sistema de notificaciones inicializado');
  }

  // 📱 Registrar Service Worker
  async registrarServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker no soportado');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      this.serviceWorkerRegistrado = true;
      console.log('✅ Service Worker registrado:', registration.scope);
      return true;
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
      return false;
    }
  }

  // 🔐 Pedir permisos de notificación
  async pedirPermisos() {
    if (!('Notification' in window)) {
      console.log('❌ Notificaciones no soportadas');
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
      }
      
      return this.permisoConcedido;
    } catch (error) {
      console.error('❌ Error pidiendo permisos:', error);
      return false;
    }
  }

  // 👋 Notificación de bienvenida
  mostrarNotificacionBienvenida() {
    if (!this.permisoConcedido) return;

    setTimeout(() => {
      new Notification('🐻 ¡Hola Danielle!', {
        body: 'Las notificaciones están activadas. Te recordaré tus tareas cuando sea necesario.',
        icon: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%2328a745"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">🐻</text></svg>',
        tag: 'bienvenida',
        requireInteraction: false
      });
    }, 1000);
  }

  // 📋 Mostrar instrucciones manuales
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

  // ⏰ Programar verificación SOLO en 3 horarios específicos (ULTRA EFICIENTE)
  programarVerificacionPeriodica() {
    console.log('⏰ Configurando verificaciones precisas: 8AM, 12PM, 5PM');

    // Función para programar un solo timeout hasta el próximo horario
    const programarProximaVerificacion = () => {
      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      
      // Horarios objetivo en milisegundos
      const horarios = [
        { hora: 8, nombre: "🌅 Buenos días" },
        { hora: 12, nombre: "🌞 Mediodía" },
        { hora: 17, nombre: "🌆 Tarde" }
      ];

      let proximoTimeout = null;
      let nombreProximo = "";

      // Buscar el próximo horario de HOY
      for (let horario of horarios) {
        const tiempoHorario = new Date(hoy.getTime()).setHours(horario.hora, 0, 0, 0);
        if (tiempoHorario > ahora.getTime()) {
          proximoTimeout = tiempoHorario - ahora.getTime();
          nombreProximo = horario.nombre;
          break;
        }
      }

      // Si no hay más horarios hoy, programar para mañana 8 AM
      if (!proximoTimeout) {
        const mañana8AM = new Date(hoy.getTime() + 24 * 60 * 60 * 1000).setHours(8, 0, 0, 0);
        proximoTimeout = mañana8AM - ahora.getTime();
        nombreProximo = "🌅 Buenos días (mañana)";
      }

      const horasRestantes = Math.round(proximoTimeout / (1000 * 60 * 60 * 100)) / 10;
      console.log(`⏱️ Próxima verificación: ${nombreProximo} en ${horasRestantes}h`);

      // Programar UNA SOLA verificación
      setTimeout(() => {
        console.log(`🔔 Ejecutando: ${nombreProximo}`);
        this.verificarYNotificar();
        
        // Después de ejecutar, programar la siguiente
        programarProximaVerificacion();
      }, proximoTimeout);
    };

    // Inicializar con una sola llamada
    programarProximaVerificacion();

    // SOLO verificar al abrir la app SI han pasado más de 2 horas
    let ultimaVerificacionManual = localStorage.getItem('ultimaVerificacion') || 0;
    
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const ahora = Date.now();
        const dosHoras = 2 * 60 * 60 * 1000;
        
        if (ahora - ultimaVerificacionManual > dosHoras) {
          setTimeout(() => {
            console.log('👁️ Verificación manual (>2h desde la última)');
            this.verificarYNotificar();
            localStorage.setItem('ultimaVerificacion', ahora.toString());
            ultimaVerificacionManual = ahora;
          }, 1000);
        }
      }
    });

    console.log('✅ Sistema ultra-eficiente activado - Solo 3 verificaciones/día');
  }

  // 🔍 Verificar tareas y enviar notificaciones (VERSIÓN ULTRA LIGERA)
  verificarYNotificar() {
    if (!this.permisoConcedido) {
      console.log('⚠️ Sin permisos para notificar');
      return;
    }

    // Obtener fechas una sola vez
    const fechaHoy = obtenerFechaHoyString();
    const fechaManana = obtenerFechaMananaString();
    const fechaPasadoManana = obtenerFechaPasadoMananaString();
    
    // Filtrar tareas de una sola pasada (más eficiente)
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

    // Enviar notificaciones solo si hay tareas (evita procesamiento innecesario)
    if (pasadas.length > 0) {
      this.enviarNotificacion(
        '😰 ¡Tareas vencidas!',
        `${pasadas.length} tarea(s) vencida(s): ${pasadas[0].titulo}${pasadas.length > 1 ? ' y más...' : ''}`,
        'vencidas',
        true
      );
    }

    if (hoy.length > 0) {
      this.enviarNotificacion(
        '📝 ¡Tareas para HOY!',
        hoy.length === 1 
          ? `"${hoy[0].titulo}"`
          : `${hoy.length} tareas para hoy`,
        'hoy',
        true
      );
    }

    if (mañana.length > 0) {
      this.enviarNotificacion(
        '🌅 Tareas para MAÑANA',
        mañana.length === 1
          ? `"${mañana[0].titulo}"`
          : `${mañana.length} tareas para mañana`,
        'mañana',
        false
      );
    }

    // Tareas de pasado mañana solo a las 8 AM
    const horaActual = new Date().getHours();
    if (pasadoMañana.length > 0 && horaActual === 8) {
      this.enviarNotificacion(
        '🗓️ Planificación',
        pasadoMañana.length === 1
          ? `Pasado mañana: "${pasadoMañana[0].titulo}"`
          : `${pasadoMañana.length} tareas en 2 días`,
        'pasadoMañana',
        false
      );
    }
  }

  // 📨 Enviar notificación individual
  enviarNotificacion(titulo, mensaje, tipo, requireInteraction = false) {
    if (!this.permisoConcedido) return;

    const iconos = {
      vencidas: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23dc3545"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">😰</text></svg>',
      hoy: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23ffc107"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">📝</text></svg>',
      mañana: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%2328a745"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">🌅</text></svg>',
      pasadoMañana: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%236f42c1"/><text x="64" y="80" font-family="Arial" font-size="50" fill="white" text-anchor="middle">🗓️</text></svg>'
    };

    const vibraciones = {
      vencidas: [200, 100, 200, 100, 200], // Urgente
      hoy: [200, 100, 200], // Normal
      mañana: [100, 50, 100], // Suave
      pasadoMañana: [50, 25, 50] // Muy suave
    };

    const opciones = {
      body: mensaje,
      icon: iconos[tipo] || iconos.hoy,
      tag: `tareas-${tipo}`,
      requireInteraction: requireInteraction,
      vibrate: vibraciones[tipo] || [200, 100, 200],
      timestamp: Date.now(),
      actions: [
        {
          action: 'ver',
          title: '👀 Ver tareas'
        },
        {
          action: 'cerrar',
          title: '❌ Cerrar'
        }
      ]
    };

    try {
      new Notification(titulo, opciones);
      console.log(`📨 Notificación enviada: ${titulo}`);
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
    }
  }

  // 🧪 Función de prueba
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

// 🧸 Alertas Sweet con OSITOS (para uso en la app)
function verificarTareasCercanas() {
  const fechaHoy = obtenerFechaHoyString();
  const fechaManana = obtenerFechaMananaString();
  
  const tareasHoy = tareas.filter(t => t.fecha === fechaHoy);
  const tareasManana = tareas.filter(t => t.fecha === fechaManana);
  const tareasPasadas = tareas.filter(t => t.fecha < fechaHoy);

  console.log('🔍 Verificando tareas cercanas:', {
    hoy: tareasHoy.length,
    mañana: tareasManana.length,
    pasadas: tareasPasadas.length
  });

  const mostrarAlerta = (titulo, lista, imgUrl, fondo, textoBtn, iconoColor) => {
    if (lista.length === 0 || typeof Swal === 'undefined') return;
    
    Swal.fire({
      title: titulo,
      html: lista.map(t => `📌 <strong>${t.titulo}</strong> - ${t.descripcion}`).join("<br><br>"),
      imageUrl: imgUrl,
      imageWidth: 250,
      imageHeight: 200,
      imageAlt: 'Osito',
      background: fondo,
      color: "#333",
      confirmButtonText: textoBtn,
      confirmButtonColor: iconoColor,
      showCloseButton: true,
      timer: 8000,
      timerProgressBar: true,
      customClass: {
        popup: 'animated-popup'
      }
    });
  };

  let delay = 500;

  // 😰 OSITO ASUSTADO - Tareas pasadas
  if (tareasPasadas.length > 0) {
    setTimeout(() => {
      mostrarAlerta(
        "😰 ¡Ups! Se te pasaron unas tareas...", 
        tareasPasadas,
        "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif",
        "#ffe6e6", 
        "¡Ay no! ¡Mi Mamá me va a regañar! 😱",
        "#dc3545"
      );
    }, delay);
    delay += 3000;
  }

  // 🤔 OSITO PENSATIVO - Tareas de hoy
  if (tareasHoy.length > 0) {
    setTimeout(() => {
      mostrarAlerta(
        "🤔 Tienes tareas para HOY, ¡Vamos a darle!", 
        tareasHoy,
        "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
        "#fff3cd", 
        "¡Manos a la obra! 💪",
        "#ffc107"
      );
    }, delay);
    delay += 3000;
  }

  // 😊 OSITO FELIZ - Tareas de mañana
  if (tareasManana.length > 0) {
    setTimeout(() => {
      mostrarAlerta(
        "😊 ¡Atención! Tienes tareas para mañana", 
        tareasManana,
        "https://media.giphy.com/media/IcGkqdUmYLFGE/giphy.gif",
        "#d1f2eb", 
        "¡Perfecto! Estoy preparada 🎉",
        "#28a745"
      );
    }, delay);
  }
}

// 🌟 INICIALIZACIÓN PRINCIPAL
const gestorNotificaciones = new GestorNotificaciones();

// 🚀 Función principal de inicialización
function inicializarApp() {
  console.log('🚀 Inicializando aplicación...');

  // Configurar formulario
  const formulario = document.getElementById("formulario-tarea");
  if (formulario) {
    formulario.addEventListener("submit", e => {
      e.preventDefault();
      agregarTarea();
    });
  }

  // Mostrar tareas existentes
  mostrarTareas();
  
  // Inicializar notificaciones
  gestorNotificaciones.inicializar();

  // Verificar tareas después de cargar
  setTimeout(() => {
    verificarTareasCercanas();
    gestorNotificaciones.verificarYNotificar();
  }, 2000);

  console.log('✅ Aplicación inicializada correctamente');
}

// 📱 Event listeners
document.addEventListener('DOMContentLoaded', inicializarApp);

// Verificar cuando la página se hace visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    setTimeout(() => {
      gestorNotificaciones.verificarYNotificar();
    }, 1000);
  }
});

// Hacer funciones globales para los onclick en HTML
window.editarTarea = editarTarea;
window.eliminarTarea = eliminarTarea;