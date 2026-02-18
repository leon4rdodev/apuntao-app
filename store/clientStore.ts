// store/clientStore.ts
import { create } from 'zustand';
import type { Client, SyncAction, SyncStatus, Transaction } from '@/types';
import { getFromStorage, saveToStorage } from '@/utils/storage';
import { API_URLS, ERROR_MESSAGES, STORAGE_KEYS } from '@/constants';
import { apiFetch } from '@/services/apiService';
import { useNotificationStore } from './notificationStore';
import NetInfo from '@react-native-community/netinfo';

// --- Tipos para el Estado y las Acciones del Store ---
interface ClientState {
    clients: Client[];
    syncQueue: SyncAction[]; // 🔥 COLA DE SINCRONIZACIÓN
    syncStatus: SyncStatus; // 🔥 ESTADO GLOBAL DE SYNC
    isLoading: boolean;
    isSyncing: boolean; // 🔥 PREVENIR EJECUCIONES PARALELAS
    actions: {
        initializeClientsFromStorage: () => Promise<void>;
        setClients: (clients: Client[]) => void;
        mergeClients: (serverClients: Client[]) => void; // 🔥 NUEVA FUNCIÓN DE MERGE
        clearClients: () => void;
        addClient: (
            clientData: Omit<Client, 'id' | 'debt' | 'transactions' | 'lastModified'>
        ) => Client;
        updateClient: (clientId: string, updatedData: Pick<Client, 'name' | 'phone'>) => void;
        deleteClient: (clientId: string) => void;
        addTransaction: (clientId: string, transaction: Omit<Transaction, 'id'>) => void;
        deleteTransaction: (clientId: string, transactionId: string) => void;
        getClientById: (id: string) => Client | undefined;
        processSyncQueue: () => Promise<void>; // 🔥 PROCESAR COLA
    };
}

// --- Funciones Auxiliares (Helpers) ---

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
 * Persiste los cleintes y la cola de sincronización en AsyncStorage.
 */
/**
 * Persiste los clientes, la cola de sincronización y crea un BACKUP local adicional.
 */
const persistState = async (clients: Client[], queue: SyncAction[]) => {
    try {
        await saveToStorage(STORAGE_KEYS.CLIENTS, clients);
        await saveToStorage('@sync_queue', queue);
        
        // 🔥 LOCAL BACKUP REDUNDANTE (Requested by User)
        // Guardamos una copia exacta en otra key por si el archivo principal se corrompe.
        await saveToStorage('@clients_backup', { clients, queue, timestamp: Date.now() });
    } catch (e) {
        console.error('Error persistiendo estado:', e);
    }
};

