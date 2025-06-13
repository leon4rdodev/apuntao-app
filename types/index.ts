/**
 * @file types.ts
 * @description Define los tipos y las interfaces globales utilizados en toda la aplicación.
 */

// --- Tipos de Autenticación y Usuario ---

/** Información básica del usuario obtenida tras la autenticación. */
export interface UserInfo {
    email: string | null;
    name: string | null;
    photo: string | null;
}

// Estructura de lo que guardaremos en AsyncStorage

/** Configuración para la autenticación con Google. */
export interface GoogleAuthConfig {
    /** ID del cliente de Google para la aplicación. */
    clientId: string;
    /** Permisos (scopes) que la aplicación solicita al usuario. */
    scopes?: string[];
    /** Propiedades adicionales para configuraciones avanzadas. */
    [key: string]: any;
}

/** Datos de autenticación completos para ser almacenados de forma segura. */
export interface StoredAuthData {
    /** Información del perfil del usuario. */
    user: UserInfo;
    /** Token de acceso para realizar peticiones a la API. */
    accessToken: string;
    /** Token para renovar el accessToken sin que el usuario inicie sesión de nuevo. */
    refreshToken: string;
    /** Fecha de expiración del accessToken en formato ISO. */
    expirationDate: string;
}

// --- Tipos de Clientes y Transacciones ---

/** Define los tipos de transacciones que se pueden registrar. */
export type TransactionType = 'Deuda' | 'Pago';

/** Representa una única transacción financiera asociada a un cliente. */
export interface Transaction {
    /** ID único de la transacción, generado internamente. */
    id: string;
    /** Fecha de la transacción en formato de timestamp (milisegundos). */
    date: number;
    /** Monto monetario de la transacción. */
    amount: number;
    /** El tipo de transacción: si aumenta la deuda ('Deuda') o la disminuye ('Pago'). */
    type: TransactionType;
}

/** Representa la entidad principal de un cliente. */
export interface Client {
    /** ID único del cliente, generado internamente. */
    id: string;
    /** Nombre completo del cliente. */
    name: string;
    /** Deuda total actual del cliente. Se calcula automáticamente. */
    debt: number;
    /** Número de teléfono del cliente (opcional). */
    phone?: string;
    /** Historial de transacciones del cliente. */
    transactions: Transaction[];
    /** Fecha de la última modificación en formato de timestamp (milisegundos). */
    lastModified: number;
}

// --- Tipos para el Contexto de Clientes (ClientContext) ---

/**
 * Define la estructura del valor proporcionado por ClientContext.
 * Contiene el estado de los clientes y las funciones para manipularlo.
 */
export interface ClientContextType {
    /** Indica si los datos iniciales de los clientes se están cargando. */
    isLoading: boolean;
    /** La lista actual de todos los clientes. */
    clients: Client[];
    /**
     * Reemplaza la lista completa de clientes. Útil para restaurar desde un backup.
     * @param clients - Un array de objetos Client o un string en formato JSON.
     */
    restoreClients: (clients: Client[] | string) => void;
    /**
     * Agrega un nuevo cliente a la lista. El ID y otros campos se generan automáticamente.
     * @param clientData - Objeto con los datos del nuevo cliente (`name`, `phone`).
     * @returns El objeto del cliente recién creado.
     */
    addClient: (
        clientData: Omit<Client, 'id' | 'debt' | 'transactions' | 'lastModified'>
    ) => Client;
    /**
     * Obtiene un cliente específico por su ID.
     * @param id - El ID del cliente a buscar.
     * @returns El objeto del cliente si se encuentra, de lo contrario `undefined`.
     */
    getClientById: (id: string) => Client | undefined;
    /**
     * Actualiza los datos de un cliente existente.
     * @param id - El ID del cliente a actualizar.
     * @param updatedData - Un objeto con las propiedades a actualizar (`name`, `phone`).
     */
    updateClient: (id: string, updatedData: Pick<Client, 'name' | 'phone'>) => void;
    /**
     * Elimina un cliente de la lista usando su ID.
     * @param id - El ID del cliente a eliminar.
     */
    deleteClient: (id: string) => void;
    /**
     * Agrega una nueva transacción a un cliente y actualiza su deuda.
     * @param clientId - El ID del cliente al que pertenece la transacción.
     * @param transaction - Objeto con los datos de la transacción (sin ID).
     */
    addTransaction: (clientId: string, transaction: Omit<Transaction, 'id'>) => void;
    /**
     * Elimina una transacción de un cliente por su ID y recalcula la deuda.
     * @param clientId - El ID del cliente.
     * @param transactionId - El ID de la transacción a eliminar.
     */
    deleteTransaction: (clientId: string, transactionId: string) => void;
    clearClients: () => void;
}

// --- Tipos de Navegación y UI ---

/** Define los tipos de notificación para la UI. */
export type NotificationType = 'success' | 'error' | 'info';

/** Define los parámetros esperados por cada ruta en la navegación (ej. React Navigation). */
export type RootStackParamList = {
    HomeScreen: undefined;
    UserDataScreen: { id: string };
    EditUserScreen: { id: string };
};

/** Props para el componente de notificación. */
export interface NotificationProps {
    /** El texto a mostrar en la notificación. */
    message: string;
    /** El tipo de notificación, que determina su estilo (color, icono). */
    type: NotificationType;
    /** Función callback que se ejecuta para cerrar la notificación. */
    onClose: () => void;
}

/** Representa el estado de una notificación en un contexto o estado local. */
export interface NotificationState {
    message: string;
    type: NotificationType;
}
