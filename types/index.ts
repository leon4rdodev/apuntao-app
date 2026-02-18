/**
 * @file types.ts
 * @description Define los tipos y las interfaces globales para la aplicación Apunta'o (versión Colmado).
 */

// --- Tipos de Datos del Backend ---
export type TransactionType = 'Pago' | 'Deuda';
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

/** Representa la entidad de un cliente dentro de una cuenta de colmado. */
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
    /** Indica si el cliente ha sido borrado (Soft Delete). */
    deleted?: boolean;
}

/** Define el estado y plan de la suscripción de una cuenta. */
export interface Subscription {
    status: 'trial' | 'active' | 'expired' | 'cancelled' | 'loading' | 'unknown';
    plan: 'none' | 'monthly' | 'quarterly' | 'yearly';
    startDate?: string;
    endDate?: string;
    trialEndDate?: string;
}

/** Datos de una cuenta de Colmado, que es el "usuario" de nuestra app. */
export interface ColmadoAccountInfo { 
    _id: string;
    colmadoName: string;
    phoneNumber: string;
    clients: Client[];
    subscription: Subscription;
    createdAt: string;
    updatedAt: string;
}

// --- Tipos para la Gestión de Sesión ---

/** Datos de sesión que se guardan en el almacenamiento seguro. */
export interface AppSessionData {
    accessToken: string;
    refreshToken: string;
}

// --- Tipos para el Contexto de Clientes (ClientContext) ---

/**
 * Define la estructura del valor proporcionado por ClientContext.
 * Contiene el estado de los clientes y las funciones para manipularlo.
 */
export interface ClientContextType {
    isLoading: boolean;
    clients: Client[];
    setClients: (clients: Client[]) => void; // Para la sincronización inicial
    addClient: (
        clientData: Omit<Client, 'id' | 'debt' | 'transactions' | 'lastModified'>
    ) => Client;
    getClientById: (id: string) => Client | undefined;
    updateClient: (id: string, updatedData: Pick<Client, 'name' | 'phone'>) => void;
    deleteClient: (id: string) => void;
    addTransaction: (clientId: string, transaction: Omit<Transaction, 'id'>) => void;
    deleteTransaction: (clientId: string, transactionId: string) => void;
    clearClients: () => void;
}

// --- Tipos para Sincronización Offline (NUEVO) ---

export type SyncStatus = 'synced' | 'pending' | 'error';

export interface SyncAction {
    id: string;
    type: 'ADD_CLIENT' | 'UPDATE_CLIENT' | 'DELETE_CLIENT' | 'ADD_TRANSACTION' | 'DELETE_TRANSACTION';
    payload: any;
    timestamp: number;
}