export const useClientStore = create<ClientState>((set, get) => ({
    clients: [],
    syncQueue: [],
    syncStatus: 'synced',
    isLoading: true,
    isSyncing: false,
    actions: {
        initializeClientsFromStorage: async () => {
            try {
                const [storedClients, storedQueue] = await Promise.all([
                    getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS),
                    getFromStorage<SyncAction[]>('@sync_queue'),
                ]);

                // 🔥 RECUPERACIÓN DE DESASTRES: Si no hay clientes, buscar en el backup
                let finalClients = Array.isArray(storedClients) ? storedClients : [];
                let finalQueue = Array.isArray(storedQueue) ? storedQueue : [];

                if (finalClients.length === 0) {
                    console.log('⚠️ No se encontraron clientes en storage principal. Buscando backup...');
                    const backup = await getFromStorage<{ clients: Client[], queue: SyncAction[], timestamp: number }>('@clients_backup');
                    
                    if (backup && Array.isArray(backup.clients) && backup.clients.length > 0) {
                        console.log(`✅ RECUPERADO: Restaurando ${backup.clients.length} clientes desde backup (${new Date(backup.timestamp).toLocaleString()})`);
                        finalClients = backup.clients;
                        finalQueue = backup.queue || [];
                        
                        // Guardar inmediatamente en el storage principal para la próxima
                        await saveToStorage(STORAGE_KEYS.CLIENTS, finalClients);
                        await saveToStorage('@sync_queue', finalQueue);
                    } else {
                        console.log('❌ No se encontró backup válido.');
                    }
                }

                set({
                    // Aseguramos que los clientes tengan las propiedades correctas
                    clients: finalClients.map(normalizeClient),
                    syncQueue: finalQueue,
                });
            } catch (error) {
                console.error('Error al cargar clientes desde el caché:', error);
            } finally {
                set({ isLoading: false });
                get().actions.processSyncQueue();
            }
        },

        setClients: (newClientsData) => {
            if (!Array.isArray(newClientsData)) return;
            const normalized = newClientsData.map(normalizeClient);
            set({ clients: normalized });
            persistState(normalized, get().syncQueue);
        },

        mergeClients: (serverClients) => {
            const { clients: localClients, syncQueue } = get();
            
            const pendingClientIds = new Set<string>();
            syncQueue.forEach(action => {
                if (action.payload?.id) pendingClientIds.add(action.payload.id);
                if (action.payload?.clientId) pendingClientIds.add(action.payload.clientId);
            });

            const mergedMap = new Map<string, Client>();
            serverClients.forEach(c => mergedMap.set(c.id, normalizeClient(c)));

            // Aplicar Local Wins
            localClients.forEach(localClient => {
                if (localClient.id.startsWith('local_') || pendingClientIds.has(localClient.id)) {
                    mergedMap.set(localClient.id, localClient);
                }
            });

            const mergedList = Array.from(mergedMap.values());
            set({ clients: mergedList });
            persistState(mergedList, syncQueue);
        },

        clearClients: () => {
            set({ clients: [], syncQueue: [] });
            saveToStorage(STORAGE_KEYS.CLIENTS, []);
            saveToStorage('@sync_queue', []);
        },

        addClient: (clientData) => {
            const newClient = normalizeClient(clientData);
            const action: SyncAction = {
                id: `act_${Date.now()}_${Math.random()}`,
                type: 'ADD_CLIENT',
                payload: newClient,
                timestamp: Date.now(),
            };

            const newClients = [...get().clients, newClient];
            const newQueue = [...get().syncQueue, action];

            set({ clients: newClients, syncQueue: newQueue, syncStatus: 'pending' });
            persistState(newClients, newQueue);
            get().actions.processSyncQueue();
            return newClient;
        },

        updateClient: (clientId, updatedData) => {
            const updatedClients = get().clients.map((c) =>
                c.id === clientId ? { ...c, ...updatedData, lastModified: Date.now() } : c
            );
            
            const action: SyncAction = {
                id: `act_${Date.now()}_${Math.random()}`,
                type: 'UPDATE_CLIENT',
                payload: { id: clientId, ...updatedData },
                timestamp: Date.now(),
            };

            const newQueue = [...get().syncQueue, action];
            set({ clients: updatedClients, syncQueue: newQueue, syncStatus: 'pending' });
            persistState(updatedClients, newQueue);
            get().actions.processSyncQueue();
        },

        deleteClient: (clientId) => {
            // 🔥 SOFT DELETE: No borramos, marcamos como deleted.
            const updatedClients = get().clients.map((c) => 
                c.id === clientId ? { ...c, deleted: true, lastModified: Date.now() } : c
            );
            
             const action: SyncAction = {
                id: `act_${Date.now()}_${Math.random()}`,
                type: 'DELETE_CLIENT',
                payload: { id: clientId, deleted: true }, // Payload explícito
                timestamp: Date.now(),
            };

            const newQueue = [...get().syncQueue, action];
            set({ clients: updatedClients, syncQueue: newQueue, syncStatus: 'pending' });
            persistState(updatedClients, newQueue);
            get().actions.processSyncQueue();
        },

        addTransaction: (clientId, transaction) => {
            let transactionId = '';
            const updatedClients = get().clients.map((client) => {
                if (client.id !== clientId) return client;
                
                const debtChange = transaction.type === 'Deuda' ? transaction.amount : -transaction.amount;
                const newDebt = Math.max(0, client.debt + debtChange);
                const newTx: Transaction = {
                    ...transaction,
                    id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                };
                transactionId = newTx.id;

                const finalTransactions = newDebt === 0 ? [] : [newTx, ...client.transactions];
                
                return {
                    ...client,
                    debt: newDebt,
                    transactions: finalTransactions,
                    lastModified: Date.now(),
                };
            });

            const action: SyncAction = {
                id: `act_${Date.now()}_${Math.random()}`,
                type: 'ADD_TRANSACTION',
                payload: { clientId, transaction: { ...transaction, id: transactionId } }, // Usamos el ID generado
                timestamp: Date.now(),
            };

            const newQueue = [...get().syncQueue, action];
            set({ clients: updatedClients, syncQueue: newQueue, syncStatus: 'pending' });
            persistState(updatedClients, newQueue);
            get().actions.processSyncQueue();
        },

        deleteTransaction: (clientId, transactionId) => {
             const updatedClients = get().clients.map((client) => {
                if (client.id !== clientId) return client;
                const tx = client.transactions.find(t => t.id === transactionId);
                if (!tx) return client;

                const debtChange = tx.type === 'Deuda' ? -tx.amount : tx.amount;
                const newDebt = Math.max(0, client.debt + debtChange);
                const remaining = client.transactions.filter(t => t.id !== transactionId);
                
                return {
                    ...client,
                    debt: newDebt,
                    transactions: newDebt === 0 ? [] : remaining,
                    lastModified: Date.now(),
                };
            });

            const action: SyncAction = {
                id: `act_${Date.now()}_${Math.random()}`,
                type: 'DELETE_TRANSACTION',
                payload: { clientId, transactionId },
                timestamp: Date.now(),
            };

             const newQueue = [...get().syncQueue, action];
            set({ clients: updatedClients, syncQueue: newQueue, syncStatus: 'pending' });
            persistState(updatedClients, newQueue);
            get().actions.processSyncQueue();
        },
        
        getClientById: (id) => get().clients.find((c) => c.id === id),

        processSyncQueue: async () => {
            const state = get();
            
            // 1. Evitar ejecuciones paralelas (Mutex)
            if (state.isSyncing) return;
            
            // 2. Si no hay nada que sincronizar, salir y marcar como 'synced'
            if (state.syncQueue.length === 0) {
                set({ syncStatus: 'synced' });
                return;
            }

            // 3. Verificar conexión antes de intentar
            const netInfo = await NetInfo.fetch();
            if (!netInfo.isConnected) {
                set({ syncStatus: 'pending' }); // No hay red, se queda pendiente
                return;
            }

            // 4. Marcar inicio de sincronización
            set({ isSyncing: true, syncStatus: 'pending' });

            try {
                // 5. CAPTURAR SNAPSHOT de la cola actual
                // Solo intentaremos procesar estos items. Si se agregan nuevos durante el await,
                // no los tocaremos en esta iteración (se procesarán en la siguiente).
                const itemsToSync = [...state.syncQueue];
                
                // NOTA: Como enviamos `state.clients` completo (Full Sync), técnicamente enviamos
                // también los cambios nuevos. Pero para limpiar la cola de forma segura,
                // solo debemos quitar los items que SABEMOS que existían al momento de iniciar el request.
                
                await apiFetch(API_URLS.DATA_SYNC, {
                    method: 'POST',
                    body: JSON.stringify({ clients: state.clients }),
                });

                // 6. ÉXITO: Limpiar SOLO los items procesados
                // Filtramos la cola actual quitando los items que estaban en itemsToSync.
                // Usamos los IDs de las acciones para identificar cuáles borrar.
                const processedIds = new Set(itemsToSync.map(a => a.id));
                const remainingQueue = get().syncQueue.filter(action => !processedIds.has(action.id));

                set({ 
                    syncQueue: remainingQueue, 
                    syncStatus: remainingQueue.length === 0 ? 'synced' : 'pending',
                    isSyncing: false 
                });
                
                persistState(state.clients, remainingQueue);

                // 7. RECURSIVIDAD: Si quedaron items (agregados durante el request),
                // procesar de nuevo inmediatamente.
                if (remainingQueue.length > 0) {
                    get().actions.processSyncQueue();
                }

            } catch (error: any) {
                console.error('Error processing sync queue:', error);
                
                // 8. ERROR: Liberar el mutex pero MANTENER la cola
                set({ isSyncing: false });

                // Si es error de red, mantenemos 'pending' para reintentar luego.
                // Si es otro error (ej. validación), marcamos como error.
                if (error.message === ERROR_MESSAGES.NO_CONNECTION || error.message.includes('Network request failed')) {
                    set({ syncStatus: 'pending' });
                } else {
                    set({ syncStatus: 'error' });
                    // Aquí podríamos disparar una notificación de error al usuario
                    useNotificationStore.getState().show({
                        message: 'No se pudieron guardar los cambios. Revisa tu conexión.',
                        type: 'error',
                    });
                }
            }
        }
    },
}));
