/**
 * @file constants/index.ts
 * @description Centraliza todos los valores constantes utilizados en la aplicación Apunta'o.
 */

/** Claves de almacenamiento local seguro (AsyncStorage) */
export const STORAGE_KEYS = {
    /** Clave para los datos de sesión de la app (accessToken, refreshToken) */
    APP_SESSION: '@app_session',
    /** Clave para la información del usuario (cuenta del colmado) */
    ACCOUNT_INFO: '@account_info',
    /** Clave para la lista de clientes (cache local) */
    CLIENTS: 'clients',
} as const;

/** URLs de la API del backend */
export const API_URLS = {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    DATA_SYNC: '/api/data/sync',
} as const;

/** Límites y configuraciones de la aplicación */
export const APP_CONFIG = {
    /** Longitud mínima del nombre de un cliente */
    MIN_NAME_LENGTH: 3,
    /** Longitud exacta del PIN de la cuenta */
    PIN_LENGTH: 6,
    /** Número máximo de reintentos para peticiones de red */
    MAX_RETRIES: 3,
    /** Tiempo de auto-cierre para notificaciones en milisegundos */
    NOTIFICATION_AUTO_CLOSE: 4000,
} as const;

/** Expresiones regulares para validación */
export const REGEX = {
    /** Validación de número de teléfono de RD (10 dígitos) */
    PHONE: /^(809|829|849)\d{7}$/,
    /** Caracteres permitidos en nombres */
    NAME_ALLOWED_CHARS: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]*$/,
    /** Solo dígitos numéricos */
    NUMBERS_ONLY: /\D+/g,
    /** Formato de números con comas para separación de miles */
    NUMBER_FORMAT: /\B(?=(\d{3})+(?!\d))/g,
} as const;

/** Mensajes de error para el usuario */
export const ERROR_MESSAGES = {
    NAME_REQUIRED: 'El nombre del cliente es obligatorio.',
    NAME_MIN_LENGTH: `El nombre debe tener al menos ${APP_CONFIG.MIN_NAME_LENGTH} letras.`,
    INVALID_PHONE: 'El teléfono debe ser un número válido de 10 dígitos (ej. 8091234567).',
    INVALID_PIN: `El PIN debe tener exactamente ${APP_CONFIG.PIN_LENGTH} números.`,
    DUPLICATE_CLIENT: '¡Ojo! Ya tienes un cliente con ese mismo nombre.',
    INVALID_AMOUNT: 'El monto debe ser un número mayor que cero.',
    PAYMENT_EXCEEDS_DEBT: '¡Te pasaste! El pago es mayor que la deuda actual.',
    NO_CONNECTION: 'Parece que no hay internet. Revisa tu conexión.',
    SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
    GENERIC_ERROR: '¡Ups! Algo salió mal. Inténtalo de nuevo en un momento.',
};

/** Mensajes de éxito para el usuario */
export const SUCCESS_MESSAGES = {
    CLIENT_ADDED: '¡Cliente agregado! Ya puedes apuntarle.',
    CLIENT_UPDATED: '¡Listo! La información del cliente fue actualizada.',
    TRANSACTION_ADDED: 'Movimiento registrado correctamente.',
    TRANSACTION_DELETED: 'El movimiento fue eliminado.',
    DEBT_CLEARED: '¡Deuda saldada! Cliente al día.',
    DATA_SYNCED: 'Tus datos se han sincronizado con la nube.',
    ACCOUNT_CREATED: '¡Tu cuenta ha sido creada! Ahora puedes iniciar sesión.',
};
