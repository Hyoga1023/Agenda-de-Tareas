// 🐻 Inicializar tareas desde localStorage
const tareas = JSON.parse(localStorage.getItem("tareas")) || [];

// 💾 Guardar tareas
const guardarTareas = () => localStorage.setItem("tareas", JSON.stringify(tareas));

// 📅 Formatear fecha a YYYY-MM-DD (ARREGLADO para evitar desfase)
const formatearFecha = fecha => {
  // Usamos la fecha tal como viene, sin crear nuevo objeto Date
  if (typeof fecha === 'string') {
    return fecha; // Si ya es string en formato correcto, la devolvemos
  }
  const f = new Date(fecha);
  // Ajustamos la zona horaria para evitar el desfase
  const offsetMs = f.getTimezoneOffset() * 60 * 1000;
  const fechaLocal = new Date(f.getTime() - offsetMs);
  return fechaLocal.toISOString().split('T')[0];
};

// 🧼 Normalizar fecha quitando horas (ARREGLADO)
const fechaSinHora = fecha => {
  let fechaStr;
  if (typeof fecha === 'string') {
    fechaStr = fecha;
  } else {
    fechaStr = formatearFecha(fecha);
  }
  // Creamos la fecha directamente con el string para evitar problemas de zona horaria
  const partes = fechaStr.split('-');
  return new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
};

