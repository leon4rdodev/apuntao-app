import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { API_URLS, STORAGE_KEYS } from '../constants';
import { apiFetch } from '@/services/apiService';
import type { Client, ClientContextType, Transaction } from '../types';
import { getFromStorage, saveToStorage } from '../utils/storage';
import { useNotification } from '@/store/notificationStore';

const ClientContext = createContext<ClientContextType | undefined>(undefined);

// Función para asegurar que un cliente tenga todos los campos requeridos
const normalizeClient = (client: Partial<Client>): Client => ({
    id: client.id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: client.name || 'Cliente sin nombre',
    phone: client.phone || undefined,
    debt: typeof client.debt === 'number' ? Math.max(0, client.debt) : 0,
    transactions: Array.isArray(client.transactions) ? client.transactions.map(tx => ({
        ...tx,
        id: tx.id || `local_txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    })) : [],
    lastModified: client.lastModified || Date.now(),
});

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const showNotification = useNotification();

    // Sincroniza la lista de clientes completa con el backend
    const syncClientsToBackend = useCallback(async (clientsToSync: Client[]) => {
        try {
            await apiFetch(API_URLS.DATA_SYNC, {
                method: 'POST',
                body: JSON.stringify({ clients: clientsToSync }),
            });
            console.log('Datos sincronizados con el backend.');
        } catch (error) {
            console.error('Error al sincronizar con el backend:', error);
            showNotification({ message: 'Error al guardar los datos en la nube.', type: 'error' });
        }
    }, [showNotification]);

    // Cargar clientes desde el caché local al iniciar la app
    useEffect(() => {
        const loadClientsFromStorage = async () => {
            setIsLoading(true);
            try {
                const storedData = await getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS);
                if (storedData && Array.isArray(storedData)) {
                    setClients(storedData.map(normalizeClient));
                }
            } catch (error) {
                console.error('Error al cargar clientes desde el caché:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadClientsFromStorage();
    }, []);

    // Función para limpiar todos los clientes (usada en logout)
    const clearClients = useCallback(async () => {
        setClients([]);
        await saveToStorage(STORAGE_KEYS.CLIENTS, []);
    }, []);

    // Función para establecer la lista completa de clientes (usada post-login/sync)
    const setAllClients = useCallback((newClientsData: Client[]) => {
        try {
            if (!Array.isArray(newClientsData)) throw new Error('Los datos de clientes no son válidos.');
            const normalizedClients = newClientsData.map(normalizeClient);
            setClients(normalizedClients);
            saveToStorage(STORAGE_KEYS.CLIENTS, normalizedClients); // Actualiza el caché local
        } catch (error) {
            console.error('Error al establecer los clientes:', error);
        }
    }, []);

    const updateClientsAndSync = (updateFn: (prevClients: Client[]) => Client[]) => {
        setClients(prevClients => {
            const updatedClients = updateFn(prevClients);
            saveToStorage(STORAGE_KEYS.CLIENTS, updatedClients);
            syncClientsToBackend(updatedClients);
            return updatedClients;
        });
    };

    const addClient = useCallback(
        (clientData: Omit<Client, 'id' | 'debt' | 'transactions' | 'lastModified'>): Client => {
            const newClient = normalizeClient(clientData);
            updateClientsAndSync(prevClients => [...prevClients, newClient]);
            return newClient;
        },
        []
    );

    const updateClient = useCallback(
        (clientId: string, updatedData: Pick<Client, 'name' | 'phone'>) => {
            updateClientsAndSync(prevClients =>
                prevClients.map(client =>
                    client.id === clientId ? { ...client, ...updatedData, lastModified: Date.now() } : client
                )
            );
        },
        []
    );

    const deleteClient = useCallback((clientId: string) => {
        updateClientsAndSync(prevClients => prevClients.filter(c => c.id !== clientId));
    }, []);

    const addTransaction = useCallback(
        (clientId: string, transaction: Omit<Transaction, 'id'>) => {
            updateClientsAndSync(prevClients =>
                prevClients.map(client => {
                    if (client.id !== clientId) return client;

                    const debtChange = transaction.type === 'Deuda' ? transaction.amount : -transaction.amount;
                    const newDebt = Math.max(0, client.debt + debtChange);

                    // --- NUEVA LÓGICA ---
                    // Si la deuda llega a cero, el historial se limpia.
                    // Si no, se añade la nueva transacción.
                    const newTransactionWithId: Transaction = {
                        ...transaction,
                        id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    };
                    const finalTransactions = newDebt === 0 ? [] : [newTransactionWithId, ...client.transactions];
                    // --- FIN DE LA NUEVA LÓGICA ---

                    return { ...client, debt: newDebt, transactions: finalTransactions, lastModified: Date.now() };
                })
            );
        },
        []
    );

    const deleteTransaction = useCallback((clientId: string, transactionId: string) => {
        updateClientsAndSync(prevClients =>
            prevClients.map(client => {
                if (client.id !== clientId) return client;

                const txToDelete = client.transactions.find(t => t.id === transactionId);
                if (!txToDelete) return client;

                const debtChange = txToDelete.type === 'Deuda' ? -txToDelete.amount : txToDelete.amount;
                const newDebt = Math.max(0, client.debt + debtChange);
                const remainingTransactions = client.transactions.filter(t => t.id !== transactionId);

                // --- NUEVA LÓGICA ---
                // Si la deuda llega a cero al eliminar la transacción, el resto del historial también se limpia.
                const finalTransactions = newDebt === 0 ? [] : remainingTransactions;
                // --- FIN DE LA NUEVA LÓGICA ---

                return { ...client, debt: newDebt, transactions: finalTransactions, lastModified: Date.now() };
            })
        );
    }, []);

    const contextValue = useMemo<ClientContextType>(
        () => ({
            clients,
            isLoading,
            setClients: setAllClients,
            addClient,
            updateClient,
            deleteClient,
            addTransaction,
            deleteTransaction,
            getClientById: (id: string) => clients.find((c) => c.id === id),
            clearClients,
        }),
        [clients, isLoading, setAllClients, addClient, updateClient, deleteClient, addTransaction, deleteTransaction, clearClients]
    );

    return <ClientContext.Provider value={contextValue}>{children}</ClientContext.Provider>;
};

export const useClientContext = (): ClientContextType => {
    const context = useContext(ClientContext);
    if (context === undefined) {
        throw new Error('useClientContext debe ser utilizado dentro de un ClientProvider');
    }
    return context;
};