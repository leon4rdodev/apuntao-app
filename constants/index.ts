/**
 * @file constants/index.ts
 * @description Centraliza todos los valores constantes utilizados en la aplicación Apunta'o.
 * Esto incluye claves de almacenamiento, URLs de API, configuración, mensajes y más.
 */

// --- Claves de Almacenamiento Local (AsyncStorage) ---
export const STORAGE_KEYS = {
    /** Datos de sesión de la app (accessToken, refreshToken, etc.). */
    APP_SESSION: '@app_session',
    /** Información de la cuenta del colmado (nombre, suscripción, etc.). */
    ACCOUNT_INFO: '@account_info',
    /** Lista de clientes del colmado (cache local). */
    CLIENTS: '@clients',
    HAS_ONBOARDED: '@has_onboarded',
} as const;

// --- Endpoints de la API del Backend ---
export const API_URLS = {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    /** Endpoint para obtener el perfil del dueño del colmado. */
    ACCOUNT_PROFILE: '/api/account/me',
    /** Endpoint para sincronizar todos los datos (clientes, suscripción). */
    DATA_SYNC: '/api/data/sync',
} as const;

// --- Configuración y Límites de la Aplicación ---
export const APP_CONFIG = {
    /** Longitud mínima requerida para el nombre de un cliente. */
    MIN_NAME_LENGTH: 3,
    /** Longitud exacta requerida para el PIN de la cuenta. */
    PIN_LENGTH: 6,
    /** Número máximo de reintentos para peticiones de red fallidas. */
    MAX_API_RETRIES: 3,
    /** Tiempo de auto-cierre para notificaciones en milisegundos. */
    NOTIFICATION_AUTO_CLOSE_DURATION: 3000,
} as const;

// --- Enlaces Externos ---
export const EXTERNAL_LINKS = {
    /** URL para calificar la app en Google Play Store. */
    PLAY_STORE: 'market://details?id=com.leon4rdodev.apuntao',
} as const;

// --- Información de Contacto para Soporte ---
export const SUPPORT_CONTACT = {
    /** Número de teléfono de WhatsApp para soporte. */
    WHATSAPP_NUMBER: '18096654820',
    /** Mensaje predeterminado para iniciar conversación de soporte por WhatsApp. */
    WHATSAPP_MESSAGE: "Hola, necesito ayuda con la aplicación Apunta'o.",
    /** Dirección de correo electrónico para soporte. */
    EMAIL_ADDRESS: 'soporte@apuntao.app',
    /** Asunto predeterminado para correos de soporte. */
    EMAIL_SUBJECT: "Soporte App Apunta'o",
} as const;

// --- Expresiones Regulares para Validación ---
export const REGEX = {
    /** Validación de número de teléfono de RD (10 dígitos que empiezan con 809, 829 o 849). */
    PHONE: /^(809|829|849)\d{7}$/,
    /** Caracteres permitidos en nombres (letras, números, espacios y acentos comunes). */
    NAME_ALLOWED_CHARS: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]*$/,
    /** Expresión para eliminar cualquier caracter que no sea un dígito. */
    NUMBERS_ONLY: /\D+/g,
    /** Formato de números con comas para separación de miles. */
    NUMBER_FORMAT: /\B(?=(\d{3})+(?!\d))/g,
} as const;

// --- Mensajes de Error para el Usuario ---
export const ERROR_MESSAGES = {
    // Errores de Formulario
    NAME_REQUIRED: 'El nombre del cliente es obligatorio.',
    NAME_MIN_LENGTH: `El nombre debe tener al menos ${APP_CONFIG.MIN_NAME_LENGTH} letras.`,
    INVALID_PHONE: 'El teléfono debe ser un número válido de 10 dígitos (ej. 809-123-4567).',
    INVALID_PIN: `El PIN debe tener exactamente ${APP_CONFIG.PIN_LENGTH} números.`,
    DUPLICATE_CLIENT: '¡Ojo! Ya tienes un cliente con ese mismo nombre.',
    INVALID_AMOUNT: 'El monto debe ser un número mayor que cero.',
    PAYMENT_EXCEEDS_DEBT: '¡Te pasaste! El pago es mayor que la deuda actual.',
    FIELDS_REQUIRED_GENERIC: 'Por favor, completa todos los campos obligatorios.',
    GENERIC_VALIDATION: 'Por favor, revisa los datos ingresados.',

    // Errores de Lógica de Negocio
    DELETE_CLIENT_WITH_DEBT:
        'No puedes eliminar un cliente con deuda pendiente. Salda la deuda primero.',
    CLIENT_NOT_FOUND: 'No se pudo encontrar la información de este cliente.',
    INVALID_CREDENTIALS: 'El número de teléfono o el PIN son incorrectos.',

    // Errores de Red y Sesión
    NO_CONNECTION: 'Parece que no hay internet. Revisa tu conexión e inténtalo de nuevo.',
    SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo para continuar.',
    GENERIC_ERROR: '¡Ups! Algo no salió bien. Por favor, inténtalo de nuevo.',
    UNEXPECTED_SAVE_ERROR: 'Ocurrió un error inesperado al intentar guardar.',

    // Errores de Interacción con el Dispositivo
    EMAIL_APP_UNAVAILABLE: 'No se pudo abrir la app de correo. ¿Tienes una instalada?',
    WHATSAPP_UNAVAILABLE: 'Asegúrate de tener WhatsApp instalado en tu dispositivo.',
};

// --- Mensajes de Éxito y UI ---
export const SUCCESS_MESSAGES = {
    CLIENT_ADDED: '¡Cliente agregado! Ya puedes apuntarle.',
    CLIENT_UPDATED: '¡Listo! La información del cliente fue actualizada.',
    TRANSACTION_ADDED: 'Movimiento registrado correctamente.',
    TRANSACTION_DELETED: 'El movimiento fue eliminado.',
    DEBT_CLEARED: '¡Deuda saldada! Cliente al día.',
    DATA_SYNCED: 'Tus datos se han sincronizado con la nube.',
    ACCOUNT_CREATED: '¡Tu cuenta ha sido creada! Ahora puedes iniciar sesión.',
    REGISTRATION_SUCCESS_TITLE: '¡Registro Exitoso!',
};
