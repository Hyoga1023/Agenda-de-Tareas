/**
 * Chatbot para Agenda de Tareas - Solo Groq API
 * Implementación definitiva y optimizada con configuración dinámica
 * Autor: Cortana para Cesar Martinez
 */

class ChatbotTareas {
  constructor() {
    // Configuración de Groq
    this.groqConfig = null;
    this.apiKey = null;
    
    // Referencias DOM
    this.elementos = {
      btnConsulta: null,
      inputConsulta: null,
      respuestaDiv: null
    };
    
    this.inicializar();
  }

  /**
   * Valida la configuración de Groq con configuración dinámica
   */
  validarConfiguracion() {
    // Verificar que config existe
    if (typeof config === 'undefined') {
      throw new Error('❌ Archivo config.js no encontrado. Inclúyelo antes que chatbot.js');
    }

    // Intentar cargar API key desde localStorage
    if (typeof cargarAPIKey === 'function') {
      cargarAPIKey();
    }

    // Verificar API key
    this.apiKey = config.GROQ_API_KEY;
    if (!this.apiKey || this.apiKey === 'TU_GROQ_API_KEY_AQUI' || this.apiKey === null || this.apiKey.length < 20) {
      // En lugar de throw error, mostrar mensaje de configuración
      setTimeout(() => {
        this.mostrarRespuesta(config.CHATBOT_CONFIG.mensajes.sin_api_key, 'warning');
      }, 500);
      return false; // No configurado, pero no bloquear la app
    }

    // Configurar Groq
    this.groqConfig = config.CHATBOT_CONFIG.groq;
    
    console.log('✅ Groq API configurada correctamente');
    return true;
  }

