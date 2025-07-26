/**
 * Configuración segura para GitHub Pages
 * Sin API keys expuestas - Se configuran dinámicamente
 */

const config = {
  // ✅ Sin API keys hardcodeadas - se configuran dinámicamente
  GROQ_API_KEY: null, // Se configurará desde localStorage o UI
  
  CHATBOT_CONFIG: {
    groq: {
      url: 'https://api.groq.com/openai/v1/chat/completions',
      modelo: 'llama-3.1-8b-instant',
      max_tokens: 400,
      temperature: 0.7
    },
    
    mensajes: {
      bienvenida: '👋 ¡Hola Danielle! Soy tu asistente inteligente para consultar tus tareas.',
      error_api: '❌ Error de conexión con Groq API. Verifica tu API key.',
      error_general: '❌ Ups, algo salió mal. Intenta de nuevo.',
      cargando: '🤔 Analizando tus tareas...',
      sin_api_key: `
        ⚠️ <strong>API Key de Groq no configurada</strong><br><br>
        
        🔧 <strong>Configuración rápida:</strong><br>
        1. Ve a <a href="https://console.groq.com" target="_blank">console.groq.com</a><br>
        2. Regístrate gratis<br>
        3. Crea una API key<br>
        4. Haz clic en el botón "⚙️ Configurar API" abajo<br><br>
        
        <button onclick="configurarGroqAPI()" style="
          background: #4285f4; 
          color: white; 
          border: none; 
          padding: 10px 20px; 
          border-radius: 5px; 
          cursor: pointer;
          font-size: 14px;
        ">⚙️ Configurar API Key</button>
      `,
      configuracion_exitosa: '✅ ¡API Key configurada correctamente! Ya puedes hacer consultas.',
      configuracion_cancelada: '❌ Configuración cancelada. La API key es necesaria para el chatbot.'
    }
  }
};

/**
 * Configurar API Key dinámicamente
 */
function configurarGroqAPI() {
  const apiKey = prompt(`
🔑 Configurar Groq API Key

Pega aquí tu API key de console.groq.com:
(Se guardará localmente en tu navegador)
  `);
  
  if (apiKey && apiKey.trim()) {
    // Validar formato básico
    if (apiKey.startsWith('gsk_') && apiKey.length > 20) {
      // Guardar en localStorage
      localStorage.setItem('groq_api_key', apiKey.trim());
      config.GROQ_API_KEY = apiKey.trim();
      
      // Mostrar mensaje de éxito
      if (window.chatbotTareas) {
        window.chatbotTareas.mostrarRespuesta(
          config.CHATBOT_CONFIG.mensajes.configuracion_exitosa, 
          'success'
        );
      } else {
        alert('✅ API Key configurada. ¡Recarga la página y ya puedes usar el chatbot!');
        location.reload();
      }
    } else {
      alert('❌ API Key inválida. Debe empezar con "gsk_" y tener más de 20 caracteres.');
      configurarGroqAPI(); // Intentar de nuevo
    }
  } else {
    if (window.chatbotTareas) {
      window.chatbotTareas.mostrarRespuesta(
        config.CHATBOT_CONFIG.mensajes.configuracion_cancelada, 
        'warning'
      );
    }
  }
}

/**
 * Cargar API Key al inicializar
 */
function cargarAPIKey() {
  const savedKey = localStorage.getItem('groq_api_key');
  if (savedKey) {
    config.GROQ_API_KEY = savedKey;
    console.log('✅ API Key cargada desde localStorage');
    return true;
  }
  return false;
}

/**
 * Verificar si la API Key está configurada
 */
function tieneAPIKey() {
  return config.GROQ_API_KEY && config.GROQ_API_KEY.length > 20;
}

// Auto-cargar la API key al cargar la página
if (typeof window !== 'undefined') {
  cargarAPIKey();
}

// Funciones helper para el chatbot
window.configurarGroqAPI = configurarGroqAPI;
window.cargarAPIKey = cargarAPIKey;
window.tieneAPIKey = tieneAPIKey;