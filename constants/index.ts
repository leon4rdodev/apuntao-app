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
/** Colores del tema */
export const COLORS = {
    /** Color primario */
    primary: '#16a34a',
    /** Color primario claro */
    primaryLight: '#dcfce7',
    /** Color primario oscuro */
    primaryDark: '#166534',
    /** Color de texto principal */
    text: '#1f2937',
    /** Color de texto secundario */
    textSecondary: '#6b7280',
    /** Color blanco */
    white: '#ffffff',
    /** Color de fondo */
    background: '#f0fdf4',
    /** Color de éxito */
    success: '#22c55e',
    /** Color de error */
    error: '#ef4444',
    /** Color de advertencia */
    warning: '#f59e0b',
    /** Color de información */
    info: '#3b82f6',
    danger: '#ef4444',
    dangerLight: '#fef2f2',
    warningLight: '#fef3c7',
    accent: '#42A5F5', // Azul para variedad
    textLight: '#666666',
    cardBg: '#FFFFFF',
    gold: '#FFB300', // Dorado para estrellas
} as const;

/** Configuración de animaciones */
export const ANIMATIONS = {
    /** Duración de entrada de notificaciones */
    // ✅ VELOCIDAD AJUSTADA
    NOTIFICATION_ENTER_DURATION: 300,
    /** Duración de salida de notificaciones */
    NOTIFICATION_EXIT_DURATION: 300,
    /** Tiempo de auto-cierre de notificaciones */
    NOTIFICATION_AUTO_CLOSE: 3000,
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

/** Mensajes de error */
export const ERROR_MESSAGES = {
    /** Error de nombre requerido */
    NAME_REQUIRED: 'El nombre es obligatorio',
    /** Error de longitud mínima de nombre */
    NAME_MIN_LENGTH: 'El nombre debe tener al menos 3 caracteres',
    /** Error de deuda inválida */
    INVALID_DEBT: 'La deuda debe ser un número válido y no negativa',
    /** Error de deuda máxima */
    INVALID_PHONE: 'El número de teléfono debe estar en el formato 000-000-0000',
    /** Error de cliente duplicado */
    DUPLICATE_CLIENT: 'No se pueden agregar dos clientes con el mismo nombre',
    /** Error de monto inválido */
    INVALID_AMOUNT: 'Por favor, ingrese un monto válido.',
    /** Error de abono mayor a deuda */
    PAYMENT_EXCEEDS_DEBT: 'El abono no puede ser mayor a la deuda pendiente.',
    /** Error de conexión */
    NO_CONNECTION: 'No hay conexión a internet',
    /** Error de token */
    TOKEN_UNAVAILABLE: 'Token de acceso no disponible',
} as const;

/** Mensajes de éxito */
export const SUCCESS_MESSAGES = {
    /** Cliente agregado */
    CLIENT_ADDED: 'Cliente agregado con éxito',
    /** Cliente actualizado */
    CLIENT_UPDATED: 'Cliente actualizado correctamente.',
    /** Transacción agregada */
    TRANSACTION_ADDED: 'Transacción agregada correctamente.',
    /** Transacción eliminada */
    TRANSACTION_DELETED: 'Transacción eliminada correctamente.',
    /** Deuda saldada */
    DEBT_CLEARED: 'Deuda saldada completamente.',
    /** Datos restaurados */
    DATA_RESTORED: 'Tus datos han sido restaurados correctamente.',
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