  /**
   * Inicializa el chatbot
   */
  inicializar() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.configurarElementos());
    } else {
      this.configurarElementos();
    }
  }

  /**
   * Configura elementos DOM y eventos
   */
  configurarElementos() {
    this.elementos.btnConsulta = document.getElementById('btn-consulta');
    this.elementos.inputConsulta = document.getElementById('consulta');
    this.elementos.respuestaDiv = document.getElementById('respuesta-chatbot');

    if (!this.validarElementos()) {
      console.warn('⚠️ Elementos del chatbot no encontrados en el DOM');
      return;
    }

    try {
      this.validarConfiguracion();
      this.configurarEventListeners();
      this.mostrarMensajeBienvenida();
    } catch (error) {
      console.error('Error de configuración:', error);
      this.mostrarRespuesta(error.message, 'error');
    }
  }

  /**
   * Valida elementos DOM
   */
  validarElementos() {
    return this.elementos.btnConsulta && 
           this.elementos.inputConsulta && 
           this.elementos.respuestaDiv;
  }

  /**
   * Configura event listeners
   */
  configurarEventListeners() {
    // Click en botón
    this.elementos.btnConsulta.addEventListener('click', (e) => {
      e.preventDefault();
      this.procesarConsulta();
    });

    // Enter en input
    this.elementos.inputConsulta.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.procesarConsulta();
      }
    });

    // Focus en input
    this.elementos.inputConsulta.addEventListener('focus', () => {
      if (this.elementos.respuestaDiv.innerHTML.includes('mensaje-bienvenida')) {
        this.elementos.respuestaDiv.innerHTML = '';
      }
    });
  }

  /**
   * Mensaje de bienvenida
   */
  mostrarMensajeBienvenida() {
    const mensajeBienvenida = `
      <div class="mensaje-bienvenida">
        <p>👋 ¡Ey Cesar! Soy tu asistente inteligente para consultar tus tareas.</p>
        <p><small>🚀 Powered by Groq (Llama 3.1) - Súper rápido</small></p>
        <p><strong>Prueba estas consultas:</strong></p>
        <ul>
          <li>"¿Qué tareas tengo para mañana?"</li>
          <li>"¿Cuántas tareas de matemáticas tengo?"</li>
          <li>"¿Hay alguna tarea vencida?"</li>
          <li>"Resume mis tareas de esta semana"</li>
          <li>"¿Qué materia tengo más pendiente?"</li>
          <li>"Dame consejos para organizarme mejor"</li>
        </ul>
        <p><small>💡 Puedo entender lenguaje natural - pregúntame como quieras</small></p>
      </div>
    `;
    this.elementos.respuestaDiv.innerHTML = mensajeBienvenida;
  }

  /**
   * Obtiene tareas del localStorage
   */
  obtenerTareas() {
    try {
      const tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
      return tareas;
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      return [];
    }
  }

  /**
   * Construye el contexto para Groq
   */
  construirContexto(consulta) {
    const tareas = this.obtenerTareas();
    const fechaHoy = new Date();
    const fechaHoyStr = fechaHoy.toISOString().split('T')[0];
    const diaSemana = fechaHoy.toLocaleDateString('es-ES', { weekday: 'long' });

    // Analizar y formatear tareas
    let contextoTareas = '';
    if (tareas.length === 0) {
      contextoTareas = 'Cesar no tiene tareas registradas actualmente.';
    } else {
      contextoTareas = tareas.map((tarea, index) => {
        const fechaTarea = new Date(tarea.fecha);
        const diasDiferencia = Math.ceil((fechaTarea - fechaHoy) / (1000 * 60 * 60 * 24));
        
        let estadoFecha = '';
        if (diasDiferencia < 0) {
          estadoFecha = `(VENCIDA - hace ${Math.abs(diasDiferencia)} días)`;
        } else if (diasDiferencia === 0) {
          estadoFecha = '(HOY - URGENTE)';
        } else if (diasDiferencia === 1) {
          estadoFecha = '(MAÑANA)';
        } else if (diasDiferencia <= 7) {
          estadoFecha = `(en ${diasDiferencia} días)`;
        } else {
          estadoFecha = `(en ${diasDiferencia} días)`;
        }

        return `${index + 1}. Materia: ${tarea.titulo || 'Sin materia'}
   Descripción: ${tarea.descripcion || 'Sin descripción'}
   Fecha límite: ${tarea.fecha} ${estadoFecha}`;
      }).join('\n\n');
    }

    return `Eres un asistente inteligente especializado en gestión de tareas académicas para Cesar Martinez, un estudiante de desarrollo de software que vive en Yumbo, Colombia.

INFORMACIÓN ACTUAL:
- Fecha de hoy: ${fechaHoyStr} (${diaSemana})
- Hora actual: ${fechaHoy.toLocaleTimeString('es-ES')}

TAREAS DE CESAR:
${contextoTareas}

INSTRUCCIONES PARA TUS RESPUESTAS:
- Responde SIEMPRE en español
- Sé amigable, directo y útil
- Si preguntan por fechas específicas (hoy, mañana, esta semana), calcula correctamente
- Si no hay tareas para una fecha, dilo claramente pero de forma positiva
- Puedes sugerir organización, consejos de estudio o recordatorios
- Usa emojis para hacer las respuestas más visuales
- Si las tareas están vencidas, marca la urgencia pero mantén un tono motivador
- Puedes ser casual y usar el nombre "Cesar" en tus respuestas
- Si preguntan por materias específicas, busca en los títulos de las tareas

CONSULTA DE CESAR: ${consulta}

Responde de forma útil y específica basándote en sus tareas reales:`;
  }

  /**
   * Procesa la consulta del usuario con verificación dinámica de API key
   */
  async procesarConsulta() {
    const consulta = this.elementos.inputConsulta.value.trim();

    // Validaciones básicas
    if (!consulta) {
      this.mostrarRespuesta('Por favor, escribe una pregunta sobre tus tareas 😊', 'warning');
      return;
    }

    // Verificar API key dinámicamente antes de cada consulta
    if (typeof cargarAPIKey === 'function') {
      cargarAPIKey();
    }
    
    this.apiKey = config.GROQ_API_KEY;
    if (!this.apiKey || this.apiKey === 'TU_GROQ_API_KEY_AQUI' || this.apiKey === null || this.apiKey.length < 20) {
      this.mostrarRespuesta(config.CHATBOT_CONFIG.mensajes.sin_api_key, 'warning');
      return;
    }

    // Configurar Groq si no está configurado
    if (!this.groqConfig) {
      this.groqConfig = config.CHATBOT_CONFIG.groq;
    }

    // UI: mostrar carga
    this.mostrarRespuesta(config.CHATBOT_CONFIG.mensajes.cargando, 'loading');
    this.elementos.btnConsulta.disabled = true;

    try {
      const contexto = this.construirContexto(consulta);
      const respuesta = await this.llamarGroqAPI(contexto);
      
      if (respuesta && respuesta.trim()) {
        this.mostrarRespuesta(respuesta, 'success');
        this.elementos.inputConsulta.value = ''; // Limpiar input
      } else {
        throw new Error('Respuesta vacía del modelo');
      }

    } catch (error) {
      console.error('Error en procesarConsulta:', error);
      this.manejarError(error);
    } finally {
      this.elementos.btnConsulta.disabled = false;
    }
  }

  /**
   * Llama a la API de Groq
   */
  async llamarGroqAPI(contexto) {
    const response = await fetch(this.groqConfig.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.groqConfig.modelo,
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente útil y amigable especializado en gestión de tareas académicas. Siempre respondes en español de forma clara, útil y motivadora.'
          },
          {
            role: 'user',
            content: contexto
          }
        ],
        max_tokens: this.groqConfig.max_tokens,
        temperature: this.groqConfig.temperature,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Manejo específico de errores de Groq
      if (response.status === 401) {
        throw new Error('API Key inválida. Verifica tu key de Groq');
      } else if (response.status === 429) {
        throw new Error('Límite de requests excedido. Espera un momento e intenta de nuevo.');
      } else if (response.status === 500) {
        throw new Error('Error interno de Groq. Intenta de nuevo en unos segundos.');
      }
      
      throw new Error(errorData.error?.message || `Error HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta de Groq recibida:', data); // Para debug

    return data.choices[0]?.message?.content?.trim() || null;
  }

  /**
   * Maneja errores de la API
   */
  manejarError(error) {
    let mensajeError = '❌ ';

    if (error.message.includes('API Key inválida')) {
      mensajeError += 'Tu API Key de Groq parece ser inválida.\n\n🔧 Solución: Haz clic en "⚙️ Configurar API" y verifica tu key';
    } else if (error.message.includes('Límite de requests')) {
      mensajeError += 'Has hecho muchas consultas muy rápido. Espera 30 segundos e intenta de nuevo.';
    } else if (error.message.includes('Error interno')) {
      mensajeError += 'Groq está teniendo problemas temporales. Intenta de nuevo en unos segundos.';
    } else if (error.message.includes('fetch')) {
      mensajeError += 'Problema de conexión a internet. Verifica tu conexión.';
    } else {
      mensajeError += `Error inesperado: ${error.message}`;
    }

    this.mostrarRespuesta(mensajeError, 'error');
  }

  /**
   * Muestra respuesta en el DOM
   */
  mostrarRespuesta(mensaje, tipo = 'info') {
    const iconos = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      loading: '⏳',
      info: 'ℹ️'
    };

    const icono = iconos[tipo] || iconos.info;
    
    // Convertir saltos de línea a HTML y mantener formato
    const mensajeHTML = mensaje
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrita
      .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Cursiva
    
    this.elementos.respuestaDiv.innerHTML = `
      <div class="respuesta-${tipo}">
        <span class="respuesta-icono">${icono}</span>
        <div class="respuesta-contenido">${mensajeHTML}</div>
      </div>
    `;

    // Scroll suave
    this.elementos.respuestaDiv.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }

  /**
   * Método público para actualizar tareas
   */
  actualizarTareas() {
    console.log('📋 Tareas actualizadas - Chatbot sincronizado');
  }

  /**
   * Método para verificar estado de la API
   */
  async verificarConexion() {
    try {
      const respuesta = await this.llamarGroqAPI('Responde solo "OK" si funciona correctamente.');
      return respuesta === 'OK';
    } catch (error) {
      console.error('Error verificando conexión:', error);
      return false;
    }
  }
}

// Instancia global
let chatbotInstance = null;

// Inicialización automática
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    chatbotInstance = new ChatbotTareas();
    window.chatbotTareas = chatbotInstance;
  });
} else {
  chatbotInstance = new ChatbotTareas();
  window.chatbotTareas = chatbotInstance;
}

// Funciones helper para integración
function notificarCambioTareas() {
  if (window.chatbotTareas) {
    window.chatbotTareas.actualizarTareas();
  }
}

function enviarConsulta() {
  if (window.chatbotTareas) {
    window.chatbotTareas.procesarConsulta();
  }
}

// Función para verificar que todo está funcionando
async function testearChatbot() {
  if (window.chatbotTareas) {
    console.log('🧪 Testeando conexión con Groq...');
    const funciona = await window.chatbotTareas.verificarConexion();
    console.log(funciona ? '✅ Chatbot funcionando correctamente' : '❌ Hay problemas con el chatbot');
    return funciona;
  }
  return false;
}