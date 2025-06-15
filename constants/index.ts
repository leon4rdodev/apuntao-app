/**
 * Constantes de la aplicación
 * Centraliza todos los valores constantes utilizados en la app
 */

/** Configuración de tokens */
export const TOKEN_CONFIG = {
    /** Tiempo en minutos antes de la expiración para refrescar el token */
    REFRESH_THRESHOLD_MINUTES: 10,
    /** Tiempo de vida por defecto del token en segundos */
    DEFAULT_EXPIRES_IN: 3599,
} as const;

/** Claves de almacenamiento local */
export const STORAGE_KEYS = {
    /** Clave para datos de autenticación */
    AUTH_DATA: '@auth_data',
    AUTH_DATA_API: '@auth_data_api',
    /** Clave para datos de clientes */
    CLIENTS: 'clients',
    /** Clave para estado de onboarding */
    ONBOARDING_COMPLETED: 'onboardingCompleted',
} as const;

/** URLs de la API */
export const API_URLS = {
    /** URL base de Google Drive API */
    GOOGLE_DRIVE_BASE: 'https://www.googleapis.com/drive/v3/',
    /** URL para obtener información del usuario */
    GOOGLE_USER_INFO: 'https://www.googleapis.com/userinfo/v2/me',
    /** URL para refrescar tokens */
    GOOGLE_TOKEN_REFRESH: 'https://www.googleapis.com/oauth2/v4/token',
    /** URL para subir archivos a Drive */
    GOOGLE_DRIVE_UPLOAD_FILES: 'https://www.googleapis.com/upload/drive/v3/files',
} as const;

/** Límites de la aplicación */
export const APP_LIMITS = {
    /** Deuda máxima permitida */
    /** Longitud mínima del nombre */
    MIN_NAME_LENGTH: 3,
    /** Número máximo de reintentos para requests */
    MAX_RETRIES: 3,
} as const;

/** Configuración de animaciones */
export const ANIMATIONS = {
    /** Duración de entrada de notificaciones */
    // ✅ VELOCIDAD AJUSTADA
    NOTIFICATION_ENTER_DURATION: 300,
    /** Duración de salida de notificaciones */
    NOTIFICATION_EXIT_DURATION: 300,
    /** Tiempo de auto-cierre de notificaciones */
    NOTIFICATION_AUTO_CLOSE: 5000,
} as const;

/** Expresiones regulares */
export const REGEX = {
    /** Validación de número de teléfono */
    PHONE: /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
    /** Caracteres permitidos en nombres */
    NAME_ALLOWED_CHARS: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]*$/,
    /** Solo números */
    NUMBERS_ONLY: /\D+/g,
    /** Formato de números con comas */
    NUMBER_FORMAT: /\B(?=(\d{3})+(?!\d))/g,
} as const;

/** Mensajes de error (Tono "Apunta'o") */
export const ERROR_MESSAGES = {
    /** Error de nombre requerido */
    NAME_REQUIRED: '¡Epa! ¿Y a quién apunto si no pones el nombre?',

    /** Error de longitud mínima de nombre */
    NAME_MIN_LENGTH: 'Ese nombre está muy corto, ¡dale un poco más de letra!',

    /** Error de deuda inválida */
    INVALID_DEBT: 'Esa deuda no cuadra. Tiene que ser un número, y que no sea negativo.',

    /** Error de teléfono inválido */
    INVALID_PHONE: 'Revisa ese teléfono, que parece que le faltan números.',

    /** Error de cliente duplicado */
    DUPLICATE_CLIENT: '¡Ojo! A ese cliente ya lo tenemos Apunta\'o. Búscalo en la lista.',

    /** Error de monto inválido */
    INVALID_AMOUNT: 'El monto no es válido. Por favor, pon una cantidad real.',

    /** Error de abono mayor a deuda */
    PAYMENT_EXCEEDS_DEBT: '¡Te pasaste! El abono es más grande que la deuda. ¡No regales tu dinero!',

    /** Error de conexión */
    NO_CONNECTION: 'No hay internet, mi pana. Conéctate para poder seguir.',

    /** Error de token (para el usuario) */
    TOKEN_UNAVAILABLE: 'Hubo un problemita para conectar. Intenta de nuevo, por si acaso.',

    /** Error de app de correo */
    EMAIL_APP_UNAVAILABLE: 'No se pudo abrir la app de email. ¿Estás seguro que tienes una instalada?',
} as const;


/** Mensajes de éxito (Tono "Apunta'o") */
export const SUCCESS_MESSAGES = {
    /** Cliente agregado */
    CLIENT_ADDED: '¡Listo! Ese cliente ya está Apunta\'o.',

    /** Cliente actualizado */
    CLIENT_UPDATED: '¡Nítido! La información de ese cliente está al día.',

    /** Transacción agregada */
    TRANSACTION_ADDED: '¡Listo! Ese movimiento ahora está Apunta\'o.',

    /** Transacción eliminada */
    TRANSACTION_DELETED: '¡Eliminado! Ya ese movimiento no existe.',

    /** Deuda saldada */
    DEBT_CLEARED: '¡Se saldó! Ya no te deben nada. ¡Estamos al día!',

    /** Datos restaurados */
    DATA_RESTORED: '¡Resuelto! Tus datos están de vuelta, sanos y salvos.',
} as const;

/** Configuración de Google Drive */
export const DRIVE_CONFIG = {
    /** Nombre de la carpeta de respaldos */
    BACKUP_FOLDER_NAME: 'Apuntao Backups',
    /** Tipo MIME para carpetas */
    FOLDER_MIME_TYPE: 'application/vnd.google-apps.folder',
    /** Tipo MIME para archivos JSON */
    JSON_MIME_TYPE: 'application/json',
    BACKUP_FILENAME: 'apuntao_backup.json',
    LAST_BACKUP_HASH_KEY: 'last_backup_hash',
    LAST_SYNC_TIME_KEY: 'last_sync_time',
} as const;
