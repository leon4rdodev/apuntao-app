// store/clientStore.ts
import { create } from 'zustand';
import type { Client, Transaction } from '@/types';
import { getFromStorage, saveToStorage } from '@/utils/storage';
import { API_URLS, STORAGE_KEYS } from '@/constants';
import { apiFetch } from '@/services/apiService';
import { useNotificationStore } from './notificationStore';

// --- Tipos para el Estado y las Acciones del Store ---
interface ClientState {
    clients: Client[];
    isLoading: boolean;
    actions: {
        initializeClientsFromStorage: () => Promise<void>;
        setClients: (clients: Client[]) => void;
        clearClients: () => void;
        addClient: (
            clientData: Omit<Client, 'id' | 'debt' | 'transactions' | 'lastModified'>
        ) => Client;
        updateClient: (clientId: string, updatedData: Pick<Client, 'name' | 'phone'>) => void;
        deleteClient: (clientId: string) => void;
        addTransaction: (clientId: string, transaction: Omit<Transaction, 'id'>) => void;
        deleteTransaction: (clientId: string, transactionId: string) => void;
        getClientById: (id: string) => Client | undefined;
    };
}

// --- Funciones Auxiliares (Helpers) ---

/**
 * Normaliza un objeto de cliente para asegurar que todos los campos requeridos existan.
 * Esto previene errores por datos incompletos o mal formados.
 */
const normalizeClient = (client: Partial<Client>): Client => ({
    id: client.id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: client.name || 'Cliente sin nombre',
    phone: client.phone || undefined,
    debt: typeof client.debt === 'number' ? Math.max(0, client.debt) : 0,
    transactions: Array.isArray(client.transactions)
        ? client.transactions.map((tx) => ({
                ...tx,
                id: tx.id || `local_txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            }))
        : [],
    lastModified: client.lastModified || Date.now(),
});

/**
 * Función centralizada para persistir y sincronizar el estado de los clientes.
 * Se encarga de guardar en el almacenamiento local y enviar los datos al backend.
 * @param updatedClients La lista completa y actualizada de clientes.
 */
const persistAndSyncClients = async (updatedClients: Client[]) => {
    // 1. Guardar en el almacenamiento local (rápido y síncrono para la UI)
    await saveToStorage(STORAGE_KEYS.CLIENTS, updatedClients);

    // 2. Sincronizar con el backend (en segundo plano)
    try {
        await apiFetch(API_URLS.DATA_SYNC, {
            method: 'POST',
            body: JSON.stringify({ clients: updatedClients }),
        });
        console.log('Datos de clientes sincronizados con el backend.');
    } catch (error) {
        console.error('Error al sincronizar clientes con el backend:', error);
        // Llama a la acción de notificación directamente desde el store de notificaciones
        useNotificationStore.getState().show({
            message: 'Error al guardar los datos en la nube. Revisa tu conexión.',
            type: 'error',
        });
    }
};

// --- Creación del Store de Zustand ---

export const useClientStore = create<ClientState>((set, get) => ({
    clients: [],
    isLoading: true,
    actions: {
        /**
         * Carga los clientes desde el almacenamiento local al iniciar la aplicación.
         */
        initializeClientsFromStorage: async () => {
            try {
                const storedData = await getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS);
                if (storedData && Array.isArray(storedData)) {
                    set({ clients: storedData.map(normalizeClient) });
                }
            } catch (error) {
                console.error('Error al cargar clientes desde el caché:', error);
            } finally {
                set({ isLoading: false });
            }
        },

        /**
         * Reemplaza por completo la lista de clientes. Usado después del login/sincronización.
         */
        setClients: (newClientsData) => {
            if (!Array.isArray(newClientsData)) {
                console.error('Los datos de clientes para establecer no son válidos.');
                return;
            }
            const normalizedClients = newClientsData.map(normalizeClient);
            set({ clients: normalizedClients });
            persistAndSyncClients(normalizedClients); // Persiste y sincroniza la nueva lista
        },

        /**
         * Limpia todos los clientes del estado. Usado durante el logout.
         */
        clearClients: () => {
            set({ clients: [] });
            saveToStorage(STORAGE_KEYS.CLIENTS, []); // Limpia el almacenamiento
        },

        /**
         * Agrega un nuevo cliente a la lista.
         */
        addClient: (clientData) => {
            const newClient = normalizeClient(clientData);
            const updatedClients = [...get().clients, newClient];
            set({ clients: updatedClients });
            persistAndSyncClients(updatedClients);
            return newClient;
        },

        /**
         * Actualiza el nombre y/o teléfono de un cliente existente.
         */
        updateClient: (clientId, updatedData) => {
            const updatedClients = get().clients.map((client) =>
                client.id === clientId
                    ? { ...client, ...updatedData, lastModified: Date.now() }
                    : client
            );
            set({ clients: updatedClients });
            persistAndSyncClients(updatedClients);
        },

        /**
         * Elimina un cliente de la lista.
         */
        deleteClient: (clientId) => {
            const updatedClients = get().clients.filter((c) => c.id !== clientId);
            set({ clients: updatedClients });
            persistAndSyncClients(updatedClients);
        },

        /**
         * Agrega una transacción (deuda o pago) a un cliente.
         */
        addTransaction: (clientId, transaction) => {
            const updatedClients = get().clients.map((client) => {
                if (client.id !== clientId) return client;

                const debtChange =
                    transaction.type === 'Deuda' ? transaction.amount : -transaction.amount;
                const newDebt = Math.max(0, client.debt + debtChange);
                const newTransactionWithId: Transaction = {
                    ...transaction,
                    id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                };

                // Si la deuda llega a cero, el historial de transacciones se limpia.
                const finalTransactions =
                    newDebt === 0 ? [] : [newTransactionWithId, ...client.transactions];

                return {
                    ...client,
                    debt: newDebt,
                    transactions: finalTransactions,
                    lastModified: Date.now(),
                };
            });
            set({ clients: updatedClients });
            persistAndSyncClients(updatedClients);
        },

        /**
         * Elimina una transacción de un cliente y re-calcula su deuda.
         */
        deleteTransaction: (clientId, transactionId) => {
            const updatedClients = get().clients.map((client) => {
                if (client.id !== clientId) return client;

                const txToDelete = client.transactions.find((t) => t.id === transactionId);
                if (!txToDelete) return client;

                const debtChange =
                    txToDelete.type === 'Deuda' ? -txToDelete.amount : txToDelete.amount;
                const newDebt = Math.max(0, client.debt + debtChange);
                const remainingTransactions = client.transactions.filter(
                    (t) => t.id !== transactionId
                );

                // Si la deuda llega a cero al eliminar, el historial también se limpia.
                const finalTransactions = newDebt === 0 ? [] : remainingTransactions;

                return {
                    ...client,
                    debt: newDebt,
                    transactions: finalTransactions,
                    lastModified: Date.now(),
                };
            });
            set({ clients: updatedClients });
            persistAndSyncClients(updatedClients);
        },

        /**
         * Obtiene un cliente por su ID del estado actual.
         */
        getClientById: (id) => get().clients.find((c) => c.id === id),
    },
}));
