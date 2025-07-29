
/**
 * Chatbot para Agenda de Tareas - Optimizado y con diseño restaurado
 * Autor: Cortana para Cesar Martinez
 */
class ChatbotTareas {
  constructor() {
    this.groqConfig = null;
    this.apiKey = null;
    this.elementos = { btnConsulta: null, inputConsulta: null, respuestaDiv: null };
    this.isProcessing = false;
    this.debounceTimeout = null;
    this.inicializar();
  }

  validarConfiguracion() {
    if (typeof config === 'undefined') {
      console.warn('❌ config.js no encontrado');
      return false;
    }
    this.apiKey = config.GROQ_API_KEY;
    if (!this.apiKey || this.apiKey === 'TU_GROQ_API_KEY_AQUI' || this.apiKey.length < 20) {
      setTimeout(() => this.mostrarRespuesta(config.CHATBOT_CONFIG.mensajes.sin_api_key, 'warning'), 500);
      return false;
    }
    this.groqConfig = config.CHATBOT_CONFIG.groq;
    console.log('✅ Groq API configurada');
    return true;
  }

  inicializar() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.configurarElementos());
    } else {
      this.configurarElementos();
    }
  }

  configurarElementos() {
    this.elementos.btnConsulta = document.getElementById('btn-consulta');
    this.elementos.inputConsulta = document.getElementById('consulta');
    this.elementos.respuestaDiv = document.getElementById('respuesta-chatbot');
    if (!this.validarElementos()) {
      console.warn('⚠️ Elementos del chatbot no encontrados');
      return;
    }
    this.validarConfiguracion();
    this.configurarEventListeners();
    this.mostrarMensajeBienvenida();
  }

  validarElementos() {
    return this.elementos.btnConsulta && this.elementos.inputConsulta && this.elementos.respuestaDiv;
  }

  configurarEventListeners() {
    const debounce = (callback, wait) => (...args) => {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => callback(...args), wait);
    };
    this.elementos.btnConsulta.addEventListener('click', debounce((e) => {
      e.preventDefault();
      this.procesarConsulta();
    }, 300));
    this.elementos.inputConsulta.addEventListener('keypress', debounce((e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.procesarConsulta();
      }
    }, 300));
    this.elementos.inputConsulta.addEventListener('focus', () => {
      if (this.elementos.respuestaDiv.innerHTML.includes('mensaje-bienvenida')) {
        this.elementos.respuestaDiv.innerHTML = '';
      }
    });
  }

  mostrarMensajeBienvenida() {
    const mensajeBienvenida = `
      <div class="mensaje-bienvenida">
        <p>👋 ¡Ey Danielle! Soy tu asistente inteligente para consultar tus tareas.</p>
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

  obtenerTareas() {
    return window.getTareas ? window.getTareas() : [];
  }

  construirContexto(consulta) {
    const tareas = this.obtenerTareas();
    const fechaHoy = new Date();
    const fechaHoyStr = fechaHoy.toISOString().split('T')[0];
    const diaSemana = fechaHoy.toLocaleDateString('es-ES', { weekday: 'long' });

    let contextoTareas = tareas.length === 0 ? 'Danielle no tiene tareas registradas.' : tareas.map((tarea, index) => {
      const fechaTarea = new Date(tarea.fecha);
      const diasDiferencia = Math.ceil((fechaTarea - fechaHoy) / (1000 * 60 * 60 * 24));
      let estadoFecha = diasDiferencia < 0 ? `(VENCIDA - hace ${Math.abs(diasDiferencia)} días)` : 
                       diasDiferencia === 0 ? '(HOY - URGENTE)' : 
                       diasDiferencia === 1 ? '(MAÑANA)' : `(en ${diasDiferencia} días)`;
      return `${index + 1}. Materia: ${tarea.titulo || 'Sin materia'}\nDescripción: ${tarea.descripcion || 'Sin descripción'}\nFecha límite: ${tarea.fecha} ${estadoFecha}`;
    }).join('\n\n');

    return `Eres un asistente para Danielle, estudiante en Yumbo, Colombia.
Fecha actual: ${fechaHoyStr} (${diaSemana})
Tareas:
${contextoTareas}
Responde en español, amigable, con emojis. Consulta: ${consulta}`;
  }

  async procesarConsulta() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const consulta = this.elementos.inputConsulta.value.trim();
    if (!consulta) {
      this.mostrarRespuesta('Por favor, escribe una pregunta 😊', 'warning');
      this.isProcessing = false;
      return;
    }
    if (!this.groqConfig || !this.apiKey) {
      this.mostrarRespuesta(config.CHATBOT_CONFIG.mensajes.sin_api_key, 'warning');
      this.isProcessing = false;
      return;
    }

    this.mostrarRespuesta(config.CHATBOT_CONFIG.mensajes.cargando, 'loading', true);
    this.elementos.btnConsulta.disabled = true;

    try {
      const contexto = this.construirContexto(consulta);
      const respuesta = await this.llamarGroqAPI(contexto);
      if (respuesta) {
        this.mostrarRespuesta(respuesta, 'success');
        this.elementos.inputConsulta.value = '';
      } else {
        throw new Error('Respuesta vacía');
      }
    } catch (error) {
      this.manejarError(error);
    } finally {
      this.isProcessing = false;
      this.elementos.btnConsulta.disabled = false;
    }
  }

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
          { role: 'system', content: 'Asistente útil para tareas académicas.' },
          { role: 'user', content: contexto }
        ],
        max_tokens: this.groqConfig.max_tokens,
        temperature: this.groqConfig.temperature
      })
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error('Límite de requests excedido');
      if (response.status === 401) throw new Error('API Key inválida');
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || null;
  }

  manejarError(error) {
    let mensaje = '❌ Error: ';
    if (error.message.includes('Límite de requests')) {
      mensaje += 'Demasiadas consultas. Espera 30 segundos.';
    } else if (error.message.includes('API Key inválida')) {
      mensaje += 'Verifica tu API Key de Groq.';
    } else {
      mensaje += error.message;
    }
    this.mostrarRespuesta(mensaje, 'error');
  }

  mostrarRespuesta(mensaje, tipo = 'info', isLoading = false) {
    const iconos = { success: '✅', error: '❌', warning: '⚠️', loading: '⏳', info: 'ℹ️' };
    const mensajeHTML = mensaje
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    this.elementos.respuestaDiv.innerHTML = `
      <div class="respuesta-${tipo}${isLoading ? ' active' : ''}">
        <span class="respuesta-icono">${iconos[tipo]}</span>
        <div class="respuesta-contenido">${mensajeHTML}</div>
      </div>
    `;
    this.elementos.respuestaDiv.scrollIntoView({ behavior: 'smooth' });
  }

  actualizarTareas() {
    console.log('📋 Tareas actualizadas');
  }

  async verificarConexion() {
    try {
      const respuesta = await this.llamarGroqAPI('Responde "OK"');
      return respuesta === 'OK';
    } catch (error) {
      console.error('Error verificando conexión:', error);
      return false;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.chatbotTareas = new ChatbotTareas();
  });
} else {
  window.chatbotTareas = new ChatbotTareas();
}