// 🎨 Mostrar tareas en el DOM (TAMBIÉN CON MÉTODO MACHETE)
function mostrarTareas() {
  const contenedor = document.getElementById("contenedor-tarjetas");
  contenedor.innerHTML = "";

  // MISMO método bruto
  const fechaHoy = obtenerFechaHoyString();
  const fechaManana = obtenerFechaMananaString();

  if (tareas.length === 0) {
    contenedor.innerHTML = `<p>No hay tareas aún. ¡Agrega una! 😊</p>`;
    return;
  }

  tareas.forEach((tarea, index) => {
    const fechaTarea = tarea.fecha;
    let clase = "";

    // Comparación DIRECTA de strings
    if (fechaTarea === fechaHoy) clase = "hoy";
    else if (fechaTarea === fechaManana) clase = "mañana";
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
  const titulo = document.getElementById("titulo").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const fecha = document.getElementById("fecha").value;

  if (!titulo || !descripcion || !fecha) {
    alert("Debes llenar todos los campos 📝");
    return;
  }

  tareas.push({ titulo, descripcion, fecha });
  guardarTareas();
  mostrarTareas();

  // Limpiar formulario
  ["titulo", "descripcion", "fecha"].forEach(id => document.getElementById(id).value = "");
}

// ❌ Eliminar tarea
const eliminarTarea = index => {
  if (confirm("¿Seguro que quieres eliminar esta tarea?")) {
    tareas.splice(index, 1);
    guardarTareas();
    mostrarTareas();
  }
};

// ✏️ Editar tarea
const editarTarea = index => {
  const tarea = tareas[index];
  const nuevoTitulo = prompt("Nuevo nombre de la tarea:", tarea.titulo);
  const nuevaDescripcion = prompt("Nueva descripción:", tarea.descripcion);
  const nuevaFecha = prompt("Nueva fecha (YYYY-MM-DD):", tarea.fecha);

  if (nuevoTitulo && nuevaDescripcion && nuevaFecha) {
    tareas[index] = { titulo: nuevoTitulo, descripcion: nuevaDescripcion, fecha: nuevaFecha };
    guardarTareas();
    mostrarTareas();
  }
};

// 🔧 Funciones auxiliares para manejar fechas CORRECTAMENTE
function obtenerFechaHoyString() {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

function obtenerFechaMananaString() {
  const mañana = new Date();
  mañana.setDate(mañana.getDate() + 1);
  const año = mañana.getFullYear();
  const mes = String(mañana.getMonth() + 1).padStart(2, '0');
  const dia = String(mañana.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

// 🧸 Alertas Sweet con OSITOS CORRECTOS (MÉTODO MACHETE - PERO BIEN HECHO)
function verificarTareasCercanas() {
  // MÉTODO BRUTO: Trabajamos solo con strings, nada de objetos Date locos
  const fechaHoy = obtenerFechaHoyString(); // "2025-07-25"
  const fechaManana = obtenerFechaMananaString(); // "2025-07-26"
  
  const tareasHoy = [], tareasManana = [], tareasPasadas = [];

  console.log('=== MÉTODO MACHETE ===');
  console.log('Hoy (string):', fechaHoy);
  console.log('Mañana (string):', fechaManana);

  tareas.forEach(t => {
    const fechaTarea = t.fecha; // Ya viene como string "2025-07-25"
    
    console.log(`Tarea: "${t.titulo}" - Fecha: "${fechaTarea}"`);
    
    // Comparación DIRECTA de strings - no hay vuelta de hoja
    if (fechaTarea === fechaHoy) {
      tareasHoy.push(t);
      console.log('  ✅ ES HOY');
    }
    else if (fechaTarea === fechaManana) {
      tareasManana.push(t);
      console.log('  ✅ ES MAÑANA');
    }
    else if (fechaTarea < fechaHoy) { // Los strings se comparan alfabéticamente, pero funciona para fechas YYYY-MM-DD
      tareasPasadas.push(t);
      console.log('  ❌ ES PASADA');
    }
    else {
      console.log('  ⏭️ ES FUTURA');
    }
  });

  const mostrarAlerta = (titulo, lista, imgUrl, fondo, textoBtn, iconoColor) => {
    if (lista.length === 0) return;
    
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
      timer: 8000, // Se cierra automáticamente después de 8 segundos
      timerProgressBar: true,
      customClass: {
        popup: 'animated-popup'
      }
    });
  };

  // Secuencia de alertas con ositos temáticos
  let delay = 500;

  // 😰 OSITO ASUSTADO - Tareas pasadas
  if (tareasPasadas.length > 0) {
    setTimeout(() => {
      mostrarAlerta(
        "😰 ¡Ups! Se te pasaron unas tareas...", 
        tareasPasadas,
        "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif", // Osito asustado/preocupado
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
        "🤔 Tienes tareas para HOY, Vamos a darle!", 
        tareasHoy,
        "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif", // Osito pensativo
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
        "😊 ¡Atención Señorita! Tienes tareas para mañana", 
        tareasManana,
        "https://media.giphy.com/media/IcGkqdUmYLFGE/giphy.gif", // Osito feliz/celebrando
        "#d1f2eb", 
        "¡Perfecto! Estoy preparado 🎉",
        "#28a745"
      );
    }, delay);
  }
}

// 🚀 Inicializar app
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("formulario-tarea").addEventListener("submit", e => {
    e.preventDefault();
    agregarTarea();
  });

  mostrarTareas();
  
  // Verificar tareas cercanas después de que todo esté cargado
  setTimeout(() => {
    verificarTareasCercanas();
  }, 1000);
});

// 🔄 Verificar tareas periódicamente (cada 30 minutos)
setInterval(verificarTareasCercanas, 30 * 60 * 1000);
// 🔔 GESTOR DE NOTIFICACIONES - Agregar esto a tu archivo principal

class NotificationManager {
  constructor() {
    this.permission = false;
    this.registration = null;
  }

  // 🚀 Inicializar PWA y notificaciones
  async inicializar() {
    console.log('🚀 Inicializando PWA...');
    
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registrado:', this.registration);
      } catch (error) {
        console.error('❌ Error registrando Service Worker:', error);
      }
    }

    // Pedir permisos de notificación
    await this.pedirPermisos();
    
    // Programar notificaciones diarias
    this.programarNotificacionesDiarias();
  }

  // 🔐 Pedir permisos para notificaciones
  async pedirPermisos() {
    if (!('Notification' in window)) {
      console.log('❌ Este navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = true;
      console.log('✅ Permisos de notificación ya concedidos');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission === 'granted';
      
      if (this.permission) {
        console.log('✅ Permisos de notificación concedidos');
        this.mostrarNotificacionBienvenida();
      } else {
        console.log('❌ Permisos de notificación denegados');
      }
      
      return this.permission;
    }

    console.log('❌ Notificaciones bloqueadas por el usuario');
    return false;
  }

  // 👋 Notificación de bienvenida
  mostrarNotificacionBienvenida() {
    if (!this.permission) return;

    new Notification('🐻 ¡Bienvenido Cesar!', {
      body: 'Las notificaciones están activadas. Te recordaré tus tareas todos los días.',
      icon: 'https://via.placeholder.com/128x128/28a745/ffffff?text=✅',
      tag: 'bienvenida'
    });
  }

  // ⏰ Programar notificaciones diarias
  programarNotificacionesDiarias() {
    // Programar para las 8:00 AM todos los días
    const ahora = new Date();
    const mañana8AM = new Date();
    mañana8AM.setDate(ahora.getDate() + 1);
    mañana8AM.setHours(8, 0, 0, 0);

    const tiempoHasta8AM = mañana8AM.getTime() - ahora.getTime();

    console.log(`⏰ Próxima notificación en ${Math.round(tiempoHasta8AM / 1000 / 60 / 60)} horas`);

    setTimeout(() => {
      this.enviarNotificacionDiaria();
      // Reprogramar para el siguiente día
      setInterval(() => this.enviarNotificacionDiaria(), 24 * 60 * 60 * 1000);
    }, tiempoHasta8AM);
  }

  // 📨 Enviar notificación diaria
  enviarNotificacionDiaria() {
    if (!this.permission) return;

    const tareas = JSON.parse(localStorage.getItem("tareas")) || [];
    const fechaHoy = this.obtenerFechaHoyString();
    const tareasHoy = tareas.filter(t => t.fecha === fechaHoy);

    let titulo = '🌅 ¡Buenos días Cesar!';
    let mensaje = '';
    let icono = 'https://via.placeholder.com/128x128/ffc107/ffffff?text=☀️';

    if (tareasHoy.length === 0) {
      mensaje = '¡Hoy no tienes tareas! Día libre para relajarte 😎';
      icono = 'https://via.placeholder.com/128x128/28a745/ffffff?text=😎';
    } else if (tareasHoy.length === 1) {
      mensaje = `Tienes 1 tarea para hoy: "${tareasHoy[0].titulo}" 📝`;
      icono = 'https://via.placeholder.com/128x128/ffc107/ffffff?text=📝';
    } else {
      mensaje = `Tienes ${tareasHoy.length} tareas para hoy. ¡A trabajar! 💪`;
      icono = 'https://via.placeholder.com/128x128/dc3545/ffffff?text=💪';
    }

    new Notification(titulo, {
      body: mensaje,
      icon: icono,
      tag: 'recordatorio-diario',
      requireInteraction: true, // No se cierra automáticamente
      actions: [
        {
          action: 'ver',
          title: '👀 Ver tareas'
        }
      ]
    });

    console.log('📨 Notificación diaria enviada:', mensaje);
  }

  // 📅 Función auxiliar para obtener fecha
  obtenerFechaHoyString() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  // 🧪 Función de prueba (para testing)
  probarNotificacion() {
    if (!this.permission) {
      alert('❌ Primero debes activar los permisos de notificación');
      return;
    }

    new Notification('🧪 Notificación de Prueba', {
      body: '¡Si ves esto, las notificaciones funcionan perfectamente! 🎉',
      icon: 'https://via.placeholder.com/128x128/4285f4/ffffff?text=🧪'
    });
  }
}

// 🚀 Inicializar el gestor de notificaciones
const notificationManager = new NotificationManager();

// 📱 Código para agregar a tu aplicación principal
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar PWA y notificaciones
  notificationManager.inicializar();

  // Agregar botón de prueba (opcional)
  const btnPrueba = document.createElement('button');
  btnPrueba.textContent = '🧪 Probar Notificación';
  btnPrueba.onclick = () => notificationManager.probarNotificacion();
  btnPrueba.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; padding: 10px; background: #4285f4; color: white; border: none; border-radius: 5px; cursor: pointer;';
  document.body.appendChild(btnPrueba);
});