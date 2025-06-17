import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { API_URLS, STORAGE_KEYS } from '../constants';
import { apiFetch } from '@/services/apiService';
import type { Client, ClientContextType, Transaction } from '../types';
import { getFromStorage, saveToStorage } from '../utils/storage';

const ClientContext = createContext<ClientContextType | null>(null);

const normalizeClient = (client: Partial<Client>): Client => ({
    id: client.id || `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: client.name || 'Cliente sin nombre',
    phone: client.phone || undefined,
    debt: typeof client.debt === 'number' ? Math.max(0, client.debt) : 0,
    transactions: Array.isArray(client.transactions) ? client.transactions : [],
    lastModified: client.lastModified || Date.now(),
});

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const hasLoadedOnce = useRef(false);

    const syncClientsToBackend = useCallback(
        async (clientsToSync: Client[]) => {
            if (isSyncing || isLoading || !hasLoadedOnce.current) return;

            setIsSyncing(true);
            console.log('Sincronizando con backend...');
            try {
                await apiFetch(API_URLS.DATA_SYNC, {
                    method: 'POST',
                    body: JSON.stringify({ clients: clientsToSync }),
                });
                console.log('Datos sincronizados con el backend.');
            } catch (error) {
                console.error('Error al sincronizar con el backend:', error);
            } finally {
                setIsSyncing(false);
            }
        },
        [isSyncing, isLoading]
    );

    useEffect(() => {
        const loadClientsFromStorage = async () => {
            setIsLoading(true);
            try {
                const storedData = await getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS);
                if (storedData && Array.isArray(storedData)) {
                    setClients(storedData.map(normalizeClient));
                }
            } catch (error) {
                console.error('Error al cargar clientes:', error);
                setClients([]);
            } finally {
                setIsLoading(false);
                hasLoadedOnce.current = true; // Marca que ya cargamos y podemos sincronizar después
            }
        };
        loadClientsFromStorage();
    }, []);

    const clearClients = useCallback(() => setClients([]), []);

    const setAllClients = useCallback((newClientsData: Client[]) => {
        try {
            if (!Array.isArray(newClientsData)) throw new Error('Los datos no son válidos.');
            const normalizedClients = newClientsData.map(normalizeClient);
            setClients(normalizedClients);
        } catch (error) {
            console.error('Error al establecer los clientes:', error);
        }
    }, []);

    const addClient = useCallback(
        (clientData: Omit<Client, 'id' | 'debt' | 'transactions' | 'lastModified'>): Client => {
            const newClient = normalizeClient(clientData);
            setClients((prevClients) => {
                const updatedClients = [...prevClients, newClient];
                saveToStorage(STORAGE_KEYS.CLIENTS, updatedClients);
                syncClientsToBackend(updatedClients);
                return updatedClients;
            });
            return newClient;
        },
        [syncClientsToBackend]
    );

    const updateClient = useCallback(
        (clientId: string, updatedData: Pick<Client, 'name' | 'phone'>) => {
            setClients((prevClients) => {
                const updatedClients = prevClients.map((client) =>
                    client.id === clientId
                        ? { ...client, ...updatedData, lastModified: Date.now() }
                        : client
                );
                saveToStorage(STORAGE_KEYS.CLIENTS, updatedClients);
                return updatedClients;
            });
        },
        []
    );

    const deleteClient = useCallback((clientId: string) => {
        setClients((prevClients) => {
            const updatedClients = prevClients.filter((c) => c.id !== clientId);
            saveToStorage(STORAGE_KEYS.CLIENTS, updatedClients);
            return updatedClients;
        });
    }, []);

    const addTransaction = useCallback(
        (clientId: string, transaction: Omit<Transaction, 'id'>) => {
            setClients((prevClients) => {
                const updatedClients = prevClients.map((client) => {
                    if (client.id !== clientId) return client;
                    const debtChange =
                        transaction.type === 'Deuda' ? transaction.amount : -transaction.amount;
                    const newDebt = Math.max(0, client.debt + debtChange);
                    const newTransactionWithId: Transaction = {
                        ...transaction,
                        id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    };
                    return {
                        ...client,
                        debt: newDebt,
                        transactions: [newTransactionWithId, ...client.transactions],
                        lastModified: Date.now(),
                    };
                });
                saveToStorage(STORAGE_KEYS.CLIENTS, updatedClients);
                syncClientsToBackend(updatedClients);
                return updatedClients;
            });
        },
        [syncClientsToBackend]
    );

    const deleteTransaction = useCallback((clientId: string, transactionId: string) => {
        setClients((prevClients) => {
            const updatedClients = prevClients.map((client) => {
                if (client.id !== clientId) return client;
                const txToDelete = client.transactions.find((t) => t.id === transactionId);
                if (!txToDelete) return client;
                const debtChange =
                    txToDelete.type === 'Deuda' ? -txToDelete.amount : txToDelete.amount;
                const newDebt = Math.max(0, client.debt + debtChange);
                return {
                    ...client,
                    debt: newDebt,
                    transactions: client.transactions.filter((t) => t.id !== transactionId),
                    lastModified: Date.now(),
                };
            });
            saveToStorage(STORAGE_KEYS.CLIENTS, updatedClients);
            return updatedClients;
        });
    }, []);

    const contextValue = useMemo<ClientContextType>(
        () => ({
            clients,
            isLoading,
            isSyncing,
            setClients: setAllClients,
            addClient,
            updateClient,
            deleteClient,
            addTransaction,
            deleteTransaction,
            getClientById: (id: string) => clients.find((c) => c.id === id),
            clearClients,
        }),
        [
            clients,
            isLoading,
            isSyncing,
            setAllClients,
            addClient,
            updateClient,
            deleteClient,
            addTransaction,
            deleteTransaction,
            clearClients,
        ]
    );

    return <ClientContext.Provider value={contextValue}>{children}</ClientContext.Provider>;
};

export const useClientContext = (): ClientContextType => {
    const context = useContext(ClientContext);
    if (context === null) {
        throw new Error('useClientContext debe ser utilizado dentro de un ClientProvider');
    }
    return context;
};
